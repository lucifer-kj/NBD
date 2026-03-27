from django.test import TestCase
from django.test import Client
from .models import Book, Atar

class CatalogApiTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.book = Book.objects.create(
            title="Test Book", author="Author", publisher="Pub",
            description="Desc", language="EN", script_type="RM", format="HB",
            price=150, stock_quantity=10, is_active=True
        )
        self.atar = Atar.objects.create(
            name="Test Atar", description="Desc", is_active=True
        )

    def test_books_list(self):
        res = self.client.get('/api/books/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()['items']), 1)

    def test_books_detail(self):
        res = self.client.get(f'/api/books/{self.book.slug}/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['title'], "Test Book")

    def test_atar_list(self):
        res = self.client.get('/api/atar/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()['items']), 1)

    def test_atar_detail(self):
        res = self.client.get(f'/api/atar/{self.atar.slug}/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['name'], "Test Atar")
