import os
import sys
import django

sys.path.append('c:/Users/user/Desktop/NBD/naaz-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django.setup()

from django.db import connection

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        row = cursor.fetchone()
    print("Database connection successful:", row)
except Exception as e:
    print("Database connection failed:", e)
