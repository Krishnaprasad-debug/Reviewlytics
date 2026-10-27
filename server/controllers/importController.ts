import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth.js';
import { validateAndExtractAmazonUrl } from '../utils/amazonUrlHelper.js';
import { validateAndExtractFlipkartUrl } from '../utils/flipkartUrlHelper.js';
import {
  scrapeAmazonReviews,
  scrapeFlipkartReviews,
  CustomError,
  ScrapedAmazonReview,
} from '../services/apifyService.js';
import {
  db,
  ProductDoc,
  PlatformListingDoc,
  ReviewDoc,
  AnalysisDoc,
  ProductSummaryDoc,
} from '../config/db.js';
import {
  analyzeReviewsBatch,
  fallbackAnalyzeReview,
  summarizeProductReviews,
} from '../services/geminiService.js';
import {
  pgUpsertProduct,
  pgUpsertPlatformListing,
  pgUpsertReviewsBatch,
  pgUpsertAnalysesBatch,
  pgUpsertSummary,
  computeReviewContentHash,
} from '../services/supabaseService.js';

/**
 * Helper to process, store, and analyze scraped reviews for a product in Supabase PostgreSQL
 */
export async function processAndStoreScrapedData(
  platform: 'amazon' | 'flipkart',
  platformProductId: string,
  targetUrl: string,
  scrapedProduct: any,
  scrapedReviews: ScrapedAmazonReview[],
  userId?: string,
  existingCanonicalProductId?: string
) {
  // Step 1: Find or create canonical product
  let product: ProductDoc | undefined;

  if (existingCanonicalProductId) {
    product = db.products.get(existingCanonicalProductId);
  }

  // Check if listing already mapped to a product
  if (!product) {
    const existingListing = Array.from(db.platformListings.values()).find(
      l => l.platform === platform && l.platformProductId === platformProductId
    );
    if (existingListing) {
      product = db.products.get(existingListing.productId);
    }
  }

  // Check by exact ASIN or URL
  if (!product) {
    product = Array.from(db.products.values()).find(
      p => p.asin === platformProductId || p.url === targetUrl
    );
  }

  const productId = product ? product._id : uuidv4();

  if (!product) {
    product = {
      _id: productId,
      name: scrapedProduct.name,
      brand: scrapedProduct.brand || 'Generic',
      category: 'Electronics',
      description: scrapedProduct.features ? scrapedProduct.features.join(' • ') : `Imported from ${platform}`,
      price: scrapedProduct.price || 0,
      currency: scrapedProduct.currency || 'INR',
      image: scrapedProduct.image || '',
      source: platform,
      asin: platformProductId,
      url: targetUrl,
      ratingsCount: scrapedProduct.ratingsCount,
      features: scrapedProduct.features || [],
      createdBy: userId || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else {
    product.name = scrapedProduct.name || product.name;
    product.brand = scrapedProduct.brand || product.brand;
    product.price = scrapedProduct.price || product.price;
    product.image = scrapedProduct.image || product.image;
    product.updatedAt = new Date().toISOString();
  }

  product = await pgUpsertProduct(product);

  // Step 2: Save / Update Platform Listing
  const listingId = `${platform}_${platformProductId}`;
  let listingDoc: PlatformListingDoc = {
    _id: listingId,
    productId: product._id,
    platform,
    platformProductId,
    url: targetUrl,
    price: scrapedProduct.price,
    currency: scrapedProduct.currency || 'INR',
    rating: scrapedProduct.rating,
    ratingsCount: scrapedProduct.ratingsCount,
    availability: scrapedProduct.availability || 'In Stock',
    lastScrapedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  listingDoc = await pgUpsertPlatformListing(listingDoc);

  // Step 3: Deduplicate and store reviews
  const savedReviews: ReviewDoc[] = [];
  const seenHashes = new Set<string>();

  for (const scrapedRev of scrapedReviews) {
    if (!scrapedRev.text || !scrapedRev.text.trim()) continue;

    const hash = computeReviewContentHash(
      product._id,
      platform,
      scrapedRev.reviewId,
      scrapedRev.author,
      scrapedRev.text
    );
    if (seenHashes.has(hash)) continue;
    seenHashes.add(hash);

    // Composite unique check: productId + reviewId or content match
    const existingReview = Array.from(db.reviews.values()).find(r => {
      if (r.productId !== product!._id) return false;
      if (scrapedRev.reviewId && r.reviewId === scrapedRev.reviewId) return true;
      const existingHash = computeReviewContentHash(
        r.productId,
        r.platform || r.source || platform,
        r.reviewId,
        r.authorName || r.author,
        r.reviewText || r.text
      );
      return existingHash === hash;
    });

    const reviewId = existingReview ? existingReview._id : uuidv4();
    const reviewDoc: ReviewDoc = {
      _id: reviewId,
      productId: product._id,
      platform,
      reviewId: scrapedRev.reviewId,
      authorName: scrapedRev.author || 'Verified Customer',
      author: scrapedRev.author || 'Verified Customer',
      rating: scrapedRev.rating,
      title: scrapedRev.title || '',
      reviewText: scrapedRev.text,
      text: scrapedRev.text,
      source: platform,
      verifiedPurchase: scrapedRev.verifiedPurchase ?? true,
      helpfulVotes: scrapedRev.helpfulVotes || 0,
      reviewUrl: targetUrl,
      date: scrapedRev.date,
      createdAt: existingReview ? existingReview.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    savedReviews.push(reviewDoc);
  }

  if (savedReviews.length > 0) {
    await pgUpsertReviewsBatch(savedReviews);
  }

  // Step 4: Analyze reviews with AI in a single batch to avoid 429 rate limit
  const allProductReviews = Array.from(db.reviews.values()).filter(r => r.productId === product!._id);
  const unanalyzedReviews = allProductReviews.filter(rev => {
    return !Array.from(db.analyses.values()).some(
      a => a.reviewId === rev._id || (rev.reviewId && a.reviewId === rev.reviewId)
    );
  });

  if (unanalyzedReviews.length > 0) {
    const batchMap = await analyzeReviewsBatch(unanalyzedReviews, product.name);
    const newAnalyses: AnalysisDoc[] = [];

    for (const rev of unanalyzedReviews) {
      const aiResult =
        batchMap.get(rev._id) ||
        fallbackAnalyzeReview(rev.reviewText || rev.text || '', rev.rating, product.name, rev._id);

      const analysisDoc: AnalysisDoc = {
        _id: uuidv4(),
        reviewId: rev._id,
        productId: product._id,
        sentiment: aiResult.sentiment,
        sentimentScore: aiResult.sentimentScore,
        confidence: aiResult.confidence,
        aspects: aiResult.aspects,
        pros: aiResult.pros,
        cons: aiResult.cons,
        keywords: aiResult.keywords,
        suspiciousIndicators: aiResult.suspiciousIndicators,
        suspiciousStatus: aiResult.suspiciousStatus,
        suspiciousReason: aiResult.suspiciousReason,
        suspiciousScore: aiResult.suspiciousScore,
        summary: aiResult.summary,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      newAnalyses.push(analysisDoc);
    }

    if (newAnalyses.length > 0) {
      await pgUpsertAnalysesBatch(newAnalyses);
    }
  }

  // Step 5: Synthesize Product-Level AI Insights
  const allProductAnalyses = Array.from(db.analyses.values()).filter(a => a.productId === product!._id);
  const summaryResult = await summarizeProductReviews(product, allProductReviews, allProductAnalyses);

  const posCount = allProductAnalyses.filter(a => a.sentiment === 'Positive').length;
  const negCount = allProductAnalyses.filter(a => a.sentiment === 'Negative').length;
  const neuCount = allProductAnalyses.filter(a => a.sentiment === 'Neutral').length;
  const mixCount = allProductAnalyses.filter(a => a.sentiment === 'Mixed').length;
  const suspCount = allProductAnalyses.filter(a => a.suspiciousStatus === 'Suspicious').length;
  const avgRating = allProductReviews.length > 0
    ? Number((allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length).toFixed(1))
    : scrapedProduct.rating || 4.0;

  let summaryDoc: ProductSummaryDoc = {
    _id: product._id,
    productId: product._id,
    overallSummary: summaryResult.overallSummary,
    overallSentiment: summaryResult.overallSentiment,
    positiveHighlights: summaryResult.positiveHighlights,
    negativeHighlights: summaryResult.negativeHighlights,
    keyObservations: summaryResult.keyObservations,
    aspectBreakdown: summaryResult.aspectBreakdown,
    sentimentBreakdown: {
      positive: posCount,
      negative: negCount,
      neutral: neuCount,
      mixed: mixCount,
    },
    topPros: summaryResult.topPros,
    topCons: summaryResult.topCons,
    topKeywords: summaryResult.topKeywords,
    suspiciousCount: suspCount,
    totalAnalyzed: allProductAnalyses.length,
    averageRating: avgRating,
    reviewCoverage: summaryResult.reviewCoverage,
    purchaseInsight: summaryResult.purchaseInsight,
    reviewSignal: summaryResult.reviewSignal,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  summaryDoc = await pgUpsertSummary(summaryDoc);

  // Attach analysis to reviews for response
  const enrichedReviews = allProductReviews.map(r => ({
    ...r,
    analysis: db.analyses.get(r._id) || Array.from(db.analyses.values()).find(a => a.reviewId === r._id) || null,
  }));

  return {
    product: {
      ...product,
      totalReviews: allProductReviews.length,
      averageRating: avgRating,
      summary: summaryDoc,
    },
    listing: listingDoc,
    reviews: enrichedReviews,
    summary: summaryDoc,
    reviewCount: allProductReviews.length,
    reviewsAnalyzed: allProductAnalyses.length,
  };
}

/**
 * Controller to handle Amazon URL import, Apify review extraction, and AI analysis
 * POST /api/import/amazon
 * Body: { "url": "https://www.amazon.in/dp/B0XXXXXXXX", "refresh"?: boolean }
 */
export async function importAmazonProductReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { url, refresh = false } = req.body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid Amazon product URL in the request body.',
      });
      return;
    }

    // Step 1: Validate URL and Extract ASIN
    const validation = await validateAndExtractAmazonUrl(url);
    if (!validation.valid || !validation.asin) {
      res.status(400).json({
        success: false,
        error: validation.error || 'Invalid Amazon product URL or ASIN could not be extracted.',
      });
      return;
    }

    const targetUrl = validation.cleanUrl || url.trim();
    const asin = validation.asin;

    // Step 2: Caching check - if already analyzed and refresh not requested
    const existingListing = Array.from(db.platformListings.values()).find(
      l => l.platform === 'amazon' && l.platformProductId === asin
    );

    if (existingListing && !refresh) {
      const existingProduct = db.products.get(existingListing.productId);
      const existingSummary = db.summaries.get(existingListing.productId);
      const existingReviews = Array.from(db.reviews.values()).filter(
        r => r.productId === existingListing.productId
      );

      if (existingProduct && existingReviews.length > 0) {
        const enrichedReviews = existingReviews.map(r => ({
          ...r,
          analysis: db.analyses.get(r._id) || Array.from(db.analyses.values()).find(a => a.reviewId === r._id) || null,
        }));

        res.status(200).json({
          success: true,
          source: 'amazon',
          cached: true,
          message: 'Loaded cached product and review analysis.',
          productId: existingProduct._id,
          product: {
            ...existingProduct,
            totalReviews: existingReviews.length,
            averageRating: existingSummary?.averageRating || existingProduct.price || 4.0,
            summary: existingSummary,
          },
          listing: existingListing,
          reviews: enrichedReviews,
          summary: existingSummary,
          reviewCount: existingReviews.length,
        });
        return;
      }
    }

    // Step 3: Run Apify Amazon Review Scraper (kestrel/amazon-reviews-scraper)
    const scrapeResult = await scrapeAmazonReviews(targetUrl, asin, validation.domain);

    // Step 4: Process, persist to Supabase PostgreSQL, and run AI analysis
    const processed = await processAndStoreScrapedData(
      'amazon',
      asin,
      targetUrl,
      scrapeResult.product,
      scrapeResult.reviews,
      req.user?._id
    );

    res.status(200).json({
      success: true,
      source: 'amazon',
      cached: false,
      productId: processed.product._id,
      product: processed.product,
      listing: processed.listing,
      reviews: processed.reviews,
      summary: processed.summary,
      reviewCount: processed.reviewCount,
      reviewsAnalyzed: processed.reviewsAnalyzed,
    });
  } catch (err: any) {
    const error = err as CustomError;
    const statusCode = error.statusCode || 500;

    let safeMessage = error.message || 'An error occurred while importing Amazon reviews.';
    if (process.env.APIFY_API_TOKEN) {
      safeMessage = safeMessage.replaceAll(process.env.APIFY_API_TOKEN, '[REDACTED]');
    }
    if (process.env.GEMINI_API_KEY) {
      safeMessage = safeMessage.replaceAll(process.env.GEMINI_API_KEY, '[REDACTED]');
    }

    console.error(`[Amazon Import Error ${statusCode}]:`, safeMessage);

    res.status(statusCode).json({
      success: false,
      error: safeMessage,
    });
  }
}

/**
 * Controller to handle Flipkart URL import, Apify review extraction, and AI analysis
 * POST /api/import/flipkart
 * Body: { "url": "https://www.flipkart.com/...", "refresh"?: boolean }
 */
export async function importFlipkartProductReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { url, refresh = false } = req.body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid Flipkart product URL in the request body.',
      });
      return;
    }

    // Step 1: Validate URL and extract product identifier
    const validation = validateAndExtractFlipkartUrl(url);
    if (!validation.valid || !validation.productId) {
      res.status(400).json({
        success: false,
        error: validation.error || 'Invalid Flipkart product URL or product ID could not be extracted.',
      });
      return;
    }

    const targetUrl = validation.cleanUrl || url.trim();
    const productId = validation.productId;

    // Step 2: Caching check
    const existingListing = Array.from(db.platformListings.values()).find(
      l => l.platform === 'flipkart' && l.platformProductId === productId
    );

    if (existingListing && !refresh) {
      const existingProduct = db.products.get(existingListing.productId);
      const existingSummary = db.summaries.get(existingListing.productId);
      const existingReviews = Array.from(db.reviews.values()).filter(
        r => r.productId === existingListing.productId
      );

      if (existingProduct && existingReviews.length > 0) {
        const enrichedReviews = existingReviews.map(r => ({
          ...r,
          analysis: db.analyses.get(r._id) || Array.from(db.analyses.values()).find(a => a.reviewId === r._id) || null,
        }));

        res.status(200).json({
          success: true,
          source: 'flipkart',
          cached: true,
          message: 'Loaded cached product and review analysis.',
          productId: existingProduct._id,
          product: {
            ...existingProduct,
            totalReviews: existingReviews.length,
            averageRating: existingSummary?.averageRating || 4.0,
            summary: existingSummary,
          },
          listing: existingListing,
          reviews: enrichedReviews,
          summary: existingSummary,
          reviewCount: existingReviews.length,
        });
        return;
      }
    }

    // Step 3: Run Apify Flipkart Review Scraper (shahidirfan/flipkart-reviews-scraper with startUrl)
    const scrapeResult = await scrapeFlipkartReviews(targetUrl, productId);

    // Step 4: Process, persist to Supabase PostgreSQL, and run AI analysis
    const processed = await processAndStoreScrapedData(
      'flipkart',
      productId,
      targetUrl,
      scrapeResult.product,
      scrapeResult.reviews,
      req.user?._id
    );

    res.status(200).json({
      success: true,
      source: 'flipkart',
      cached: false,
      productId: processed.product._id,
      product: processed.product,
      listing: processed.listing,
      reviews: processed.reviews,
      summary: processed.summary,
      reviewCount: processed.reviewCount,
      reviewsAnalyzed: processed.reviewsAnalyzed,
    });
  } catch (err: any) {
    const error = err as CustomError;
    const statusCode = error.statusCode || 500;

    let safeMessage = error.message || 'An error occurred while importing Flipkart reviews.';
    if (process.env.APIFY_API_TOKEN) {
      safeMessage = safeMessage.replaceAll(process.env.APIFY_API_TOKEN, '[REDACTED]');
    }
    if (process.env.GEMINI_API_KEY) {
      safeMessage = safeMessage.replaceAll(process.env.GEMINI_API_KEY, '[REDACTED]');
    }

    console.error(`[Flipkart Import Error ${statusCode}]:`, safeMessage);

    res.status(statusCode).json({
      success: false,
      error: safeMessage,
    });
  }
}

