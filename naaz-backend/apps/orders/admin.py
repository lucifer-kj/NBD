from django.contrib import admin
from .models import Order, OrderItem, PromoCode, Refund

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('item_type', 'book', 'atar_variant', 'product_name', 'price_at_purchase', 'quantity', 'line_total')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'final_amount', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'user__email', 'instamojo_payment_id')
    readonly_fields = ('subtotal', 'discount_amount', 'loyalty_points_used', 'loyalty_discount_amount', 'final_amount', 'status')
    inlines = [OrderItemInline]

@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percentage', 'valid_until', 'usage_limit', 'times_used', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('code',)

@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ('order', 'amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('order__id',)
