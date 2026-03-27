from ninja import Schema
from typing import List, Optional
from decimal import Decimal

class BookOut(Schema):
    id: int
    title: str
    slug: str
    author: str
    translator: Optional[str] = None
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

class AtarVariantOut(Schema):
    id: int
    volume_ml: int
    price: Decimal
    stock_quantity: int
    sku: str

class AtarOut(Schema):
    id: int
    name: str
    slug: str
    description: str
    top_notes: str
    heart_notes: str
    base_notes: str
    is_active: bool
    variants: List[AtarVariantOut]
