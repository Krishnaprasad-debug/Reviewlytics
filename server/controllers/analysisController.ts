import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, AnalysisDoc, ProductSummaryDoc } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import { analyzeReview, summarizeProductReviews } from '../services/geminiService.js';
import {
  pgUpsertAnalysis,
  pgUpsertAnalysesBatch,
  pgUpsertSummary,
} from '../services/supabaseService.js';

export async function analyzeSingleReviewById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { reviewId } = req.params;
    const { force = false } = req.body;

    const review = db.reviews.get(reviewId);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    const product = db.products.get(review.productId);
    const existingAnalysis = Array.from(db.analyses.values()).find(a => a.reviewId === reviewId);

    if (existingAnalysis && !force) {
      res.json({
        success: true,
        message: 'Loaded cached AI analysis.',
        data: { analysis: existingAnalysis },
      });
      return;
    }

    const aiResult = await analyzeReview(review.reviewText, review.rating, product?.name);

    let analysis: AnalysisDoc;
    if (existingAnalysis) {
      existingAnalysis.sentiment = aiResult.sentiment;
      existingAnalysis.confidence = aiResult.confidence;
      existingAnalysis.aspects = aiResult.aspects;
      existingAnalysis.pros = aiResult.pros;
      existingAnalysis.cons = aiResult.cons;
      existingAnalysis.keywords = aiResult.keywords;
      existingAnalysis.suspiciousStatus = aiResult.suspiciousStatus;
      existingAnalysis.suspiciousReason = aiResult.suspiciousReason;
      existingAnalysis.suspiciousScore = aiResult.suspiciousScore;
      existingAnalysis.updatedAt = new Date().toISOString();
      analysis = existingAnalysis;
    } else {
      analysis = {
        _id: uuidv4(),
        reviewId: review._id,
        productId: review.productId,
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
      };
    }

    analysis = await pgUpsertAnalysis(analysis);

    res.json({
      success: true,
      message: 'AI Review Analysis completed successfully!',
      data: { analysis },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to analyze review.' });
  }
}

