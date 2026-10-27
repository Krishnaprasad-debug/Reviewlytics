import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  db,
  UserDoc,
  ProductDoc,
  PlatformListingDoc,
  ReviewDoc,
  AnalysisDoc,
  ProductSummaryDoc,
} from '../config/db.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseConnected = false;
let lastConnectionError: string | null = null;
let lastVerifiedAt: string | null = null;

/**
 * Deterministic content hash for review deduplication when external_review_id is missing
 */
export function computeReviewContentHash(
  productId: string,
  platform: string,
  externalReviewId?: string,
  authorName?: string,
  reviewText?: string
): string {
  const cleanPlatform = (platform || 'manual').toLowerCase().trim();
  if (externalReviewId && externalReviewId.trim()) {
    return crypto
      .createHash('sha256')
      .update(`${productId}::${cleanPlatform}::ext::${externalReviewId.trim()}`)
      .digest('hex');
  }
  const cleanAuthor = (authorName || 'anonymous').toLowerCase().trim();
  const cleanText = (reviewText || '').toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 300);
  return crypto
    .createHash('sha256')
    .update(`${productId}::${cleanPlatform}::txt::${cleanAuthor}::${cleanText}`)
    .digest('hex');
}

/**
 * Normalize Supabase URL to its base origin (e.g., stripping trailing /rest/v1/ if included)
 */
export function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl || !rawUrl.trim()) return '';
  const clean = rawUrl.trim().replace(/^["']|["']$/g, '').trim();
  if (!clean || clean === 'https://your-project-ref.supabase.co' || clean === 'your_supabase_url') {
    return '';
  }
  try {
    const parsed = new URL(clean);
    return parsed.origin;
  } catch {
    return clean.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  }
}

/**
 * Mask Supabase URL or Service Role Key safely
 */
export function maskSupabaseUrl(url?: string): string | null {
  const normalized = normalizeSupabaseUrl(url);
  if (!normalized) return null;
  return normalized;
}

export function maskSecretKey(key?: string): string | null {
  if (!key || !key.trim() || key === 'your_supabase_service_role_key') return null;
  const clean = key.trim();
  if (clean.length <= 12) return '••••••••';
  return `${clean.slice(0, 6)}••••••••${clean.slice(-4)}`;
}

/**
 * Check if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured with non-placeholder values
 */
export function hasSupabaseCredentials(): {
  configured: boolean;
  hasUrl: boolean;
  hasServiceRoleKey: boolean;
  missingVars: string[];
} {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL);
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  const hasUrl = Boolean(url && url.startsWith('http'));
  const hasServiceRoleKey = Boolean(
    key &&
      key !== 'your_supabase_service_role_key' &&
      key.length > 20
  );

  const missingVars: string[] = [];
  if (!hasUrl) missingVars.push('SUPABASE_URL');
  if (!hasServiceRoleKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');

  return {
    configured: hasUrl && hasServiceRoleKey,
    hasUrl,
    hasServiceRoleKey,
    missingVars,
  };
}

/**
 * Initialize or retrieve the server-side Supabase client
 */
export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  const url = normalizeSupabaseUrl(customUrl || process.env.SUPABASE_URL);
  const key = (customKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (
    !url ||
    !key ||
    key === 'your_supabase_service_role_key'
  ) {
    return null;
  }

  if (!customUrl && !customKey && supabaseClient) {
    return supabaseClient;
  }

  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  if (!customUrl && !customKey) {
    supabaseClient = client;
  }

  return client;
}

export function isSupabaseActive(): boolean {
  return supabaseConnected && supabaseClient !== null;
}

export function getSupabaseStatusInfo() {
  const creds = hasSupabaseCredentials();
  return {
    isConnected: supabaseConnected,
    configured: creds.configured,
    hasUrl: creds.hasUrl,
    hasServiceRoleKey: creds.hasServiceRoleKey,
    missingVars: creds.missingVars,
    maskedUrl: maskSupabaseUrl(process.env.SUPABASE_URL),
    maskedKey: maskSecretKey(process.env.SUPABASE_SERVICE_ROLE_KEY),
    lastError: lastConnectionError,
    lastVerifiedAt,
  };
}

/**
 * Save SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to local .env
 */
export function saveSupabaseCredentialsToEnv(url: string, serviceRoleKey: string): void {
  const cleanUrl = url.trim();
  const cleanKey = serviceRoleKey.trim();
  const envPath = path.join(process.cwd(), '.env');

  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf-8');
  } else {
    const examplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(examplePath)) {
      content = fs.readFileSync(examplePath, 'utf-8');
    }
  }

  const urlLine = `SUPABASE_URL="${cleanUrl}"`;
  if (/^SUPABASE_URL=.*$/m.test(content)) {
    content = content.replace(/^SUPABASE_URL=.*$/m, urlLine);
  } else {
    content = `${content.trim()}\n${urlLine}\n`;
  }

  const keyLine = `SUPABASE_SERVICE_ROLE_KEY="${cleanKey}"`;
  if (/^SUPABASE_SERVICE_ROLE_KEY=.*$/m.test(content)) {
    content = content.replace(/^SUPABASE_SERVICE_ROLE_KEY=.*$/m, keyLine);
  } else {
    content = `${content.trim()}\n${keyLine}\n`;
  }

  fs.writeFileSync(envPath, content, 'utf-8');
  process.env.SUPABASE_URL = cleanUrl;
  process.env.SUPABASE_SERVICE_ROLE_KEY = cleanKey;
  supabaseClient = null;
}

// ============================================================================
// Row Mappers: PostgreSQL snake_case <-> Application camelCase Interfaces
// ============================================================================

