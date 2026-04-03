"""
Instamojo REST helpers — payment request creation and webhook MAC verification.
"""

from __future__ import annotations

import hashlib
import hmac
import logging
from typing import Any
from urllib.parse import urljoin

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def instamojo_base_url() -> str:
    env = (getattr(settings, "INSTAMOJO_ENV", "sandbox") or "sandbox").lower()
    if env in ("production", "live", "prod"):
        return "https://www.instamojo.com/"
    return "https://test.instamojo.com/"


def build_mac_signature(post_data: dict[str, Any], salt: str) -> str:
    """
    Instamojo webhook MAC: sort keys (excluding mac), join values with '|', HMAC-SHA1 hex.
    """
    filtered = {k: v for k, v in post_data.items() if k != "mac" and v is not None}
    parts = [str(filtered[k]) for k in sorted(filtered.keys())]
    message = "|".join(parts)
    digest = hmac.new(salt.encode("utf-8"), message.encode("utf-8"), hashlib.sha1).hexdigest()
    return digest


def create_payment_request(
    *,
    amount: str,
    purpose: str,
    buyer_name: str,
    email: str,
    phone: str,
    redirect_url: str,
    webhook_url: str,
) -> dict[str, Any]:
    api_key = getattr(settings, "INSTAMOJO_API_KEY", None) or getattr(settings, "CONSUMER_KEY", None)
    auth_token = getattr(settings, "INSTAMOJO_AUTH_TOKEN", None) or getattr(settings, "CONSUMER_SECRET", None)
    if not api_key or not auth_token:
        raise RuntimeError("Instamojo API credentials are not configured")

    url = urljoin(instamojo_base_url(), "api/1.1/payment-requests/")
    payload = {
        "amount": amount,
        "purpose": purpose[:500],
        "buyer_name": buyer_name[:120],
        "email": email,
        "phone": phone[:40],
        "redirect_url": redirect_url,
        "webhook": webhook_url,
        "send_email": False,
        "send_sms": False,
    }
    headers = {
        "X-Api-Key": api_key,
        "X-Auth-Token": auth_token,
        "Content-Type": "application/json",
    }
    resp = requests.post(url, json=payload, headers=headers, timeout=30)
    try:
        data = resp.json()
    except Exception:
        logger.exception("Instamojo non-JSON response: %s", resp.text[:500])
        raise RuntimeError(f"Instamojo error: HTTP {resp.status_code}")

    if resp.status_code >= 400 or not data.get("success"):
        logger.warning("Instamojo payment request failed: %s", data)
        raise RuntimeError(data.get("message") or data.get("error") or f"HTTP {resp.status_code}")

    pr = data.get("payment_request") or {}
    return {
        "payment_request_id": pr.get("id"),
        "longurl": pr.get("longurl"),
        "raw": data,
    }
