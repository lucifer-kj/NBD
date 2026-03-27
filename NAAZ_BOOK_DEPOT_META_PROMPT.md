# 🕌 NAAZ BOOK DEPOT — MASTER AGENT META PROMPT
## Headless E-Commerce Platform Blueprint
### Version 1.0 | For Antigravity IDE | Read Every Line Before Acting

---

> **AGENT DIRECTIVE:** You are a senior full-stack engineer building the Naaz Book Depot
> e-commerce platform from scratch. This document is your single source of truth.
> **Do not improvise. Do not skip sections. Execute phases in strict sequential order.**
> When in doubt, re-read this document before writing a single line of code.

---

## ⚠️ CRITICAL BUILD ORDER — READ BEFORE EVERYTHING

The build follows this exact sequence. Each phase must be complete and tested before the next begins:

```
PHASE 1 → Backend Models + Database (Django + PostgreSQL)
PHASE 2 → Backend API Layer (Django Ninja endpoints)
PHASE 3 → Frontend UI (Copy & adapt from naazbook.in — wire to live API)
PHASE 4 → Cart & Checkout (Instamojo payments + order flow)
PHASE 5 → Search (Elasticsearch keyword + transliteration)
PHASE 6 → Deployment (Production hardening + launch)

── POST-PRODUCTION (do NOT build now) ──────────────────────
PHASE 7 → Semantic Search / pgvector (add after launch)
PHASE 8 → AI Chatbot / Recommendations (add after launch)
```

**The database schema IS designed to support AI features later — but do not implement
pgvector embeddings, OpenAI calls, or the chatbot until after the platform is live and stable.**

---

## 📖 SECTION 1: BRAND & MISSION CONTEXT

| Field | Detail |
|---|---|
| **Brand** | Naaz Book Depot |
| **Established** | 1959 (65+ years legacy) |
| **Location** | Chittaranjan Avenue / College Square, Kolkata, WB — PIN 700073 |
| **Website (Reference UI)** | https://www.naazbook.in |
| **Category** | Islamic Literature & Traditional Atar (Non-alcoholic perfumes) |
| **Core Mission** | Digitize a 65-year-old physical heritage brand into a modern e-commerce platform — without losing cultural authenticity. |

**Key Products:**
- Islamic books: Sahih Al Bukhari, Tafsir Ibn Kathir, The Noble Quran (Arabic, Urdu, Roman scripts)
- Atar/Ittar: Traditional non-alcoholic perfumes in volume variants (3ml, 6ml, 12ml)

---

## 🎨 SECTION 2: BRAND DESIGN SYSTEM (SOURCE OF TRUTH)

> **Agent:** These are the EXACT brand tokens extracted from the live site. Use them everywhere.
> Never substitute your own color or font preferences.

### Colors

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#175746` | Deep Islamic green — primary text, headers, nav background, secondary buttons |
| `accent` | `#D3AF37` | Antique gold — primary CTA buttons, highlights, price tags, hover states |
| `background` | `#F8F0E3` | Warm cream — page background, aged-paper warmth |
| `textPrimary` | `#175746` | Body text and links |
| `surface` | `#FFFFFF` | Cards, modals, input fields |
| `inputText` | `#1F2937` | Text inside form inputs |

### Typography

| Role | Font Family | Size | Notes |
|---|---|---|---|
| **Display / Headings** | `Playfair Display`, serif | h1: 30px, h2: 48px | Elegant, literary serif |
| **Body / UI** | `Roboto`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Oxygen`, `Ubuntu`, `Cantarell`, sans-serif | 14px | System-font stack for body |
| **Arabic / Urdu Text** | `Noto Naskh Arabic`, serif | Contextual | For Arabic/Urdu product names and quotes |

### Spacing & Shape

| Token | Value | Notes |
|---|---|---|
| `baseUnit` | 4px | All spacing is multiples of 4 |
| `borderRadius` (default) | `0px` | Sharp corners on inputs, cards, secondary buttons |
| `borderRadius` (primary button) | `12px` | Rounded corners on gold CTA buttons only |

### Buttons

**Primary Button (Gold CTA):**
```css
background: #D3AF37;
color: #FFFFFF;
border-radius: 12px;
box-shadow: none;
/* Text: "View Complete Collection", "Add to Cart" */
```

**Secondary Button (Green):**
```css
background: #175746;
color: #FFFFFF;
border-radius: 0px;
box-shadow: none;
```

### Logo & Assets

| Asset | URL |
|---|---|
| Logo | `https://www.naazbook.in/lovable-uploads/logo.png` |
| Favicon | `https://www.naazbook.in/favicon.png` |
| Logo links to | `/` (homepage) |

