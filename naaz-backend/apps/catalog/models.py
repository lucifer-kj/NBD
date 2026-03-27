from django.db import models
from django.utils.text import slugify


class Book(models.Model):
    """
    Islamic literature catalog.

    search_embedding: VectorField column — present but NULL until post-production
    when we wire up pgvector + OpenAI embeddings. Do NOT import pgvector yet;
    add the column via raw migration to keep it nullable and infrastructure-free.
    """

    FORMAT_CHOICES = [
        ('HB', 'Hardcover'),
        ('PB', 'Paperback'),
        ('LB', 'Leather-bound'),
    ]
    LANGUAGE_CHOICES = [
        ('EN', 'English'), ('UR', 'Urdu'),
        ('AR', 'Arabic'), ('BN', 'Bengali'),
    ]
    SCRIPT_CHOICES = [
        ('AR', 'Arabic Script'),
        ('RM', 'Roman Script'),
        ('UR', 'Urdu Script'),
    ]

    # Identity
    title = models.CharField(max_length=500)
    slug = models.SlugField(unique=True, max_length=550)
    author = models.CharField(max_length=200)
    translator = models.CharField(max_length=200, blank=True, null=True)
    publisher = models.CharField(max_length=200)
    description = models.TextField()

    # Bibliographic
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)
    script_type = models.CharField(max_length=2, choices=SCRIPT_CHOICES)
    pages = models.PositiveIntegerField(null=True, blank=True)
    format = models.CharField(max_length=2, choices=FORMAT_CHOICES)
    isbn = models.CharField(max_length=20, blank=True, null=True, unique=True)

    # Commerce
    price = models.DecimalField(max_digits=8, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    # Media
    cover_image = models.ImageField(upload_to='books/covers/', blank=True, null=True)

    # AI Scaffold — column exists, NULL until post-production
    # search_embedding populated by: python manage.py generate_embeddings (Phase 7+)
    # For now: leave as JSONField placeholder so schema is forward-compatible
    search_vector_json = models.JSONField(null=True, blank=True, editable=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'books'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['language', 'script_type']),
            models.Index(fields=['is_active']),
            models.Index(fields=['price']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.get_language_display()} / {self.get_script_type_display()})"


class Atar(models.Model):
    """
    Parent Atar/Ittar — the scent identity.
    Sold in multiple volume variants (see AtarVariant).
    """

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=220)
    description = models.TextField()

    # Scent Profile (powers AI recommendations post-production)
    top_notes = models.CharField(
        max_length=300, blank=True,
        help_text="Comma-separated, e.g. Rose, Saffron, Bergamot"
    )
    heart_notes = models.CharField(max_length=300, blank=True)
    base_notes = models.CharField(
        max_length=300, blank=True,
        help_text="e.g. Oud, Musk, Amber, Sandalwood"
    )

    is_active = models.BooleanField(default=True)
    cover_image = models.ImageField(upload_to='atar/covers/', blank=True, null=True)

    # AI Scaffold — same pattern as Book
    search_vector_json = models.JSONField(null=True, blank=True, editable=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'atar'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class AtarVariant(models.Model):
    """
    Child variant: each volume size of an Atar.
    Example: Majmua → 3ml (₹150), 6ml (₹280), 12ml (₹520)
    """

    atar = models.ForeignKey(Atar, on_delete=models.CASCADE, related_name='variants')
    volume_ml = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'atar_variants'
        unique_together = ('atar', 'volume_ml')
        indexes = [models.Index(fields=['sku'])]

    def __str__(self):
        return f"{self.atar.name} — {self.volume_ml}ml @ ₹{self.price}"
