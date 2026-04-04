from decimal import Decimal
from typing import List

from django.db.models import Count
from django.db import transaction
from ninja import Router
from ninja.errors import HttpError

from apps.catalog.models import AtarVariant, Book
from apps.users.api import AuthBearer
from apps.users.models import UserAddress

from .models import Order, OrderItem
from .schemas import CheckoutIn, OrderOut, OrderSummaryOut

router = Router()


@router.get("/", response=List[OrderSummaryOut], auth=AuthBearer())
def list_my_orders(request):
    qs = (
        Order.objects.filter(user=request.auth)
        .annotate(item_count=Count("items"))
        .order_by("-created_at")
    )
    return [
        OrderSummaryOut(
            id=o.id,
            status=o.status,
            final_amount=o.final_amount,
            created_at=o.created_at,
            item_count=o.item_count,
        )
        for o in qs
    ]


@router.get("/{order_id}/", response=OrderOut, auth=AuthBearer())
def get_order_detail(request, order_id: int):
    order = (
        Order.objects.prefetch_related("items")
        .filter(user=request.auth, id=order_id)
        .first()
    )
    if not order:
        raise HttpError(404, "Order not found")
    return order


@router.post("/checkout/validate/", auth=AuthBearer())
def validate_checkout(request, payload: CheckoutIn):
    errors = []
    subtotal = Decimal("0.00")

    for item in payload.items:
        if item.quantity <= 0:
            errors.append({"item_id": item.item_id, "error": "Quantity must be greater than zero"})
            continue

        if item.item_type == "BOOK":
            product = Book.objects.filter(id=item.item_id, is_active=True).first()
            if not product:
                errors.append({"item_id": item.item_id, "error": "Book not found"})
                continue
            if product.stock_quantity < item.quantity:
                errors.append({"item_id": item.item_id, "error": "Insufficient stock"})
                continue
            subtotal += product.price * item.quantity
        elif item.item_type == "ATAR":
            variant = AtarVariant.objects.filter(id=item.item_id, is_active=True, atar__is_active=True).first()
            if not variant:
                errors.append({"item_id": item.item_id, "error": "Atar variant not found"})
                continue
            if variant.stock_quantity < item.quantity:
                errors.append({"item_id": item.item_id, "error": "Insufficient stock"})
                continue
            subtotal += variant.price * item.quantity
        else:
            errors.append({"item_id": item.item_id, "error": "Invalid item type"})

    if errors:
        return 400, {"ok": False, "errors": errors}

    return {"ok": True, "subtotal": subtotal, "final_amount": subtotal}


@router.post("/checkout/", response=OrderOut, auth=AuthBearer())
@transaction.atomic
def create_checkout_order(request, payload: CheckoutIn):
    address = UserAddress.objects.filter(id=payload.shipping_address_id, user=request.auth).first()
    if not address:
        raise HttpError(400, "Shipping address not found")

    validation = validate_checkout(request, payload)
    if isinstance(validation, tuple):
        raise HttpError(validation[0], "Checkout validation failed")

    shipping_address = {
        "label": address.label,
        "street": address.street,
        "city": address.city,
        "state": address.state,
        "pin_code": address.pin_code,
    }

    order = Order.objects.create(
        user=request.auth,
        shipping_address=shipping_address,
        subtotal=validation["subtotal"],
        final_amount=validation["final_amount"],
        status=Order.Status.PROCESSING, # COD approval
    )

    for item in payload.items:
        if item.item_type == "BOOK":
            # Lock the row to prevent concurrent stock deductions
            product = Book.objects.select_for_update().get(id=item.item_id)
            if product.stock_quantity < item.quantity:
                raise HttpError(400, f"Insufficient stock for {product.title}")
            product.stock_quantity -= item.quantity
            product.save(update_fields=["stock_quantity"])
            line_total = product.price * item.quantity
            OrderItem.objects.create(
                order=order,
                item_type="BOOK",
                book=product,
                product_name=product.title,
                price_at_purchase=product.price,
                quantity=item.quantity,
                line_total=line_total,
            )
        else:
            # Lock the variant row
            variant = AtarVariant.objects.select_for_update().select_related("atar").get(id=item.item_id)
            if variant.stock_quantity < item.quantity:
                raise HttpError(400, f"Insufficient stock for {variant.atar.name} ({variant.volume_ml}ml)")
            variant.stock_quantity -= item.quantity
            variant.save(update_fields=["stock_quantity"])
            line_total = variant.price * item.quantity
            OrderItem.objects.create(
                order=order,
                item_type="ATAR",
                atar_variant=variant,
                product_name=f"{variant.atar.name} ({variant.volume_ml}ml)",
                price_at_purchase=variant.price,
                quantity=item.quantity,
                line_total=line_total,
            )

    order = Order.objects.prefetch_related("items").get(id=order.id)
    return order
