from django.db import models
from django.conf import settings


class PromoCode(models.Model):
    """Admin-managed discount codes."""

    code = models.CharField(max_length=50, unique=True, db_index=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    max_discount_amount = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    times_used = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'promo_codes'

    def __str__(self):
        return f"{self.code} ({self.discount_percentage}% off)"


class Order(models.Model):
    """
    Master order record.

    CRITICAL INVARIANTS:
    1. financial fields (subtotal, final_amount, etc.) are IMMUTABLE after status=PAID
    2. State transitions must follow the valid paths in state_machine.py
    3. instamojo_payment_id uniqueness ensures idempotent webhook processing
    """

    class Status(models.TextChoices):
        CREATED = 'CREATED', 'Created'
        PENDING_PAYMENT = 'PENDING_PAYMENT', 'Pending Payment'
        PAID = 'PAID', 'Paid'
        PROCESSING = 'PROCESSING', 'Processing'
        SHIPPED = 'SHIPPED', 'Shipped'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'
        REFUNDED = 'REFUNDED', 'Refunded'
        RETURN_REQUESTED = 'RETURN_REQUESTED', 'Return Requested'
        RETURNED = 'RETURNED', 'Returned'
        FAILED_DELIVERY = 'FAILED_DELIVERY', 'Failed Delivery'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='orders'
    )
    # Snapshot of shipping address at order time — never join to UserAddress
    shipping_address = models.JSONField()

    # Financial Snapshot — SET ONCE at checkout, never recalculated after PAID
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    loyalty_points_used = models.PositiveIntegerField(default=0)
    loyalty_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Promo
    promo_code = models.ForeignKey(
        PromoCode, null=True, blank=True, on_delete=models.SET_NULL
    )

    # Status & Payment
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.CREATED, db_index=True
    )
    instamojo_payment_id = models.CharField(
        max_length=200, blank=True, null=True, unique=True
    )
    instamojo_payment_request_id = models.CharField(max_length=200, blank=True, null=True)

    # Logistics
    tracking_number = models.CharField(max_length=200, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['instamojo_payment_id']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Order #{self.id} — {self.user.email} — {self.status}"


class OrderItem(models.Model):
    """
    Individual line item in an order.

    CRITICAL: price_at_purchase and line_total are IMMUTABLE.
    They represent what the customer paid. Never reference the product's
    current price after an order is created.
    """

    ITEM_TYPE_CHOICES = [('BOOK', 'Book'), ('ATAR', 'Atar Variant')]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=5, choices=ITEM_TYPE_CHOICES)

    # Polymorphic reference — only one is set per row
    book = models.ForeignKey(
        'catalog.Book', null=True, blank=True, on_delete=models.PROTECT
    )
    atar_variant = models.ForeignKey(
        'catalog.AtarVariant', null=True, blank=True, on_delete=models.PROTECT
    )

    # Denormalized snapshot — captured at checkout time
    product_name = models.CharField(max_length=500)
    price_at_purchase = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.PositiveIntegerField()
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.product_name} × {self.quantity} @ ₹{self.price_at_purchase}"


class Refund(models.Model):
    """Refund tracking — per order or per item."""

    class RefundStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='refunds')
    order_item = models.ForeignKey(
        OrderItem, null=True, blank=True, on_delete=models.PROTECT
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(
        max_length=15, choices=RefundStatus.choices, default=RefundStatus.PENDING
    )
    instamojo_refund_id = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'refunds'
