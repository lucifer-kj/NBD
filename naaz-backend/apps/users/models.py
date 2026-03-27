from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Extended user model. Email is the primary auth identifier.
    loyalty_points_balance and favorite_scent_notes support future
    AI recommendations — fields are present but not actively used in Phase 1.
    """

    username = None  # Removed — we auth by email
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    # Loyalty System
    loyalty_points_balance = models.PositiveIntegerField(default=0)
    lifetime_spend = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # AI Context (scaffold — used post-production)
    LANGUAGE_CHOICES = [
        ('EN', 'English'), ('UR', 'Urdu'),
        ('AR', 'Arabic'), ('BN', 'Bengali'),
    ]
    preferred_language = models.CharField(
        max_length=2, choices=LANGUAGE_CHOICES, default='EN'
    )
    favorite_scent_notes = models.JSONField(default=list, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone_number']),
        ]

    def __str__(self):
        return f"{self.get_full_name()} <{self.email}>"


class UserAddress(models.Model):
    """One user → many saved addresses."""

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=50, default='Home')
    street = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pin_code = models.CharField(max_length=10)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_addresses'

    def save(self, *args, **kwargs):
        if self.is_default:
            # Unset other defaults for this user atomically
            UserAddress.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.label} — {self.user.email}"
