import logging
from decimal import Decimal

from typing import Any

from django.conf import settings
from django.db import transaction
from django.http import HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from ninja import Router, Schema
from ninja.errors import HttpError

from apps.orders.models import Order
from apps.orders.services import decrement_stock_for_paid_order
from apps.users.api import AuthBearer

from .instamojo_client import build_mac_signature, create_payment_request
from .models import PaymentRecord
from .schemas import PaymentCreateIn, PaymentCreateOut, PaymentVerifyOut

logger = logging.getLogger(__name__)

router = Router()


@router.post("/create/", response=PaymentCreateOut, auth=AuthBearer())
@transaction.atomic
def initiate_payment(request, payload: PaymentCreateIn):
    """
    Create an Instamojo Payment Request for an existing PENDING_PAYMENT order.
    """
    order = (
        Order.objects.select_for_update()
        .filter(id=payload.order_id, user=request.auth)
        .first()
    )
    if not order:
        raise HttpError(404, "Order not found")

    if order.status != Order.Status.PENDING_PAYMENT:
        raise HttpError(400, "Order is not awaiting payment")

    salt = getattr(settings, "INSTAMOJO_SALT", None) or getattr(settings, "INSTAMOJO_PRIVATE_SALT", None)
    if not salt:
        raise HttpError(503, "Payment gateway is not configured (missing INSTAMOJO_SALT)")

    webhook_path = "/api/payments/webhook/"
    webhook_url = request.build_absolute_uri(webhook_path)

    if not payload.redirect_url.startswith("http://") and not payload.redirect_url.startswith("https://"):
        raise HttpError(400, "redirect_url must be an absolute URL")

    user = request.auth
    buyer_name = (user.get_full_name() or "").strip() or user.email.split("@")[0]
    phone = (payload.phone or user.phone_number or "").strip() or "9999999999"
    amount_str = f"{order.final_amount:.2f}"

    purpose = f"Naaz Book Depot — Order #{order.id}"

    try:
        result = create_payment_request(
            amount=amount_str,
            purpose=purpose,
            buyer_name=buyer_name,
            email=user.email,
            phone=phone,
            redirect_url=payload.redirect_url,
            webhook_url=webhook_url,
        )
    except RuntimeError as e:
        logger.warning("Instamojo create failed: %s", e)
        raise HttpError(502, str(e))

    pr_id = result.get("payment_request_id")
    longurl = result.get("longurl")
    if not pr_id or not longurl:
        raise HttpError(502, "Invalid response from payment gateway")

    order.instamojo_payment_request_id = pr_id
    order.save(update_fields=["instamojo_payment_request_id", "updated_at"])

    return PaymentCreateOut(
        longurl=longurl,
        payment_request_id=str(pr_id),
        order_id=order.id,
    )


@csrf_exempt
def webhook_view(request) -> HttpResponse:
    """
    Instamojo server-to-server webhook (form POST). CSRF-exempt; MAC verified.
    """
    if request.method != "POST":
        return HttpResponse(status=405)

    salt = getattr(settings, "INSTAMOJO_SALT", None) or getattr(settings, "INSTAMOJO_PRIVATE_SALT", None)
    if not salt:
        logger.error("INSTAMOJO_SALT not configured")
        return HttpResponse(status=503)

    post_data = request.POST.dict()
    mac_received = post_data.get("mac") or ""  # type: ignore[assignment]

    try:
        mac_calc = build_mac_signature(post_data, salt)
    except Exception:
        logger.exception("MAC build failed")
        return HttpResponse(status=400)

    if not mac_received or mac_calc.lower() != str(mac_received).lower():
        logger.warning("Instamojo MAC mismatch")
        return HttpResponse(status=400)

    payment_request_id = post_data.get("payment_request_id") or post_data.get("payment_request")
    payment_id = post_data.get("payment_id")
    status = (post_data.get("status") or "").strip()

    if not payment_request_id:
        logger.warning("Webhook missing payment_request_id")
        return HttpResponse(status=400)

    try:
        _apply_webhook_payment(payment_request_id=str(payment_request_id), payment_id=str(payment_id or ""), status=status, payload=post_data)
    except Exception:
        logger.exception("Webhook processing failed")
        return HttpResponse(status=500)

    return HttpResponse(status=200)


def _apply_webhook_payment(
    *,
    payment_request_id: str,
    payment_id: str,
    status: str,
    payload: dict,
) -> None:
    with transaction.atomic():
        order = (
            Order.objects.select_for_update()
            .filter(instamojo_payment_request_id=payment_request_id)
            .first()
        )
        if not order:
            logger.warning("No order for payment_request_id=%s", payment_request_id)
            return

        amount_str = payload.get("amount") or str(order.final_amount)
        try:
            amount_dec = Decimal(str(amount_str))
        except Exception:
            amount_dec = order.final_amount

        PaymentRecord.objects.create(
            order=order,
            instamojo_payment_id=payment_id or "pending",
            instamojo_payment_request_id=payment_request_id,
            status=status or "UNKNOWN",
            amount=amount_dec,
            webhook_payload=payload,
        )

        if status.upper() != "CREDIT":
            logger.info("Payment not credited for order %s: status=%s", order.id, status)
            return

        if order.status == Order.Status.PAID:
            if payment_id and order.instamojo_payment_id != payment_id:
                order.instamojo_payment_id = payment_id
                order.save(update_fields=["instamojo_payment_id", "updated_at"])
            return

        order.status = Order.Status.PAID
        if payment_id:
            order.instamojo_payment_id = payment_id
        uf = ["status", "updated_at"]
        if payment_id:
            uf.insert(0, "instamojo_payment_id")
        order.save(update_fields=uf)

        try:
            decrement_stock_for_paid_order(order)
        except ValueError as e:
            logger.error("Stock decrement failed for order %s: %s", order.id, e)
            raise


@router.get("/verify/", response=PaymentVerifyOut, auth=AuthBearer())
def verify_payment(request, payment_request_id: str):
    """Match frontend state after redirect — order must belong to the authenticated user."""
    order = Order.objects.filter(
        user=request.auth,
        instamojo_payment_request_id=payment_request_id,
    ).first()
    if not order:
        raise HttpError(404, "Order not found")
    return PaymentVerifyOut(
        order_id=order.id,
        status=order.status,
        final_amount=str(order.final_amount),
        instamojo_payment_id=order.instamojo_payment_id,
    )
