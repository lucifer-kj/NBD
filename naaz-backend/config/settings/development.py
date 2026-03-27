from .base import *
from dotenv import load_dotenv
import os

load_dotenv()

DEBUG = True
ALLOWED_HOSTS = ['*']

# Optional: Override DATABASES for SQLite if needed locally, but we'll use Postgres in Docker
