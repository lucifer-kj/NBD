from django.test import TestCase
from django.test import Client

class AiAssistantTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_chat_stub(self):
        res = self.client.post('/api/ai/chat/')
        self.assertEqual(res.status_code, 503)
        self.assertEqual(res.json()['error'], "Coming soon")
