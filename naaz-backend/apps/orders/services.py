"""
Order fulfillment helpers — stock mutation when payment is confirmed.
"""

from django.db import transaction
from django.db.models import F

from apps.catalog.models import AtarVariant, Book

from .models import Order


@transaction.atomic
def decrement_stock_for_paid_order(order: Order) -> None:
    """Subtract sold quantities from Book / AtarVariant rows (idempotent per order)."""
    for line in order.items.select_related("book", "atar_variant").all():
        if line.item_type == "BOOK" and line.book_id:
            updated = Book.objects.filter(id=line.book_id, stock_quantity__gte=line.quantity).update(
                stock_quantity=F("stock_quantity") - line.quantity
            )
            if updated != 1:
                raise ValueError(f"Insufficient stock for book id={line.book_id}")
        elif line.item_type == "ATAR" and line.atar_variant_id:
            updated = AtarVariant.objects.filter(
                id=line.atar_variant_id, stock_quantity__gte=line.quantity
            ).update(stock_quantity=F("stock_quantity") - line.quantity)
            if updated != 1:
                raise ValueError(f"Insufficient stock for atar variant id={line.atar_variant_id}")
