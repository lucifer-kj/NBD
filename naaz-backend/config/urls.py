from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from ninja import NinjaAPI

from apps.users.api import router as users_router
from apps.catalog.api import router as catalog_router
from apps.ai_assistant.api import router as ai_router
from apps.orders.api import router as orders_router
from apps.payments.api import router as payments_router, webhook_view

api = NinjaAPI(title="Naaz Book Depot API", version="1.0.0")

api.add_router("/auth/", users_router)
api.add_router("/", catalog_router)  # Handles /api/books/ and /api/atar/ implicitly using mount points in catalog/api.py
api.add_router("/ai/", ai_router)
api.add_router("/orders/", orders_router)
api.add_router("/payments/", payments_router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/payments/webhook/', webhook_view),
    path('api/', api.urls),
    path('healthz/', lambda request: JsonResponse({"status": "ok"})),
    path('readyz/', lambda request: JsonResponse({"status": "ready"})),
]
