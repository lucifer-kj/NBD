# Naaz Backend API Contract (v1)

This document freezes the canonical API surface for the current frontend.

Base path: `/api`

## Auth
- `POST /auth/register/`
- `POST /auth/login/`
- `POST /auth/google/` — body `{ "id_token": "<Google JWT>" }` → JWT pair
- `GET /auth/me/` (Bearer token)
- `GET /auth/addresses/`
- `POST /auth/addresses/` — create saved address (Bearer)

## Catalog
- `GET /books/` (paginated)
- `GET /books/{slug}/`
- `GET /atar/` (paginated)
- `GET /atar/{slug}/`

## Orders
- `POST /orders/checkout/validate/`
- `POST /orders/checkout/` — creates order `PENDING_PAYMENT`
- `GET /orders/` — list current user’s orders (Bearer)
- `GET /orders/{order_id}/` — order detail (Bearer)

## Payments (Instamojo)
- `POST /payments/create/` — body `{ "order_id", "redirect_url", "phone?" }` → `{ longurl, payment_request_id, order_id }` (Bearer)
- `GET /payments/verify/?payment_request_id=` — sync order state after redirect (Bearer)
- `POST /api/payments/webhook/` — server-to-server Instamojo webhook (public; MAC verified). **Not** under JSON API router; same host as backend.

## AI Assistant
- `POST /ai/chat/` (placeholder)

## Contract Rules
- Frontend must not call legacy paths like `/products`, `/categories`, or `/catalog/categories`.
- New endpoints must be added here and in OpenAPI before frontend usage.
