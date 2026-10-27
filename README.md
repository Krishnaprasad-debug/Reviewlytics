# REVIEWLYTICS – AI-Powered Product Review Analysis & Insight Platform

REVIEWLYTICS is a production-grade intelligence platform that converts unstructured e-commerce reviews from Amazon and Flipkart into deep, structured consumer insights, aspect-based sentiment polarity, suspicious feedback detection, and executive purchasing advice using Google Gemini NLP and **Supabase PostgreSQL**.

---

## 1. System Architecture

```text
                                REVIEWLYTICS
                                     │
                                    USER
                                     │
                       Amazon / Flipkart Product URL
                                     │
                                     ▼
                               React Frontend
                                (Vite + TS)
                                     │
                                     ▼
                              Express Backend
                               (Node.js + TS)
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
            Amazon Apify Actor              Flipkart Apify Actor
        (kestrel/amazon-reviews-scraper) (shahidirfan/flipkart-reviews-scraper)
                     │                               │
                     └───────────────┬───────────────┘
                                     ▼
                            Review Normalizer
                  (Filters non-empty review text & hashes)
                                     │
                                     ▼
                      Supabase Database Service Layer
                        (@supabase/supabase-js SDK)
                                     │
                                     ▼
                           Supabase PostgreSQL
          (users, products, platform_listings, reviews, analyses, summaries)
                                     │
                                     ▼
                              Gemini 3.8 Flash
                                     │
                ┌────────────────────┼────────────────────┐
                ▼                    ▼                    ▼
        Review AI Analysis   Product AI Insights   Analytics Aggregator
        • Sentiment & Score  • Executive Summary   • Rating & Polarity
        • Aspect Breakdown   • Top Pros & Cons     • Review Timeline
        • Bot & Spam Flag    • Review Signal       • Aspect Mentions
                │                    │                    │
                └────────────────────┼────────────────────┘
                                     ▼
                              REVIEWLYTICS UI
                     (Catalog, Detail, Reviews, Compare)
```

---

## 2. Database Setup (Supabase PostgreSQL)

### Step 1: Apply the SQL Schema Migration
Run the SQL migration file located at:
```text
supabase/migrations/20261026000001_initial_reviewlytics_schema.sql
```
You can execute this SQL via:
- **Supabase Dashboard → SQL Editor** (paste the contents of `supabase/migrations/20261026000001_initial_reviewlytics_schema.sql` and click **Run**), or
- **Supabase CLI**: `supabase db push`

This creates the 6 relational tables with foreign keys, indexes, unique content-hash deduplication constraints, triggers, and Row Level Security (RLS) policies:
1. `public.users`
2. `public.products`
3. `public.platform_listings`
4. `public.reviews`
5. `public.review_analyses`
6. `public.product_summaries`

### Step 2: Configure Environment Variables
Set the following server-side environment variables in your environment secrets or `.env` file (see `.env.example`):

```env
# Supabase PostgreSQL Configuration (Primary Database)
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# Gemini API Key for AI review & product analysis
GEMINI_API_KEY="your_gemini_api_key"

# Apify API Token for Amazon & Flipkart review extraction
APIFY_API_TOKEN="your_apify_api_token"

# JWT Secret for User Authentication
JWT_SECRET="your_jwt_secret_key"
```

> **Security Note**: `SUPABASE_SERVICE_ROLE_KEY` is strictly a server-side secret. It is only read by the Express backend (`server/services/supabaseService.ts`) and is never exposed in Vite client variables (`VITE_*`), frontend bundles, or API responses.

### Step 3: Migrate Existing Data & Verify Supabase
Once `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured and the SQL schema is applied, run the idempotent migration and verification script:

```bash
npm run migrate:supabase
```

Alternatively, trigger migration or live verification from the running application:
- **UI**: Navigate to **Settings → Database & Storage Engine** and click **Migrate Local Data to Supabase** or **Run Read/Write Verification**.
- **API**:
  - `GET /api/settings/database` — Inspect connection status, row counts, and migration readiness.
  - `POST /api/settings/database/migrate` — Safely upsert all local records (`data/*.json`) into Supabase PostgreSQL.
  - `POST /api/settings/database/verify` — Execute an isolated temporary-record write, read, and cleanup test on Supabase PostgreSQL.

---

## 3. Key Platform Capabilities

1. **Marketplace Review Scraping via Apify**:
   - **Amazon**: `kestrel/amazon-reviews-scraper`
   - **Flipkart**: `shahidirfan/flipkart-reviews-scraper` (using `{ startUrl }`)
2. **Idempotent Review Deduplication**:
   - Reviews are normalized and assigned a deterministic `content_hash` (`product_id + platform + rating + author + normalized_text_prefix`) so repeated imports never duplicate reviews.
3. **Structured Gemini AI Analysis**:
   - Uses `@google/genai` (`gemini-3.8-flash`) with strict `responseSchema` for aspect-based sentiment, pros/cons, keywords, suspicious review detection, and executive summaries.
4. **Authentication & RBAC**:
   - Existing `bcryptjs` password hashing and `jsonwebtoken` Bearer authentication preserved seamlessly with `public.users` in Supabase PostgreSQL.

---

## 4. API Endpoints

### Ingestion & Analysis
- `POST /api/import/amazon` — Scrape Amazon reviews, run Gemini NLP, persist to Supabase PostgreSQL.
- `POST /api/import/flipkart` — Scrape Flipkart reviews, run Gemini NLP, persist to Supabase PostgreSQL.
- `POST /api/import/analyze` — Multi-platform ingestion linking Amazon & Flipkart listings to a single canonical product.
- `POST /api/upload/csv` — Upload CSV reviews with automatic product creation and AI analysis.

### Products, Reviews & Analytics
- `GET /api/products` — List products with review counts, avg ratings, search, and pagination.
- `GET /api/products/:id` — Product detail with platform breakdown, rating distribution, and sentiment stats.
- `GET /api/reviews` — Catalog-wide reviews with search, rating/sentiment/bot filters, and pagination.
- `GET /api/analysis/product/:productId/summary` — Product-level AI summary and buyer insights.
- `POST /api/analytics/compare` — Compare 2–4 products side-by-side with AI comparison verdict.

---

## 5. Verification & Build Commands

```bash
# 1. Type-check backend and frontend
npm run lint

# 2. Build production bundle (Vite frontend + esbuild server)
npm run build

# 3. Run Supabase migration & verification CLI
npm run migrate:supabase
```