### Tailwind CSS Config (Apply These Tokens)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#175746',
        accent: '#D3AF37',
        background: '#F8F0E3',
        surface: '#FFFFFF',
        'text-primary': '#175746',
        'input-text': '#1F2937',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Roboto', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
        arabic: ['"Noto Naskh Arabic"', 'serif'],
      },
      fontSize: {
        'h1': '30px',
        'h2': '48px',
        'body': '14px',
      },
      borderRadius: {
        'none': '0px',
        'btn': '12px',
      },
      spacing: {
        // All spacing uses multiples of 4px (default Tailwind 4px base = correct)
      },
    },
  },
  plugins: [],
}
export default config
```

---

## 🏛️ SECTION 3: SYSTEM ARCHITECTURE

### Architecture Pattern: **Headless / Decoupled**

Frontend and backend are two separate applications communicating via REST APIs.

```
┌───────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                         │
│   Browser / Mobile Browser                                │
└───────────────────────┬───────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼───────────────────────────────────┐
│                   FRONTEND (Next.js)                      │
│   Next.js 14 App Router │ Tailwind CSS │ Shadcn UI        │
│   React Query (server state) │ Zustand (cart)             │
└───────────────────────┬───────────────────────────────────┘
                        │ REST /api/*
┌───────────────────────▼───────────────────────────────────┐
│                   BACKEND (Django)                        │
│   Django 5.x + Django Ninja                               │
│   PostgreSQL 16 (+ pgvector column ready, NOT active yet) │
│   Celery + Redis (background jobs)                        │
│   Django Admin (client CMS)                               │
└───────┬──────────┬──────────┬──────────┬──────────────────┘
        │          │          │          │
   ┌────▼───┐ ┌───▼────┐ ┌───▼────┐ ┌───▼──────────────┐
   │Postgres│ │Elastic │ │ Redis  │ │   Instamojo      │
   │  16    │ │Search  │ │Cache + │ │   Payments       │
   │        │ │(Phase5)│ │ Queue  │ │   (Phase 4)      │
   └────────┘ └────────┘ └────────┘ └──────────────────┘

   ┌─────────────────────────────────────────────────────┐
   │  POST-PRODUCTION (wired but not active at launch)   │
   │  pgvector column on Book/Atar models (NULL for now) │
   │  OpenAI Embeddings app (scaffold only)              │
   │  AI Chatbot app (scaffold only)                     │
   └─────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Status |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Active — Phase 3 |
| Styling | Tailwind CSS + Shadcn UI | Active — Phase 3 |
| State (cart) | Zustand | Active — Phase 3 |
| State (server) | React Query / TanStack Query | Active — Phase 3 |
| Backend | Django 5.x | Active — Phase 1 |
| API Layer | Django Ninja | Active — Phase 2 |
| Database | PostgreSQL 16 | Active — Phase 1 |
| pgvector extension | Installed in DB, columns nullable | Scaffold only |
| Keyword Search | Elasticsearch 8.x | Active — Phase 5 |
| Semantic Search | pgvector + OpenAI | **Post-production** |
| AI Chatbot | OpenAI GPT-4 | **Post-production** |
| Cache & Queue | Redis 7 | Active — Phase 4 |
| Background Jobs | Celery | Active — Phase 4 |
| Payment Gateway | Instamojo | Active — Phase 4 |
| Containerization | Docker + Docker Compose | Active from Phase 1 |
| Deployment | Render/Railway (backend) + Vercel (frontend) | Phase 6 |

---

## 📁 SECTION 4: COMPLETE FOLDER STRUCTURE

### Backend: `naaz-backend/`

```
naaz-backend/
├── manage.py
├── requirements.txt
├── requirements-dev.txt
├── .env                              # Never commit
├── .env.example                      # Commit this
├── docker-compose.yml
├── Dockerfile
│
├── config/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py                   # Shared settings
│   │   ├── development.py            # DEBUG=True, local DB
│   │   └── production.py             # DEBUG=False, secure headers
│   ├── urls.py                       # Root URL config
│   ├── asgi.py
│   └── wsgi.py
│
├── apps/
│   │
│   ├── users/                        # PHASE 1
│   │   ├── __init__.py
│   │   ├── models.py                 # CustomUser, UserAddress
│   │   ├── admin.py                  # Full admin registration
│   │   ├── api.py                    # Auth endpoints
│   │   ├── schemas.py
│   │   ├── services.py               # OTP logic, loyalty helpers
│   │   ├── signals.py
│   │   └── tests.py
│   │
│   ├── catalog/                      # PHASE 1
│   │   ├── __init__.py
│   │   ├── models.py                 # Book, Atar, AtarVariant
│   │   ├── admin.py                  # Rich admin with filters
│   │   ├── api.py                    # Product endpoints
│   │   ├── schemas.py
│   │   ├── services.py               # Stock reservation
│   │   ├── search_indexes.py         # Elasticsearch mappings (Phase 5)
│   │   ├── embeddings.py             # pgvector scaffold — NOT wired (post-prod)
│   │   └── tests.py
│   │
│   ├── orders/                       # PHASE 1 models / PHASE 4 logic
│   │   ├── __init__.py
│   │   ├── models.py                 # Order, OrderItem, PromoCode, Refund
│   │   ├── admin.py
│   │   ├── api.py                    # Checkout + order management
│   │   ├── schemas.py
│   │   ├── services.py               # Checkout, stock lock, loyalty
│   │   ├── signals.py                # Loyalty point trigger on PAID
│   │   ├── state_machine.py          # Valid order state transitions
│   │   └── tests.py
│   │
│   ├── payments/                     # PHASE 4
│   │   ├── __init__.py
│   │   ├── models.py                 # PaymentRecord
│   │   ├── api.py                    # Instamojo webhook
│   │   ├── schemas.py
│   │   ├── instamojo.py              # Instamojo SDK wrapper
│   │   └── tests.py
│   │
│   ├── notifications/                # PHASE 4
│   │   ├── __init__.py
│   │   ├── tasks.py                  # Celery: email + WhatsApp
│   │   ├── email_service.py
│   │   ├── whatsapp_service.py
│   │   └── templates/
│   │       ├── email_invoice.html
│   │       └── email_order_confirm.html
│   │
│   ├── search/                       # PHASE 5
│   │   ├── __init__.py
│   │   ├── api.py                    # /api/search/ endpoint
│   │   ├── elastic_client.py         # ES connection + query builder
│   │   └── management/
│   │       └── commands/
│   │           └── index_products.py
│   │
│   ├── ai_assistant/                 # SCAFFOLD ONLY — post-production
│   │   ├── __init__.py
│   │   ├── api.py                    # Stubbed endpoint (returns 503)
│   │   ├── context_builder.py        # Stubbed — do not implement yet
│   │   └── schemas.py
│   │
│   └── core/                         # Shared utilities
│       ├── __init__.py
│       ├── exceptions.py             # InsufficientStockError, etc.
│       ├── pagination.py
│       └── permissions.py
│
└── celery_app.py
```

### Frontend: `naaz-frontend/`

```
naaz-frontend/
├── package.json
├── next.config.js
├── tailwind.config.ts                # Brand tokens from Section 2
├── tsconfig.json
├── .env.local
│
├── public/
│   ├── logo.png                      # Downloaded from naazbook.in
│   ├── favicon.png
│   └── fonts/                        # Self-host Noto Naskh Arabic
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root: fonts, providers, metadata
│   │   ├── page.tsx                  # Homepage (Hero, Featured, Categories)
│   │   ├── (shop)/
│   │   │   ├── books/
│   │   │   │   ├── page.tsx          # Books catalog with filters
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Book detail
│   │   │   ├── atar/
│   │   │   │   ├── page.tsx          # Atar catalog
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Atar detail + variant selector
│   │   │   ├── search/
│   │   │   │   └── page.tsx          # Search results
│   │   │   └── cart/
│   │   │       └── page.tsx          # Cart + checkout flow
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── account/
│   │       ├── orders/page.tsx
│   │       ├── loyalty/page.tsx
│   │       └── addresses/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # Shadcn base (do not modify)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Logo, nav links, search, cart icon
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── Providers.tsx         # React Query + auth context
│   │   ├── catalog/
│   │   │   ├── BookCard.tsx          # Card with cover, title, price, Add to Cart
│   │   │   ├── AtarCard.tsx          # Card with image, scent notes preview
│   │   │   ├── ProductGrid.tsx       # Responsive grid wrapper
│   │   │   ├── FilterSidebar.tsx     # Language, script, format, price range
│   │   │   └── VariantSelector.tsx   # Pill buttons: 3ml / 6ml / 12ml
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx        # Slide-in cart panel
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── CheckoutForm.tsx
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   └── SearchResults.tsx
│   │   ├── home/
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── FeaturedBooks.tsx
│   │   │   ├── FeaturedAtar.tsx
│   │   │   └── CategorySection.tsx
│   │   └── shared/
│   │       ├── ScriptBadge.tsx       # "Arabic Script" / "Roman Script" chips
│   │       ├── PriceDisplay.tsx      # ₹ formatting
│   │       ├── StockBadge.tsx        # "In Stock" / "Out of Stock"
│   │       └── LoadingSpinner.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts             # Axios instance with base URL + auth headers
│   │   │   ├── books.ts              # getBooks, getBook
│   │   │   ├── atar.ts               # getAtarList, getAtar
│   │   │   ├── orders.ts             # createOrder, getOrders
│   │   │   ├── auth.ts               # login, register, logout
│   │   │   └── search.ts             # search
│   │   ├── store/
│   │   │   ├── cartStore.ts          # Zustand cart (persisted to localStorage)
│   │   │   └── authStore.ts          # Zustand auth (JWT token)
│   │   └── utils/
│   │       ├── currency.ts           # formatINR(amount) → "₹1,299"
│   │       ├── cn.ts                 # clsx + twMerge helper
│   │       └── slugify.ts
│   │
│   └── types/
│       ├── book.ts
│       ├── atar.ts
│       ├── order.ts
│       └── user.ts
```

---

## 🗄️ SECTION 5: DATABASE MODELS (Django)

> **Agent:** Implement exactly as specified. Do not add or remove fields.
> The `search_embedding` VectorField is included on Book and Atar but remains NULL — this column
> exists so we can populate it post-production without a schema migration.

### `apps/users/models.py`

```python
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
```

### `apps/catalog/models.py`

```python
from django.db import models


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
```

### `apps/orders/models.py`

```python
from django.db import models
from django.conf import settings


class PromoCode(models.Model):
    """Admin-managed discount codes."""

    code = models.CharField(max_length=50, unique=True, db_index=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    max_discount_amount = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    times_used = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'promo_codes'

    def __str__(self):
        return f"{self.code} ({self.discount_percentage}% off)"


class Order(models.Model):
    """
    Master order record.

    CRITICAL INVARIANTS:
    1. financial fields (subtotal, final_amount, etc.) are IMMUTABLE after status=PAID
    2. State transitions must follow the valid paths in state_machine.py
    3. instamojo_payment_id uniqueness ensures idempotent webhook processing
    """

    class Status(models.TextChoices):
        CREATED = 'CREATED', 'Created'
        PENDING_PAYMENT = 'PENDING_PAYMENT', 'Pending Payment'
        PAID = 'PAID', 'Paid'
        PROCESSING = 'PROCESSING', 'Processing'
        SHIPPED = 'SHIPPED', 'Shipped'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'
        REFUNDED = 'REFUNDED', 'Refunded'
        RETURN_REQUESTED = 'RETURN_REQUESTED', 'Return Requested'
        RETURNED = 'RETURNED', 'Returned'
        FAILED_DELIVERY = 'FAILED_DELIVERY', 'Failed Delivery'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='orders'
    )
    # Snapshot of shipping address at order time — never join to UserAddress
    shipping_address = models.JSONField()

    # Financial Snapshot — SET ONCE at checkout, never recalculated after PAID
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    loyalty_points_used = models.PositiveIntegerField(default=0)
    loyalty_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Promo
    promo_code = models.ForeignKey(
        PromoCode, null=True, blank=True, on_delete=models.SET_NULL
    )

    # Status & Payment
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.CREATED, db_index=True
    )
    instamojo_payment_id = models.CharField(
        max_length=200, blank=True, null=True, unique=True
    )
    instamojo_payment_request_id = models.CharField(max_length=200, blank=True, null=True)

    # Logistics
    tracking_number = models.CharField(max_length=200, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['instamojo_payment_id']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Order #{self.id} — {self.user.email} — {self.status}"


class OrderItem(models.Model):
    """
    Individual line item in an order.

    CRITICAL: price_at_purchase and line_total are IMMUTABLE.
    They represent what the customer paid. Never reference the product's
    current price after an order is created.
    """

    ITEM_TYPE_CHOICES = [('BOOK', 'Book'), ('ATAR', 'Atar Variant')]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=5, choices=ITEM_TYPE_CHOICES)

    # Polymorphic reference — only one is set per row
    book = models.ForeignKey(
        'catalog.Book', null=True, blank=True, on_delete=models.PROTECT
    )
    atar_variant = models.ForeignKey(
        'catalog.AtarVariant', null=True, blank=True, on_delete=models.PROTECT
    )

    # Denormalized snapshot — captured at checkout time
    product_name = models.CharField(max_length=500)
    price_at_purchase = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.PositiveIntegerField()
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.product_name} × {self.quantity} @ ₹{self.price_at_purchase}"


class Refund(models.Model):
    """Refund tracking — per order or per item."""

    class RefundStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='refunds')
    order_item = models.ForeignKey(
        OrderItem, null=True, blank=True, on_delete=models.PROTECT
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(
        max_length=15, choices=RefundStatus.choices, default=RefundStatus.PENDING
    )
    instamojo_refund_id = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'refunds'
```

---

## 🔌 SECTION 6: API ENDPOINTS SPECIFICATION

> **Agent:** Implement all endpoints with Django Ninja. All protected endpoints
> require JWT auth. Use the schemas from Section 7.

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register/` | Public | Create account |
| POST | `/api/auth/login/` | Public | Returns JWT access + refresh tokens |
| POST | `/api/auth/token/refresh/` | Public | Refresh JWT |
| GET | `/api/auth/me/` | Required | Current user profile |

### Catalog Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/books/` | Public | List books (paginated + filterable) |
| GET | `/api/books/{slug}/` | Public | Book detail |
| GET | `/api/atar/` | Public | List Atar with variants |
| GET | `/api/atar/{slug}/` | Public | Atar detail with all variants |

**Query params for `/api/books/`:**
- `language=EN|UR|AR|BN`
- `script_type=AR|RM|UR`
- `format=HB|PB|LB`
- `min_price=`, `max_price=`
- `page=1`, `page_size=20`
- `search=` (keyword — active Phase 5 only)

### Order Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders/checkout/` | Required | Create order + get Instamojo payment URL |
| GET | `/api/orders/` | Required | User's order history |
| GET | `/api/orders/{order_id}/` | Required | Order detail |
| POST | `/api/orders/{order_id}/cancel/` | Required | Cancel (pre-shipping only) |

### Payment Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/webhook/instamojo/` | HMAC | Instamojo payment webhook |
| GET | `/api/payments/verify/{payment_id}/` | Required | Manual verification fallback |

### Search Endpoint (Phase 5)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/search/?q={query}` | Public | Keyword + transliteration search |
| GET | `/api/search/suggestions/?q={query}` | Public | Typeahead |

### AI Endpoints (Scaffold — returns 503 until post-production)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/chat/` | Optional | **Stub: {"error": "Coming soon"}** |

---

## 🖥️ SECTION 7: UI COPY STRATEGY (naazbook.in → New Frontend)

> **This is Phase 3. The published site at https://www.naazbook.in is the UI reference.**
> Do NOT redesign from scratch. Copy the layout, content, structure, and component patterns.
> Then wire every data point to the live Django API instead of hardcoded content.
> Tweaks for improvement are allowed but the visual identity must match the reference site.

### Step-by-Step UI Copy Process

```
1. Open https://www.naazbook.in in browser
2. For each page below:
   a. Screenshot the full page
   b. Note every section, component, and content block
   c. Recreate the component in React using brand tokens (Section 2)
   d. Replace all hardcoded text/images with API data
   e. Keep all visual patterns, spacing, and layout choices
```

### Pages to Copy (in order)

**Page 1: Homepage (`/`)**
- [ ] Copy hero banner — headline, subheadline, CTA buttons
- [ ] Copy featured books section — use `GET /api/books/?page_size=6` for data
- [ ] Copy featured Atar section — use `GET /api/atar/?page_size=4`
- [ ] Copy category navigation section
- [ ] Copy brand story / legacy section ("Est. 1959")
- [ ] Copy footer — address, links, social

**Page 2: Books Catalog (`/books/`)**
- [ ] Copy page layout, hero header
- [ ] Copy filter sidebar — language, script, format, price range
- [ ] Copy product grid — BookCard components
- [ ] Copy pagination controls
- [ ] Wire to: `GET /api/books/` with filter params

**Page 3: Book Detail (`/books/[slug]/`)**
- [ ] Copy product detail layout — image, title, author, price, description
- [ ] Copy script/language badges
- [ ] Copy quantity selector + Add to Cart button (gold, rounded)
- [ ] Copy product details section (pages, publisher, ISBN)
- [ ] Wire to: `GET /api/books/{slug}/`

**Page 4: Atar Catalog (`/atar/`)**
- [ ] Copy layout and AtarCard design
- [ ] Note scent notes display pattern
- [ ] Wire to: `GET /api/atar/`

**Page 5: Atar Detail (`/atar/[slug]/`)**
- [ ] Copy scent notes display (top / heart / base)
- [ ] Copy variant selector — MUST be pill buttons not a dropdown
  - `[3ml — ₹150]` `[6ml — ₹280]` `[12ml — ₹520]`
  - Selected pill: gold background (#D3AF37)
  - Unselected pill: green border (#175746), white background
- [ ] Wire to: `GET /api/atar/{slug}/`

**Page 6: Cart (`/cart/`)**
- [ ] Copy cart layout — items, quantities, subtotal
- [ ] Copy promo code input field
- [ ] Copy order summary sidebar
- [ ] Wire to: Zustand cartStore + checkout API (Phase 4)

**Page 7: Auth Pages (`/login/`, `/register/`)**
- [ ] Copy form layout and branding

**Page 8: Account Pages**
- [ ] Copy orders list and detail layout
- [ ] Wire to: `GET /api/orders/`

### Component Improvement Opportunities

These are acceptable improvements over the reference site:

| Component | Reference | Improvement |
|---|---|---|
| Navbar | Static | Add live cart count badge on cart icon |
| BookCard | Basic | Add "In Stock" / "Out of Stock" badge |
| AtarCard | Image only | Show top notes as small chips |
| Mobile nav | Basic | Slide-in drawer with all navigation links |
| Search bar | Limited | Debounced live search with suggestions |
| Product images | Single | Add image zoom on hover for desktop |

---

## ⚙️ SECTION 8: CORE BUSINESS LOGIC & EDGE CASES

> **Agent:** All rules must be enforced at the service layer. The API layer validates input.
> The service layer enforces business rules. The model layer maintains data integrity.

### 8A. Checkout Service (Price Integrity)

```
CHECKOUT FLOW — SERVER SIDE ONLY:

1.  Receive: [{item_type, item_id, quantity}, ...] + shipping_address_id + promo_code?
2.  For each item:
    a. Fetch CURRENT price from DB (never trust frontend price)
    b. Check is_active = True
    c. stock_quantity >= requested quantity — use select_for_update()
    d. If ANY item fails → reject ENTIRE checkout with 409 Conflict
    e. Include item-level error message: "Only 2 units of X available"
3.  Validate promo_code server-side (if provided)
4.  Validate loyalty_points_to_use (must not exceed balance OR 20% of subtotal)
5.  Calculate:
    - subtotal = sum(current_price × quantity)
    - discount_amount = promo_code_discount (if valid)
    - loyalty_discount_amount = loyalty_points_to_use × 1.00 (1 point = ₹1)
    - final_amount = subtotal - discount_amount - loyalty_discount_amount
6.  BEGIN TRANSACTION:
    a. Create Order (status=CREATED)
    b. Create OrderItems (with price_at_purchase = current DB price)
    c. RESERVE STOCK (reduce stock_quantity for all items)
    d. Mark promo code times_used += 1 (atomic)
    e. Deduct loyalty_points_used from user balance (atomic)
    f. Set Order status = PENDING_PAYMENT
    g. Create Instamojo payment request
    h. Save instamojo_payment_request_id to Order
7.  COMMIT TRANSACTION
8.  Return {order_id, payment_url} to frontend
9.  Frontend redirects user to payment_url

WHAT IF TRANSACTION FAILS?
→ Full rollback — stock NOT reduced, order NOT created, promo NOT incremented
```

### 8B. Stock Reservation (Concurrency Protection)

```python
# apps/catalog/services.py
from django.db import transaction, models as db_models
from apps.core.exceptions import InsufficientStockError

def reserve_stock(items: list) -> None:
    """
    Atomically reserves stock for all items in a single transaction.
    Uses SELECT FOR UPDATE to prevent two simultaneous checkouts from
    buying the last available item.

    items: [{"type": "BOOK"|"ATAR", "id": int, "quantity": int}]
    """
    with transaction.atomic():
        for item in items:
            if item['type'] == 'BOOK':
                from apps.catalog.models import Book
                product = Book.objects.select_for_update().get(
                    id=item['id'], is_active=True
                )
                name = product.title
            else:
                from apps.catalog.models import AtarVariant
                product = AtarVariant.objects.select_for_update().get(
                    id=item['id'], is_active=True
                )
                name = str(product)

            if product.stock_quantity < item['quantity']:
                raise InsufficientStockError(
                    product_name=name,
                    available=product.stock_quantity,
                    requested=item['quantity']
                )
            product.stock_quantity -= item['quantity']
            product.save(update_fields=['stock_quantity'])


def release_stock(order) -> None:
    """
    Restores stock when order is cancelled or payment fails.
    Uses F() expressions for atomicity.
    """
    with transaction.atomic():
        for item in order.items.all():
            if item.book_id:
                from apps.catalog.models import Book
                Book.objects.filter(id=item.book_id).update(
                    stock_quantity=db_models.F('stock_quantity') + item.quantity
                )
            elif item.atar_variant_id:
                from apps.catalog.models import AtarVariant
                AtarVariant.objects.filter(id=item.atar_variant_id).update(
                    stock_quantity=db_models.F('stock_quantity') + item.quantity
                )
```

### 8C. Order State Machine

```python
# apps/orders/state_machine.py

VALID_TRANSITIONS = {
    'CREATED': ['PENDING_PAYMENT'],
    'PENDING_PAYMENT': ['PAID', 'CANCELLED'],
    'PAID': ['PROCESSING', 'CANCELLED'],        # Cancel allowed before SHIPPED
    'PROCESSING': ['SHIPPED'],
    'SHIPPED': ['DELIVERED', 'FAILED_DELIVERY'],
    'DELIVERED': ['RETURN_REQUESTED'],
    'RETURN_REQUESTED': ['RETURNED'],
    'RETURNED': ['REFUNDED'],
    'CANCELLED': [],    # Terminal state
    'REFUNDED': [],     # Terminal state
    'FAILED_DELIVERY': ['REFUNDED'],
}

def transition(order, new_status: str) -> None:
    """
    Validates and applies a state transition.
    Raises ValueError on invalid transition.
    """
    current = order.status
    allowed = VALID_TRANSITIONS.get(current, [])

    if new_status not in allowed:
        raise ValueError(
            f"Cannot transition Order #{order.id} from {current} to {new_status}. "
            f"Allowed: {allowed}"
        )

    # Release stock if cancelling from PAID
    if new_status == 'CANCELLED' and current == 'PAID':
        from apps.catalog.services import release_stock
        release_stock(order)

    order.status = new_status
    order.save(update_fields=['status', 'updated_at'])
```

### 8D. Loyalty Engine

```python
# apps/orders/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import models as db_models

POINTS_PER_RUPEE = 0.01  # ₹100 = 1 point

@receiver(post_save, sender='orders.Order')
def award_loyalty_points_on_paid(sender, instance, **kwargs):
    """
    Award loyalty points when order transitions to PAID.
    Uses F() to prevent race conditions.
    Only fires when status changes TO 'PAID'.
    """
    # Detect status change using update_fields if possible
    if instance.status == 'PAID':
        from django.db import transaction
        points_earned = int(float(instance.final_amount) * POINTS_PER_RUPEE)
        if points_earned > 0:
            with transaction.atomic():
                instance.user.__class__.objects.filter(id=instance.user_id).update(
                    loyalty_points_balance=db_models.F('loyalty_points_balance') + points_earned,
                    lifetime_spend=db_models.F('lifetime_spend') + instance.final_amount,
                )
```

### 8E. Promo Code Validation (Atomic)

```python
# apps/orders/services.py
from decimal import Decimal
from django.db import models as db_models
from django.utils import timezone
from apps.orders.models import PromoCode

def validate_and_apply_promo(code: str, subtotal: Decimal) -> Decimal:
    """
    Validates promo code and returns discount amount.
    Increments times_used atomically (prevents race condition at usage_limit).
    Raises ValueError with user-facing message on any failure.
    """
    try:
        promo = PromoCode.objects.get(code=code.upper().strip(), is_active=True)
    except PromoCode.DoesNotExist:
        raise ValueError("Invalid or expired promo code.")

    now = timezone.now()
    if not (promo.valid_from <= now <= promo.valid_until):
        raise ValueError("This promo code has expired.")

    if promo.usage_limit is not None:
        # Atomic increment with ceiling check
        updated = PromoCode.objects.filter(
            id=promo.id,
            times_used__lt=promo.usage_limit
        ).update(times_used=db_models.F('times_used') + 1)
        if updated == 0:
            raise ValueError("This promo code has reached its usage limit.")
    else:
        PromoCode.objects.filter(id=promo.id).update(
            times_used=db_models.F('times_used') + 1
        )

    discount = subtotal * (promo.discount_percentage / Decimal('100'))
    if promo.max_discount_amount:
        discount = min(discount, promo.max_discount_amount)

    return discount
```

### 8F. Instamojo Webhook (Idempotency)

```python
# apps/payments/api.py
@router.post("/webhook/instamojo/")
def instamojo_webhook(request, payload: WebhookPayload):
    """
    IDEMPOTENT webhook handler.
    Calling this twice with the same payment_id is safe — second call is a no-op.
    """
    # Step 1: Verify HMAC signature
    if not verify_instamojo_mac(request, payload):
        return HttpResponse(status=400)

    payment_id = payload.payment_id

    # Step 2: Idempotency — already processed?
    from apps.orders.models import Order
    try:
        order = Order.objects.get(instamojo_payment_id=payment_id)
        if order.status not in ['CREATED', 'PENDING_PAYMENT']:
            return {"status": "already_processed"}
    except Order.DoesNotExist:
        # Try to find by payment_request_id
        order = Order.objects.filter(
            instamojo_payment_request_id=payload.payment_request_id
        ).first()
        if not order:
            return HttpResponse(status=404)

    # Step 3: Process payment result
    if payload.status == "Credit":
        from apps.orders.state_machine import transition
        from apps.notifications.tasks import send_order_confirmation
        from django.db import transaction

        with transaction.atomic():
            order.instamojo_payment_id = payment_id
            order.save(update_fields=['instamojo_payment_id'])
            transition(order, 'PAID')  # Triggers loyalty signal

        send_order_confirmation.delay(order.id)

    elif payload.status in ["Failed", "Expired"]:
        from apps.catalog.services import release_stock
        from apps.orders.state_machine import transition
        release_stock(order)
        transition(order, 'CANCELLED')

    return {"status": "ok"}
```

---

## 💳 SECTION 9: PAYMENT INTEGRATION (Instamojo)

```python
# apps/payments/instamojo.py
import requests
from django.conf import settings

# Sandbox: https://test.instamojo.com/api/1.1
# Production: https://www.instamojo.com/api/1.1
INSTAMOJO_BASE = getattr(settings, 'INSTAMOJO_BASE_URL', 'https://test.instamojo.com/api/1.1')


def create_payment_request(order) -> dict:
    """
    Creates an Instamojo payment request and returns the dict including payment_url.
    Called from the checkout service after order is created.
    """
    headers = {
        'X-Api-Key': settings.INSTAMOJO_API_KEY,
        'X-Auth-Token': settings.INSTAMOJO_AUTH_TOKEN,
    }
    data = {
        'purpose': f'Naaz Book Depot — Order #{order.id}',
        'amount': str(order.final_amount),
        'buyer_name': order.user.get_full_name() or order.user.email,
        'email': order.user.email,
        'phone': order.user.phone_number or '',
        'redirect_url': (
            f"{settings.FRONTEND_URL}/order/confirmation/"
            f"?order_id={order.id}&payment_id={{payment_id}}"
        ),
        'webhook': f"{settings.BACKEND_URL}/api/payments/webhook/instamojo/",
        'allow_repeated_payments': False,
        'send_email': True,
        'send_sms': bool(order.user.phone_number),
    }
    response = requests.post(
        f"{INSTAMOJO_BASE}/payment-requests/",
        data=data,
        headers=headers,
        timeout=30,
    )
    response.raise_for_status()
    result = response.json()

    if not result.get('success'):
        raise ValueError(f"Instamojo error: {result}")

    return result['payment_request']


def verify_instamojo_mac(request_body: bytes, mac_header: str) -> bool:
    """
    Verify HMAC SHA1 signature on incoming webhook.
    See: https://docs.instamojo.com/v2/docs/handling-payment-webhooks
    """
    import hmac
    import hashlib
    expected = hmac.new(
        settings.INSTAMOJO_PRIVATE_SALT.encode(),
        request_body,
        hashlib.sha1
    ).hexdigest()
    return hmac.compare_digest(expected, mac_header)
```

---

## 📬 SECTION 10: BACKGROUND TASKS (Celery)

```python
# apps/notifications/tasks.py
from celery import shared_task
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_order_confirmation(self, order_id: int):
    """
    Triggered by webhook after payment success.
    Sends: email invoice + WhatsApp confirmation (if phone exists).
    """
    try:
        from apps.orders.models import Order
        order = (
            Order.objects
            .select_related('user')
            .prefetch_related('items')
            .get(id=order_id)
        )

        # Email invoice
        from apps.notifications.email_service import send_invoice_email
        send_invoice_email(order)

        # WhatsApp (optional — only if phone number present)
        if order.user.phone_number:
            from apps.notifications.whatsapp_service import send_whatsapp_confirmation
            send_whatsapp_confirmation(order)

        logger.info(f"Confirmation sent for Order #{order_id}")

    except Exception as exc:
        logger.error(f"Confirmation failed for Order #{order_id}: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=5, default_retry_delay=120)
def process_refund(self, refund_id: int):
    """Process refund via Instamojo API. Retries on failure."""
    try:
        from apps.orders.models import Refund
        refund = Refund.objects.select_related('order').get(id=refund_id)
        # TODO: Call Instamojo refund API
        # refund.status = 'COMPLETED'
        # refund.save()
    except Exception as exc:
        raise self.retry(exc=exc)
```

---

## 🔍 SECTION 11: SEARCH — PHASE 5 (Elasticsearch Only)

> **Note:** Phase 5 implements Elasticsearch keyword + transliteration search only.
> pgvector semantic/intent search is Post-Production (Phase 7+). Do NOT implement it now.

### Elasticsearch Setup

```yaml
# docker-compose.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - esdata:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9200"]
      interval: 30s
      retries: 5
```

### Index Mappings with Synonym Filter

```python
# apps/search/elastic_client.py
BOOK_INDEX_SETTINGS = {
    "settings": {
        "analysis": {
            "filter": {
                "islamic_synonyms": {
                    "type": "synonym",
                    "synonyms": [
                        # Quran variants
                        "quran, quraan, quran, koran, coran, al-quran, al quran, the quran",
                        # Hadith variants
                        "bukhari, al-bukhari, bokhari, albukhari",
                        "hadith, hadeeth, hadees, hades",
                        # Common terms
                        "prophet, nabi, rasool, rasul, messenger",
                        "allah, god, al-lah",
                        "sunnah, sunna, sunnat",
                        # Atar variants
                        "oud, aoud, oudh, oodh, oud wood",
                        "atar, attar, itr, ittar, ittr",
                        "musk, musc, misk",
                    ]
                }
            },
            "analyzer": {
                "naaz_analyzer": {
                    "type": "custom",
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase",
                        "asciifolding",   # Handles diacritics: ā→a, ū→u
                        "islamic_synonyms"
                    ]
                }
            }
        }
    },
    "mappings": {
        "properties": {
            "id": {"type": "integer"},
            "type": {"type": "keyword"},  # "book" or "atar"
            "title": {"type": "text", "analyzer": "naaz_analyzer"},
            "author": {"type": "text", "analyzer": "naaz_analyzer"},
            "description": {"type": "text", "analyzer": "naaz_analyzer"},
            "language": {"type": "keyword"},
            "script_type": {"type": "keyword"},
            "price": {"type": "float"},
            "slug": {"type": "keyword"},
            "is_active": {"type": "boolean"},
            "stock_available": {"type": "boolean"},
        }
    }
}
```

### Index Products Management Command

```python
# apps/search/management/commands/index_products.py
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Index all active products into Elasticsearch'

    def handle(self, *args, **options):
        from apps.search.elastic_client import es, BOOK_INDEX_SETTINGS
        from apps.catalog.models import Book, Atar

        # Create/update index
        if not es.indices.exists(index='naaz_products'):
            es.indices.create(index='naaz_products', body=BOOK_INDEX_SETTINGS)

        count = 0
        for book in Book.objects.filter(is_active=True):
            es.index(index='naaz_products', id=f"book_{book.id}", document={
                'id': book.id, 'type': 'book',
                'title': book.title, 'author': book.author,
                'description': book.description,
                'language': book.language, 'script_type': book.script_type,
                'price': float(book.price),
                'slug': book.slug,
                'is_active': book.is_active,
                'stock_available': book.stock_quantity > 0,
            })
            count += 1

        for atar in Atar.objects.filter(is_active=True):
            es.index(index='naaz_products', id=f"atar_{atar.id}", document={
                'id': atar.id, 'type': 'atar',
                'title': atar.name,
                'description': f"{atar.description} {atar.top_notes} {atar.heart_notes} {atar.base_notes}",
                'price': float(atar.variants.order_by('price').first().price) if atar.variants.exists() else 0,
                'slug': atar.slug,
                'is_active': atar.is_active,
                'stock_available': atar.variants.filter(stock_quantity__gt=0).exists(),
            })
            count += 1

        self.stdout.write(self.style.SUCCESS(f'✅ Indexed {count} products'))
```

---

## 🔐 SECTION 12: SECURITY CHECKLIST

| # | Rule | Where Enforced |
|---|---|---|
| 1 | Never trust frontend price | `checkout_service.py` — reprice from DB |
| 2 | JWT auth on all protected endpoints | Django Ninja `auth=django_auth` |
| 3 | Sanitize all inputs | Pydantic schemas (auto via Django Ninja) |
| 4 | Verify Instamojo webhook HMAC | `verify_instamojo_mac()` — first line of webhook |
| 5 | Rate limit auth endpoints | `django-ratelimit` on login/register/OTP |
| 6 | Use Django ORM only — no raw SQL | Project-wide convention |
| 7 | Use slugs in URLs, not numeric IDs (catalog) | Model `slug` field + URL routing |
| 8 | CORS restricted to frontend origin only | `django-cors-headers` config |
| 9 | All secrets in `.env` only | `python-dotenv` + `.gitignore` |
| 10 | Duplicate webhook calls are no-ops | Idempotency check in webhook handler |
| 11 | Order cancellation blocked after SHIPPED | `state_machine.py` transition validation |
| 12 | Stock reservation uses `select_for_update()` | `reserve_stock()` service |
| 13 | Promo code increment is atomic | `F('times_used') + 1` with filter ceiling |
| 14 | Admin panel on non-standard URL | `ADMIN_URL = env('ADMIN_URL', default='admin/')` |

---

## 🌐 SECTION 13: ENVIRONMENT VARIABLES

### `naaz-backend/.env`

```env
# Django Core
SECRET_KEY=replace-with-50-char-random-string
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Admin URL (change in production)
ADMIN_URL=admin/

# Database
DATABASE_URL=postgresql://naaz_user:password@localhost:5432/naaz_db
# Or individual vars:
DB_NAME=naaz_db
DB_USER=naaz_user
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# Instamojo (use sandbox keys in development)
INSTAMOJO_BASE_URL=https://test.instamojo.com/api/1.1
INSTAMOJO_API_KEY=your-sandbox-api-key
INSTAMOJO_AUTH_TOKEN=your-sandbox-auth-token
INSTAMOJO_PRIVATE_SALT=your-sandbox-private-salt

# Email
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=naaz@example.com
EMAIL_HOST_PASSWORD=app-password
DEFAULT_FROM_EMAIL=Naaz Book Depot <noreply@naazbook.in>

# WhatsApp / Twilio (optional in Phase 4)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Post-production AI (do NOT set these until Phase 7+)
# OPENAI_API_KEY=sk-...
```

### `naaz-frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BRAND_NAME=Naaz Book Depot
```

---

## 🐳 SECTION 14: DOCKER COMPOSE

```yaml
# docker-compose.yml
version: '3.9'

services:
  db:
    image: pgvector/pgvector:pg16
    # Using pgvector image so the extension is available post-production
    # For now the extension is installed but NOT activated in application code
    environment:
      POSTGRES_DB: naaz_db
      POSTGRES_USER: naaz_user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U naaz_user -d naaz_db"]
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - esdata:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9200/_cluster/health"]
      interval: 30s
      retries: 5

  backend:
    build: ./naaz-backend
    command: python manage.py runserver 0.0.0.0:8000
    env_file: ./naaz-backend/.env
    environment:
      - DJANGO_SETTINGS_MODULE=config.settings.development
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./naaz-backend:/app
      - media_files:/app/media

  celery:
    build: ./naaz-backend
    command: celery -A celery_app worker --loglevel=info --concurrency=2
    env_file: ./naaz-backend/.env
    environment:
      - DJANGO_SETTINGS_MODULE=config.settings.development
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./naaz-backend:/app

volumes:
  pgdata:
  esdata:
  media_files:
```

---

## 📦 SECTION 15: REQUIREMENTS FILES

### `naaz-backend/requirements.txt`

```
# Core Django
Django==5.0.4
django-ninja==1.1.0
psycopg2-binary==2.9.9

# Auth
djangorestframework-simplejwt==5.3.1

# Cache & Queue
celery==5.3.6
redis==5.0.3
django-redis==5.4.0

# Search (Phase 5)
elasticsearch==8.12.0
elasticsearch-dsl==8.9.0

# Payments
requests==2.31.0

# Utils
python-dotenv==1.0.1
Pillow==10.2.0
django-cors-headers==4.3.1
django-ratelimit==4.1.0
django-storages==1.14.2

# Notifications
twilio==8.13.0

# Testing
pytest-django==4.7.0
factory-boy==3.3.0
coverage==7.4.0

# Linting
ruff==0.3.0

# Post-production only — uncomment when starting Phase 7
# pgvector==0.2.5
# openai==1.14.0
```

### `naaz-frontend/package.json` (key dependencies)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "tailwindcss": "^3.4.3",
    "@tanstack/react-query": "^5.28.0",
    "zustand": "^4.5.2",
    "axios": "^1.6.8",
    "lucide-react": "^0.372.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.2.2"
  },
  "devDependencies": {
    "typescript": "^5.4.3",
    "@types/react": "^18.3.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

---

## 🗺️ SECTION 16: DEVELOPMENT ROADMAP

> **Agent:** Execute phases in exact order. Do not skip ahead. Checklist items must be complete
> before moving to the next phase.

---

### ✅ PHASE 1 — BACKEND FOUNDATION (Database + Models)

**Goal:** Working Django project, all models migrated, all entities visible in Django Admin.

```
[ ] 1.1   mkdir naaz-book-depot && cd naaz-book-depot
[ ] 1.2   mkdir naaz-backend naaz-frontend
[ ] 1.3   cd naaz-backend && python -m venv venv && source venv/bin/activate
[ ] 1.4   pip install Django==5.0.4 django-ninja psycopg2-binary Pillow python-dotenv
          django-cors-headers djangorestframework-simplejwt
[ ] 1.5   django-admin startproject config .
[ ] 1.6   Create apps: users, catalog, orders, payments, notifications, search,
          ai_assistant (stub), core
          → python manage.py startapp [name] for each, move into apps/ folder
[ ] 1.7   Configure config/settings/base.py:
          - AUTH_USER_MODEL = 'users.CustomUser'
          - INSTALLED_APPS (add all apps)
          - DATABASES (PostgreSQL)
          - MEDIA_ROOT, MEDIA_URL
[ ] 1.8   docker-compose up -d db → verify PostgreSQL is running
[ ] 1.9   Implement CustomUser + UserAddress models (Section 5)
[ ] 1.10  Implement Book, Atar, AtarVariant models (Section 5)
[ ] 1.11  Implement Order, OrderItem, PromoCode, Refund models (Section 5)
[ ] 1.12  python manage.py makemigrations → review generated migrations
[ ] 1.13  python manage.py migrate
[ ] 1.14  Register ALL models in admin.py with:
          - list_display (key fields)
          - list_filter (status, language, is_active)
          - search_fields (title, email, code)
          - readonly_fields on Order (financial fields after PAID)
[ ] 1.15  python manage.py createsuperuser
[ ] 1.16  python manage.py runserver → visit /admin/ → verify all models visible
[ ] 1.17  Enter test data via admin:
          - 3 Books (different languages/scripts)
          - 2 Atar with 3 variants each
          - 1 PromoCode
[ ] 1.18  python manage.py test apps/ → all pass

PHASE 1 COMPLETE WHEN: Admin panel shows all entities with test data.
```

---

### ✅ PHASE 2 — API LAYER (Django Ninja)

**Goal:** All API endpoints documented and testable via Swagger UI.

```
[ ] 2.1   Install django-ninja, configure NinjaAPI in config/urls.py
[ ] 2.2   Create apps/users/schemas.py (UserOut, RegisterIn, LoginIn)
[ ] 2.3   Create apps/catalog/schemas.py (BookOut, AtarOut, AtarVariantOut)
[ ] 2.4   Create apps/orders/schemas.py (CheckoutIn, OrderOut, CartItemIn)
[ ] 2.5   Implement auth endpoints: /api/auth/register/, /api/auth/login/, /api/auth/me/
[ ] 2.6   Implement GET /api/books/ with pagination + language/script/format filters
[ ] 2.7   Implement GET /api/books/{slug}/
[ ] 2.8   Implement GET /api/atar/ (with nested variants)
[ ] 2.9   Implement GET /api/atar/{slug}/
[ ] 2.10  Stub AI endpoint: POST /api/ai/chat/ → returns {"error": "Coming soon", "code": 503}
[ ] 2.11  Visit http://localhost:8000/api/docs → verify all endpoints documented
[ ] 2.12  Test each endpoint manually via Swagger UI with test data from Phase 1
[ ] 2.13  Write tests for each endpoint in apps/*/tests.py

