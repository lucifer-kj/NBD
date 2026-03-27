from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI

from apps.users.api import router as users_router
from apps.catalog.api import router as catalog_router
from apps.ai_assistant.api import router as ai_router

api = NinjaAPI(title="Naaz Book Depot API", version="1.0.0")

api.add_router("/auth/", users_router)
api.add_router("/", catalog_router)  # Handles /api/books/ and /api/atar/ implicitly using mount points in catalog/api.py
api.add_router("/ai/", ai_router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
]
