from ninja import Schema
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

class CartItemIn(Schema):
    item_type: str  # 'BOOK' or 'ATAR'
    item_id: int
    quantity: int

class CheckoutIn(Schema):
    items: List[CartItemIn]
    shipping_address_id: int
    promo_code: Optional[str] = None
    loyalty_points_to_use: Optional[int] = 0

class OrderItemOut(Schema):
    id: int
    item_type: str
    product_name: str
    price_at_purchase: Decimal
    quantity: int
    line_total: Decimal

class OrderOut(Schema):
    id: int
    status: str
    subtotal: Decimal
    discount_amount: Decimal
    loyalty_discount_amount: Decimal
    final_amount: Decimal
    tracking_number: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut]
