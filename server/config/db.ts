import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import {
  ProductModel,
  ReviewModel,
  ReviewAnalysisModel,
  ProductInsightModel,
  PlatformListingModel,
} from '../models/index.js';

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  profileImage?: string;
  settings?: {
    theme?: 'light' | 'dark' | 'system';
    emailNotifications?: boolean;
    autoAnalyzeReviews?: boolean;
    aiTemperature?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductDoc {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  currency?: string;
  image: string;
  source?: 'amazon' | 'flipkart' | 'manual' | 'csv' | 'api';
  asin?: string;
  url?: string;
  ratingsCount?: number;
  features?: string[];
  canonicalId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformListingDoc {
  _id: string;
  productId: string;
  platform: 'amazon' | 'flipkart';
  platformProductId: string; // ASIN or Flipkart PID
  url: string;
  price?: number;
  currency?: string;
  rating?: number;
  ratingsCount?: number;
  availability?: string;
  lastScrapedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewDoc {
  _id: string;
  productId: string;
  platform?: 'amazon' | 'flipkart' | 'manual' | 'csv' | 'api';
  reviewId?: string;
  userId?: string;
  authorName?: string;
  author?: string;
  rating: number; // 1 - 5
  title: string;
  reviewText: string;
  text?: string;
  source: 'manual' | 'csv' | 'api' | 'amazon' | 'flipkart';
  verifiedPurchase?: boolean;
  helpfulVotes?: number;
  reviewUrl?: string;
  date?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AspectSentiment {
  name: string;
  aspect?: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  score?: number;
  mentions?: number;
  evidence?: string;
}

export interface AnalysisDoc {
  _id: string;
  reviewId?: string;
  productId: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  sentimentScore?: number;
  confidence: number;
  aspects: AspectSentiment[];
  pros: string[];
  cons: string[];
  keywords: string[];
  suspiciousIndicators?: string[];
  suspiciousStatus: 'Genuine' | 'Suspicious' | 'Uncertain';
  suspiciousReason?: string;
  suspiciousScore?: number; // 0 to 100
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSummaryDoc {
  _id: string;
  productId: string;
  overallSummary: string;
  overallSentiment?: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  positiveHighlights: string[];
  negativeHighlights: string[];
  keyObservations: string[];
  aspectBreakdown: AspectSentiment[];
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  };
  topPros: { text: string; count: number }[];
  topCons: { text: string; count: number }[];
  topKeywords: { keyword: string; count: number }[];
  suspiciousCount: number;
  totalAnalyzed: number;
  averageRating: number;
  reviewCoverage?: {
    reviewsAnalyzed: number;
    note?: string;
  };
  purchaseInsight?: string;
  reviewSignal?: string;
  createdAt: string;
  updatedAt: string;
}

class JsonDatabase {
  private dataDir: string;
  private usersFile: string;
  private productsFile: string;
  private reviewsFile: string;
  private analysesFile: string;
  private summariesFile: string;
  private platformListingsFile: string;

  public users: Map<string, UserDoc> = new Map();
  public products: Map<string, ProductDoc> = new Map();
  public reviews: Map<string, ReviewDoc> = new Map();
  public analyses: Map<string, AnalysisDoc> = new Map();
  public summaries: Map<string, ProductSummaryDoc> = new Map();
  public platformListings: Map<string, PlatformListingDoc> = new Map();

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.productsFile = path.join(this.dataDir, 'products.json');
    this.reviewsFile = path.join(this.dataDir, 'reviews.json');
    this.analysesFile = path.join(this.dataDir, 'analyses.json');
    this.summariesFile = path.join(this.dataDir, 'summaries.json');
    this.platformListingsFile = path.join(this.dataDir, 'platformListings.json');

    this.loadAll();
  }

  private loadAll() {
    this.loadCollection(this.usersFile, this.users);
    this.loadCollection(this.productsFile, this.products);
    this.loadCollection(this.reviewsFile, this.reviews);
    this.loadCollection(this.analysesFile, this.analyses);
    this.loadCollection(this.summariesFile, this.summaries);
    this.loadCollection(this.platformListingsFile, this.platformListings);
  }

  private loadCollection<T extends { _id: string }>(filePath: string, map: Map<string, T>) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const items: T[] = JSON.parse(raw);
        map.clear();
        for (const item of items) {
          map.set(item._id, item);
        }
      }
    } catch (err) {
      console.error(`Failed to load ${filePath}:`, err);
    }
  }

  private saveCollection<T>(filePath: string, map: Map<string, T>) {
    try {
      const items = Array.from(map.values());
      fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Failed to save ${filePath}:`, err);
    }
  }

  public saveUsers() {
    this.saveCollection(this.usersFile, this.users);
  }

  public saveProducts() {
    this.saveCollection(this.productsFile, this.products);
  }

  public saveReviews() {
    this.saveCollection(this.reviewsFile, this.reviews);
  }

  public saveAnalyses() {
    this.saveCollection(this.analysesFile, this.analyses);
  }

  public saveSummaries() {
    this.saveCollection(this.summariesFile, this.summaries);
  }

  public savePlatformListings() {
    this.saveCollection(this.platformListingsFile, this.platformListings);
  }
}

export const db = new JsonDatabase();

/**
 * Mask sensitive credentials in MongoDB URI for safe client inspection
 */
export function maskMongoUri(uri: string): string {
  if (!uri) return '';
  try {
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, (_m, prefix, _pwd, rest) => {
      return `${prefix}••••••••${rest}`;
    });
  } catch {
    return 'mongodb://••••••••';
  }
}

/**
 * Automatically clean angle brackets < > often copied from Atlas templates
 * and ensure a database name exists
 */
export function normalizeMongoUri(uri: string): string {
  if (!uri) return '';
  let clean = uri.trim().replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/i, (_match, srv, user, pass) => {
    const cleanUser = user.replace(/^<|>$/g, '').trim();
    const cleanPass = pass.replace(/^<|>$/g, '').trim();
    return `mongodb${srv || ''}://${cleanUser}:${cleanPass}@`;
  });
  if (clean.includes('.mongodb.net/?') || clean.endsWith('.mongodb.net/')) {
    clean = clean.replace('.mongodb.net/?', '.mongodb.net/reviewlytics?').replace(/\.mongodb\.net\/$/, '.mongodb.net/reviewlytics');
  }
  return clean;
}

