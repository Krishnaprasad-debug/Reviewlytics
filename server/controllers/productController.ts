import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, ProductDoc, ProductSummaryDoc } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import { createProductSummaryFallback } from '../services/geminiService.js';
import {
  pgUpsertProduct,
  pgDeleteProduct,
  pgUpsertSummary,
} from '../services/supabaseService.js';

export async function getProducts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, category, brand, sortBy, order, page = '1', limit = '12' } = req.query;

    let products = Array.from(db.products.values());

    // Search filter
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      products = products.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category && typeof category === 'string' && category !== 'All') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Brand filter
    if (brand && typeof brand === 'string' && brand !== 'All') {
      products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }

    // Sorting
    const sortField = (sortBy as string) || 'createdAt';
    const isAsc = order === 'asc';

    products.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return isAsc ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const total = products.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = products.slice(startIndex, startIndex + limitNum);

    // Attach review count and avg rating to each product
    const enriched = paginated.map(p => {
      const pReviews = Array.from(db.reviews.values()).filter(r => r.productId === p._id);
      const totalReviews = pReviews.length;
      const avgRating = totalReviews > 0
        ? Number((pReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
        : 0;
      const analyses = Array.from(db.analyses.values()).filter(a => a.productId === p._id);
      const positiveAnalyses = analyses.filter(a => a.sentiment === 'Positive').length;
      const sentimentScore = analyses.length > 0 ? Math.round((positiveAnalyses / analyses.length) * 100) : null;

      return {
        ...p,
        totalReviews,
        averageRating: avgRating,
        sentimentScore,
        hasSummary: db.summaries.has(p._id),
      };
    });

    res.json({
      success: true,
      data: {
        products: enriched,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch products.' });
  }
}

export async function getProductById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = db.products.get(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const reviews = Array.from(db.reviews.values()).filter(r => r.productId === id);
    const analyses = Array.from(db.analyses.values()).filter(a => a.productId === id);
    const summary = db.summaries.get(id) || null;

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    // Rating breakdown
    const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: reviews.filter(r => Math.round(r.rating) === star).length,
      percentage: totalReviews > 0 ? Math.round((reviews.filter(r => Math.round(r.rating) === star).length / totalReviews) * 100) : 0,
    }));

    // Sentiment breakdown
    const positiveCount = analyses.filter(a => a.sentiment === 'Positive').length;
    const negativeCount = analyses.filter(a => a.sentiment === 'Negative').length;
    const neutralCount = analyses.filter(a => a.sentiment === 'Neutral').length;
    const mixedCount = analyses.filter(a => a.sentiment === 'Mixed').length;
    const suspiciousCount = analyses.filter(a => a.suspiciousStatus === 'Suspicious').length;

    res.json({
      success: true,
      data: {
        product: {
          ...product,
          totalReviews,
          averageRating: avgRating,
          ratingDistribution,
          sentimentStats: {
            analyzed: analyses.length,
            positive: positiveCount,
            negative: negativeCount,
            neutral: neutralCount,
            mixed: mixedCount,
            positivePercent: analyses.length > 0 ? Math.round((positiveCount / analyses.length) * 100) : 0,
            suspiciousCount,
          },
          summary,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching product details.' });
  }
}

export async function createProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, brand, category, description, price, image } = req.body;

    if (!name || !brand || !category) {
      res.status(400).json({ success: false, message: 'Name, brand, and category are required.' });
      return;
    }

    const defaultImages: { [cat: string]: string } = {
      Electronics: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
      Audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      Smartphones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      Computers: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
      Wearables: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      Appliances: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=800&auto=format&fit=crop&q=80',
    };

    const newProduct: ProductDoc = {
      _id: uuidv4(),
      name: name.trim(),
      brand: brand.trim(),
      category: category.trim(),
      description: description ? description.trim() : `High-performance ${category.toLowerCase()} engineered by ${brand}.`,
      price: typeof price === 'number' ? price : parseFloat(price) || 99.99,
      image: image || defaultImages[category] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
      createdBy: req.user?._id || 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await pgUpsertProduct(newProduct);

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      data: { product: saved },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create product.' });
  }
}

export async function updateProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = db.products.get(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const { name, brand, category, description, price, image } = req.body;
    if (name) product.name = name.trim();
    if (brand) product.brand = brand.trim();
    if (category) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = typeof price === 'number' ? price : parseFloat(price) || product.price;
    if (image) product.image = image;
    product.updatedAt = new Date().toISOString();

    const saved = await pgUpsertProduct(product);

    res.json({
      success: true,
      message: 'Product updated successfully!',
      data: { product: saved },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update product.' });
  }
}

export async function deleteProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = db.products.get(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    await pgDeleteProduct(id);

    res.json({
      success: true,
      message: 'Product and associated review records deleted successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete product.' });
  }
}

export async function getCategories(req: AuthRequest, res: Response): Promise<void> {
  try {
    const categories = Array.from(new Set(Array.from(db.products.values()).map(p => p.category))).filter(Boolean);
    const brands = Array.from(new Set(Array.from(db.products.values()).map(p => p.brand))).filter(Boolean);
    res.json({
      success: true,
      data: { categories, brands },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch categories.' });
  }
}

export async function getProductInsights(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = db.products.get(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const reviews = Array.from(db.reviews.values()).filter(r => r.productId === id);
    const analyses = Array.from(db.analyses.values()).filter(a => a.productId === id);
    const summary = db.summaries.get(id);

    const posCount = analyses.filter(a => a.sentiment === 'Positive').length;
    const negCount = analyses.filter(a => a.sentiment === 'Negative').length;
    const neuCount = analyses.filter(a => a.sentiment === 'Neutral').length;
    const mixCount = analyses.filter(a => a.sentiment === 'Mixed').length;
    const suspCount = analyses.filter(a => a.suspiciousStatus === 'Suspicious').length;

    const avgRating = reviews.length > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : 4.0;

    let activeSummary = summary;
    if ((!activeSummary || !activeSummary.overallSummary) && (reviews.length > 0 || analyses.length > 0)) {
      const generated = createProductSummaryFallback(product, reviews, analyses);
      activeSummary = {
        _id: id,
        productId: id,
        overallSummary: generated.overallSummary,
        overallSentiment: generated.overallSentiment,
        positiveHighlights: generated.positiveHighlights,
        negativeHighlights: generated.negativeHighlights,
        keyObservations: generated.keyObservations,
        aspectBreakdown: generated.aspectBreakdown,
        sentimentBreakdown: {
          positive: posCount,
          neutral: neuCount,
          negative: negCount,
          mixed: mixCount,
        },
        topPros: generated.topPros,
        topCons: generated.topCons,
        topKeywords: generated.topKeywords,
        suspiciousCount: suspCount,
        totalAnalyzed: analyses.length,
        averageRating: avgRating,
        reviewCoverage: generated.reviewCoverage,
        purchaseInsight: generated.purchaseInsight,
        reviewSignal: generated.reviewSignal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      activeSummary = await pgUpsertSummary(activeSummary);
    }

    const insights = {
      productId: id,
      productName: product.name,
      overallSummary: activeSummary?.overallSummary || 'No summary synthesized yet.',
      overallSentiment: activeSummary?.overallSentiment || (posCount > negCount ? 'Positive' : negCount > posCount ? 'Negative' : 'Neutral'),
      sentimentBreakdown: activeSummary?.sentimentBreakdown || {
        positive: posCount,
        neutral: neuCount,
        negative: negCount,
        mixed: mixCount,
      },
      averageRating: activeSummary?.averageRating || avgRating,
      topPros: activeSummary?.topPros || [],
      topCons: activeSummary?.topCons || [],
      aspectBreakdown: activeSummary?.aspectBreakdown || [],
      topKeywords: activeSummary?.topKeywords || [],
      keyObservations: activeSummary?.keyObservations || [],
      suspiciousCount: activeSummary?.suspiciousCount ?? suspCount,
      totalAnalyzed: activeSummary?.totalAnalyzed || analyses.length,
      reviewCoverage: activeSummary?.reviewCoverage || {
        reviewsAnalyzed: analyses.length,
        totalAvailableReviews: reviews.length,
        coveragePercentage: reviews.length > 0 ? Math.round((analyses.length / reviews.length) * 100) : 100,
        note: `AI synthesis based on ${analyses.length} verified reviews.`,
      },
      purchaseInsight: activeSummary?.purchaseInsight || '',
      reviewSignal: activeSummary?.reviewSignal || 'Caution',
      updatedAt: activeSummary?.updatedAt || product.updatedAt,
    };

    res.json({
      success: true,
      data: insights,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch product insights.' });
  }
}

export async function getProductComparison(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = db.products.get(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const listings = Array.from(db.platformListings.values()).filter(l => l.productId === id);
    const reviews = Array.from(db.reviews.values()).filter(r => r.productId === id);
    const analyses = Array.from(db.analyses.values()).filter(a => a.productId === id);

    const amazonListing = listings.find(l => l.platform === 'amazon');
    const flipkartListing = listings.find(l => l.platform === 'flipkart');

    const amazonReviews = reviews.filter(r => r.platform === 'amazon' || (!r.platform && r.source === 'amazon'));
    const flipkartReviews = reviews.filter(r => r.platform === 'flipkart' || (!r.platform && r.source === 'flipkart'));

    const amazonReviewIds = new Set(amazonReviews.map(r => r._id));
    const flipkartReviewIds = new Set(flipkartReviews.map(r => r._id));

    const amazonAnalyses = analyses.filter(a => amazonReviewIds.has(a.reviewId));
    const flipkartAnalyses = analyses.filter(a => flipkartReviewIds.has(a.reviewId));

    const amazonAvgRating = amazonReviews.length > 0
      ? Number((amazonReviews.reduce((sum, r) => sum + r.rating, 0) / amazonReviews.length).toFixed(1))
      : (amazonListing?.rating || 0);

    const flipkartAvgRating = flipkartReviews.length > 0
      ? Number((flipkartReviews.reduce((sum, r) => sum + r.rating, 0) / flipkartReviews.length).toFixed(1))
      : (flipkartListing?.rating || 0);

    const amazonPrice = amazonListing?.price || product.price || 0;
    const flipkartPrice = flipkartListing?.price || 0;

    let priceDiff = 0;
    let betterPricePlatform: 'amazon' | 'flipkart' | 'equal' | 'unknown' = 'unknown';

    if (amazonPrice > 0 && flipkartPrice > 0) {
      priceDiff = Math.abs(amazonPrice - flipkartPrice);
      if (amazonPrice < flipkartPrice) {
        betterPricePlatform = 'amazon';
      } else if (flipkartPrice < amazonPrice) {
        betterPricePlatform = 'flipkart';
      } else {
        betterPricePlatform = 'equal';
      }
    } else if (amazonPrice > 0) {
      betterPricePlatform = 'amazon';
    } else if (flipkartPrice > 0) {
      betterPricePlatform = 'flipkart';
    }

    const formatPlatformData = (listing: any, pReviews: any[], pAnalyses: any[], avgR: number, platformName: string) => {
      const pos = pAnalyses.filter(a => a.sentiment === 'Positive').length;
      const neg = pAnalyses.filter(a => a.sentiment === 'Negative').length;
      const neu = pAnalyses.filter(a => a.sentiment === 'Neutral').length;

      const pros = Array.from(new Set(pAnalyses.flatMap(a => a.pros || []))).slice(0, 5);
      const cons = Array.from(new Set(pAnalyses.flatMap(a => a.cons || []))).slice(0, 5);

      return {
        available: !!listing || pReviews.length > 0,
        platform: platformName,
        url: listing?.url || (platformName === 'amazon' ? product.url : ''),
        price: listing?.price || (platformName === 'amazon' ? product.price : 0),
        currency: listing?.currency || 'INR',
        rating: avgR || listing?.rating || 0,
        ratingsCount: listing?.ratingsCount || pReviews.length,
        reviewsCount: pReviews.length,
        reviewsAnalyzed: pAnalyses.length,
        sentiment: {
          positive: pos,
          neutral: neu,
          negative: neg,
          positivePercentage: pAnalyses.length > 0 ? Math.round((pos / pAnalyses.length) * 100) : 0,
        },
        topPros: pros,
        topCons: cons,
        availability: listing?.availability || 'In Stock',
      };
    };

    const amazonData = formatPlatformData(amazonListing, amazonReviews, amazonAnalyses, amazonAvgRating, 'amazon');
    const flipkartData = formatPlatformData(flipkartListing, flipkartReviews, flipkartAnalyses, flipkartAvgRating, 'flipkart');

    res.json({
      success: true,
      data: {
        productId: id,
        product,
        platforms: {
          amazon: amazonData,
          flipkart: flipkartData,
        },
        comparison: {
          priceDifference: priceDiff,
          betterPricePlatform,
          ratingDifference: Math.abs(amazonAvgRating - flipkartAvgRating).toFixed(1),
          higherRatedPlatform: amazonAvgRating > flipkartAvgRating ? 'amazon' : flipkartAvgRating > amazonAvgRating ? 'flipkart' : 'equal',
          verdict: betterPricePlatform === 'amazon'
            ? 'Amazon currently offers a better price for this product.'
            : betterPricePlatform === 'flipkart'
            ? 'Flipkart currently offers a better price for this product.'
            : 'Pricing and availability are comparable across platforms.',
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to generate product comparison.' });
  }
}