/**
 * Controller to handle multi-platform analysis (Amazon + Flipkart together)
 * POST /api/import/analyze
 * Body: { "amazonUrl"?: string, "flipkartUrl"?: string }
 */
export async function analyzeMultiPlatformProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { amazonUrl, flipkartUrl } = req.body;

    if (!amazonUrl && !flipkartUrl) {
      res.status(400).json({
        success: false,
        error: 'Please provide at least one Amazon or Flipkart URL to analyze.',
      });
      return;
    }

    let canonicalProductId: string | undefined;
    let amazonData: any = null;
    let flipkartData: any = null;

    if (amazonUrl && typeof amazonUrl === 'string' && amazonUrl.trim()) {
      const validation = await validateAndExtractAmazonUrl(amazonUrl);
      if (validation.valid && validation.asin) {
        const targetUrl = validation.cleanUrl || amazonUrl.trim();
        const scrapeResult = await scrapeAmazonReviews(targetUrl, validation.asin, validation.domain);
        amazonData = await processAndStoreScrapedData(
          'amazon',
          validation.asin,
          targetUrl,
          scrapeResult.product,
          scrapeResult.reviews,
          req.user?._id
        );
        canonicalProductId = amazonData.product._id;
      }
    }

    if (flipkartUrl && typeof flipkartUrl === 'string' && flipkartUrl.trim()) {
      const validation = validateAndExtractFlipkartUrl(flipkartUrl);
      if (validation.valid && validation.productId) {
        const targetUrl = validation.cleanUrl || flipkartUrl.trim();
        const scrapeResult = await scrapeFlipkartReviews(targetUrl, validation.productId);
        flipkartData = await processAndStoreScrapedData(
          'flipkart',
          validation.productId,
          targetUrl,
          scrapeResult.product,
          scrapeResult.reviews,
          req.user?._id,
          canonicalProductId
        );
        if (!canonicalProductId) {
          canonicalProductId = flipkartData.product._id;
        }
      }
    }

    const primaryData = amazonData || flipkartData;
    if (!primaryData) {
      res.status(400).json({
        success: false,
        error: 'Could not extract product data from the provided URLs.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      productId: canonicalProductId,
      product: primaryData.product,
      summary: primaryData.summary,
      reviews: primaryData.reviews,
      reviewCount: primaryData.reviewCount,
      platforms: {
        amazon: !!amazonData,
        flipkart: !!flipkartData,
      },
    });
  } catch (err: any) {
    const error = err as CustomError;
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Multi-platform product import failed.',
    });
  }
}
