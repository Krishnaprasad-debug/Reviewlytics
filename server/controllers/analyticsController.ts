import { Response } from 'express';
import { db, ReviewDoc, ProductSummaryDoc } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import { compareProductsAI } from '../services/geminiService.js';

export async function getDashboardAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId, category, dateRange } = req.query;

    let products = Array.from(db.products.values());
    let reviews = Array.from(db.reviews.values());
    let analyses = Array.from(db.analyses.values());

    // Category filter
    if (category && typeof category === 'string' && category !== 'All') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
      const prodIds = new Set(products.map(p => p._id));
      reviews = reviews.filter(r => prodIds.has(r.productId));
      analyses = analyses.filter(a => prodIds.has(a.productId));
    }

    // Product filter
    if (productId && typeof productId === 'string' && productId !== 'all') {
      products = products.filter(p => p._id === productId);
      reviews = reviews.filter(r => r.productId === productId);
      analyses = analyses.filter(a => a.productId === productId);
    }

    // Date range filter
    if (dateRange && typeof dateRange === 'string') {
      const now = new Date();
      let cutoffDate: Date | null = null;
      if (dateRange === '7d') cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      else if (dateRange === '30d') cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      else if (dateRange === '90d') cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      else if (dateRange === '1y') cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

      if (cutoffDate) {
        const filtered = reviews.filter(r => new Date(r.createdAt) >= cutoffDate!);
        if (filtered.length > 0) {
          reviews = filtered;
          const revIds = new Set(reviews.map(r => r._id));
          analyses = analyses.filter(a => revIds.has(a.reviewId || ''));
        }
      }
    }

    const totalProducts = products.length;
    const totalReviews = reviews.length;
    const totalAnalyzed = analyses.length;

    const avgRating = totalReviews > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    // Sentiment Breakdown
    const positiveCount = analyses.filter(a => a.sentiment === 'Positive').length;
    const negativeCount = analyses.filter(a => a.sentiment === 'Negative').length;
    const neutralCount = analyses.filter(a => a.sentiment === 'Neutral').length;
    const mixedCount = analyses.filter(a => a.sentiment === 'Mixed').length;
    const suspiciousCount = analyses.filter(a => a.suspiciousStatus === 'Suspicious').length;
    const uncertainCount = analyses.filter(a => a.suspiciousStatus === 'Uncertain').length;

    const sentimentDistribution = [
      { name: 'Positive', value: positiveCount, color: '#10B981', percentage: totalAnalyzed > 0 ? Math.round((positiveCount / totalAnalyzed) * 100) : 0 },
      { name: 'Negative', value: negativeCount, color: '#EF4444', percentage: totalAnalyzed > 0 ? Math.round((negativeCount / totalAnalyzed) * 100) : 0 },
      { name: 'Neutral', value: neutralCount, color: '#6B7280', percentage: totalAnalyzed > 0 ? Math.round((neutralCount / totalAnalyzed) * 100) : 0 },
      { name: 'Mixed', value: mixedCount, color: '#F59E0B', percentage: totalAnalyzed > 0 ? Math.round((mixedCount / totalAnalyzed) * 100) : 0 },
    ];

    // Rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
      const count = reviews.filter(r => Math.round(r.rating) === star).length;
      return {
        star: `${star} Stars`,
        rating: star,
        count,
        percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0,
      };
    });

    // Review Timeline trend (grouped by month or recent dates)
    const monthMap = new Map<string, { month: string; reviews: number; positive: number; negative: number; avgRating: number; ratingSum: number }>();
    reviews.forEach(r => {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      const current = monthMap.get(key) || { month: monthLabel, reviews: 0, positive: 0, negative: 0, avgRating: 0, ratingSum: 0 };
      current.reviews++;
      current.ratingSum += r.rating;

      const matchedAnalysis = analyses.find(a => a.reviewId === r._id);
      if (matchedAnalysis?.sentiment === 'Positive') current.positive++;
      if (matchedAnalysis?.sentiment === 'Negative') current.negative++;

      monthMap.set(key, current);
    });

    const reviewTrends = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([_, v]) => ({
        ...v,
        avgRating: v.reviews > 0 ? Number((v.ratingSum / v.reviews).toFixed(1)) : 0,
      }));

    // Aspect Analysis aggregation
    const aspectMap = new Map<string, { positive: number; negative: number; neutral: number; total: number }>();
    analyses.forEach(a => {
      if (Array.isArray(a.aspects)) {
        a.aspects.forEach(asp => {
          const name = asp.name;
          const current = aspectMap.get(name) || { positive: 0, negative: 0, neutral: 0, total: 0 };
          current.total++;
          if (asp.sentiment === 'Positive') current.positive++;
          else if (asp.sentiment === 'Negative') current.negative++;
          else current.neutral++;
          aspectMap.set(name, current);
        });
      }
    });

    const aspectAnalytics = Array.from(aspectMap.entries())
      .map(([name, data]) => ({
        name,
        positive: data.positive,
        negative: data.negative,
        neutral: data.neutral,
        total: data.total,
        positiveRatio: data.total > 0 ? Math.round((data.positive / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    // Top products by rating & review count
    const topProducts = products.map(p => {
      const pReviews = reviews.filter(r => r.productId === p._id);
      const pAnalyses = analyses.filter(a => a.productId === p._id);
      const pos = pAnalyses.filter(a => a.sentiment === 'Positive').length;
      return {
        _id: p._id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        image: p.image,
        price: p.price,
        reviewCount: pReviews.length,
        avgRating: pReviews.length > 0 ? Number((pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length).toFixed(1)) : 0,
        positiveSentimentPercent: pAnalyses.length > 0 ? Math.round((pos / pAnalyses.length) * 100) : 0,
      };
    }).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5);

    // Recent reviews with analysis
    const recentReviews = reviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
      .map(r => {
        const prod = db.products.get(r.productId);
        const analysis = analyses.find(a => a.reviewId === r._id);
        return {
          ...r,
          productName: prod?.name || 'Product',
          analysis,
        };
      });

    res.json({
      success: true,
      data: {
        metrics: {
          totalProducts,
          totalReviews,
          totalAnalyzed,
          averageRating: avgRating,
          positiveCount,
          negativeCount,
          neutralCount,
          mixedCount,
          positivePercentage: totalAnalyzed > 0 ? Math.round((positiveCount / totalAnalyzed) * 100) : 0,
          suspiciousCount,
          uncertainCount,
          suspiciousPercentage: totalAnalyzed > 0 ? Math.round((suspiciousCount / totalAnalyzed) * 100) : 0,
        },
        sentimentDistribution,
        ratingDistribution,
        reviewTrends,
        aspectAnalytics,
        topProducts,
        recentReviews,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to calculate analytics.' });
  }
}

export async function compareProducts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length < 2) {
      res.status(400).json({
        success: false,
        message: 'Please provide at least 2 product IDs to compare.',
      });
      return;
    }

    const selectedProducts = productIds.map(id => db.products.get(id)).filter(Boolean);
    if (selectedProducts.length < 2) {
      res.status(404).json({
        success: false,
        message: 'Could not find the requested products for comparison.',
      });
      return;
    }

    const productReviewsMap: { [productId: string]: ReviewDoc[] } = {};
    const productSummariesMap: { [productId: string]: ProductSummaryDoc | null } = {};

    selectedProducts.forEach(p => {
      if (p) {
        productReviewsMap[p._id] = Array.from(db.reviews.values()).filter(r => r.productId === p._id);
        productSummariesMap[p._id] = db.summaries.get(p._id) || null;
      }
    });

    const aiComparison = await compareProductsAI(
      selectedProducts as any,
      productReviewsMap,
      productSummariesMap
    );

    // Compute direct side-by-side stats
    const comparisonCards = selectedProducts.map(p => {
      if (!p) return null;
      const revs = productReviewsMap[p._id] || [];
      const analyses = Array.from(db.analyses.values()).filter(a => a.productId === p._id);
      const posCount = analyses.filter(a => a.sentiment === 'Positive').length;
      const negCount = analyses.filter(a => a.sentiment === 'Negative').length;
      const avg = revs.length > 0 ? Number((revs.reduce((sum, r) => sum + r.rating, 0) / revs.length).toFixed(1)) : 0;
      const summary = productSummariesMap[p._id];

      return {
        _id: p._id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price,
        image: p.image,
        description: p.description,
        totalReviews: revs.length,
        averageRating: avg,
        sentimentPositive: posCount,
        sentimentNegative: negCount,
        positiveRatio: analyses.length > 0 ? Math.round((posCount / analyses.length) * 100) : 0,
        summary,
      };
    }).filter(Boolean);

    res.json({
      success: true,
      message: 'Product comparison generated successfully.',
      data: {
        products: comparisonCards,
        aiComparison,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Product comparison failed.' });
  }
}
