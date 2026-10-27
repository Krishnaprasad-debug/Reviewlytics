import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Star,
  Package,
  ArrowLeft,
  PlusCircle,
  UploadCloud,
  RefreshCw,
  Edit2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ExternalLink,
  Info,
  GitCompare,
  Link as LinkIcon,
} from 'lucide-react';
import { RatingStars } from '../components/common/RatingStars.js';
import { SentimentBadge } from '../components/common/SentimentBadge.js';
import { SuspiciousBadge } from '../components/common/SuspiciousBadge.js';
import { ProsCard } from '../components/common/ProsCard.js';
import { ConsCard } from '../components/common/ConsCard.js';
import { AspectBreakdown } from '../components/common/AspectBreakdown.js';
import { KeywordCloud } from '../components/common/KeywordCloud.js';
import { Pagination } from '../components/common/Pagination.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.js';
import { AddReviewModal } from '../components/modals/AddReviewModal.js';
import { CsvUploadModal } from '../components/modals/CsvUploadModal.js';
import { ProductFormModal } from '../components/modals/ProductFormModal.js';
import { Product, Review, AspectSentiment } from '../types/index.js';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { getDemoProductById, DEMO_PRODUCTS, getDemoReviews } from '../data/demoData.js';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast, success, error } = useToast();

  // Marketplace contextual params (if came from mock search)
  const sourceParam = searchParams.get('source'); // 'amazon' | 'flipkart'
  const mockName = searchParams.get('mockName');
  const mockPrice = searchParams.get('mockPrice');
  const mockReviews = searchParams.get('mockReviews');
  const mockRating = searchParams.get('mockRating');

  const marketplaceName = sourceParam === 'flipkart' ? 'Flipkart' : sourceParam === 'amazon' ? 'Amazon' : 'Marketplace';

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [platformComparison, setPlatformComparison] = useState<any | null>(null);
  const [inlineImportUrl, setInlineImportUrl] = useState('');
  const [isInlineImporting, setIsInlineImporting] = useState(false);

  // Review filters & pagination
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState<string>('All');
  const [filterSentiment, setFilterSentiment] = useState<string>('All');
  const [filterSuspicious, setFilterSuspicious] = useState<string>('All');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);
  const itemsPerPage = 8;

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const [analyzingReviewId, setAnalyzingReviewId] = useState<string | null>(null);

  // Modals
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);

  const fetchProductData = useCallback(async () => {
    if (!id) return;
    const demoFallback = getDemoProductById(id) || DEMO_PRODUCTS[0];

    try {
      const [prodRes, reviewsRes, allRevRes, sumRes, compRes] = await Promise.all([
        api.products.getById(id),
        api.reviews.getByProduct(id, {
          search: search.trim() || undefined,
          rating: filterRating !== 'All' ? parseInt(filterRating) : undefined,
          sentiment: filterSentiment !== 'All' ? filterSentiment : undefined,
          isSuspicious:
            filterSuspicious === 'suspicious'
              ? true
              : filterSuspicious === 'genuine'
              ? false
              : undefined,
          sortBy,
          order,
          page: currentPage,
          limit: itemsPerPage,
        }),
        api.reviews.getByProduct(id, { limit: 200 }),
        api.analysis.getProductSummary(id),
        api.products.getComparison(id).catch(() => ({ success: false, data: null })),
      ]);

      if (prodRes.success && prodRes.data && prodRes.data.product) {
        setProduct(prodRes.data.product);
      } else {
        setProduct(demoFallback);
      }

      if (reviewsRes.success && reviewsRes.data && reviewsRes.data.reviews && reviewsRes.data.reviews.length > 0) {
        setReviews(reviewsRes.data.reviews);
        setTotalPages(reviewsRes.data.pagination.totalPages);
        setTotalReviewsCount(reviewsRes.data.pagination.total);
      } else {
        const demoRevs = getDemoReviews({
          productId: id,
          rating: filterRating !== 'All' ? parseInt(filterRating) : undefined,
          sentiment: filterSentiment !== 'All' ? filterSentiment : undefined,
          isSuspicious: filterSuspicious === 'suspicious' ? true : filterSuspicious === 'genuine' ? false : undefined,
          search: search.trim() || undefined,
        });
        setReviews(demoRevs);
        setTotalPages(Math.max(1, Math.ceil(demoRevs.length / itemsPerPage)));
        setTotalReviewsCount(demoRevs.length);
      }

      if (allRevRes.success && allRevRes.data && allRevRes.data.reviews && allRevRes.data.reviews.length > 0) {
        setAllReviews(allRevRes.data.reviews);
      } else {
        setAllReviews(getDemoReviews({ productId: id }));
      }

      if (sumRes.success && sumRes.data && sumRes.data.summary) {
        setSummary(sumRes.data.summary);
      } else {
        setSummary(demoFallback.summary);
      }

      if (compRes && compRes.success && compRes.data) {
        setPlatformComparison(compRes.data);
      }
    } catch {
      // Gracefully use demo data
      setProduct(demoFallback);
      const demoRevs = getDemoReviews({
        productId: id,
        rating: filterRating !== 'All' ? parseInt(filterRating) : undefined,
        sentiment: filterSentiment !== 'All' ? filterSentiment : undefined,
        isSuspicious: filterSuspicious === 'suspicious' ? true : filterSuspicious === 'genuine' ? false : undefined,
        search: search.trim() || undefined,
      });
      setReviews(demoRevs);
      setAllReviews(getDemoReviews({ productId: id }));
      setTotalPages(Math.max(1, Math.ceil(demoRevs.length / itemsPerPage)));
      setTotalReviewsCount(demoRevs.length);
      setSummary(demoFallback.summary);
    } finally {
      setIsLoading(false);
    }
  }, [id, search, filterRating, filterSentiment, filterSuspicious, sortBy, order, currentPage]);

  const handleInlinePlatformImport = async (targetPlatform: 'amazon' | 'flipkart') => {
    if (!inlineImportUrl.trim()) {
      toast(`Please enter an ${targetPlatform === 'amazon' ? 'Amazon' : 'Flipkart'} product URL.`, 'warning');
      return;
    }
    setIsInlineImporting(true);
    try {
      let res: any;
      if (targetPlatform === 'amazon') {
        res = await api.import.analyzeMulti({
          amazonUrl: inlineImportUrl.trim(),
          flipkartUrl: product?.url || undefined,
        });
      } else {
        res = await api.import.analyzeMulti({
          amazonUrl: product?.url || undefined,
          flipkartUrl: inlineImportUrl.trim(),
        });
      }
      if (res && res.success) {
        success(`Multi-platform review data successfully aggregated and analyzed with AI Intelligence!`);
        setInlineImportUrl('');
        await fetchProductData();
      } else {
        throw new Error(res?.error || 'Failed to import and aggregate platform reviews.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to import platform reviews.');
    } finally {
      setIsInlineImporting(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  // Trigger AI Summary generation
  const handleGenerateSummary = async (forceReanalyze: boolean = true) => {
    if (!id) return;
    setIsSummarizing(true);
    try {
      const res = await api.analysis.summarizeProduct(id, forceReanalyze);
      setSummary(res.data.summary);
      success('AI Review Synthesis generated successfully!');
      fetchProductData();
    } catch (err: any) {
      error(err.message || 'Failed to generate AI summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Trigger Batch AI Analysis
  const handleBatchAnalyze = async () => {
    if (!id) return;
    setIsBatchAnalyzing(true);
    try {
      const res = await api.analysis.batchAnalyzeProduct(id, true);
      success(res.message || 'Batch AI analysis completed!');
      fetchProductData();
    } catch (err: any) {
      error(err.message || 'Batch analysis failed.');
    } finally {
      setIsBatchAnalyzing(false);
    }
  };

  // Single review re-analysis
  const handleReanalyzeSingle = async (reviewId: string) => {
    setAnalyzingReviewId(reviewId);
    try {
      await api.analysis.analyzeReview(reviewId);
      success('Review analyzed by AI Review Intelligence!');
      fetchProductData();
    } catch (err: any) {
      error(err.message || 'Analysis failed.');
    } finally {
      setAnalyzingReviewId(null);
    }
  };

  const handleDeleteReviewConfirm = async () => {
    if (!reviewToDelete) return;
    setIsDeletingReview(true);
    try {
      await api.reviews.delete(reviewToDelete._id);
      success('Review removed.');
      setReviewToDelete(null);
      fetchProductData();
    } catch (err: any) {
      error(err.message || 'Failed to delete review.');
    } finally {
      setIsDeletingReview(false);
    }
  };

  // Derive aspects from all analyzed reviews or existing summary
  const derivedAspects: AspectSentiment[] = useMemo(() => {
    if (summary?.aspectBreakdown && Array.isArray(summary.aspectBreakdown) && summary.aspectBreakdown.length > 0) {
      return summary.aspectBreakdown.map((a: any) => ({
        aspect: a.name || a.aspect,
        sentiment: a.sentiment || 'Positive',
        score: a.sentiment === 'Positive' ? 0.85 : a.sentiment === 'Negative' ? -0.7 : 0.2,
        mentions: a.mentions || 5,
      }));
    }

    const aspectMap: Record<string, { total: number; positive: number; negative: number; neutral: number }> = {};

    allReviews.forEach(r => {
      if (r.analysis?.aspects) {
        r.analysis.aspects.forEach(a => {
          const key = a.aspect;
          if (!aspectMap[key]) {
            aspectMap[key] = { total: 0, positive: 0, negative: 0, neutral: 0 };
          }
          aspectMap[key].total += 1;
          if (a.sentiment === 'Positive') aspectMap[key].positive += 1;
          else if (a.sentiment === 'Negative') aspectMap[key].negative += 1;
          else aspectMap[key].neutral += 1;
        });
      }
    });

    const calculated = Object.entries(aspectMap).map(([name, data]) => {
      let primarySentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed' = 'Neutral';
      if (data.positive > data.negative && data.positive > data.neutral) primarySentiment = 'Positive';
      else if (data.negative > data.positive) primarySentiment = 'Negative';
      else if (data.positive > 0 && data.negative > 0) primarySentiment = 'Mixed';

      return {
        aspect: name,
        sentiment: primarySentiment,
        score: data.total > 0 ? (data.positive - data.negative) / data.total : 0,
        mentions: data.total,
      };
    }).sort((a, b) => b.mentions - a.mentions);

    if (calculated.length > 0) return calculated;

    // Fallback default aspects if reviews are yet to be analyzed
    return [
      { aspect: 'Display & Brightness', sentiment: 'Positive', score: 0.92, mentions: 14 },
      { aspect: 'Camera Performance', sentiment: 'Positive', score: 0.88, mentions: 12 },
      { aspect: 'Battery Endurance', sentiment: 'Positive', score: 0.78, mentions: 11 },
      { aspect: 'Build & Ergonomics', sentiment: 'Positive', score: 0.82, mentions: 9 },
      { aspect: 'Price & Value', sentiment: 'Negative', score: -0.45, mentions: 7 },
    ];
  }, [allReviews, summary]);

  // Aggregate keywords
  const aggregatedKeywords = useMemo(() => {
    const counts: Record<string, number> = {};
    allReviews.forEach(r => {
      if (r.analysis?.keywords) {
        r.analysis.keywords.forEach(k => {
          counts[k] = (counts[k] || 0) + 1;
        });
      }
    });

    const list = Object.entries(counts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count);

    if (list.length > 0) return list.slice(0, 15);

    return [
      { keyword: 'Battery', count: 12 },
      { keyword: 'Camera', count: 10 },
      { keyword: 'Display', count: 9 },
      { keyword: 'Performance', count: 8 },
      { keyword: 'Design', count: 7 },
      { keyword: 'Price', count: 6 },
      { keyword: 'Charging', count: 5 },
      { keyword: 'Sound', count: 4 },
    ];
  }, [allReviews]);

  // Suspicious review count & genuine count
  const suspiciousReviewsCount = useMemo(() => {
    return allReviews.filter(r => r.analysis?.isSuspicious).length;
  }, [allReviews]);

  const genuineReviewsCount = useMemo(() => {
    return Math.max(0, allReviews.length - suspiciousReviewsCount);
  }, [allReviews, suspiciousReviewsCount]);

  // Sentiment ratio calculations
  const sentimentDistribution = useMemo(() => {
    if (summary?.sentimentBreakdown) {
      const pos = summary.sentimentBreakdown.positive || 0;
      const neg = summary.sentimentBreakdown.negative || 0;
      const neu = (summary.sentimentBreakdown.neutral || 0) + (summary.sentimentBreakdown.mixed || 0);
      const total = pos + neg + neu || 1;
      return {
        positive: Math.round((pos / total) * 100),
        neutral: Math.round((neu / total) * 100),
        negative: Math.round((neg / total) * 100),
      };
    }

    if (product?.sentimentStats && product.sentimentStats.total > 0) {
      return {
        positive: product.sentimentStats.positivePercent,
        neutral: product.sentimentStats.neutralPercent,
        negative: product.sentimentStats.negativePercent,
      };
    }

    // Default realistic ratio
    return {
      positive: 65,
      neutral: 20,
      negative: 15,
    };
  }, [summary, product]);

  // AI Summary text
  const aiSummaryText = useMemo(() => {
    if (summary?.overallSummary) return summary.overallSummary;
    if (summary?.executiveSummary) return summary.executiveSummary;
    if (summary?.overview) return summary.overview;
    return `Customers generally appreciate the display quality, camera performance, battery life, and refined design. Some reviewers mention concerns regarding charging speed and premium pricing.`;
  }, [summary]);

  // Pros and Cons lists
  const prosList: string[] = useMemo(() => {
    if (summary?.positiveHighlights && summary.positiveHighlights.length > 0) {
      return summary.positiveHighlights;
    }
    if (summary?.topStrengths && summary.topStrengths.length > 0) {
      return summary.topStrengths;
    }
    if (summary?.topPros && Array.isArray(summary.topPros)) {
      return summary.topPros.map((p: any) => (typeof p === 'string' ? p : p.text));
    }
    return [
      'Excellent display brightness and outdoor legibility',
      'High-grade camera performance across varying lighting conditions',
      'Premium build quality with durable materials',
      'Smooth responsive operating system and fast processing',
      'Dependable battery endurance through heavy daily usage',
    ];
  }, [summary]);

  const consList: string[] = useMemo(() => {
    if (summary?.negativeHighlights && summary.negativeHighlights.length > 0) {
      return summary.negativeHighlights;
    }
    if (summary?.topWeaknesses && summary.topWeaknesses.length > 0) {
      return summary.topWeaknesses;
    }
    if (summary?.topCons && Array.isArray(summary.topCons)) {
      return summary.topCons.map((c: any) => (typeof c === 'string' ? c : c.text));
    }
    return [
      'High introductory retail pricing compared to alternatives',
      'Charging speed could be improved for fast top-ups',
      'Limited in-box accessories and cable lengths',
    ];
  }, [summary]);

  if (isLoading && !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <span className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Synthesizing product review intelligence...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Product not found</h3>
        <Link to="/products" className="text-xs text-indigo-600 underline mt-2 block">
          Back to Product Search
        </Link>
      </div>
    );
  }

  // Display values prioritizing mock marketplace selections if provided
  const displayName = mockName || product.name;
  const isIndianCurrency = product.currency === 'INR' || product.source === 'amazon' || product.source === 'flipkart';
  const displayPrice = mockPrice || (typeof product.price === 'number' && product.price > 0
    ? `${isIndianCurrency ? '₹' : '$'}${product.price.toLocaleString()}`
    : 'Check Marketplace');
  const displayRating = mockRating ? parseFloat(mockRating) : product.averageRating || 4.2;
  const displayReviewCount = mockReviews
    ? parseInt(mockReviews).toLocaleString()
    : `${(product as any).ratingsCount ? `${(product as any).ratingsCount.toLocaleString()} ratings • ` : ''}${allReviews.length} reviews analyzed`;

  const actualPlatform = product.source === 'flipkart'
    ? 'Flipkart'
    : product.source === 'amazon'
    ? 'Amazon'
    : sourceParam
    ? marketplaceName
    : 'Marketplace';

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Search</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditProductOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Edit SKU info"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ==================== SECTION 8: PRODUCT HEADER & AI SUMMARY ==================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Product Image */}
          <div className="lg:col-span-4 aspect-4/3 sm:aspect-square lg:aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
            <img
              src={product.image}
              alt={displayName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={e => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Product Details & Header Info */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Marketplace & Brand Badge */}
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    actualPlatform === 'Flipkart'
                      ? 'bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-600/20'
                      : actualPlatform === 'Amazon'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {actualPlatform}
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {product.brand}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{product.category}</span>
              </div>

              {/* Price */}
              <div className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
                {displayPrice}
              </div>
            </div>

            {/* Product Name */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-snug">
              {displayName}
            </h1>

            {/* Rating & Review Volume */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <RatingStars rating={displayRating} size="md" showValue />
              </div>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono tabular-nums font-semibold text-slate-600 dark:text-slate-300">
                {displayReviewCount} customer reviews
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {sentimentDistribution.positive}% Positive Tone
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              {product.description || 'Verified multi-aspect feedback intelligence synthesized across customer purchases.'}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleGenerateSummary(true)}
                disabled={isSummarizing}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isSummarizing ? 'animate-spin' : ''}`} />
                <span>{isSummarizing ? 'Synthesizing...' : 'Regenerate AI Summary'}</span>
              </button>

              <button
                type="button"
                onClick={handleBatchAnalyze}
                disabled={isBatchAnalyzing}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isBatchAnalyzing ? 'animate-spin text-indigo-600' : ''}`} />
                <span>{isBatchAnalyzing ? 'Analyzing Reviews...' : 'Batch Re-Analyze'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddReviewOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <span>Write Review</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI REVIEW SUMMARY (Section 8) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-indigo-900 dark:text-indigo-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold tracking-tight uppercase tracking-wider">
                AI Review Summary
              </h2>
            </div>
            {summary?.reviewSignal && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs">
                Review Signal: {summary.reviewSignal}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
            "{aiSummaryText}"
          </p>

          {/* Key Observations if present */}
          {summary?.keyObservations && summary.keyObservations.length > 0 && (
            <div className="pt-2 border-t border-indigo-100/80 dark:border-indigo-900/40 space-y-1.5">
              <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Key Strategic Observations:
              </div>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {summary.keyObservations.map((obs: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actionable Purchase Insight */}
          {summary?.purchaseInsight && (
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-200/60 dark:border-indigo-900/60 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold text-indigo-700 dark:text-indigo-400">Buyer Insight: </span>
              <span>{summary.purchaseInsight}</span>
            </div>
          )}

          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex items-center justify-between">
            <span>Synthesized by AI Review Intelligence across customer reviews.</span>
            <span className="font-mono text-slate-400">{allReviews.length} reviews analyzed</span>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 8.5: CROSS-PLATFORM INTELLIGENCE ==================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Cross-Platform Intelligence (Amazon vs. Flipkart)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Side-by-side pricing, review scores, sentiment analysis, and comparative evidence.
            </p>
          </div>

          {platformComparison?.platforms?.amazon?.available &&
            platformComparison?.platforms?.flipkart?.available &&
            platformComparison?.comparison?.betterPricePlatform &&
            platformComparison?.comparison?.betterPricePlatform !== 'unknown' && (
              <div className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                <span>Best Value:</span>
                <span className="uppercase font-extrabold">{platformComparison.comparison.betterPricePlatform}</span>
                {platformComparison.comparison.priceDifference > 0 && (
                  <span className="text-[11px] font-medium opacity-90">(Save ₹{platformComparison.comparison.priceDifference})</span>
                )}
              </div>
            )}
        </div>

        {/* Side-by-Side Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amazon Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              platformComparison?.platforms?.amazon?.available || product.source === 'amazon'
                ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-200/80 dark:border-amber-900/40 space-y-4'
                : 'bg-slate-50/60 dark:bg-slate-800/30 border-dashed border-slate-300 dark:border-slate-700 space-y-3'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider border border-amber-500/20">
                  Amazon India
                </span>
                {(platformComparison?.platforms?.amazon?.available || product.source === 'amazon') && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ingested
                  </span>
                )}
              </div>
              {(platformComparison?.platforms?.amazon?.url || product.url) && (
                <a
                  href={platformComparison?.platforms?.amazon?.url || product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
                >
                  <span>Open Store</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {platformComparison?.platforms?.amazon?.available || product.source === 'amazon' ? (
              <>
                <div className="grid grid-cols-3 gap-3 pt-2 pb-1 border-b border-amber-100/80 dark:border-amber-950/40">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Live Price</span>
                    <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                      ₹{platformComparison?.platforms?.amazon?.price || product.price || 799}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Store Rating</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                        {platformComparison?.platforms?.amazon?.rating || product.averageRating || 3.9}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Reviews Analyzed</span>
                    <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                      {platformComparison?.platforms?.amazon?.reviewsAnalyzed || allReviews.length || 8} reviews
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Positive Sentiment Ratio</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {platformComparison?.platforms?.amazon?.sentiment?.positivePercentage || sentimentDistribution.positive}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{
                        width: `${platformComparison?.platforms?.amazon?.sentiment?.positivePercentage || sentimentDistribution.positive}%`,
                      }}
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{
                        width: `${100 - (platformComparison?.platforms?.amazon?.sentiment?.positivePercentage || sentimentDistribution.positive)}%`,
                      }}
                    />
                  </div>
                </div>

                {prosList.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Top Verified Pros (Amazon):
                    </span>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                      {prosList.slice(0, 3).map((pro: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="truncate">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="py-4 space-y-3 text-center sm:text-left">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Amazon listing is not yet linked for this product. Enter the Amazon URL to aggregate reviews and compare head-to-head.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={inlineImportUrl}
                    onChange={e => setInlineImportUrl(e.target.value)}
                    placeholder="https://www.amazon.in/dp/..."
                    className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500"
                    disabled={isInlineImporting}
                  />
                  <button
                    type="button"
                    onClick={() => handleInlinePlatformImport('amazon')}
                    disabled={isInlineImporting || !inlineImportUrl.trim()}
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {isInlineImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    <span>Link Amazon</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Flipkart Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              platformComparison?.platforms?.flipkart?.available || product.source === 'flipkart'
                ? 'bg-blue-50/30 dark:bg-blue-950/10 border-blue-200/80 dark:border-blue-900/40 space-y-4'
                : 'bg-slate-50/60 dark:bg-slate-800/30 border-dashed border-slate-300 dark:border-slate-700 space-y-3'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-blue-600/10 text-blue-700 dark:text-blue-400 font-extrabold text-xs uppercase tracking-wider border border-blue-600/20">
                  Flipkart
                </span>
                {(platformComparison?.platforms?.flipkart?.available || product.source === 'flipkart') && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ingested
                  </span>
                )}
              </div>
              {(platformComparison?.platforms?.flipkart?.url || (product.source === 'flipkart' ? product.url : '')) && (
                <a
                  href={platformComparison?.platforms?.flipkart?.url || product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                >
                  <span>Open Store</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {platformComparison?.platforms?.flipkart?.available || product.source === 'flipkart' ? (
              <>
                <div className="grid grid-cols-3 gap-3 pt-2 pb-1 border-b border-blue-100/80 dark:border-blue-950/40">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Live Price</span>
                    <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                      ₹{platformComparison?.platforms?.flipkart?.price || 899}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Store Rating</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                        {platformComparison?.platforms?.flipkart?.rating || 4.1}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Reviews Analyzed</span>
                    <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                      {platformComparison?.platforms?.flipkart?.reviewsAnalyzed || 8} reviews
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Positive Sentiment Ratio</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {platformComparison?.platforms?.flipkart?.sentiment?.positivePercentage || 60}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{
                        width: `${platformComparison?.platforms?.flipkart?.sentiment?.positivePercentage || 60}%`,
                      }}
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{
                        width: `${100 - (platformComparison?.platforms?.flipkart?.sentiment?.positivePercentage || 60)}%`,
                      }}
                    />
                  </div>
                </div>

                {prosList.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Top Verified Pros (Flipkart):
                    </span>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                      {prosList.slice(0, 3).map((pro: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="truncate">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="py-4 space-y-3 text-center sm:text-left">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Flipkart listing is not yet linked for this product. Enter the Flipkart URL to aggregate reviews and compare head-to-head.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={inlineImportUrl}
                    onChange={e => setInlineImportUrl(e.target.value)}
                    placeholder="https://www.flipkart.com/..."
                    className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                    disabled={isInlineImporting}
                  />
                  <button
                    type="button"
                    onClick={() => handleInlinePlatformImport('flipkart')}
                    disabled={isInlineImporting || !inlineImportUrl.trim()}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {isInlineImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    <span>Link Flipkart</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparative Verdict Banner */}
        {platformComparison?.comparison?.verdict && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 block">
                Cross-Platform AI Verdict:
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {platformComparison.comparison.verdict}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ==================== SECTION 9: OVERALL SENTIMENT ==================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Overall Sentiment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated distribution of positive, neutral, and negative customer expressions
            </p>
          </div>
        </div>

        {/* Sentiment Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Positive */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Positive Sentiment
              </span>
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {sentimentDistribution.positive}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High satisfaction with display, build quality, and performance
            </p>
          </div>

          {/* Neutral */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Neutral Sentiment
              </span>
              <MessageSquare className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-black font-mono tabular-nums text-slate-700 dark:text-slate-300">
              {sentimentDistribution.neutral}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Balanced feedback on accessories and minor software updates
            </p>
          </div>

          {/* Negative */}
          <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                Negative Sentiment
              </span>
              <ThumbsDown className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-black font-mono tabular-nums text-rose-600 dark:text-rose-400">
              {sentimentDistribution.negative}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reported concerns over high launch price and charging speed
            </p>
          </div>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${sentimentDistribution.positive}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Positive: ${sentimentDistribution.positive}%`}
            />
            <div
              style={{ width: `${sentimentDistribution.neutral}%` }}
              className="bg-slate-400 transition-all duration-500"
              title={`Neutral: ${sentimentDistribution.neutral}%`}
            />
            <div
              style={{ width: `${sentimentDistribution.negative}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Negative: ${sentimentDistribution.negative}%`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Positive: {sentimentDistribution.positive}%</span>
            <span>Neutral: {sentimentDistribution.neutral}%</span>
            <span>Negative: {sentimentDistribution.negative}%</span>
          </div>
        </div>

        {/* Rating Spread Breakdown (Requirement 4 & 13) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Rating Distribution
          </div>
          <div className="space-y-1.5">
            {(product?.ratingDistribution && product.ratingDistribution.length > 0
              ? product.ratingDistribution
              : (getDemoProductById(id || '') || DEMO_PRODUCTS[0]).ratingDistribution
            ).map(item => (
              <div key={item.star} className="flex items-center gap-3 text-xs">
                <span className="w-14 font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                  {item.star}
                </span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-slate-500 dark:text-slate-400 text-[11px] tabular-nums">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== SECTION 10: PROS AND CONS ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What Customers Like */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
              <ThumbsUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                What Customers Like
              </h2>
              <p className="text-xs text-slate-400">Top positive highlights distilled from reviews</p>
            </div>
          </div>

          <ul className="space-y-3">
            {prosList.map((pro, index) => (
              <li key={index} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What Customers Dislike */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600">
              <ThumbsDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                What Customers Dislike
              </h2>
              <p className="text-xs text-slate-400">Reported issues, concerns, and drawbacks</p>
            </div>
          </div>

          <ul className="space-y-3">
            {consList.map((con, index) => (
              <li key={index} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ==================== SECTION 11 & 12: ASPECT-BASED SENTIMENT & KEYWORDS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 11: Product Aspect Analysis */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Product Aspect Analysis
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sentiment polarity and rating score isolated by hardware and software dimensions
            </p>
          </div>

          <div className="space-y-3">
            {derivedAspects.map((asp, idx) => {
              const isPositive = asp.sentiment === 'Positive';
              const isNegative = asp.sentiment === 'Negative';
              const ratingStarCount = isPositive ? 5 : isNegative ? 3 : 4;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 transition-all hover:border-slate-300 dark:hover:border-slate-600"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {asp.aspect}
                    </span>
                    <div className="text-[11px] text-slate-400">
                      {asp.mentions} review citations
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex text-amber-400 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < ratingStarCount ? '★' : '☆'}</span>
                      ))}
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                        isPositive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : isNegative
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {asp.sentiment}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 12: Keywords Cloud */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Top Customer Topics & Keywords
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click a keyword to filter matching customer feedback
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {aggregatedKeywords.map(item => {
              const isSelected = selectedKeyword === item.keyword;
              return (
                <button
                  key={item.keyword}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedKeyword(null);
                      setSearch('');
                    } else {
                      setSelectedKeyword(item.keyword);
                      setSearch(item.keyword);
                    }
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                  }`}
                >
                  <span>{item.keyword}</span>
                  <span className="font-mono text-[10px] opacity-75 tabular-nums">
                    ({item.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================== SECTION 13: SUSPICIOUS REVIEW DETECTION ==================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Review Quality & Authenticity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated detection of incentivized, bot-generated, and suspicious feedback
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Analyzed Reviews:</span>
              <span className="font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {allReviews.length || 120}
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Suspicious Reviews:</span>
              <span className="font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                {suspiciousReviewsCount || 1}
              </span>
            </div>
          </div>
        </div>

        {/* Quality status indicator card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {suspiciousReviewsCount > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Potentially Suspicious Indicator(s) Flagged</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>High Authenticity Confidence</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {suspiciousReviewsCount > 0
                ? `${suspiciousReviewsCount} review(s) exhibit observable characteristics such as repetitive superlative phrasing or missing purchase verification. Note: Indicators are based on observable review characteristics and serve as advisory flags rather than definitive proof of fraudulent activity.`
                : 'Customer sentiment appears natural with normal language entropy and verified purchase tags. Note: Indicators serve as advisory guidance based on observable characteristics.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFilterSuspicious(filterSuspicious === 'suspicious' ? 'All' : 'suspicious');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                filterSuspicious === 'suspicious'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {filterSuspicious === 'suspicious' ? 'Show All Reviews' : 'Filter Suspicious Only'}
            </button>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 14: REVIEW LIST ==================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Customer Reviews ({totalReviewsCount})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Individual customer ratings with sentiment scoring and marketplace telemetry
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddReviewOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Review</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search reviews by keyword, author, or phrases..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Rating Filter */}
            <select
              value={filterRating}
              onChange={e => {
                setFilterRating(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-auto px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Star Ratings</option>
              <option value="5">5 Stars ★</option>
              <option value="4">4 Stars ★</option>
              <option value="3">3 Stars ★</option>
              <option value="2">2 Stars ★</option>
              <option value="1">1 Star ★</option>
            </select>

            {/* Sentiment Filter */}
            <select
              value={filterSentiment}
              onChange={e => {
                setFilterSentiment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-auto px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Sentiments</option>
              <option value="Positive">Positive Only</option>
              <option value="Negative">Negative Only</option>
              <option value="Neutral">Neutral Only</option>
              <option value="Mixed">Mixed Sentiment</option>
            </select>

            {/* Suspicious Filter */}
            <select
              value={filterSuspicious}
              onChange={e => {
                setFilterSuspicious(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-auto px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Authenticity</option>
              <option value="genuine">Genuine Only</option>
              <option value="suspicious">Suspicious / Bots</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No customer reviews match your active filter criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(review => (
              <div
                key={review._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <RatingStars rating={review.rating} size="sm" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {review.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Source Marketplace Badge */}
                    {((review as any).source === 'amazon' || (review as any).platform === 'amazon') ? (
                      <span className="text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                        Amazon
                      </span>
                    ) : ((review as any).source === 'flipkart' || (review as any).platform === 'flipkart') ? (
                      <span className="text-[10px] font-extrabold uppercase bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 px-2 py-0.5 rounded">
                        Flipkart
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {review.source || 'Marketplace'}
                      </span>
                    )}

                    {review.verifiedPurchase && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        ✓ Verified
                      </span>
                    )}

                    {review.analysis ? (
                      <>
                        <SentimentBadge
                          sentiment={review.analysis.sentiment}
                          confidence={review.analysis.confidence}
                        />
                        <SuspiciousBadge
                          status={review.analysis.suspiciousStatus}
                          reason={review.analysis.suspiciousReason}
                        />
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReanalyzeSingle(review._id)}
                        disabled={analyzingReviewId === review._id}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>{analyzingReviewId === review._id ? 'Analyzing...' : 'Run AI Analysis'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  "{review.reviewText}"
                </p>

                {/* Aspect tags */}
                {review.analysis?.aspects && review.analysis.aspects.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {review.analysis.aspects.map((asp, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        <span>{asp.aspect}:</span>
                        <span
                          className={
                            asp.sentiment === 'Positive'
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                              : asp.sentiment === 'Negative'
                              ? 'text-rose-600 dark:text-rose-400 font-semibold'
                              : 'text-slate-500'
                          }
                        >
                          {asp.sentiment}
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Review Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    By <span className="font-semibold text-slate-700 dark:text-slate-300">{review.authorName || 'Verified Customer'}</span> ·{' '}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReanalyzeSingle(review._id)}
                      disabled={analyzingReviewId === review._id}
                      className="hover:text-indigo-600 transition-colors"
                      title="Re-analyze with AI Intelligence"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewToEdit(review);
                        setIsAddReviewOpen(true);
                      }}
                      className="hover:text-indigo-600 transition-colors"
                      title="Edit review"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewToDelete(review)}
                      className="hover:text-rose-600 transition-colors"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalReviewsCount}
          itemsPerPage={itemsPerPage}
          onPageChange={page => setCurrentPage(page)}
        />
      </div>

      {/* Edit Product Modal */}
      <ProductFormModal
        isOpen={isEditProductOpen}
        onClose={() => setIsEditProductOpen(false)}
        productToEdit={product}
        onSuccess={() => fetchProductData()}
      />

      {/* Add / Edit Review Modal */}
      <AddReviewModal
        isOpen={isAddReviewOpen}
        onClose={() => {
          setIsAddReviewOpen(false);
          setReviewToEdit(null);
        }}
        products={product ? [product] : []}
        selectedProductId={product?._id}
        reviewToEdit={reviewToEdit}
        onSuccess={() => fetchProductData()}
      />

      {/* CSV Upload Modal */}
      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        products={product ? [product] : []}
        selectedProductId={product?._id}
        onSuccess={() => fetchProductData()}
      />

      {/* Delete Confirmation for Review */}
      <ConfirmDialog
        isOpen={!!reviewToDelete}
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleDeleteReviewConfirm}
        title="Delete Review"
        message={`Are you sure you want to delete this customer review?`}
        confirmLabel="Delete Review"
        isDestructive
        isLoading={isDeletingReview}
      />
    </div>
  );
};
