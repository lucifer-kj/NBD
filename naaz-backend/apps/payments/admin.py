from django.contrib import admin

from .models import PaymentRecord


@admin.register(PaymentRecord)
class PaymentRecordAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "instamojo_payment_id",
        "status",
        "amount",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("instamojo_payment_id", "instamojo_payment_request_id", "order__id")
    readonly_fields = (
        "order",
        "instamojo_payment_id",
        "instamojo_payment_request_id",
        "status",
        "amount",
        "webhook_payload",
        "created_at",
    )
