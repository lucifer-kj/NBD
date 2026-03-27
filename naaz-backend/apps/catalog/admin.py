from django.contrib import admin
from .models import Book, Atar, AtarVariant

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'language', 'script_type', 'price', 'stock_quantity', 'is_active')
    list_filter = ('language', 'script_type', 'format', 'is_active')
    search_fields = ('title', 'author', 'isbn')
    prepopulated_fields = {'slug': ('title',)}

class AtarVariantInline(admin.TabularInline):
    model = AtarVariant
    extra = 1

@admin.register(Atar)
class AtarAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    search_fields = ('name', 'top_notes')
    list_filter = ('is_active',)
    prepopulated_fields = {'slug': ('name',)}
    inlines = [AtarVariantInline]

@admin.register(AtarVariant)
class AtarVariantAdmin(admin.ModelAdmin):
    list_display = ('atar', 'volume_ml', 'price', 'stock_quantity', 'sku', 'is_active')
    list_filter = ('volume_ml', 'is_active')
    search_fields = ('atar__name', 'sku')
