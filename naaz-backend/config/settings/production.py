from .base import *
import os
from dotenv import load_dotenv

load_dotenv()

DEBUG = False
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# Database
# In production, we strictly require DATABASE_URL
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in production environment")

# Parse DATABASE_URL for legacy DATABASES set in base.py if needed, 
# or just ensure base.py's implementation is using it correctly.
# Base.py currently does: db_url = os.getenv('DATABASE_URL', '...')
# So we are already covered there, but we ensure it's not the default.

# Redis / Cache
REDIS_URL = os.getenv('REDIS_URL')
if not REDIS_URL:
    raise ValueError("REDIS_URL must be set in production environment")

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

# Elasticsearch
ELASTICSEARCH_URL = os.getenv('ELASTICSEARCH_URL')

# Security settings
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True') == 'True'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS
# Sanitize origins (strip trailing slashes/paths as required by django-cors-headers)
raw_origins = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
CORS_ALLOWED_ORIGINS = [
    origin.rstrip('/').split('//')[-1].split('/')[0] if '//' in origin else origin.rstrip('/') 
    for origin in raw_origins if origin
]
# Ensure absolute URI format (http:// or https://)
CORS_ALLOWED_ORIGINS = [
    f"https://{o}" if not o.startswith(('http://', 'https://')) else o 
    for o in raw_origins if o
]