export function mapRowToUser(row: any): UserDoc {
  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role || 'user',
    profileImage: row.profile_image || undefined,
    settings: row.settings || {
      theme: 'dark',
      emailNotifications: true,
      autoAnalyzeReviews: true,
      aiTemperature: 0.7,
    },
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export function mapUserToRow(user: UserDoc) {
  return {
    id: user._id,
    name: user.name,
    email: user.email.toLowerCase().trim(),
    password: user.password || '',
    role: user.role || 'user',
    profile_image: user.profileImage || null,
    settings: user.settings || {
      theme: 'dark',
      emailNotifications: true,
      autoAnalyzeReviews: true,
      aiTemperature: 0.7,
    },
    created_at: user.createdAt || new Date().toISOString(),
    updated_at: user.updatedAt || new Date().toISOString(),
  };
}

export function mapRowToProduct(row: any): ProductDoc {
  return {
    _id: row.id,
    name: row.name,
    brand: row.brand || 'Generic',
    category: row.category || 'Electronics',
    description: row.description || '',
    price: Number(row.price ?? 0),
    currency: row.currency || 'INR',
    image: row.image || '',
    source: row.source || 'manual',
    asin: row.asin || undefined,
    url: row.url || undefined,
    ratingsCount: row.ratings_count !== null && row.ratings_count !== undefined ? Number(row.ratings_count) : undefined,
    features: Array.isArray(row.features) ? row.features : [],
    canonicalId: row.canonical_id || undefined,
    createdBy: row.created_by || 'system',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export function mapProductToRow(prod: ProductDoc) {
  return {
    id: prod._id,
    name: prod.name,
    brand: prod.brand || 'Generic',
    category: prod.category || 'Electronics',
    description: prod.description || '',
    price: Number(prod.price ?? 0),
    currency: prod.currency || 'INR',
    image: prod.image || '',
    source: prod.source || 'manual',
    asin: prod.asin || null,
    url: prod.url || null,
    ratings_count: prod.ratingsCount ?? 0,
    features: Array.isArray(prod.features) ? prod.features : [],
    canonical_id: prod.canonicalId || prod.asin || null,
    created_by: prod.createdBy || 'system',
    created_at: prod.createdAt || new Date().toISOString(),
    updated_at: prod.updatedAt || new Date().toISOString(),
  };
}

export function mapRowToListing(row: any): PlatformListingDoc {
  return {
    _id: row.id,
    productId: row.product_id,
    platform: row.platform,
    platformProductId: row.platform_product_id,
    url: row.url,
    price: row.price !== null && row.price !== undefined ? Number(row.price) : undefined,
    currency: row.currency || 'INR',
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : undefined,
    ratingsCount: row.ratings_count !== null && row.ratings_count !== undefined ? Number(row.ratings_count) : undefined,
    availability: row.availability || 'In Stock',
    lastScrapedAt: row.last_scraped_at ? new Date(row.last_scraped_at).toISOString() : new Date().toISOString(),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export function mapListingToRow(listing: PlatformListingDoc) {
  return {
    id: listing._id || `${listing.platform}_${listing.platformProductId}`,
    product_id: listing.productId,
    platform: listing.platform,
    platform_product_id: listing.platformProductId,
    url: listing.url,
    price: listing.price ?? 0,
    currency: listing.currency || 'INR',
    rating: listing.rating ?? 0,
    ratings_count: listing.ratingsCount ?? 0,
    availability: listing.availability || 'In Stock',
    last_scraped_at: listing.lastScrapedAt || new Date().toISOString(),
    created_at: listing.createdAt || new Date().toISOString(),
    updated_at: listing.updatedAt || new Date().toISOString(),
  };
}

export function mapRowToReview(row: any): ReviewDoc {
  return {
    _id: row.id,
    productId: row.product_id,
    platform: row.platform || row.source || 'manual',
    reviewId: row.external_review_id || undefined,
    userId: row.user_id || undefined,
    authorName: row.author_name || 'Verified Customer',
    author: row.author_name || 'Verified Customer',
    rating: Number(row.rating ?? 5),
    title: row.title || '',
    reviewText: row.review_text || '',
    text: row.review_text || '',
    source: row.source || row.platform || 'manual',
    verifiedPurchase: Boolean(row.verified_purchase ?? true),
    helpfulVotes: Number(row.helpful_votes ?? 0),
    reviewUrl: row.review_url || undefined,
    date: row.review_date || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export function mapReviewToRow(rev: ReviewDoc) {
  const platform = rev.platform || (rev.source === 'amazon' || rev.source === 'flipkart' ? rev.source : 'manual');
  const reviewText = rev.reviewText || rev.text || '';
  const authorName = rev.authorName || rev.author || 'Anonymous Reviewer';
  const externalId = rev.reviewId && rev.reviewId !== rev._id ? rev.reviewId : null;

  return {
    id: rev._id,
    product_id: rev.productId,
    platform,
    external_review_id: externalId,
    user_id: rev.userId || null,
    author_name: authorName,
    rating: Math.min(5, Math.max(1, Number(rev.rating || 5))),
    title: rev.title || '',
    review_text: reviewText,
    source: rev.source || platform || 'manual',
    verified_purchase: rev.verifiedPurchase ?? true,
    helpful_votes: rev.helpfulVotes ?? 0,
    review_url: rev.reviewUrl || null,
    review_date: rev.date || null,
    content_hash: computeReviewContentHash(rev.productId, platform, externalId || rev._id, authorName, reviewText),
    metadata: {},
    created_at: rev.createdAt || new Date().toISOString(),
    updated_at: rev.updatedAt || new Date().toISOString(),
  };
}

function normalizeSentimentLabel(s?: string): 'Positive' | 'Negative' | 'Neutral' | 'Mixed' {
  const clean = (s || 'Positive').toLowerCase().trim();
  if (clean === 'negative') return 'Negative';
  if (clean === 'neutral') return 'Neutral';
  if (clean === 'mixed') return 'Mixed';
  return 'Positive';
}

function normalizeSuspiciousLabel(s?: string): 'Genuine' | 'Suspicious' | 'Uncertain' {
  const clean = (s || 'Genuine').toLowerCase().trim();
  if (clean === 'suspicious') return 'Suspicious';
  if (clean === 'uncertain') return 'Uncertain';
  return 'Genuine';
}

export function mapRowToAnalysis(row: any): AnalysisDoc {
  return {
    _id: row.id,
    reviewId: row.review_id,
    productId: row.product_id,
    sentiment: normalizeSentimentLabel(row.sentiment),
    sentimentScore: row.sentiment_score !== null && row.sentiment_score !== undefined ? Number(row.sentiment_score) : undefined,
    confidence: Number(row.confidence ?? 0.85),
    aspects: Array.isArray(row.aspects) ? row.aspects : [],
    pros: Array.isArray(row.pros) ? row.pros : [],
    cons: Array.isArray(row.cons) ? row.cons : [],
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    suspiciousIndicators: Array.isArray(row.suspicious_indicators) ? row.suspicious_indicators : [],
    suspiciousStatus: normalizeSuspiciousLabel(row.suspicious_status),
    suspiciousReason: row.suspicious_reason || undefined,
    suspiciousScore: Number(row.suspicious_score ?? 0),
    summary: row.summary || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export function mapAnalysisToRow(an: AnalysisDoc) {
  return {
    id: an._id,
    review_id: an.reviewId || an._id,
    product_id: an.productId,
    sentiment: normalizeSentimentLabel(an.sentiment),
    sentiment_score: an.sentimentScore ?? 0,
    confidence: an.confidence ?? 0.85,
    aspects: Array.isArray(an.aspects) ? an.aspects : [],
    pros: Array.isArray(an.pros) ? an.pros : [],
    cons: Array.isArray(an.cons) ? an.cons : [],
    keywords: Array.isArray(an.keywords) ? an.keywords : [],
    suspicious_indicators: Array.isArray(an.suspiciousIndicators) ? an.suspiciousIndicators : [],
    suspicious_status: normalizeSuspiciousLabel(an.suspiciousStatus),
    suspicious_reason: an.suspiciousReason || null,
    suspicious_score: an.suspiciousScore ?? 0,
    summary: an.summary || null,
    created_at: an.createdAt || new Date().toISOString(),
    updated_at: an.updatedAt || new Date().toISOString(),
  };
}

export function mapRowToSummary(row: any): ProductSummaryDoc {
  return {
    _id: row.id || row.product_id,
    productId: row.product_id,
    overallSummary: row.overall_summary || '',
    overallSentiment: normalizeSentimentLabel(row.overall_sentiment),
    positiveHighlights: Array.isArray(row.positive_highlights) ? row.positive_highlights : [],
    negativeHighlights: Array.isArray(row.negative_highlights) ? row.negative_highlights : [],
    keyObservations: Array.isArray(row.key_observations) ? row.key_observations : [],
    aspectBreakdown: Array.isArray(row.aspect_breakdown) ? row.aspect_breakdown : [],
    sentimentBreakdown: row.sentiment_breakdown || { positive: 0, negative: 0, neutral: 0, mixed: 0 },
    topPros: Array.isArray(row.top_pros) ? row.top_pros : [],
    topCons: Array.isArray(row.top_cons) ? row.top_cons : [],
    topKeywords: Array.isArray(row.top_keywords) ? row.top_keywords : [],
    suspiciousCount: Number(row.suspicious_count ?? 0),
    totalAnalyzed: Number(row.total_analyzed ?? 0),
    averageRating: Number(row.average_rating ?? 0),
    reviewCoverage: row.review_coverage || undefined,
    purchaseInsight: row.purchase_insight || undefined,
    reviewSignal: row.review_signal || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export function mapSummaryToRow(sum: ProductSummaryDoc) {
  return {
    id: sum._id || sum.productId,
    product_id: sum.productId,
    overall_summary: sum.overallSummary || '',
    overall_sentiment: normalizeSentimentLabel(sum.overallSentiment),
    positive_highlights: Array.isArray(sum.positiveHighlights) ? sum.positiveHighlights : [],
    negative_highlights: Array.isArray(sum.negativeHighlights) ? sum.negativeHighlights : [],
    key_observations: Array.isArray(sum.keyObservations) ? sum.keyObservations : [],
    aspect_breakdown: Array.isArray(sum.aspectBreakdown) ? sum.aspectBreakdown : [],
    sentiment_breakdown: sum.sentimentBreakdown || { positive: 0, negative: 0, neutral: 0, mixed: 0 },
    top_pros: Array.isArray(sum.topPros) ? sum.topPros : [],
    top_cons: Array.isArray(sum.topCons) ? sum.topCons : [],
    top_keywords: Array.isArray(sum.topKeywords) ? sum.topKeywords : [],
    suspicious_count: sum.suspiciousCount ?? 0,
    total_analyzed: sum.totalAnalyzed ?? 0,
    average_rating: sum.averageRating ?? 0,
    review_coverage: sum.reviewCoverage || {},
    purchase_insight: sum.purchaseInsight || '',
    review_signal: sum.reviewSignal || '',
    created_at: sum.createdAt || new Date().toISOString(),
    updated_at: sum.updatedAt || new Date().toISOString(),
  };
}

// ============================================================================
// Connection Verification & Hydration
// ============================================================================

/**
 * Connect to Supabase PostgreSQL, verify real table access, and hydrate cache
 */
export async function connectSupabase(
  customUrl?: string,
  customKey?: string
): Promise<{
  connected: boolean;
  message: string;
  counts?: {
    users: number;
    products: number;
    reviews: number;
    analyses: number;
    summaries: number;
    listings: number;
  };
}> {
  const creds = hasSupabaseCredentials();
  if (!customUrl && !customKey && !creds.configured) {
    supabaseConnected = false;
    lastConnectionError = `Missing required Supabase credentials: ${creds.missingVars.join(', ')}`;
    console.log(`[Supabase] ${lastConnectionError}. Legacy data store remains preserved.`);
    return {
      connected: false,
      message: lastConnectionError,
    };
  }

  const client = getSupabaseClient(customUrl, customKey);
  if (!client) {
    supabaseConnected = false;
    lastConnectionError = 'Supabase client could not be initialized: missing URL or Service Role Key.';
    return {
      connected: false,
      message: lastConnectionError,
    };
  }

  try {
    // Perform a real GET read operation against public.products to confirm connectivity and schema
    // Note: Do not use { head: true } because PostgREST 404 responses on missing tables have no body on HEAD
    const { count: prodCount, error: prodErr } = await client
      .from('products')
      .select('id', { count: 'exact' })
      .limit(1);

    if (prodErr) {
      supabaseConnected = false;
      const isMissingSchema = prodErr.code === 'PGRST205' || prodErr.message?.includes('schema cache');
      lastConnectionError = isMissingSchema
        ? `Supabase reached, but PostgreSQL tables are not created yet (${prodErr.code}: ${prodErr.message}). Apply supabase/migrations/20261026000001_initial_reviewlytics_schema.sql in Supabase SQL Editor.`
        : `Supabase query error (${prodErr.code || 'ERROR'}): ${prodErr.message}`;
      console.warn('[Supabase] Connection/Schema verification status:', lastConnectionError);
      return {
        connected: false,
        message: lastConnectionError,
      };
    }

    if (!customUrl && !customKey) {
      supabaseClient = client;
      supabaseConnected = true;
      lastConnectionError = null;
      lastVerifiedAt = new Date().toISOString();
    }

    // Fetch counts across all 6 tables using GET queries
    const [
      { count: usersCount },
      { count: reviewsCount },
      { count: analysesCount },
      { count: summariesCount },
      { count: listingsCount },
    ] = await Promise.all([
      client.from('users').select('id', { count: 'exact' }).limit(1),
      client.from('reviews').select('id', { count: 'exact' }).limit(1),
      client.from('review_analyses').select('id', { count: 'exact' }).limit(1),
      client.from('product_summaries').select('id', { count: 'exact' }).limit(1),
      client.from('platform_listings').select('id', { count: 'exact' }).limit(1),
    ]);

    const counts = {
      users: usersCount ?? 0,
      products: prodCount ?? 0,
      reviews: reviewsCount ?? 0,
      analyses: analysesCount ?? 0,
      summaries: summariesCount ?? 0,
      listings: listingsCount ?? 0,
    };

    console.log(
      `[Supabase] Connected to Supabase PostgreSQL! Records in DB -> Users: ${counts.users}, Products: ${counts.products}, Reviews: ${counts.reviews}, Analyses: ${counts.analyses}, Summaries: ${counts.summaries}`
    );

    // Hydrate runtime memory ONLY for tables that already contain migrated data in Supabase
    if (!customUrl && !customKey && (counts.products > 0 || counts.users > 0)) {
      await hydrateMemoryFromSupabase();
    }

    return {
      connected: true,
      message: 'Successfully connected and verified Supabase PostgreSQL tables.',
      counts,
    };
  } catch (err: any) {
    supabaseConnected = false;
    lastConnectionError = err.message || 'Failed to connect to Supabase PostgreSQL.';
    console.warn('[Supabase] Connectivity check failed:', lastConnectionError);
    return {
      connected: false,
      message: lastConnectionError,
    };
  }
}

/**
 * Load rows from Supabase PostgreSQL into the runtime cache for non-empty tables
 */
export async function hydrateMemoryFromSupabase(): Promise<void> {
  if (!supabaseClient || !supabaseConnected) return;

  const [usersRes, prodsRes, listingsRes, revsRes, analysesRes, sumsRes] = await Promise.all([
    supabaseClient.from('users').select('*'),
    supabaseClient.from('products').select('*').order('created_at', { ascending: false }),
    supabaseClient.from('platform_listings').select('*'),
    supabaseClient.from('reviews').select('*').order('created_at', { ascending: false }),
    supabaseClient.from('review_analyses').select('*'),
    supabaseClient.from('product_summaries').select('*'),
  ]);

  if (!usersRes.error && usersRes.data && usersRes.data.length > 0) {
    db.users.clear();
    usersRes.data.forEach(r => {
      const u = mapRowToUser(r);
      db.users.set(u._id, u);
    });
  }

  if (!prodsRes.error && prodsRes.data && prodsRes.data.length > 0) {
    db.products.clear();
    prodsRes.data.forEach(r => {
      const p = mapRowToProduct(r);
      db.products.set(p._id, p);
    });
  }

  if (!listingsRes.error && listingsRes.data && listingsRes.data.length > 0) {
    db.platformListings.clear();
    listingsRes.data.forEach(r => {
      const l = mapRowToListing(r);
      db.platformListings.set(l._id, l);
    });
  }

  if (!revsRes.error && revsRes.data && revsRes.data.length > 0) {
    db.reviews.clear();
    revsRes.data.forEach(r => {
      const rev = mapRowToReview(r);
      db.reviews.set(rev._id, rev);
    });
  }

  if (!analysesRes.error && analysesRes.data && analysesRes.data.length > 0) {
    db.analyses.clear();
    analysesRes.data.forEach(r => {
      const an = mapRowToAnalysis(r);
      db.analyses.set(an._id, an);
    });
  }

  if (!sumsRes.error && sumsRes.data && sumsRes.data.length > 0) {
    db.summaries.clear();
    sumsRes.data.forEach(r => {
      const s = mapRowToSummary(r);
      db.summaries.set(s.productId, s);
    });
  }
}

// ============================================================================
// Direct Supabase PostgreSQL Persistence Operations
// ============================================================================

export async function pgUpsertUser(user: UserDoc): Promise<UserDoc> {
  db.users.set(user._id, user);
  if (isSupabaseActive() && supabaseClient) {
    const { data, error } = await supabaseClient
      .from('users')
      .upsert(mapUserToRow(user), { onConflict: 'id' })
      .select()
      .single();
    if (error) {
      throw new Error(`Supabase user upsert failed: ${error.message}`);
    }
    const mapped = mapRowToUser(data);
    db.users.set(mapped._id, mapped);
    return mapped;
  }
  db.saveUsers();
  return user;
}

export async function pgGetUserByEmail(email: string): Promise<UserDoc | undefined> {
  const normalized = email.toLowerCase().trim();
  if (isSupabaseActive() && supabaseClient) {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('email', normalized)
      .maybeSingle();
    if (!error && data) {
      const mapped = mapRowToUser(data);
      db.users.set(mapped._id, mapped);
      return mapped;
    }
    if (error) {
      console.warn(`[Supabase] User email lookup warning (${error.code || 'ERR'}): ${error.message}. Falling back to preserved user store.`);
    }
  }
  return Array.from(db.users.values()).find(u => u.email.toLowerCase() === normalized);
}

export async function pgGetUserById(id: string): Promise<UserDoc | undefined> {
  if (isSupabaseActive() && supabaseClient) {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (!error && data) {
      const mapped = mapRowToUser(data);
      db.users.set(mapped._id, mapped);
      return mapped;
    }
    if (error) {
      console.warn(`[Supabase] User ID lookup warning (${error.code || 'ERR'}): ${error.message}. Falling back to preserved user store.`);
    }
  }
  return db.users.get(id);
}

export async function pgUpsertProduct(product: ProductDoc): Promise<ProductDoc> {
  db.products.set(product._id, product);
  if (isSupabaseActive() && supabaseClient) {
    const { data, error } = await supabaseClient
      .from('products')
      .upsert(mapProductToRow(product), { onConflict: 'id' })
      .select()
      .single();
    if (error) {
      throw new Error(`Supabase product upsert failed: ${error.message}`);
    }
    const mapped = mapRowToProduct(data);
    db.products.set(mapped._id, mapped);
    return mapped;
  }
  db.saveProducts();
  return product;
}

export async function pgDeleteProduct(productId: string): Promise<void> {
  if (isSupabaseActive() && supabaseClient) {
    // Foreign keys have ON DELETE CASCADE for listings, reviews, analyses, summaries
    const { error } = await supabaseClient.from('products').delete().eq('id', productId);
    if (error) {
      throw new Error(`Supabase product delete failed: ${error.message}`);
    }
  }
  db.products.delete(productId);
  db.reviews.forEach((r, rId) => {
    if (r.productId === productId) db.reviews.delete(rId);
  });
  db.analyses.forEach((a, aId) => {
    if (a.productId === productId) db.analyses.delete(aId);
  });
  db.summaries.delete(productId);
  db.platformListings.forEach((l, lId) => {
    if (l.productId === productId) db.platformListings.delete(lId);
  });

  if (!isSupabaseActive()) {
    db.saveProducts();
    db.saveReviews();
    db.saveAnalyses();
    db.saveSummaries();
    db.savePlatformListings();
  }
}

export async function pgUpsertPlatformListing(listing: PlatformListingDoc): Promise<PlatformListingDoc> {
  db.platformListings.set(listing._id, listing);
  if (isSupabaseActive() && supabaseClient) {
    const { data, error } = await supabaseClient
      .from('platform_listings')
      .upsert(mapListingToRow(listing), { onConflict: 'platform,platform_product_id' })
      .select()
      .single();
    if (error) {
      throw new Error(`Supabase platform listing upsert failed: ${error.message}`);
    }
    const mapped = mapRowToListing(data);
    db.platformListings.set(mapped._id, mapped);
    return mapped;
  }
  db.savePlatformListings();
  return listing;
}

export async function pgUpsertReview(review: ReviewDoc): Promise<ReviewDoc> {
  db.reviews.set(review._id, review);
  if (isSupabaseActive() && supabaseClient) {
    const row = mapReviewToRow(review);
    const { data, error } = await supabaseClient
      .from('reviews')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();
    if (error) {
      throw new Error(`Supabase review upsert failed: ${error.message}`);
    }
    const mapped = mapRowToReview(data);
    db.reviews.set(mapped._id, mapped);
    return mapped;
  }
  db.saveReviews();
  return review;
}

export async function pgUpsertReviewsBatch(reviews: ReviewDoc[]): Promise<ReviewDoc[]> {
  if (reviews.length === 0) return [];
  reviews.forEach(r => db.reviews.set(r._id, r));

  if (isSupabaseActive() && supabaseClient) {
    const rows = reviews.map(mapReviewToRow);
    const { data, error } = await supabaseClient
      .from('reviews')
      .upsert(rows, { onConflict: 'id' })
      .select();
    if (error) {
      throw new Error(`Supabase batch review upsert failed: ${error.message}`);
    }
    const mapped = (data || []).map(mapRowToReview);
    mapped.forEach(m => db.reviews.set(m._id, m));
    return mapped;
  }

  db.saveReviews();
  return reviews;
}

export async function pgDeleteReview(reviewId: string): Promise<void> {
  if (isSupabaseActive() && supabaseClient) {
    const { error } = await supabaseClient.from('reviews').delete().eq('id', reviewId);
    if (error) {
      throw new Error(`Supabase review delete failed: ${error.message}`);
    }
  }
  db.reviews.delete(reviewId);
  const matchingAnalysis = Array.from(db.analyses.values()).find(a => a.reviewId === reviewId);
  if (matchingAnalysis) {
    db.analyses.delete(matchingAnalysis._id);
  }
  if (!isSupabaseActive()) {
    db.saveReviews();
    db.saveAnalyses();
  }
}

export async function pgUpsertAnalysis(analysis: AnalysisDoc): Promise<AnalysisDoc> {
  db.analyses.set(analysis._id, analysis);
  if (isSupabaseActive() && supabaseClient) {
    const { data, error } = await supabaseClient
      .from('review_analyses')
      .upsert(mapAnalysisToRow(analysis), { onConflict: 'review_id' })
      .select()
      .single();
    if (error) {
      throw new Error(`Supabase review analysis upsert failed: ${error.message}`);
    }
    const mapped = mapRowToAnalysis(data);
    db.analyses.set(mapped._id, mapped);
    return mapped;
  }
  db.saveAnalyses();
  return analysis;
}

export async function pgUpsertAnalysesBatch(analyses: AnalysisDoc[]): Promise<AnalysisDoc[]> {
  if (analyses.length === 0) return [];
  analyses.forEach(a => db.analyses.set(a._id, a));

  if (isSupabaseActive() && supabaseClient) {
    const rows = analyses.map(mapAnalysisToRow);
    const { data, error } = await supabaseClient
      .from('review_analyses')
      .upsert(rows, { onConflict: 'review_id' })
      .select();
    if (error) {
      throw new Error(`Supabase batch analysis upsert failed: ${error.message}`);
    }
    const mapped = (data || []).map(mapRowToAnalysis);
    mapped.forEach(m => db.analyses.set(m._id, m));
    return mapped;
  }

  db.saveAnalyses();
  return analyses;
}

export async function pgUpsertSummary(summary: ProductSummaryDoc): Promise<ProductSummaryDoc> {
  db.summaries.set(summary.productId, summary);
  if (isSupabaseActive() && supabaseClient) {
    const { data, error } = await supabaseClient
      .from('product_summaries')
      .upsert(mapSummaryToRow(summary), { onConflict: 'product_id' })
      .select()
      .single();
    if (error) {
      throw new Error(`Supabase product summary upsert failed: ${error.message}`);
    }
    const mapped = mapRowToSummary(data);
    db.summaries.set(mapped.productId, mapped);
    return mapped;
  }
  db.saveSummaries();
  return summary;
}

// ============================================================================
// Safe Read/Write Verification Test
// ============================================================================

/**
 * Performs an isolated read and write/read-back test using a temporary test record.
 * Deletes ONLY the exact temporary test record created by the test after confirming its identity.
 */
export async function runSupabaseReadWriteVerification(customUrl?: string, customKey?: string): Promise<{
  connected: boolean;
  readPass: boolean;
  writePass: boolean;
  message: string;
  tableCounts?: {
    users: number;
    products: number;
    listings: number;
    reviews: number;
    analyses: number;
    summaries: number;
  };
}> {
  const client = getSupabaseClient(customUrl, customKey);
  if (!client) {
    return {
      connected: false,
      readPass: false,
      writePass: false,
      message: 'Supabase credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not configured.',
    };
  }

  try {
    // 1. Read test (use GET instead of HEAD so missing table errors PGRST205 are captured)
    const { count: prodCount, error: readErr } = await client
      .from('products')
      .select('id', { count: 'exact' })
      .limit(1);

    if (readErr) {
      const isMissingSchema = readErr.code === 'PGRST205' || readErr.message?.includes('schema cache');
      const msg = isMissingSchema
        ? `Supabase reached, but PostgreSQL tables are not created yet (${readErr.code}: ${readErr.message}). Please run supabase/migrations/20261026000001_initial_reviewlytics_schema.sql in your Supabase SQL Editor first.`
        : `Supabase read test failed (${readErr.code || 'ERROR'}): ${readErr.message}`;
      return {
        connected: false,
        readPass: false,
        writePass: false,
        message: msg,
      };
    }

    // 2. Safe write + read-back test using temporary record
    const tempId = `__verify_temp_product_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const tempRow = {
      id: tempId,
      name: '__TEMP_VERIFICATION_PRODUCT__',
      brand: 'ReviewlyticsVerify',
      category: 'Verification',
      description: 'Temporary verification record for safe write/read-back check',
      price: 1.0,
      currency: 'INR',
      image: 'https://example.com/verify.png',
      source: 'manual',
      created_by: 'system_verifier',
    };

    const { error: insertErr } = await client.from('products').insert(tempRow);
    if (insertErr) {
      return {
        connected: true,
        readPass: true,
        writePass: false,
        message: `Supabase write test failed: ${insertErr.message}`,
      };
    }

    const { data: readBack, error: readBackErr } = await client
      .from('products')
      .select('id, name, created_by')
      .eq('id', tempId)
      .single();

    const writeVerified =
      !readBackErr &&
      readBack &&
      readBack.id === tempId &&
      readBack.name === '__TEMP_VERIFICATION_PRODUCT__' &&
      readBack.created_by === 'system_verifier';

    // Delete ONLY the exact temporary test record after confirming its identity
    if (readBack && readBack.id === tempId) {
      await client
        .from('products')
        .delete()
        .eq('id', tempId)
        .eq('created_by', 'system_verifier');
    }

    if (writeVerified && !customUrl && !customKey) {
      supabaseClient = client;
      supabaseConnected = true;
      lastConnectionError = null;
      lastVerifiedAt = new Date().toISOString();
    }

    const [
      { count: usersCount },
      { count: listingsCount },
      { count: reviewsCount },
      { count: analysesCount },
      { count: summariesCount },
    ] = await Promise.all([
      client.from('users').select('id', { count: 'exact' }).limit(1),
      client.from('platform_listings').select('id', { count: 'exact' }).limit(1),
      client.from('reviews').select('id', { count: 'exact' }).limit(1),
      client.from('review_analyses').select('id', { count: 'exact' }).limit(1),
      client.from('product_summaries').select('id', { count: 'exact' }).limit(1),
    ]);

    return {
      connected: true,
      readPass: true,
      writePass: Boolean(writeVerified),
      message: writeVerified
        ? 'Supabase PostgreSQL connection, read, and safe write/read-back verification succeeded.'
        : 'Read passed, but read-back verification did not match.',
      tableCounts: {
        users: usersCount ?? 0,
        products: prodCount ?? 0,
        listings: listingsCount ?? 0,
        reviews: reviewsCount ?? 0,
        analyses: analysesCount ?? 0,
        summaries: summariesCount ?? 0,
      },
    };
  } catch (err: any) {
    return {
      connected: false,
      readPass: false,
      writePass: false,
      message: `Verification error: ${err.message}`,
    };
  }
}

// ============================================================================
// Safe, Idempotent Data Migration from JSON -> Supabase PostgreSQL
// ============================================================================

export interface MigrationReport {
  success: boolean;
  message: string;
  sourceCounts: {
    users: number;
    products: number;
    listings: number;
    reviews: number;
    analyses: number;
    summaries: number;
  };
  importedCounts: {
    users: number;
    products: number;
    listings: number;
    reviews: number;
    analyses: number;
    summaries: number;
  };
  skippedOrFailed: {
    entity: string;
    id: string;
    reason: string;
  }[];
  destinationCounts: {
    users: number;
    products: number;
    listings: number;
    reviews: number;
    analyses: number;
    summaries: number;
  };
}

/**
 * Safely reads `data/*.json` (without modifying or deleting them), validates parent-child
 * relationships, and performs idempotent batched upserts into Supabase PostgreSQL.
 */
export async function migrateJsonToSupabase(): Promise<MigrationReport> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Cannot migrate: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not configured.');
  }

  const dataDir = path.join(process.cwd(), 'data');
  const readJsonSafe = <T>(filename: string): T[] => {
    const fp = path.join(dataDir, filename);
    if (!fs.existsSync(fp)) return [];
    const raw = fs.readFileSync(fp, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  };

  // Ensure backup exists before migration
  const backupDir = path.join(dataDir, 'backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  for (const fname of ['users.json', 'products.json', 'platformListings.json', 'reviews.json', 'analyses.json', 'summaries.json']) {
    const srcPath = path.join(dataDir, fname);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(backupDir, fname));
    }
  }

  const users = readJsonSafe<UserDoc>('users.json');
  const products = readJsonSafe<ProductDoc>('products.json');
  const listings = readJsonSafe<PlatformListingDoc>('platformListings.json');
  const reviews = readJsonSafe<ReviewDoc>('reviews.json');
  const analyses = readJsonSafe<AnalysisDoc>('analyses.json');
  const summaries = readJsonSafe<ProductSummaryDoc>('summaries.json');

  const sourceCounts = {
    users: users.length,
    products: products.length,
    listings: listings.length,
    reviews: reviews.length,
    analyses: analyses.length,
    summaries: summaries.length,
  };

  const importedCounts = {
    users: 0,
    products: 0,
    listings: 0,
    reviews: 0,
    analyses: 0,
    summaries: 0,
  };

  const skippedOrFailed: { entity: string; id: string; reason: string }[] = [];

  // 1. Migrate Users
  for (const u of users) {
    if (!u._id || !u.email) {
      skippedOrFailed.push({ entity: 'user', id: u._id || 'unknown', reason: 'Missing _id or email' });
      continue;
    }
    const { error } = await client.from('users').upsert(mapUserToRow(u), { onConflict: 'id' });
    if (error) {
      skippedOrFailed.push({ entity: 'user', id: u._id, reason: error.message });
    } else {
      importedCounts.users++;
    }
  }

  // 2. Migrate Products (Parent table)
  const validProductIds = new Set<string>();
  for (const p of products) {
    if (!p._id || !p.name) {
      skippedOrFailed.push({ entity: 'product', id: p._id || 'unknown', reason: 'Missing _id or name' });
      continue;
    }
    const { error } = await client.from('products').upsert(mapProductToRow(p), { onConflict: 'id' });
    if (error) {
      skippedOrFailed.push({ entity: 'product', id: p._id, reason: error.message });
    } else {
      validProductIds.add(p._id);
      importedCounts.products++;
    }
  }

  // 3. Migrate Platform Listings (Depends on products)
  for (const l of listings) {
    if (!l.productId || !validProductIds.has(l.productId)) {
      skippedOrFailed.push({
        entity: 'platform_listing',
        id: l._id || 'unknown',
        reason: `Parent product ${l.productId} not found`,
      });
      continue;
    }
    const { error } = await client
      .from('platform_listings')
      .upsert(mapListingToRow(l), { onConflict: 'platform,platform_product_id' });
    if (error) {
      skippedOrFailed.push({ entity: 'platform_listing', id: l._id, reason: error.message });
    } else {
      importedCounts.listings++;
    }
  }

  // 4. Migrate Reviews (Depends on products)
  const validReviewIds = new Set<string>();
  const reviewRows: any[] = [];
  for (const r of reviews) {
    const text = r.reviewText || r.text || '';
    if (!r._id || !r.productId || !text.trim()) {
      skippedOrFailed.push({
        entity: 'review',
        id: r._id || 'unknown',
        reason: 'Missing _id, productId, or reviewText',
      });
      continue;
    }
    if (!validProductIds.has(r.productId)) {
      skippedOrFailed.push({
        entity: 'review',
        id: r._id,
        reason: `Parent product ${r.productId} not found`,
      });
      continue;
    }
    reviewRows.push(mapReviewToRow(r));
    validReviewIds.add(r._id);
  }

  // Batch upsert reviews in chunks of 25
  for (let i = 0; i < reviewRows.length; i += 25) {
    const chunk = reviewRows.slice(i, i + 25);
    const { error } = await client.from('reviews').upsert(chunk, { onConflict: 'id' });
    if (error) {
      // Fallback row-by-row if batch had a conflict on content_hash
      for (const singleRow of chunk) {
        const { error: singleErr } = await client.from('reviews').upsert(singleRow, { onConflict: 'id' });
        if (singleErr) {
          skippedOrFailed.push({ entity: 'review', id: singleRow.id, reason: singleErr.message });
          validReviewIds.delete(singleRow.id);
        } else {
          importedCounts.reviews++;
        }
      }
    } else {
      importedCounts.reviews += chunk.length;
    }
  }

  // 5. Migrate Review Analyses (Depends on reviews & products)
  const analysisRows: any[] = [];
  for (const a of analyses) {
    const revId = a.reviewId || a._id;
    if (!a._id || !revId || !a.productId) {
      skippedOrFailed.push({
        entity: 'review_analysis',
        id: a._id || 'unknown',
        reason: 'Missing _id, reviewId, or productId',
      });
      continue;
    }
    if (!validReviewIds.has(revId)) {
      skippedOrFailed.push({
        entity: 'review_analysis',
        id: a._id,
        reason: `Parent review ${revId} not found`,
      });
      continue;
    }
    analysisRows.push(mapAnalysisToRow(a));
  }

  for (let i = 0; i < analysisRows.length; i += 25) {
    const chunk = analysisRows.slice(i, i + 25);
    const { error } = await client.from('review_analyses').upsert(chunk, { onConflict: 'review_id' });
    if (error) {
      for (const singleRow of chunk) {
        const { error: singleErr } = await client
          .from('review_analyses')
          .upsert(singleRow, { onConflict: 'review_id' });
        if (singleErr) {
          skippedOrFailed.push({ entity: 'review_analysis', id: singleRow.id, reason: singleErr.message });
        } else {
          importedCounts.analyses++;
        }
      }
    } else {
      importedCounts.analyses += chunk.length;
    }
  }

  // 6. Migrate Product Summaries (Depends on products)
  for (const s of summaries) {
    if (!s.productId || !validProductIds.has(s.productId)) {
      skippedOrFailed.push({
        entity: 'product_summary',
        id: s._id || s.productId || 'unknown',
        reason: `Parent product ${s.productId} not found`,
      });
      continue;
    }
    const { error } = await client
      .from('product_summaries')
      .upsert(mapSummaryToRow(s), { onConflict: 'product_id' });
    if (error) {
      skippedOrFailed.push({ entity: 'product_summary', id: s.productId, reason: error.message });
    } else {
      importedCounts.summaries++;
    }
  }

  // Reconcile destination counts
  const [
    { count: destUsers },
    { count: destProds },
    { count: destListings },
    { count: destReviews },
    { count: destAnalyses },
    { count: destSummaries },
  ] = await Promise.all([
    client.from('users').select('*', { count: 'exact', head: true }),
    client.from('products').select('*', { count: 'exact', head: true }),
    client.from('platform_listings').select('*', { count: 'exact', head: true }),
    client.from('reviews').select('*', { count: 'exact', head: true }),
    client.from('review_analyses').select('*', { count: 'exact', head: true }),
    client.from('product_summaries').select('*', { count: 'exact', head: true }),
  ]);

  const destinationCounts = {
    users: destUsers ?? 0,
    products: destProds ?? 0,
    listings: destListings ?? 0,
    reviews: destReviews ?? 0,
    analyses: destAnalyses ?? 0,
    summaries: destSummaries ?? 0,
  };

  return {
    success: skippedOrFailed.length === 0,
    message: `Migrated ${importedCounts.products} products, ${importedCounts.reviews} reviews, ${importedCounts.analyses} analyses, ${importedCounts.summaries} summaries, ${importedCounts.listings} platform listings, and ${importedCounts.users} users to Supabase PostgreSQL.`,
    sourceCounts,
    importedCounts,
    skippedOrFailed,
    destinationCounts,
  };
}
