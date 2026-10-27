import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  Sparkles,
  PlusCircle,
  X,
  Star,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { RatingStars } from '../components/common/RatingStars.js';
import { Product } from '../types/index.js';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { DEMO_PRODUCTS, getDemoComparison } from '../data/demoData.js';

export const ComparePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast, success, error } = useToast();

  const [allProducts, setAllProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(['prod-macbook-pro-16', 'prod-galaxy-s24-ultra']);
  const [comparisonData, setComparisonData] = useState<any | null>(getDemoComparison(['prod-macbook-pro-16', 'prod-galaxy-s24-ultra']));
  const [isComparing, setIsComparing] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Initialize selected IDs from URL query params if present
  useEffect(() => {
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean);
      setSelectedProductIds(ids);
    }
  }, [searchParams]);

  // Load all products for selector
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.products.getAll({ limit: 100 });
        if (res.success && res.data && res.data.products && res.data.products.length > 0) {
          setAllProducts(res.data.products);
          if (selectedProductIds.length === 0 && res.data.products.length >= 2) {
            setSelectedProductIds([res.data.products[0]._id, res.data.products[1]._id]);
          }
        } else {
          setAllProducts(DEMO_PRODUCTS);
          if (selectedProductIds.length === 0) {
            setSelectedProductIds([DEMO_PRODUCTS[0]._id, DEMO_PRODUCTS[1]._id]);
          }
        }
      } catch {
        setAllProducts(DEMO_PRODUCTS);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  const runComparison = useCallback(async (idsToCompare: string[]) => {
    if (idsToCompare.length < 2) {
      setComparisonData(null);
      return;
    }
    setIsComparing(true);
    try {
      const res = await api.analytics.compareProducts(idsToCompare);
      if (res.success && res.data && res.data.products && res.data.products.length > 0) {
        setComparisonData(res.data);
      } else {
        setComparisonData(getDemoComparison(idsToCompare));
      }
    } catch {
      setComparisonData(getDemoComparison(idsToCompare));
    } finally {
      setIsComparing(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProductIds.length >= 2) {
      runComparison(selectedProductIds);
    }
  }, [selectedProductIds, runComparison]);

  const handleAddProduct = (productId: string) => {
    if (!productId || selectedProductIds.includes(productId)) return;
    if (selectedProductIds.length >= 4) {
      toast('Maximum 4 products can be compared at once.', 'warning');
      return;
    }
    const updated = [...selectedProductIds, productId];
    setSelectedProductIds(updated);
    setSearchParams({ ids: updated.join(',') });
  };

  const handleRemoveProduct = (productId: string) => {
    const updated = selectedProductIds.filter(id => id !== productId);
    setSelectedProductIds(updated);
    setSearchParams({ ids: updated.join(',') });
  };

  const selectedProducts = allProducts.filter(p => selectedProductIds.includes(p._id));
  const availableToAdd = allProducts.filter(p => !selectedProductIds.includes(p._id));

  return (
    <div className="space-y-6">
      {/* Header & Product Selector */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                AI Head-to-Head Comparison Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select 2 to 4 products to synthesize customer sentiment and find the ideal choice with AI Review Intelligence.
            </p>
          </div>

          {availableToAdd.length > 0 && selectedProductIds.length < 4 && (
            <div className="flex items-center gap-2">
              <select
                onChange={e => {
                  handleAddProduct(e.target.value);
                  e.target.value = '';
                }}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                defaultValue=""
              >
                <option value="" disabled>
                  + Add Product to Compare...
                </option>
                {availableToAdd.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.brand})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Selected Product Badges */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          {selectedProducts.map(p => (
            <div
              key={p._id}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2 shadow-xs"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-5 h-5 rounded-md object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="truncate max-w-[150px]">{p.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveProduct(p._id)}
                className="text-indigo-400 hover:text-rose-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {selectedProducts.length < 2 && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Select at least 2 products to generate head-to-head AI comparison.</span>
            </span>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isComparing && (
        <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
          <span className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Synthesizing cross-product review intelligence...
          </p>
        </div>
      )}

      {/* Comparison Grid & AI Insights */}
      {comparisonData && !isComparing && (
        <div className="space-y-6">
          {/* Comparative AI Synthesis Card */}
          {comparisonData.aiComparison && (
            <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm space-y-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-400/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      Comparative AI Verdict
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cross-referenced customer sentiments, trade-offs, and value analysis
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-400/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>AI Synthesized</span>
                </div>
              </div>

              {/* Overview */}
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">Executive Summary:</span>
                {comparisonData.aiComparison.overallComparison ||
                  comparisonData.aiComparison.summary}
              </div>

              {/* Recommendation and Winner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                    Recommended Pick
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {comparisonData.aiComparison.recommendation}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                    Value & Buyer Archetypes
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {comparisonData.aiComparison.valueAnalysis ||
                      'Tailored for power users vs budget-conscious professionals.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Side-by-Side Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {comparisonData.products.map((item: any) => (
              <div
                key={item.productId}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Image & Price */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-slate-100 dark:border-slate-800">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-xs font-black bg-slate-900/80 text-white backdrop-blur-xs">
                      {item.currency === 'INR' ? `₹${item.price?.toLocaleString()}` : `$${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}`}
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                    {item.brand} • {item.category}
                  </span>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1 line-clamp-1">
                    {item.name}
                  </h4>

                  {/* Rating & Reviews count */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <RatingStars rating={item.avgRating || 0} size="sm" showValue />
                    <span className="text-xs text-slate-400">({item.totalReviews} reviews)</span>
                  </div>

                  {/* Sentiment Metric */}
                  <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Positive Sentiment</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {item.sentimentBreakdown?.positivePercent || 0}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{
                          width: `${item.sentimentBreakdown?.positivePercent || 0}%`,
                        }}
                      />
                      <div
                        className="bg-rose-500 h-full"
                        style={{
                          width: `${item.sentimentBreakdown?.negativePercent || 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Key Strengths mini */}
                  {item.topAspects && item.topAspects.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Key Features:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.topAspects.map((asp: any, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                          >
                            {asp.aspect}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to={`/products/${item.productId}`}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold text-center text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-1.5 mt-4"
                >
                  <span>Open Full Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