/**
 * Persist MONGODB_URI into local .env file
 */
export function saveMongoUriToEnv(uri: string): void {
  const normalized = normalizeMongoUri(uri);
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

  const mongoLine = `MONGODB_URI="${normalized}"`;
  if (/^MONGODB_URI=.*$/m.test(content)) {
    content = content.replace(/^MONGODB_URI=.*$/m, mongoLine);
  } else {
    content = `${content.trim()}\n${mongoLine}\n`;
  }

  fs.writeFileSync(envPath, content, 'utf-8');
  process.env.MONGODB_URI = normalized;
}

/**
 * Persist APIFY_API_TOKEN into local .env file
 */
export function saveApifyTokenToEnv(token: string): void {
  const trimmed = token.trim();
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

  const apifyLine = `APIFY_API_TOKEN="${trimmed}"`;
  if (/^APIFY_API_TOKEN=.*$/m.test(content)) {
    content = content.replace(/^APIFY_API_TOKEN=.*$/m, apifyLine);
  } else {
    content = `${content.trim()}\n${apifyLine}\n`;
  }

  fs.writeFileSync(envPath, content, 'utf-8');
  process.env.APIFY_API_TOKEN = trimmed;
}

/**
 * Persist JWT_SECRET into local .env file
 */
export function saveJwtSecretToEnv(secret: string): void {
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

  const jwtLine = `JWT_SECRET="${secret}"`;
  if (/^JWT_SECRET=.*$/m.test(content)) {
    content = content.replace(/^JWT_SECRET=.*$/m, jwtLine);
  } else {
    content = `${content.trim()}\n${jwtLine}\n`;
  }

  fs.writeFileSync(envPath, content, 'utf-8');
  process.env.JWT_SECRET = secret;
}

/**
 * Remove MONGODB_URI from local .env and disconnect
 */
export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf-8');
    content = content.replace(/^MONGODB_URI=.*$/m, '# MONGODB_URI=""');
    fs.writeFileSync(envPath, content, 'utf-8');
  }
  delete process.env.MONGODB_URI;
}

/**
 * Connect to MongoDB if MONGODB_URI is provided or passed directly
 */
export async function connectMongo(customUri?: string): Promise<{ connected: boolean; message: string; host?: string; dbName?: string }> {
  let uri = customUri || process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Database] MONGODB_URI not provided. Running on robust persistent JSON store.');
    return {
      connected: false,
      message: 'MONGODB_URI not provided. Operating on persistent local JSON store.',
    };
  }
  uri = normalizeMongoUri(uri);
  try {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    const host = mongoose.connection.host || 'cluster';
    const dbName = mongoose.connection.name || 'reviewlytics';
    console.log(`[Database] Successfully connected to MongoDB cluster (${host}/${dbName}).`);
    return {
      connected: true,
      message: `Successfully connected to MongoDB cluster (${host}/${dbName}).`,
      host,
      dbName,
    };
  } catch (err: any) {
    console.warn('[Database] Could not connect to MongoDB, falling back to persistent JSON store:', err.message);
    return {
      connected: false,
      message: err.message || 'Could not connect to MongoDB cluster.',
    };
  }
}

/**
 * Synchronize all memory / JSON datasets to MongoDB collections
 */
