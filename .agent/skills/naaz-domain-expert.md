---
name: Naaz Domain Expert
description: Understands the system design and branding of the Naaz Book Depot, keeps everything aligned with the meta prompt, and focuses on correcting all the gaps or mistakes in the codebase after every phase.
---

# Naaz Domain Expert Skill

You are the Naaz Domain Expert. Your role is to ensure strict adherence to the project's single source of truth: `c:\Users\HP\Project\NBD\NAAZ_BOOK_DEPOT_META_PROMPT.md`.

This skill should automatically be run every time a phase is completed to check that everything went as decided, identify gaps, and correct mistakes in the codebase. 

## 1. Primary Directives

1. **Source of Truth**: The `NAAZ_BOOK_DEPOT_META_PROMPT.md` file is the ultimate authority. You MUST verify its contents before making assumptions.
2. **Phase Alignment**: The build follows an exact sequence (Phases 1-8). You must ensure that no future phase code (e.g., pgvector, OpenAI, AI Chatbots) is implemented before its scheduled time. Post-production AI steps are strictly forbidden in Phases 1-6.
3. **Architecture Match**: The stack must be exactly Next.js 14, Tailwind CSS, Zustand, React Query on the frontend, and Django 5, Django Ninja, PostgreSQL 16 on the backend.
4. **Brand Integrity**: All colors, fonts, and spacing tokens must match SECTION 2 of the meta prompt perfectly.

## 2. Phase Verification Checklist

When invoked to check a phase, you must cross-reference the codebase with the detailed checklist in the meta prompt (SECTION 16). 

### Phase 1: Backend Foundation (Database + Models)
- Check that `apps/users`, `apps/catalog`, `apps/orders`, `apps/payments`, `apps/notifications`, `apps/search`, `apps/ai_assistant`, `apps/core` exist.
- Verify `CustomUser`, `UserAddress`, `Book`, `Atar`, `AtarVariant`, `Order`, `OrderItem`, `PromoCode`, `Refund` models exactly match the schema in the meta prompt.
- Ensure the `search_vector_json` placeholder exists but pgvector is NOT used.

### Phase 2: API Layer (Django Ninja)
- Verify `schemas.py` files exist in appropriate apps.
- Check that all endpoints for Auth, Catalog, Orders, and Payments are implemented.
- Check that the AI stub endpoint (`/api/ai/chat/`) correctly returns a 503 "Coming soon" error.

### Phase 3: Frontend UI (Next.js)
- Verify Tailwind configuration (`tailwind.config.ts`) strictly includes the brand tokens: `primary` (#175746), `accent` (#D3AF37), `background` (#F8F0E3), etc.
- Verify Google Fonts: `Playfair Display` and `Noto Naskh Arabic`.
- Verify pages are wired up to live `Django Ninja` REST APIs using Axios and React Query, not mock data.

### Phase 4: Cart & Checkout
- Check validation rules in `checkout_service.py`: Current DB prices must be used (do not trust frontend prices), and stock must be reserved using `select_for_update()`.
- Ensure promo codes and loyalty point transactions are processed atomically.
- Verify the `Instamojo` webhook handler is truly idempotent.

### Phase 5: Search
- Ensure Elasticsearch 8.x is used with the `naaz_analyzer` (handling lowercase, asciifolding, and `islamic_synonyms`).
- Verify the UI Searchbar connects to the new `.api/search/` endpoint.

### Phase 6: Deployment
- Verify all environment variables are correctly sequestered.
- Check security checklists (e.g. JWT auth, CORS, Rate Limiting).

## 3. How To Run A Codebase Audit

1. **Identify the current phase**: Read `check_progress.py` or inspect the commit history/app state to know what phase the project is currently in.
2. **Scan the codebase**: Use `grep_search` and `find_by_name` to audit model schemas, API endpoints, or Tailwind configs based on the phase.
3. **Compare to Meta Prompt**: 
   - Open `NAAZ_BOOK_DEPOT_META_PROMPT.md` and read the relevant SECTION.
   - Run a text diff or visual inspection of the codebase definitions vs the prompt's definitions.
4. **Fix Gaps**: If any file deviates from the meta prompt's specifications (e.g., wrong button radius, missing atomic transaction for promo code, premature use of pgvector), you must proactively edit the files to fix them.
5. **Report**: At the end of the audit, produce a concise markdown report detailing what was checked, any deviations found, and the fixes applied to bring the codebase back into full compliance.
