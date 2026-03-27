import os
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.catalog.models import Book, Atar, AtarVariant
from apps.orders.models import PromoCode

def populate():
    User = get_user_model()
    # Create superuser
    if not User.objects.filter(email='admin@naazbook.in').exists():
        u = User.objects.create(email='admin@naazbook.in', first_name='Admin', last_name='User', is_staff=True, is_superuser=True)
        u.set_password('admin')
        u.save()

    # Books
    Book.objects.get_or_create(title='Sahih Al Bukhari', defaults={
        'author': 'Imam Bukhari', 'publisher': 'Darussalam', 'description': 'Collection of Hadiths',
        'language': 'AR', 'script_type': 'AR', 'format': 'HB', 'price': 1500, 'stock_quantity': 50
    })
    Book.objects.get_or_create(title='Tafsir Ibn Kathir', defaults={
        'author': 'Ibn Kathir', 'publisher': 'Islamic Foundation', 'description': 'Tafsir of Quran',
        'language': 'EN', 'script_type': 'RM', 'format': 'HB', 'price': 2500, 'stock_quantity': 30
    })
    Book.objects.get_or_create(title='The Noble Quran', defaults={
        'author': 'Muhsin Khan', 'publisher': 'Darussalam', 'description': 'Translation of Quran',
        'language': 'UR', 'script_type': 'UR', 'format': 'PB', 'price': 500, 'stock_quantity': 100
    })

    # Atar
    majm, _ = Atar.objects.get_or_create(name='Majmua', defaults={
        'description': 'Classic attar', 'top_notes': 'Rose, Saffron', 'base_notes': 'Oud, Sandalwood'
    })
    AtarVariant.objects.get_or_create(atar=majm, volume_ml=3, defaults={'price': 150, 'sku': 'MAJ-3', 'stock_quantity': 20})
    AtarVariant.objects.get_or_create(atar=majm, volume_ml=6, defaults={'price': 280, 'sku': 'MAJ-6', 'stock_quantity': 15})
    AtarVariant.objects.get_or_create(atar=majm, volume_ml=12, defaults={'price': 520, 'sku': 'MAJ-12', 'stock_quantity': 10})

    oud, _ = Atar.objects.get_or_create(name='Oud Al Layl', defaults={
        'description': 'Night Oud', 'top_notes': 'Floral', 'base_notes': 'Oud, Musk'
    })
    AtarVariant.objects.get_or_create(atar=oud, volume_ml=3, defaults={'price': 200, 'sku': 'OOUD-3', 'stock_quantity': 10})
    AtarVariant.objects.get_or_create(atar=oud, volume_ml=6, defaults={'price': 350, 'sku': 'OOUD-6', 'stock_quantity': 10})
    AtarVariant.objects.get_or_create(atar=oud, volume_ml=12, defaults={'price': 650, 'sku': 'OOUD-12', 'stock_quantity': 10})

    # PromoCode
    PromoCode.objects.get_or_create(code='WELCOME10', defaults={
        'discount_percentage': 10.0, 'valid_from': timezone.now(), 
        'valid_until': timezone.now() + timezone.timedelta(days=365)
    })
    print("Test data populated.")

if __name__ == '__main__':
    populate()