export async function syncJsonToMongo(): Promise<{
  products: number;
  reviews: number;
  analyses: number;
  summaries: number;
  listings: number;
}> {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB is not currently connected. Please connect first.');
  }

  let productsCount = 0;
  for (const prod of db.products.values()) {
    try {
      await (ProductModel as any).findOneAndUpdate(
        { _id: prod._id },
        {
          name: prod.name,
          brand: prod.brand,
          category: prod.category,
          description: prod.description,
          price: prod.price,
          currency: prod.currency || 'INR',
          image: prod.image,
          features: prod.features || [],
          canonicalId: prod.canonicalId || prod.asin,
          createdBy: prod.createdBy || 'system',
        },
        { upsert: true }
      );
      productsCount++;
    } catch (e) {
      console.warn('Sync product error for', prod._id, e);
    }
  }

  let listingsCount = 0;
  for (const listing of db.platformListings.values()) {
    try {
      await (PlatformListingModel as any).findOneAndUpdate(
        { platform: listing.platform, platformProductId: listing.platformProductId },
        {
          productId: listing.productId,
          platform: listing.platform,
          platformProductId: listing.platformProductId,
          url: listing.url,
          price: listing.price,
          currency: listing.currency || 'INR',
          rating: listing.rating,
          ratingsCount: listing.ratingsCount,
          availability: listing.availability,
          lastScrapedAt: new Date(listing.lastScrapedAt || Date.now()),
        },
        { upsert: true }
      );
      listingsCount++;
    } catch (e) {
      console.warn('Sync listing error for', listing._id, e);
    }
  }

  let reviewsCount = 0;
  for (const rev of db.reviews.values()) {
    try {
      await (ReviewModel as any).findOneAndUpdate(
        { platform: rev.platform || rev.source || 'manual', reviewId: rev.reviewId || rev._id },
        {
          productId: rev.productId,
          platform: rev.platform || rev.source || 'manual',
          reviewId: rev.reviewId || rev._id,
          rating: rev.rating,
          title: rev.title || '',
          text: rev.reviewText || rev.text || '',
          author: rev.authorName || rev.author || 'Customer',
          date: rev.date || '',
          verifiedPurchase: Boolean(rev.verifiedPurchase),
          helpfulVotes: rev.helpfulVotes || 0,
          reviewUrl: rev.reviewUrl || '',
        },
        { upsert: true }
      );
      reviewsCount++;
    } catch (e) {
      console.warn('Sync review error for', rev._id, e);
    }
  }

  let analysesCount = 0;
  for (const an of db.analyses.values()) {
    try {
      await (ReviewAnalysisModel as any).findOneAndUpdate(
        { reviewId: an.reviewId || an._id },
        {
          reviewId: an.reviewId || an._id,
          productId: an.productId,
          sentiment: (an.sentiment || 'Positive').toLowerCase(),
          sentimentScore: an.sentimentScore || 0,
          aspects: (an.aspects || []).map(a => ({
            aspect: a.aspect || a.name,
            sentiment: (a.sentiment || 'Positive').toLowerCase(),
            score: a.score || 0,
            evidence: a.evidence || '',
          })),
          pros: an.pros || [],
          cons: an.cons || [],
          keywords: an.keywords || [],
          suspiciousIndicators: an.suspiciousIndicators || [],
          suspiciousStatus: an.suspiciousStatus || 'Genuine',
          suspiciousScore: an.suspiciousScore || 0,
          summary: an.summary || '',
        },
        { upsert: true }
      );
      analysesCount++;
    } catch (e) {
      console.warn('Sync analysis error for', an._id, e);
    }
  }

  let summariesCount = 0;
  for (const s of db.summaries.values()) {
    try {
      await (ProductInsightModel as any).findOneAndUpdate(
        { productId: s.productId },
        {
          productId: s.productId,
          overallSummary: s.overallSummary,
          overallSentiment: (s.overallSentiment || 'Positive').toLowerCase(),
          sentimentBreakdown: s.sentimentBreakdown || { positive: 0, neutral: 0, negative: 0, mixed: 0 },
          averageRating: s.averageRating || 0,
          topPros: s.topPros || [],
          topCons: s.topCons || [],
          aspectBreakdown: (s.aspectBreakdown || []).map(a => ({
            name: a.name || a.aspect || '',
            aspect: a.aspect || a.name || '',
            sentiment: a.sentiment || 'Positive',
            score: a.score || 0,
            mentions: a.mentions || 0,
          })),
          topKeywords: s.topKeywords || [],
          keyObservations: s.keyObservations || [],
          suspiciousCount: s.suspiciousCount || 0,
          totalAnalyzed: s.totalAnalyzed || 0,
          reviewCoverage: s.reviewCoverage || { reviewsAnalyzed: s.totalAnalyzed || 0 },
          purchaseInsight: s.purchaseInsight || '',
          reviewSignal: s.reviewSignal || '',
          generatedAt: new Date(s.updatedAt || s.createdAt || Date.now()),
        },
        { upsert: true }
      );
      summariesCount++;
    } catch (e) {
      console.warn('Sync summary error for', s.productId, e);
    }
  }

  return {
    products: productsCount,
    reviews: reviewsCount,
    analyses: analysesCount,
    summaries: summariesCount,
    listings: listingsCount,
  };
}
