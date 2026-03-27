from ninja import Router, Query
from ninja.pagination import paginate, PageNumberPagination
from .models import Book, Atar
from .schemas import BookOut, AtarOut
from typing import List
from django.shortcuts import get_object_or_404
from ninja import FilterSchema

router = Router()

class BookFilterSchema(FilterSchema):
    language: str = None
    script_type: str = None
    format: str = None
    
    # Needs to be explicitly handled if not natively mapped
    # Ninja FilterSchema maps fields directly to ORM if matching names,
    # but we can provide custom filter methods
    def filter_min_price(self, value: float) -> dict:
        return {"price__gte": value}

    def filter_max_price(self, value: float) -> dict:
        return {"price__lte": value}

@router.get("/books/", response=List[BookOut])
@paginate(PageNumberPagination, page_size=20)
def list_books(request, filters: BookFilterSchema = Query(...)):
    qs = Book.objects.filter(is_active=True)
    return filters.filter(qs)

@router.get("/books/{slug}/", response=BookOut)
def get_book(request, slug: str):
    return get_object_or_404(Book, slug=slug, is_active=True)

@router.get("/atar/", response=List[AtarOut])
@paginate(PageNumberPagination, page_size=20)
def list_atar(request):
    return Atar.objects.filter(is_active=True).prefetch_related('variants')

@router.get("/atar/{slug}/", response=AtarOut)
def get_atar(request, slug: str):
    return get_object_or_404(Atar, slug=slug, is_active=True)
