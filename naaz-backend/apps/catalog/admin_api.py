"""
Admin-only API endpoints for the Naaz Admin Panel.

All endpoints require JWT auth + is_staff=True.
Designed for Refine data provider compatibility:
  - GET list returns { items: [...], count: N }
  - GET detail returns a single object
  - PATCH updates partial fields
"""

from typing import List, Optional
from decimal import Decimal
from datetime import datetime

from ninja import Router, Schema, File
from ninja.files import UploadedFile
from ninja.pagination import paginate, PageNumberPagination
from ninja.errors import HttpError
from django.db import transaction

from apps.users.api import AuthBearer
from apps.users.models import CustomUser
from apps.catalog.models import Book, Atar, AtarVariant
from apps.orders.models import Order, OrderItem

router = Router(tags=["Admin"])


# ──────────────────────────── Auth Guard ────────────────────────────

def require_staff(request):
    """Raise 403 if the authenticated user is not staff."""
    user = request.auth
    if not user or not user.is_staff:
        raise HttpError(403, "Admin access required")
    return user


# ──────────────────────────── Schemas ────────────────────────────

class AdminBookOut(Schema):
    id: int
    title: str
    slug: str
    author: str
    publisher: str
    description: str
    language: str
    script_type: str
    pages: Optional[int] = None
    format: str
    isbn: Optional[str] = None
    price: Decimal
    stock_quantity: int
    is_active: bool
    cover_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @staticmethod
    def resolve_cover_image(obj):
        if obj.cover_image:
            return obj.cover_image.url
        return None


class AdminBookUpdateIn(Schema):
    title: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    stock_quantity: Optional[int] = None
    is_active: Optional[bool] = None


class AdminBookCreateIn(Schema):
    title: str
    author: str
    publisher: str
    description: str
    language: str = "EN"
    script_type: str = "RM"
    format: str = "PB"
    price: Decimal
    stock_quantity: int = 0
    is_active: bool = True
    isbn: Optional[str] = None
    pages: Optional[int] = None


class AdminOrderOut(Schema):
    id: int
    status: str
    subtotal: Decimal
    discount_amount: Decimal
    final_amount: Decimal
    tracking_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user_email: str = ""
    item_count: int = 0

    @staticmethod
    def resolve_user_email(obj):
        return obj.user.email if obj.user else ""


class AdminOrderUpdateIn(Schema):
    status: Optional[str] = None
    tracking_number: Optional[str] = None


class AdminUserOut(Schema):
    id: int
    email: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    is_active: bool
    is_staff: bool
    date_joined: datetime
    loyalty_points_balance: int
    lifetime_spend: Decimal


# ──────────────────────────── Books (Inventory) ────────────────────────────

@router.get("/books/", response=List[AdminBookOut], auth=AuthBearer())
@paginate(PageNumberPagination, page_size=50)
def admin_list_books(request):
    require_staff(request)
    return Book.objects.all().order_by("-created_at")


@router.get("/books/{book_id}/", response=AdminBookOut, auth=AuthBearer())
def admin_get_book(request, book_id: int):
    require_staff(request)
    try:
        return Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        raise HttpError(404, "Book not found")


@router.post("/books/", response=AdminBookOut, auth=AuthBearer())
def admin_create_book(request, payload: AdminBookCreateIn):
    require_staff(request)
    book = Book.objects.create(**payload.dict())
    return book


@router.patch("/books/{book_id}/", response=AdminBookOut, auth=AuthBearer())
def admin_update_book(request, book_id: int, payload: AdminBookUpdateIn):
    require_staff(request)
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        raise HttpError(404, "Book not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(book, field, value)
    book.save()
    return book


@router.post("/books/{book_id}/upload-cover/", auth=AuthBearer())
def admin_upload_cover(request, book_id: int, file: UploadedFile = File(...)):
    """Upload a cover image for a book. Stored via DEFAULT_FILE_STORAGE (Cloudinary in prod)."""
    require_staff(request)
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        raise HttpError(404, "Book not found")

    book.cover_image.save(file.name, file, save=True)
    return {"ok": True, "cover_url": book.cover_image.url}


@router.delete("/books/{book_id}/", auth=AuthBearer())
def admin_delete_book(request, book_id: int):
    require_staff(request)
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        raise HttpError(404, "Book not found")
    book.delete()
    return {"ok": True}


# ──────────────────────────── Orders ────────────────────────────

@router.get("/orders/", response=List[AdminOrderOut], auth=AuthBearer())
@paginate(PageNumberPagination, page_size=20)
def admin_list_orders(request):
    require_staff(request)
    from django.db.models import Count
    return (
        Order.objects.select_related("user")
        .annotate(item_count=Count("items"))
        .order_by("-created_at")
    )


@router.get("/orders/{order_id}/", response=AdminOrderOut, auth=AuthBearer())
def admin_get_order(request, order_id: int):
    require_staff(request)
    from django.db.models import Count
    try:
        return Order.objects.select_related("user").annotate(item_count=Count("items")).get(id=order_id)
    except Order.DoesNotExist:
        raise HttpError(404, "Order not found")


@router.patch("/orders/{order_id}/", response=AdminOrderOut, auth=AuthBearer())
def admin_update_order(request, order_id: int, payload: AdminOrderUpdateIn):
    require_staff(request)
    from django.db.models import Count
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        raise HttpError(404, "Order not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(order, field, value)
    order.save()
    return Order.objects.select_related("user").annotate(item_count=Count("items")).get(id=order.id)


# ──────────────────────────── Users ────────────────────────────

@router.get("/users/", response=List[AdminUserOut], auth=AuthBearer())
@paginate(PageNumberPagination, page_size=50)
def admin_list_users(request):
    require_staff(request)
    return CustomUser.objects.all().order_by("-date_joined")


@router.get("/users/{user_id}/", response=AdminUserOut, auth=AuthBearer())
def admin_get_user(request, user_id: int):
    require_staff(request)
    try:
        return CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        raise HttpError(404, "User not found")