export async function analyzeProductReviewsBatch(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const { forceAll = false } = req.body;

    const product = db.products.get(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const reviews = Array.from(db.reviews.values()).filter(r => r.productId === productId);
    if (reviews.length === 0) {
      res.status(400).json({ success: false, message: 'No reviews found for this product to analyze.' });
      return;
    }

    const analyzedCount = { processed: 0, skipped: 0, errors: 0 };
    const updatedAnalyses: AnalysisDoc[] = [];

    const batchPromises = reviews.map(async review => {
      const existing = Array.from(db.analyses.values()).find(a => a.reviewId === review._id);
      if (existing && !forceAll) {
        analyzedCount.skipped++;
        return existing;
      }

      try {
        const aiResult = await analyzeReview(review.reviewText, review.rating, product.name);
        const analysis: AnalysisDoc = existing || {
          _id: uuidv4(),
          reviewId: review._id,
          productId: review.productId,
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
        };

        if (existing) {
          existing.sentiment = aiResult.sentiment;
          existing.confidence = aiResult.confidence;
          existing.aspects = aiResult.aspects;
          existing.pros = aiResult.pros;
          existing.cons = aiResult.cons;
          existing.keywords = aiResult.keywords;
          existing.suspiciousStatus = aiResult.suspiciousStatus;
          existing.suspiciousReason = aiResult.suspiciousReason;
          existing.suspiciousScore = aiResult.suspiciousScore;
          existing.updatedAt = new Date().toISOString();
        }

        updatedAnalyses.push(analysis);
        analyzedCount.processed++;
        return analysis;
      } catch (e) {
        analyzedCount.errors++;
        return null;
      }
    });

    await Promise.all(batchPromises);
    if (updatedAnalyses.length > 0) {
      await pgUpsertAnalysesBatch(updatedAnalyses);
    }

    // Auto-update summary after batch analysis
    const allProductAnalyses = Array.from(db.analyses.values()).filter(a => a.productId === productId);
    const summaryData = await summarizeProductReviews(product, reviews, allProductAnalyses);

    const posCount = allProductAnalyses.filter(a => a.sentiment === 'Positive').length;
    const negCount = allProductAnalyses.filter(a => a.sentiment === 'Negative').length;
    const neuCount = allProductAnalyses.filter(a => a.sentiment === 'Neutral').length;
    const mixCount = allProductAnalyses.filter(a => a.sentiment === 'Mixed').length;
    const suspCount = allProductAnalyses.filter(a => a.suspiciousStatus === 'Suspicious').length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    let summaryDoc: ProductSummaryDoc = {
      _id: productId,
      productId,
      overallSummary: summaryData.overallSummary,
      positiveHighlights: summaryData.positiveHighlights,
      negativeHighlights: summaryData.negativeHighlights,
      keyObservations: summaryData.keyObservations,
      aspectBreakdown: summaryData.aspectBreakdown,
      sentimentBreakdown: {
        positive: posCount,
        negative: negCount,
        neutral: neuCount,
        mixed: mixCount,
      },
      topPros: summaryData.topPros,
      topCons: summaryData.topCons,
      topKeywords: summaryData.topKeywords,
      suspiciousCount: suspCount,
      totalAnalyzed: allProductAnalyses.length,
      averageRating: Number(avgRating.toFixed(1)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    summaryDoc = await pgUpsertSummary(summaryDoc);

    res.json({
      success: true,
      message: `Batch analysis completed: ${analyzedCount.processed} processed, ${analyzedCount.skipped} cached, ${analyzedCount.errors} errors.`,
      data: {
        summary: summaryDoc,
        stats: analyzedCount,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Batch review analysis failed.' });
  }
}

export async function getProductSummary(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const { regenerate = false } = req.query;

    const product = db.products.get(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const existingSummary = db.summaries.get(productId);
    if (existingSummary && regenerate !== 'true') {
      res.json({
        success: true,
        data: { summary: existingSummary },
      });
      return;
    }

    const reviews = Array.from(db.reviews.values()).filter(r => r.productId === productId);
    const analyses = Array.from(db.analyses.values()).filter(a => a.productId === productId);

    const summaryData = await summarizeProductReviews(product, reviews, analyses);

    const posCount = analyses.filter(a => a.sentiment === 'Positive').length;
    const negCount = analyses.filter(a => a.sentiment === 'Negative').length;
    const neuCount = analyses.filter(a => a.sentiment === 'Neutral').length;
    const mixCount = analyses.filter(a => a.sentiment === 'Mixed').length;
    const suspCount = analyses.filter(a => a.suspiciousStatus === 'Suspicious').length;
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    let summaryDoc: ProductSummaryDoc = {
      _id: productId,
      productId,
      overallSummary: summaryData.overallSummary,
      positiveHighlights: summaryData.positiveHighlights,
      negativeHighlights: summaryData.negativeHighlights,
      keyObservations: summaryData.keyObservations,
      aspectBreakdown: summaryData.aspectBreakdown,
      sentimentBreakdown: {
        positive: posCount,
        negative: negCount,
        neutral: neuCount,
        mixed: mixCount,
      },
      topPros: summaryData.topPros,
      topCons: summaryData.topCons,
      topKeywords: summaryData.topKeywords,
      suspiciousCount: suspCount,
      totalAnalyzed: analyses.length,
      averageRating: Number(avgRating.toFixed(1)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    summaryDoc = await pgUpsertSummary(summaryDoc);

    res.json({
      success: true,
      message: 'Product review summary generated successfully.',
      data: { summary: summaryDoc },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to generate product summary.' });
  }
}

export async function getSuspiciousReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId } = req.query;

    let analyses = Array.from(db.analyses.values()).filter(
      a => a.suspiciousStatus === 'Suspicious' || a.suspiciousStatus === 'Uncertain'
    );

    if (productId && typeof productId === 'string' && productId !== 'all') {
      analyses = analyses.filter(a => a.productId === productId);
    }

    const items = analyses.map(analysis => {
      const review = db.reviews.get(analysis.reviewId || '');
      const product = db.products.get(analysis.productId);
      return {
        analysis,
        review,
        productName: product?.name || 'Unknown Product',
      };
    }).filter(item => !!item.review);

    res.json({
      success: true,
      data: { suspiciousReviews: items },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to get suspicious reviews.' });
  }
}
