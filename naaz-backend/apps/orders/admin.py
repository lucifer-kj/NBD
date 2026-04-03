import json

from django.contrib import admin
from django.utils.html import format_html

from .models import Order, OrderItem, PromoCode, Refund


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "item_type",
        "book",
        "atar_variant",
        "product_name",
        "price_at_purchase",
        "quantity",
        "line_total",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "status",
        "final_amount",
        "instamojo_payment_request_id",
        "tracking_number",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = (
        "id",
        "user__email",
        "instamojo_payment_id",
        "instamojo_payment_request_id",
        "tracking_number",
    )
    readonly_fields = (
        "user",
        "subtotal",
        "discount_amount",
        "loyalty_points_used",
        "loyalty_discount_amount",
        "final_amount",
        "shipping_address_display",
        "instamojo_payment_id",
        "created_at",
        "updated_at",
    )
    fieldsets = (
        (
            "Order",
            {
                "fields": (
                    "user",
                    "status",
                    "tracking_number",
                    "shipping_address_display",
                )
            },
        ),
        (
            "Payment (Instamojo)",
            {
                "fields": (
                    "subtotal",
                    "discount_amount",
                    "final_amount",
                    "instamojo_payment_id",
                    "instamojo_payment_request_id",
                )
            },
        ),
        (
            "Loyalty",
            {"fields": ("loyalty_points_used", "loyalty_discount_amount")},
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
    inlines = [OrderItemInline]
    actions = (
        "mark_processing",
        "mark_shipped",
        "mark_delivered",
        "mark_cancelled",
    )

    @admin.display(description="Shipping address")
    def shipping_address_display(self, obj: Order):
        if not obj.shipping_address:
            return "—"
        return format_html("<pre>{}</pre>", json.dumps(obj.shipping_address, indent=2, ensure_ascii=False))

    @admin.action(description="Mark as Processing (paid orders)")
    def mark_processing(self, request, queryset):
        queryset.filter(status__in=[Order.Status.PAID, Order.Status.PROCESSING]).update(
            status=Order.Status.PROCESSING
        )

    @admin.action(description="Mark as Shipped (requires tracking)")
    def mark_shipped(self, request, queryset):
        queryset.filter(status__in=[Order.Status.PAID, Order.Status.PROCESSING]).update(
            status=Order.Status.SHIPPED
        )

    @admin.action(description="Mark as Delivered")
    def mark_delivered(self, request, queryset):
        queryset.filter(status=Order.Status.SHIPPED).update(status=Order.Status.DELIVERED)

    @admin.action(description="Mark as Cancelled (non-delivered)")
    def mark_cancelled(self, request, queryset):
        queryset.exclude(status__in=[Order.Status.DELIVERED, Order.Status.CANCELLED]).update(
            status=Order.Status.CANCELLED
        )


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "discount_percentage",
        "valid_until",
        "usage_limit",
        "times_used",
        "is_active",
    )
    list_filter = ("is_active",)
    search_fields = ("code",)


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ("order", "amount", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("order__id",)
