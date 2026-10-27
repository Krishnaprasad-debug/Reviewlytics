import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquareText,
  Search,
  Filter,
  PlusCircle,
  UploadCloud,
  Sparkles,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { RatingStars } from '../components/common/RatingStars.js';
import { SentimentBadge } from '../components/common/SentimentBadge.js';
import { SuspiciousBadge } from '../components/common/SuspiciousBadge.js';
import { Pagination } from '../components/common/Pagination.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.js';
import { AddReviewModal } from '../components/modals/AddReviewModal.js';
import { CsvUploadModal } from '../components/modals/CsvUploadModal.js';
import { Product, Review } from '../types/index.js';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { getDemoReviews, DEMO_PRODUCTS } from '../data/demoData.js';

export const ReviewsPage: React.FC = () => {
  const { toast, success, error } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('All');
  const [filterRating, setFilterRating] = useState<string>('All');
  const [filterSentiment, setFilterSentiment] = useState<string>('All');
  const [filterSuspicious, setFilterSuspicious] = useState<string>('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);

  // AI loading states
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const [revRes, prodRes] = await Promise.all([
        api.reviews.getAll({
          search: search.trim() || undefined,
          productId: selectedProduct !== 'All' ? selectedProduct : undefined,
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
        api.products.getAll({ limit: 100 }),
      ]);

      if (revRes.success && revRes.data && revRes.data.reviews && revRes.data.reviews.length > 0) {
        setReviews(revRes.data.reviews);
        setTotalPages(revRes.data.pagination.totalPages);
        setTotalItems(revRes.data.pagination.total);
      } else {
        const demoFiltered = getDemoReviews({
          productId: selectedProduct !== 'All' ? selectedProduct : undefined,
          rating: filterRating !== 'All' ? parseInt(filterRating) : undefined,
          sentiment: filterSentiment !== 'All' ? filterSentiment : undefined,
          isSuspicious:
            filterSuspicious === 'suspicious'
              ? true
              : filterSuspicious === 'genuine'
              ? false
              : undefined,
          search: search.trim() || undefined,
        });
        setReviews(demoFiltered);
        setTotalPages(Math.max(1, Math.ceil(demoFiltered.length / itemsPerPage)));
        setTotalItems(demoFiltered.length);
      }

      if (prodRes.success && prodRes.data && prodRes.data.products && prodRes.data.products.length > 0) {
        setProducts(prodRes.data.products);
      } else {
        setProducts(DEMO_PRODUCTS);
      }
    } catch {
      // Demo fallback
      const demoFiltered = getDemoReviews({
        productId: selectedProduct !== 'All' ? selectedProduct : undefined,
        rating: filterRating !== 'All' ? parseInt(filterRating) : undefined,
        sentiment: filterSentiment !== 'All' ? filterSentiment : undefined,
        isSuspicious:
          filterSuspicious === 'suspicious'
            ? true
            : filterSuspicious === 'genuine'
            ? false
            : undefined,
        search: search.trim() || undefined,
      });
      setReviews(demoFiltered);
      setTotalPages(Math.max(1, Math.ceil(demoFiltered.length / itemsPerPage)));
      setTotalItems(demoFiltered.length);
      setProducts(DEMO_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  }, [
    search,
    selectedProduct,
    filterRating,
    filterSentiment,
    filterSuspicious,
    sortBy,
    order,
    currentPage,
  ]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSingleAnalyze = async (id: string) => {
    setAnalyzingId(id);
    try {
      await api.analysis.analyzeReview(id);
      success('Review analyzed by AI Review Intelligence!');
      fetchReviews();
    } catch (err: any) {
      error(err.message || 'Analysis failed.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      await api.reviews.delete(reviewToDelete._id);
      success('Review deleted.');
      setReviewToDelete(null);
      fetchReviews();
    } catch (err: any) {
      error(err.message || 'Failed to delete review.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Customer Reviews Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search, filter, and inspect AI-extracted sentiment, aspects, and bot flags across your entire catalog.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCsvModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setReviewToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Write Review</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search feedback text, headline, or reviewer name..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Product Selector */}
            <select
              value={selectedProduct}
              onChange={e => {
                setSelectedProduct(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 max-w-[160px] truncate"
            >
              <option value="All">All Products</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Sentiment Selector */}
            <select
              value={filterSentiment}
              onChange={e => {
                setFilterSentiment(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
              <option value="Neutral">Neutral</option>
              <option value="Mixed">Mixed</option>
            </select>

            {/* Rating Selector */}
            <select
              value={filterRating}
              onChange={e => {
                setFilterRating(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Stars</option>
              <option value="5">5 Stars ★</option>
              <option value="4">4 Stars ★</option>
              <option value="3">3 Stars ★</option>
              <option value="2">2 Stars ★</option>
              <option value="1">1 Star ★</option>
            </select>

            {/* Suspicious Selector */}
            <select
              value={filterSuspicious}
              onChange={e => {
                setFilterSuspicious(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Authenticity</option>
              <option value="genuine">Genuine Feedback</option>
              <option value="suspicious">Flagged Bots/Spam</option>
            </select>

            {/* Sort Selector */}
            <select
              value={`${sortBy}-${order}`}
              onChange={e => {
                const [s, o] = e.target.value.split('-');
                setSortBy(s);
                setOrder(o as any);
              }}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Content */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No reviews match your filters"
          description="Adjust your search query or submit a customer review to analyze."
          actionLabel="Add Customer Review"
          onAction={() => {
            setReviewToEdit(null);
            setIsAddModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div
              key={review._id}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <RatingStars rating={review.rating} size="sm" />
                  {((review as any).source === 'amazon' || (review as any).platform === 'amazon') && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Amazon
                    </span>
                  )}
                  {((review as any).source === 'flipkart' || (review as any).platform === 'flipkart') && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20">
                      Flipkart
                    </span>
                  )}
                  {review.title && (
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {review.title}
                    </span>
                  )}
                  {review.verifiedPurchase && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      ✓ Verified
                    </span>
                  )}
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <Link
                    to={`/products/${review.productId}`}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>{review.productName || 'View Product'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="flex items-center gap-2">
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
                      onClick={() => handleSingleAnalyze(review._id)}
                      disabled={analyzingId === review._id}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>{analyzingId === review._id ? 'Analyzing...' : 'Run AI Analysis'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Review Text */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                "{review.reviewText}"
              </p>

              {/* Aspects breakdown tags */}
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

              {/* Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div>
                  By <span className="font-semibold text-slate-700 dark:text-slate-300">{review.authorName || 'Verified Customer'}</span> •{' '}
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSingleAnalyze(review._id)}
                    disabled={analyzingId === review._id}
                    className="hover:text-cyan-600 transition-colors p-1"
                    title="Re-analyze with AI Intelligence"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewToEdit(review);
                      setIsAddModalOpen(true);
                    }}
                    className="hover:text-cyan-600 transition-colors p-1"
                    title="Edit review"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewToDelete(review)}
                    className="hover:text-rose-600 transition-colors p-1"
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
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={page => setCurrentPage(page)}
      />

      {/* Modals */}
      <AddReviewModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setReviewToEdit(null);
        }}
        products={products}
        reviewToEdit={reviewToEdit}
        onSuccess={() => fetchReviews()}
      />

      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        products={products}
        onSuccess={() => fetchReviews()}
      />

      <ConfirmDialog
        isOpen={!!reviewToDelete}
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Review"
        message="Are you sure you want to permanently delete this customer review?"
        confirmLabel="Delete Review"
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
};
