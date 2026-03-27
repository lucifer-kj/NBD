from ninja import Schema
from typing import Optional

class UserOut(Schema):
    id: int
    email: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    loyalty_points_balance: int
    preferred_language: str

class RegisterIn(Schema):
    email: str
    first_name: str
    last_name: str
    password: str
    phone_number: Optional[str] = None

class LoginIn(Schema):
    email: str
    password: str

class TokenOut(Schema):
    access: str
    refresh: str

class UserAddressSchema(Schema):
    id: int
    label: str
    street: str
    city: str
    state: str
    pin_code: str
    is_default: bool
