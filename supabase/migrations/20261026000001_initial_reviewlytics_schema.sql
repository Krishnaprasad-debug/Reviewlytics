-- ============================================================================
-- REVIEWLYTICS — Complete PostgreSQL Schema Migration for Supabase
-- Migration: 20261026000001_initial_reviewlytics_schema.sql
-- Safe & Idempotent: Uses IF NOT EXISTS to avoid breaking existing schemas
-- ============================================================================

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- Preserves existing bcrypt password hashes, roles, and JSONB user settings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  profile_image TEXT,
  settings JSONB NOT NULL DEFAULT '{"theme":"dark","emailNotifications":true,"autoAnalyzeReviews":true,"aiTemperature":0.7}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- ----------------------------------------------------------------------------
-- 2. PRODUCTS TABLE
-- Stores canonical products from Amazon, Flipkart, CSV, or manual creation
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'Generic',
  category TEXT NOT NULL DEFAULT 'Electronics',
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  image TEXT NOT NULL DEFAULT '',
  source TEXT DEFAULT 'manual' CHECK (source IN ('amazon', 'flipkart', 'manual', 'csv', 'api')),
  asin TEXT,
  url TEXT,
  ratings_count INTEGER DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  canonical_id TEXT,
  created_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products (brand);
CREATE INDEX IF NOT EXISTS idx_products_asin ON public.products (asin);
CREATE INDEX IF NOT EXISTS idx_products_source ON public.products (source);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

-- ----------------------------------------------------------------------------
-- 3. PLATFORM LISTINGS TABLE
-- Links canonical products to marketplace-specific listings (Amazon ASIN / Flipkart PID)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_listings (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('amazon', 'flipkart')),
  platform_product_id TEXT NOT NULL,
  url TEXT NOT NULL,
  price NUMERIC(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  rating NUMERIC(3, 2) DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  availability TEXT DEFAULT 'In Stock',
  last_scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_platform_listing UNIQUE (platform, platform_product_id)
);

CREATE INDEX IF NOT EXISTS idx_platform_listings_product_id ON public.platform_listings (product_id);
CREATE INDEX IF NOT EXISTS idx_platform_listings_lookup ON public.platform_listings (platform, platform_product_id);

-- ----------------------------------------------------------------------------
-- 4. REVIEWS TABLE
-- Stores customer reviews with idempotent deduplication via content_hash & external ID
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  platform TEXT DEFAULT 'manual' CHECK (platform IN ('amazon', 'flipkart', 'manual', 'csv', 'api')),
  external_review_id TEXT,
  user_id TEXT,
  author_name TEXT NOT NULL DEFAULT 'Anonymous Reviewer',
  rating NUMERIC(3, 2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL DEFAULT '',
  review_text TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'csv', 'api', 'amazon', 'flipkart')),
  verified_purchase BOOLEAN NOT NULL DEFAULT true,
  helpful_votes INTEGER NOT NULL DEFAULT 0,
  review_url TEXT,
  review_date TEXT,
  content_hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_reviews_content_hash UNIQUE (content_hash)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_platform_ext_id ON public.reviews (platform, external_review_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews (rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);

-- ----------------------------------------------------------------------------
-- 5. REVIEW ANALYSES TABLE
-- Stores AI sentiment, aspects, pros, cons, keywords, and suspicious indicators
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_analyses (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL UNIQUE REFERENCES public.reviews(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('Positive', 'Negative', 'Neutral', 'Mixed')),
  sentiment_score NUMERIC(5, 3) DEFAULT 0,
  confidence NUMERIC(5, 3) NOT NULL DEFAULT 0.85,
  aspects JSONB NOT NULL DEFAULT '[]'::jsonb,
  pros JSONB NOT NULL DEFAULT '[]'::jsonb,
  cons JSONB NOT NULL DEFAULT '[]'::jsonb,
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  suspicious_indicators JSONB NOT NULL DEFAULT '[]'::jsonb,
  suspicious_status TEXT NOT NULL DEFAULT 'Genuine' CHECK (suspicious_status IN ('Genuine', 'Suspicious', 'Uncertain')),
  suspicious_reason TEXT,
  suspicious_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_analyses_product_id ON public.review_analyses (product_id);
CREATE INDEX IF NOT EXISTS idx_review_analyses_review_id ON public.review_analyses (review_id);
CREATE INDEX IF NOT EXISTS idx_review_analyses_sentiment ON public.review_analyses (sentiment);
CREATE INDEX IF NOT EXISTS idx_review_analyses_suspicious ON public.review_analyses (suspicious_status);

-- ----------------------------------------------------------------------------
-- 6. PRODUCT SUMMARIES TABLE
-- Stores synthesized product-level AI insights, aspect breakdowns, and buyer signals
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_summaries (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  overall_summary TEXT NOT NULL DEFAULT '',
  overall_sentiment TEXT DEFAULT 'Positive',
  positive_highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  negative_highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_observations JSONB NOT NULL DEFAULT '[]'::jsonb,
  aspect_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  sentiment_breakdown JSONB NOT NULL DEFAULT '{"positive":0,"negative":0,"neutral":0,"mixed":0}'::jsonb,
  top_pros JSONB NOT NULL DEFAULT '[]'::jsonb,
  top_cons JSONB NOT NULL DEFAULT '[]'::jsonb,
  top_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  suspicious_count INTEGER NOT NULL DEFAULT 0,
  total_analyzed INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
  review_coverage JSONB DEFAULT '{}'::jsonb,
  purchase_insight TEXT DEFAULT '',
  review_signal TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_summaries_product_id ON public.product_summaries (product_id);

-- ----------------------------------------------------------------------------
-- 7. UPDATED_AT TRIGGER FUNCTION
-- Automatically keeps updated_at current on row updates
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_platform_listings_updated_at ON public.platform_listings;
CREATE TRIGGER set_platform_listings_updated_at
  BEFORE UPDATE ON public.platform_listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_reviews_updated_at ON public.reviews;
CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_review_analyses_updated_at ON public.review_analyses;
CREATE TRIGGER set_review_analyses_updated_at
  BEFORE UPDATE ON public.review_analyses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_product_summaries_updated_at ON public.product_summaries;
CREATE TRIGGER set_product_summaries_updated_at
  BEFORE UPDATE ON public.product_summaries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) & POLICIES
-- Strict least-privilege: All client access goes through the Express backend
-- using SUPABASE_SERVICE_ROLE_KEY. Direct anonymous access to private user
-- records is completely blocked.
-- ----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_summaries ENABLE ROW LEVEL SECURITY;

-- Service role full access policies
DROP POLICY IF EXISTS "service_role_all_users" ON public.users;
CREATE POLICY "service_role_all_users" ON public.users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_products" ON public.products;
CREATE POLICY "service_role_all_products" ON public.products
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_platform_listings" ON public.platform_listings;
CREATE POLICY "service_role_all_platform_listings" ON public.platform_listings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_reviews" ON public.reviews;
CREATE POLICY "service_role_all_reviews" ON public.reviews
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_review_analyses" ON public.review_analyses;
CREATE POLICY "service_role_all_review_analyses" ON public.review_analyses
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_product_summaries" ON public.product_summaries;
CREATE POLICY "service_role_all_product_summaries" ON public.product_summaries
  FOR ALL TO service_role USING (true) WITH CHECK (true);