PHASE 2 COMPLETE WHEN: All catalog endpoints return correct data via Swagger UI.
```

---

### ✅ PHASE 3 — FRONTEND UI (Copy naazbook.in + Wire to API)

**Goal:** Pixel-accurate recreation of naazbook.in UI, all data from live Django API.

```
[ ] 3.1   cd naaz-frontend
          npx create-next-app@latest . --typescript --tailwind --app --src-dir
[ ] 3.2   npm install zustand @tanstack/react-query axios lucide-react clsx tailwind-merge
[ ] 3.3   npx shadcn-ui@latest init (use brand colors from Section 2)
[ ] 3.4   Configure tailwind.config.ts with all brand tokens (Section 2)
[ ] 3.5   Create src/lib/api/client.ts — Axios instance pointing to backend
[ ] 3.6   Add Google Fonts in layout.tsx: Playfair Display + Noto Naskh Arabic
[ ] 3.7   Download logo from naazbook.in/lovable-uploads/logo.png → /public/logo.png

--- Copy UI Pages (visit naazbook.in, replicate each) ---

[ ] 3.8   Build Navbar.tsx (logo, nav links, search, cart icon with badge)
[ ] 3.9   Build Footer.tsx (address, social, links)
[ ] 3.10  Build Homepage page.tsx:
          - HeroBanner.tsx (headline + CTA from reference site)
          - FeaturedBooks.tsx (API: GET /api/books/?page_size=6)
          - FeaturedAtar.tsx (API: GET /api/atar/?page_size=4)
          - CategorySection.tsx
          - BrandStory.tsx (Est. 1959 section)
