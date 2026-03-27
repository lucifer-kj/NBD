from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserAddress

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'phone_number', 'loyalty_points_balance')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    list_filter = ('is_staff', 'is_active', 'preferred_language')
    ordering = ('email',)

@admin.register(UserAddress)
class UserAddressAdmin(admin.ModelAdmin):
    list_display = ('label', 'user', 'city', 'state', 'pin_code', 'is_default')
    search_fields = ('user__email', 'city', 'pin_code')
    list_filter = ('is_default', 'state')
