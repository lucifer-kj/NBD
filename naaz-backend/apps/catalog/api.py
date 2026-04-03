from ninja import Router, Query, Schema
from ninja.pagination import paginate, PageNumberPagination
from .models import Book, Atar
from .schemas import BookOut, AtarOut
from typing import List
from django.shortcuts import get_object_or_404


router = Router()


@router.get("/books/", response=List[BookOut])
@paginate(PageNumberPagination, page_size=20)
def list_books(
    request,
    language: str = Query(None),
    script_type: str = Query(None),
    format: str = Query(None),
    min_price: float = Query(None),
    max_price: float = Query(None)
):
    qs = Book.objects.filter(is_active=True)

    if language:
        qs = qs.filter(language=language)
    if script_type:
        qs = qs.filter(script_type=script_type)
    if format:
        qs = qs.filter(format=format)
    if min_price is not None:
        qs = qs.filter(price__gte=min_price)
    if max_price is not None:
        qs = qs.filter(price__lte=max_price)

    return qs

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
