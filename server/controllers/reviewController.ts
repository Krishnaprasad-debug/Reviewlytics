import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, ReviewDoc, AnalysisDoc } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import { analyzeReview } from '../services/geminiService.js';
import {
  pgUpsertReview,
  pgDeleteReview,
  pgUpsertAnalysis,
} from '../services/supabaseService.js';

export async function getReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      productId,
      search,
      rating,
      sentiment,
      suspiciousOnly,
      keyword,
      aspect,
      sortBy = 'createdAt',
      order = 'desc',
      page = '1',
      limit = '10',
    } = req.query;

    let reviews = Array.from(db.reviews.values());

    // Product filter
    if (productId && typeof productId === 'string' && productId !== 'all') {
      reviews = reviews.filter(r => r.productId === productId);
    }

    // Search filter
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      reviews = reviews.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.reviewText.toLowerCase().includes(q) ||
          (r.authorName && r.authorName.toLowerCase().includes(q))
      );
    }

    // Rating filter
    if (rating && typeof rating === 'string' && rating !== 'all') {
      const targetRating = parseInt(rating, 10);
      if (!isNaN(targetRating)) {
        reviews = reviews.filter(r => Math.round(r.rating) === targetRating);
      }
    }

    // Sentiment / Aspect / Keyword / Suspicious filters via Analysis lookup
    if (sentiment || suspiciousOnly === 'true' || keyword || aspect) {
      reviews = reviews.filter(r => {
        const analysis = Array.from(db.analyses.values()).find(a => a.reviewId === r._id);
        if (!analysis) return false;

        if (sentiment && sentiment !== 'all' && analysis.sentiment.toLowerCase() !== (sentiment as string).toLowerCase()) {
          return false;
        }

        if (suspiciousOnly === 'true' && analysis.suspiciousStatus !== 'Suspicious') {
          return false;
        }

        if (keyword && typeof keyword === 'string') {
          const kw = (keyword as string).toLowerCase();
          const match = analysis.keywords.some(k => k.toLowerCase().includes(kw));
          if (!match && !r.reviewText.toLowerCase().includes(kw)) return false;
        }

        if (aspect && typeof aspect === 'string') {
          const asp = (aspect as string).toLowerCase();
          const match = analysis.aspects.some(a => a.name.toLowerCase().includes(asp));
          if (!match) return false;
        }

        return true;
      });
    }

    // Sorting
    const isAsc = order === 'asc';
    reviews.sort((a: any, b: any) => {
      if (sortBy === 'rating') {
        return isAsc ? a.rating - b.rating : b.rating - a.rating;
      }
      return isAsc
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const total = reviews.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = reviews.slice(startIndex, startIndex + limitNum);

    // Attach analysis and product info
    const enriched = paginated.map(r => {
      const analysis = Array.from(db.analyses.values()).find(a => a.reviewId === r._id) || null;
      const product = db.products.get(r.productId);
      return {
        ...r,
        productName: product?.name || 'Unknown Product',
        productBrand: product?.brand || '',
        productImage: product?.image || '',
        analysis,
      };
    });

    res.json({
      success: true,
      data: {
        reviews: enriched,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch reviews.' });
  }
}

export async function createReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId, rating, title, reviewText, authorName, autoAnalyze = true } = req.body;

    if (!productId || !rating || !reviewText) {
      res.status(400).json({ success: false, message: 'Product ID, rating, and review text are required.' });
      return;
    }

    const product = db.products.get(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const newReview: ReviewDoc = {
      _id: uuidv4(),
      productId,
      userId: req.user?._id,
      authorName: authorName ? authorName.trim() : (req.user?.name || 'Anonymous Reviewer'),
      rating: Math.min(5, Math.max(1, Number(rating))),
      title: title ? title.trim() : 'Customer Review',
      reviewText: reviewText.trim(),
      source: 'manual',
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedReview = await pgUpsertReview(newReview);

    let analysis: AnalysisDoc | null = null;
    if (autoAnalyze) {
      try {
        const aiResult = await analyzeReview(savedReview.reviewText, savedReview.rating, product.name);
        analysis = await pgUpsertAnalysis({
          _id: uuidv4(),
          reviewId: savedReview._id,
          productId: savedReview.productId,
          sentiment: aiResult.sentiment,
          confidence: aiResult.confidence,
          aspects: aiResult.aspects,
          pros: aiResult.pros,
          cons: aiResult.cons,
          keywords: aiResult.keywords,
          suspiciousStatus: aiResult.suspiciousStatus,
          suspiciousReason: aiResult.suspiciousReason,
          suspiciousScore: aiResult.suspiciousScore,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (aiErr) {
        console.error('Auto analyze failed for new review:', aiErr);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully!',
      data: {
        review: {
          ...savedReview,
          productName: product.name,
          analysis,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create review.' });
  }
}

export async function updateReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const review = db.reviews.get(id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    const { rating, title, reviewText, authorName, reanalyze = true } = req.body;
    if (rating !== undefined) review.rating = Math.min(5, Math.max(1, Number(rating)));
    if (title !== undefined) review.title = title.trim();
    if (reviewText !== undefined) review.reviewText = reviewText.trim();
    if (authorName !== undefined) review.authorName = authorName.trim();
    review.updatedAt = new Date().toISOString();

    const savedReview = await pgUpsertReview(review);

    let analysis = Array.from(db.analyses.values()).find(a => a.reviewId === savedReview._id) || null;
    if (reanalyze) {
      const product = db.products.get(savedReview.productId);
      const aiResult = await analyzeReview(savedReview.reviewText, savedReview.rating, product?.name);
      if (analysis) {
        analysis.sentiment = aiResult.sentiment;
        analysis.confidence = aiResult.confidence;
        analysis.aspects = aiResult.aspects;
        analysis.pros = aiResult.pros;
        analysis.cons = aiResult.cons;
        analysis.keywords = aiResult.keywords;
        analysis.suspiciousStatus = aiResult.suspiciousStatus;
        analysis.suspiciousReason = aiResult.suspiciousReason;
        analysis.suspiciousScore = aiResult.suspiciousScore;
        analysis.updatedAt = new Date().toISOString();
        analysis = await pgUpsertAnalysis(analysis);
      } else {
        analysis = await pgUpsertAnalysis({
          _id: uuidv4(),
          reviewId: savedReview._id,
          productId: savedReview.productId,
          sentiment: aiResult.sentiment,
          confidence: aiResult.confidence,
          aspects: aiResult.aspects,
          pros: aiResult.pros,
          cons: aiResult.cons,
          keywords: aiResult.keywords,
          suspiciousStatus: aiResult.suspiciousStatus,
          suspiciousReason: aiResult.suspiciousReason,
          suspiciousScore: aiResult.suspiciousScore,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    res.json({
      success: true,
      message: 'Review updated successfully!',
      data: { review: { ...savedReview, analysis } },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update review.' });
  }
}

export async function deleteReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const review = db.reviews.get(id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    await pgDeleteReview(id);

    res.json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete review.' });
  }
}
