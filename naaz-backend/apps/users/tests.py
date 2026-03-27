from django.test import TestCase
from django.test import Client
from .models import CustomUser

class UserApiTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_register_and_login(self):
        # Register
        data = {
            "email": "test@naazbook.in",
            "first_name": "Test",
            "last_name": "User",
            "password": "password123"
        }
        res = self.client.post('/api/auth/register/', data, content_type='application/json')
        self.assertEqual(res.status_code, 201)

        # Login
        login_data = {
            "email": "test@naazbook.in",
            "password": "password123"
        }
        res2 = self.client.post('/api/auth/login/', login_data, content_type='application/json')
        self.assertEqual(res2.status_code, 200)
        self.assertIn('access', res2.json())
        self.assertIn('refresh', res2.json())

        # Me
        access = res2.json()['access']
        res3 = self.client.get('/api/auth/me/', HTTP_AUTHORIZATION=f'Bearer {access}')
        self.assertEqual(res3.status_code, 200)
        self.assertEqual(res3.json()['email'], "test@naazbook.in")
