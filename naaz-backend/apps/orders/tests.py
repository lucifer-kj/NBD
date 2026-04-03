from django.test import Client, TestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.catalog.models import Atar, AtarVariant, Book
from apps.users.models import CustomUser, UserAddress


class CheckoutApiTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = CustomUser.objects.create_user(
            email="buyer@example.com",
            password="password123",
            first_name="Buyer",
            last_name="User",
        )
        self.address = UserAddress.objects.create(
            user=self.user,
            label="Home",
            street="1 Test Street",
            city="Kolkata",
            state="WB",
            pin_code="700001",
            is_default=True,
        )
        self.book = Book.objects.create(
            title="Book One",
            author="Author A",
            publisher="Pub",
            description="Desc",
            language="EN",
            script_type="RM",
            format="HB",
            price=250,
            stock_quantity=5,
            is_active=True,
        )
        self.atar = Atar.objects.create(
            name="Atar One",
            description="Desc",
            top_notes="Rose",
            heart_notes="Musk",
            base_notes="Oud",
            is_active=True,
        )
        self.atar_variant = AtarVariant.objects.create(
            atar=self.atar, volume_ml=6, price=300, stock_quantity=4, sku="AT-6-ONE", is_active=True
        )
        access = str(RefreshToken.for_user(self.user).access_token)
        self.auth_header = {"HTTP_AUTHORIZATION": f"Bearer {access}"}

    def test_validate_checkout_success(self):
        payload = {
            "shipping_address_id": self.address.id,
            "items": [
                {"item_type": "BOOK", "item_id": self.book.id, "quantity": 1},
                {"item_type": "ATAR", "item_id": self.atar_variant.id, "quantity": 1},
            ],
        }
        res = self.client.post("/api/orders/checkout/validate/", payload, content_type="application/json", **self.auth_header)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["ok"], True)

    def test_create_checkout_order_success(self):
        payload = {
            "shipping_address_id": self.address.id,
            "items": [{"item_type": "BOOK", "item_id": self.book.id, "quantity": 2}],
        }
        res = self.client.post("/api/orders/checkout/", payload, content_type="application/json", **self.auth_header)
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertEqual(body["status"], "PENDING_PAYMENT")
        self.assertEqual(len(body["items"]), 1)

    def test_smoke_journey_browse_login_checkout_start(self):
        books_res = self.client.get("/api/books/")
        self.assertEqual(books_res.status_code, 200)

        login_res = self.client.post(
            "/api/auth/login/",
            {"email": "buyer@example.com", "password": "password123"},
            content_type="application/json",
        )
        self.assertEqual(login_res.status_code, 200)
        access = login_res.json()["access"]

        validate_payload = {
            "shipping_address_id": self.address.id,
            "items": [{"item_type": "BOOK", "item_id": self.book.id, "quantity": 1}],
        }
        validate_res = self.client.post(
            "/api/orders/checkout/validate/",
            validate_payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {access}",
        )
        self.assertEqual(validate_res.status_code, 200)
