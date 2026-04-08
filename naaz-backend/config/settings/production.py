from .base import *
import os
from dotenv import load_dotenv

load_dotenv()

DEBUG = False
ALLOWED_HOSTS = [host.strip() for host in os.getenv('ALLOWED_HOSTS', '').split(',') if host.strip()]

render_external_hostname = os.getenv('RENDER_EXTERNAL_HOSTNAME')
if render_external_hostname:
    ALLOWED_HOSTS.append(render_external_hostname)

if '.onrender.com' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append('.onrender.com')

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
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True').lower() == 'true'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS and CSRF
# We want to keep origins from base.py, and add anything from environment variables.
from .base import CORS_ALLOWED_ORIGINS as BASE_CORS, CSRF_TRUSTED_ORIGINS as BASE_CSRF

raw_origins = [o.strip() for o in os.getenv('CORS_ALLOWED_ORIGINS', '').split(',') if o.strip()]
env_origins = [o.rstrip('/') for o in raw_origins]

# Use a set to remove duplicates, then convert to list
CORS_ALLOWED_ORIGINS = list(set(BASE_CORS + env_origins))
CSRF_TRUSTED_ORIGINS = list(set(BASE_CSRF + env_origins))
