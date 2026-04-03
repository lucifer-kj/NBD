from django.test import TestCase

from apps.payments.instamojo_client import build_mac_signature


class InstamojoMacTests(TestCase):
    def test_mac_matches_instruction_pipe_join(self):
        salt = "test-salt"
        post_data = {
            "amount": "100.00",
            "buyer_name": "Test",
            "payment_id": "MOJO123",
            "payment_request_id": "prid-1",
            "status": "Credit",
        }
        mac = build_mac_signature({**post_data, "mac": "ignored"}, salt)
        # Deterministic: sorted keys → amount, buyer_name, payment_id, payment_request_id, status
        expected_msg = "100.00|Test|MOJO123|prid-1|Credit"
        import hashlib
        import hmac

        manual = hmac.new(salt.encode("utf-8"), expected_msg.encode("utf-8"), hashlib.sha1).hexdigest()
        self.assertEqual(mac.lower(), manual.lower())
