from ninja import Schema


class PaymentCreateIn(Schema):
    order_id: int
    redirect_url: str
    phone: str | None = None


class PaymentCreateOut(Schema):
    longurl: str
    payment_request_id: str
    order_id: int


class PaymentVerifyOut(Schema):
    order_id: int
    status: str
    final_amount: str
    instamojo_payment_id: str | None = None