[ ] 3.11  Build BookCard.tsx + AtarCard.tsx
[ ] 3.12  Build /books/ catalog page (FilterSidebar + ProductGrid)
[ ] 3.13  Build /books/[slug]/ detail page (image, info, Add to Cart)
[ ] 3.14  Build /atar/ catalog page
[ ] 3.15  Build /atar/[slug]/ detail page with VariantSelector.tsx (pill buttons)
[ ] 3.16  Build CartDrawer.tsx (Zustand store) + CartSummary.tsx
[ ] 3.17  Build /login/ and /register/ auth pages
[ ] 3.18  Build /account/orders/ and /account/loyalty/ pages
[ ] 3.19  Implement SearchBar.tsx (debounced, connects to /api/search/ in Phase 5)
[ ] 3.20  Mobile responsive test — all pages must work on 375px width
[ ] 3.21  Pixel-check UI against naazbook.in screenshots

PHASE 3 COMPLETE WHEN: All pages render with live API data. Cart adds/removes items.
No broken images. Responsive on mobile. Colors and fonts match Section 2 exactly.
```

---

### ✅ PHASE 4 — CART, CHECKOUT & PAYMENTS

**Goal:** End-to-end order flow: add to cart → checkout → pay → receive confirmation.

```
[ ] 4.1   Implement apps/core/exceptions.py (InsufficientStockError, InvalidPromoCode)
[ ] 4.2   Implement apps/catalog/services.py: reserve_stock(), release_stock()
[ ] 4.3   Implement apps/orders/state_machine.py (Section 8C)
[ ] 4.4   Implement apps/orders/services.py: checkout_service() (Section 8A)
[ ] 4.5   Implement apps/orders/signals.py: loyalty points on PAID (Section 8D)
[ ] 4.6   Implement apps/orders/services.py: validate_and_apply_promo() (Section 8E)
[ ] 4.7   Implement POST /api/orders/checkout/ endpoint
[ ] 4.8   Implement GET /api/orders/ + GET /api/orders/{order_id}/
[ ] 4.9   Implement POST /api/orders/{order_id}/cancel/ (with state machine check)
[ ] 4.10  Set up Instamojo sandbox account (https://test.instamojo.com)
[ ] 4.11  Implement apps/payments/instamojo.py (Section 9)
[ ] 4.12  Connect checkout endpoint to Instamojo → returns payment_url
[ ] 4.13  docker-compose up -d redis
[ ] 4.14  Configure celery_app.py
[ ] 4.15  Implement apps/notifications/tasks.py: send_order_confirmation (Section 10)
[ ] 4.16  Implement apps/notifications/email_service.py + email_invoice.html template
[ ] 4.17  Implement Instamojo webhook: POST /api/payments/webhook/instamojo/ (Section 8F)
[ ] 4.18  Install ngrok → expose port 8000 → configure Instamojo sandbox webhook URL
[ ] 4.19  Frontend: Wire CheckoutForm.tsx to POST /api/orders/checkout/
[ ] 4.20  Frontend: Redirect to Instamojo payment page on checkout
[ ] 4.21  Frontend: Build /order/confirmation/ page (success + order summary)
[ ] 4.22  Frontend: Display promo code input in cart (validates on apply)
[ ] 4.23  End-to-end test with Instamojo sandbox:
          Add items → checkout → pay → webhook fires →
          Order status=PAID → Email sent → Loyalty points awarded ✓

PHASE 4 COMPLETE WHEN: Full order flow works in sandbox. Email received. Loyalty points added.
```

---

### ✅ PHASE 5 — SEARCH (Elasticsearch)

**Goal:** Search handles "Koran", "Qur'an", "Bukhari", "Bokhari" correctly.

```
[ ] 5.1   docker-compose up -d elasticsearch → wait 30s for startup
[ ] 5.2   Implement apps/search/elastic_client.py (Section 11)
[ ] 5.3   Create Elasticsearch index with synonym analyzer (Section 11)
[ ] 5.4   Implement management command: python manage.py index_products (Section 11)
[ ] 5.5   Run: python manage.py index_products → verify count matches DB
[ ] 5.6   Connect Book admin post_save signal → re-index book on save
[ ] 5.7   Connect Atar admin post_save signal → re-index atar on save
[ ] 5.8   Implement GET /api/search/?q= endpoint with fuzzy matching
[ ] 5.9   Implement GET /api/search/suggestions/?q= for typeahead
[ ] 5.10  Wire SearchBar.tsx to /api/search/ endpoint
[ ] 5.11  Test searches:
          "Koran" → returns Quran books ✓
          "Bukhari" and "Bokhari" → same results ✓
          "Oud" and "Oudh" → same Atar results ✓
          Typo "Quraan" → returns Quran books ✓

PHASE 5 COMPLETE WHEN: All transliteration/synonym searches return correct results.
```

---

### ✅ PHASE 6 — DEPLOYMENT

**Goal:** Platform live on production URLs with Instamojo switched to production.

```
[ ] 6.1   Configure config/settings/production.py:
          DEBUG=False, HTTPS, HSTS, SECURE_COOKIES
[ ] 6.2   Set up Sentry for error monitoring (backend + frontend)
[ ] 6.3   Configure S3 or Cloudinary for media storage (django-storages)
[ ] 6.4   Write unit tests for all service layer functions (target 80% coverage)
[ ] 6.5   Run full security checklist (Section 12 — every item)
[ ] 6.6   Deploy backend to Railway or Render:
          - Set all environment variables
          - Run migrate on first deploy
          - Confirm /api/docs is accessible (restrict to staff in prod)
[ ] 6.7   Deploy Elasticsearch to Elastic Cloud or Bonsai.io (managed)
[ ] 6.8   Deploy frontend to Vercel:
          - Set NEXT_PUBLIC_API_URL to production backend URL
[ ] 6.9   Configure custom domain: naazbook.in → Vercel
[ ] 6.10  Update CORS: ALLOWED_ORIGINS = ['https://naazbook.in']
[ ] 6.11  Switch Instamojo from sandbox to production:
          - Update INSTAMOJO_BASE_URL
          - Update API key + auth token
          - Update webhook URL to production domain
[ ] 6.12  python manage.py index_products on production
[ ] 6.13  Final smoke test on production:
          - Browse catalog ✓
          - Add to cart ✓
          - Checkout with real Instamojo payment (₹1 test) ✓
          - Receive email confirmation ✓
          - Search "Quran" ✓

PHASE 6 COMPLETE WHEN: Platform is live at naazbook.in with real payments working.
```

---

### 🔮 POST-PRODUCTION PHASES (Do NOT start until Phase 6 is stable)

```
PHASE 7 — SEMANTIC SEARCH (pgvector + OpenAI embeddings)
  [ ] 7.1  Uncomment pgvector and openai in requirements.txt
  [ ] 7.2  Install pgvector extension: CREATE EXTENSION vector;
  [ ] 7.3  Add VectorField to Book + Atar models (replace search_vector_json)
  [ ] 7.4  python manage.py generate_embeddings (bulk generate for all products)
  [ ] 7.5  Connect auto-embedding on admin save
  [ ] 7.6  Add vector search fallback to /api/search/ (hybrid: ES + vector)

PHASE 8 — AI CHATBOT & RECOMMENDATIONS
  [ ] 8.1  Implement apps/ai_assistant/context_builder.py
  [ ] 8.2  Implement POST /api/ai/chat/ (streaming OpenAI response)
  [ ] 8.3  Build ChatWidget.tsx (floating bottom-right on all pages)
  [ ] 8.4  Test: "recommend an oud fragrance" → correct Atar suggested
  [ ] 8.5  Add recommendation section to product detail pages
  [ ] 8.6  Test: "books about patience" → semantic results from pgvector ✓
```

---

## ⚠️ SECTION 17: KNOWN GOTCHAS & AGENT WARNINGS

| # | Warning | Resolution |
|---|---|---|
| 1 | **pgvector/pgvector Docker image** | Using `pgvector/pgvector:pg16` in docker-compose so the extension is pre-installed for Phase 7+. Run `CREATE EXTENSION IF NOT EXISTS vector;` only when you start Phase 7. |
| 2 | **Elasticsearch startup time** | Always wait 30+ seconds after `docker-compose up elasticsearch` before running `index_products`. |
| 3 | **Instamojo webhook in local dev** | Use `ngrok http 8000` and paste the HTTPS URL into Instamojo sandbox webhook settings. |
| 4 | **OpenAI package** | Do NOT install `openai` package until Phase 7. Keep it commented out in requirements.txt to avoid confusion. |
| 5 | **Celery in development** | Run `celery -A celery_app worker --loglevel=info` in a separate terminal alongside `runserver`. |
| 6 | **Arabic text in Admin** | Set `LANGUAGE_CODE = 'en-us'` but the `Noto Naskh Arabic` font in the frontend handles RTL text rendering. No Django middleware needed for Phase 1-6. |
| 7 | **Image uploads in production** | Configure `django-storages` with S3/Cloudinary in Phase 6. Local `MEDIA_ROOT` is fine for development. |
| 8 | **PromoCode race condition** | `validate_and_apply_promo()` uses `filter(..., times_used__lt=usage_limit).update(...)` — this is atomic and the only safe pattern. Do not use `.get()` + `.save()`. |
| 9 | **CartStore persistence** | Zustand cart should persist to `localStorage` via `persist` middleware so cart survives page refresh. |
| 10 | **Price re-check on checkout** | Frontend sends item IDs only — never prices. Backend always fetches current price from DB. This is non-negotiable. |
| 11 | **Slug generation** | Auto-generate slugs in the `Book.save()` and `Atar.save()` methods using `django.utils.text.slugify`. Ensure uniqueness by appending `-{id}` if slug already exists. |
| 12 | **Phone number format for WhatsApp** | Twilio requires E.164 format: `+91XXXXXXXXXX`. Validate and format phone numbers at registration. |

---

## 🏁 FINAL AGENT INSTRUCTION

You now have everything needed to build this platform correctly. This document is the constitution.

**Start with Phase 1. The very first command:**

```bash
mkdir naaz-book-depot && cd naaz-book-depot
mkdir naaz-backend naaz-frontend
cd naaz-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install Django==5.0.4 django-ninja psycopg2-binary Pillow \
  python-dotenv django-cors-headers djangorestframework-simplejwt
django-admin startproject config .
mkdir apps
python manage.py startapp users && mv users apps/
python manage.py startapp catalog && mv catalog apps/
python manage.py startapp orders && mv orders apps/
python manage.py startapp payments && mv payments apps/
python manage.py startapp notifications && mv notifications apps/
python manage.py startapp search && mv search apps/
python manage.py startapp ai_assistant && mv ai_assistant apps/
python manage.py startapp core && mv core apps/
```

**Phase 1 Deliverable:** Django admin at `/admin/` shows Books, Atar, AtarVariants, Orders, Users, PromoCodes — all with test data entered.

**Do not proceed to Phase 2 until the admin panel is fully working with real test data.**

---

*Document Version: 2.0 | Platform: Naaz Book Depot | 
*Last Updated: June 2025 | 