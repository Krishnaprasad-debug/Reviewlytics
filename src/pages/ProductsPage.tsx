import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  Package,
  Layers,
  CheckCircle,
  ExternalLink,
  History,
  X,
  Filter,
  PlusCircle,
  GitCompare,
  Trash2,
  Edit2,
  UploadCloud,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { RatingStars } from '../components/common/RatingStars.js';
import {
  MOCK_MARKETPLACE_PRODUCTS,
  MockMarketplaceProduct,
  searchMockMarketplaceProducts,
} from '../data/mockMarketplaceProducts.js';
import { AnalysisLoadingModal } from '../components/modals/AnalysisLoadingModal.js';
import { ProductFormModal } from '../components/modals/ProductFormModal.js';
import { CsvUploadModal } from '../components/modals/CsvUploadModal.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.js';
import { Pagination } from '../components/common/Pagination.js';
import { Product } from '../types/index.js';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { AnalyzeProductCard } from '../components/common/AnalyzeProductCard.js';
import { DEMO_PRODUCTS } from '../data/demoData.js';

const POPULAR_SEARCHES = [
  'Samsung Galaxy S24',
  'iPhone 16',
  'Sony WH-1000XM5',
  'MacBook Pro',
  'Garmin Fenix 7',
  'Breville Barista',
];

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast, success, error } = useToast();

  // Navigation tab: 'search' (default marketplace discovery) or 'catalog' (seeded/stored products)
  const activeTab = searchParams.get('tab') === 'catalog' ? 'catalog' : 'search';

  // Search query state
  const queryParam = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(queryParam);
  const [activeQuery, setActiveQuery] = useState(queryParam);

  // Marketplace filter: 'all' | 'amazon' | 'flipkart'
  const [marketplaceFilter, setMarketplaceFilter] = useState<'all' | 'amazon' | 'flipkart'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('reviewlytics_recent_searches') || localStorage.getItem('reviewai_recent_searches');
      return saved ? JSON.parse(saved) : ['Samsung Galaxy S24', 'Sony WH-1000XM5'];
    } catch {
      return ['Samsung Galaxy S24', 'Sony WH-1000XM5'];
    }
  });

  // Analysis loading modal state
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedProductForAnalysis, setSelectedProductForAnalysis] = useState<MockMarketplaceProduct | null>(null);

  // Catalog tab state (Preserved database products for CRUD & Compare)
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogTotalPages, setCatalogTotalPages] = useState(1);
  const [catalogTotal, setCatalogTotal] = useState(DEMO_PRODUCTS.length);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync queryParam if URL changes
  useEffect(() => {
    if (queryParam !== activeQuery) {
      setActiveQuery(queryParam);
      setSearchInput(queryParam);
    }
  }, [queryParam]);

  // Load catalog products if in catalog tab
  const fetchCatalogProducts = async () => {
    setCatalogLoading(true);
    try {
      const res = await api.products.getAll({
        page: catalogPage,
        limit: 9,
      });
      if (res.success && res.data && res.data.products && res.data.products.length > 0) {
        setCatalogProducts(res.data.products);
        setCatalogTotalPages(res.data.pagination.totalPages);
        setCatalogTotal(res.data.pagination.total);
      } else {
        setCatalogProducts(DEMO_PRODUCTS);
        setCatalogTotalPages(1);
        setCatalogTotal(DEMO_PRODUCTS.length);
      }
    } catch {
      setCatalogProducts(DEMO_PRODUCTS);
      setCatalogTotalPages(1);
      setCatalogTotal(DEMO_PRODUCTS.length);
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'catalog') {
      fetchCatalogProducts();
    }
  }, [activeTab, catalogPage]);

  // Handle Search Submission
  const handlePerformSearch = (textToSearch: string) => {
    const trimmed = textToSearch.trim();
    setActiveQuery(trimmed);
    setSearchInput(trimmed);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (trimmed) next.set('q', trimmed);
      else next.delete('q');
      return next;
    });

    if (trimmed && !recentSearches.includes(trimmed)) {
      const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
      setRecentSearches(updated);
      try {
        localStorage.setItem('reviewlytics_recent_searches', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  const handleClearSearch = () => {
    setActiveQuery('');
    setSearchInput('');
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('q');
      return next;
    });
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('reviewlytics_recent_searches');
    localStorage.removeItem('reviewai_recent_searches');
  };

  // Filtered mock results
  const searchResults = useMemo(() => {
    return searchMockMarketplaceProducts(activeQuery, marketplaceFilter, selectedCategory);
  }, [activeQuery, marketplaceFilter, selectedCategory]);

  // Grouped results for the marketplace sections
  const amazonResults = useMemo(() => {
    return searchResults.filter(p => p.source === 'amazon');
  }, [searchResults]);

  const flipkartResults = useMemo(() => {
    return searchResults.filter(p => p.source === 'flipkart');
  }, [searchResults]);

  // Trigger Analyze Reviews
  const handleAnalyzeReviews = (product: MockMarketplaceProduct) => {
    setSelectedProductForAnalysis(product);
    setIsAnalysisModalOpen(true);
  };

  // On Analysis Modal Complete
  const handleAnalysisComplete = (product: MockMarketplaceProduct) => {
    setIsAnalysisModalOpen(false);
    // Navigate to the seeded product details page with marketplace context
    navigate(
      `/products/${product.targetSeededProductId}?source=${product.source}&mockName=${encodeURIComponent(
        product.name
      )}&mockPrice=${encodeURIComponent(product.formattedPrice)}&mockReviews=${product.reviewCount}&mockRating=${product.rating}`
    );
  };

  // Compare handlers
  const toggleCompareSelect = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(prev => prev.filter(x => x !== id));
    } else {
      if (selectedForCompare.length >= 4) {
        toast('You can compare a maximum of 4 products at once.', 'warning');
        return;
      }
      setSelectedForCompare(prev => [...prev, id]);
    }
  };

  const handleLaunchCompare = () => {
    if (selectedForCompare.length < 2) {
      toast('Select at least 2 products to compare.', 'info');
      return;
    }
    navigate(`/compare?ids=${selectedForCompare.join(',')}`);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await api.products.delete(productToDelete._id);
      success(`Product "${productToDelete.name}" deleted.`);
      setProductToDelete(null);
      fetchCatalogProducts();
    } catch (err: any) {
      error(err.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Workflow Bar & Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Product Intelligence & Discovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Search multi-marketplace products and extract synthesized review intelligence
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                next.delete('tab');
                return next;
              });
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'search'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Search Marketplace
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                next.set('tab', 'catalog');
                return next;
              });
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'catalog'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Analyzed Products ({catalogTotal || 5})
          </button>
        </div>
      </div>

      {activeTab === 'search' ? (
        /* ======================== PRIMARY SEARCH WORKFLOW ======================== */
        <div className="space-y-8">
          {/* Real Marketplace URL Analysis Ingestion */}
          <AnalyzeProductCard />

          {/* Main Search Hero Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-indigo-50/40 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Marketplace AI Intelligence</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Search for a product
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Discover product ratings, verified customer feedback, and launch instant AI sentiment breakdowns across Amazon and Flipkart.
              </p>
            </div>

            {/* Prominent Search Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handlePerformSearch(searchInput);
              }}
              className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-3xl"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search for a product (e.g. Samsung Galaxy S24, iPhone 16, Sony WH-1000XM5)..."
                  className="w-full pl-11 pr-10 py-3.5 text-sm bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </form>

            {/* Popular Product Suggestions */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Popular Searches:
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {POPULAR_SEARCHES.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handlePerformSearch(item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer shadow-xs"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches (if any) */}
            {recentSearches.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                <div className="flex items-center gap-1 text-slate-400 shrink-0">
                  <History className="w-3.5 h-3.5" />
                  <span>Recent:</span>
                </div>
                {recentSearches.map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handlePerformSearch(term)}
                    className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClearRecentSearches}
                  className="text-slate-400 hover:text-rose-500 ml-auto text-[11px]"
                >
                  Clear history
                </button>
              </div>
            )}
          </div>

          {/* Controls & Marketplace Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            {/* Marketplace filter tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setMarketplaceFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  marketplaceFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Marketplaces ({MOCK_MARKETPLACE_PRODUCTS.length})
              </button>
              <button
                type="button"
                onClick={() => setMarketplaceFilter('amazon')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  marketplaceFilter === 'amazon'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Amazon</span>
              </button>
              <button
                type="button"
                onClick={() => setMarketplaceFilter('flipkart')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  marketplaceFilter === 'flipkart'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Flipkart</span>
              </button>
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Category:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Categories</option>
                <option value="Smartphones">Smartphones</option>
                <option value="Audio">Audio & Headphones</option>
                <option value="Computers">Laptops & Computers</option>
                <option value="Wearables">Smartwatches & Wearables</option>
                <option value="Appliances">Appliances & Espresso</option>
              </select>
            </div>
          </div>

          {/* Results Summary State */}
          {activeQuery && (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <div>
                Showing results for <span className="font-bold text-slate-900 dark:text-white">"{activeQuery}"</span> ({searchResults.length} marketplace listings found)
              </div>
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Reset Search
              </button>
            </div>
          )}

          {/* Empty State */}
          {searchResults.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No marketplace products found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No match found for "{activeQuery}". Try searching for one of the popular demo devices: Samsung Galaxy S24, iPhone 16, Sony WH-1000XM5, or MacBook Pro.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handlePerformSearch('Samsung Galaxy S24')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all inline-flex items-center gap-1.5"
                >
                  <span>Search "Samsung Galaxy S24"</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* MARKETPLACE SECTIONS (Grouped by Marketplace as requested) */
            <div className="space-y-10">
              {/* AMAZON SECTION */}
              {(marketplaceFilter === 'all' || marketplaceFilter === 'amazon') && amazonResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-black text-xs">
                        a
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                          Amazon Marketplace
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Verified Amazon product listings with high review volume
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      {amazonResults.length} {amazonResults.length === 1 ? 'listing' : 'listings'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {amazonResults.map(product => (
                      <MarketplaceProductCard
                        key={product.id}
                        product={product}
                        onAnalyze={() => handleAnalyzeReviews(product)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* FLIPKART SECTION */}
              {(marketplaceFilter === 'all' || marketplaceFilter === 'flipkart') && flipkartResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-blue-600 font-black text-xs">
                        fk
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                          Flipkart Marketplace
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Verified Flipkart listings with buyer feedback telemetry
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      {flipkartResults.length} {flipkartResults.length === 1 ? 'listing' : 'listings'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flipkartResults.map(product => (
                      <MarketplaceProductCard
                        key={product.id}
                        product={product}
                        onAnalyze={() => handleAnalyzeReviews(product)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ======================== CATALOG TAB (Seeded Products & CRUD) ======================== */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Tracked Intelligence Catalog
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage seeded database products, trigger batch reviews, and run SKU comparison.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {selectedForCompare.length > 1 && (
                <button
                  type="button"
                  onClick={handleLaunchCompare}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-1.5 animate-pulse"
                >
                  <GitCompare className="w-4 h-4" />
                  <span>Compare Selected ({selectedForCompare.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setProductToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Catalog grid */}
          {catalogLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
              <span className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500">Loading catalog items...</p>
            </div>
          ) : catalogProducts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No products found in the database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalogProducts.map(prod => (
                <div
                  key={prod._id}
                  className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={e => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {prod.brand} · {prod.category}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {prod.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Price</div>
                      <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                        ${prod.price.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCompareSelect(prod._id)}
                        className={`p-2 rounded-lg text-xs border transition-colors ${
                          selectedForCompare.includes(prod._id)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                        }`}
                        title="Compare product"
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        to={`/products/${prod._id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {catalogTotalPages > 1 && (
            <Pagination
              currentPage={catalogPage}
              totalPages={catalogTotalPages}
              totalItems={catalogTotal}
              itemsPerPage={9}
              onPageChange={page => setCatalogPage(page)}
            />
          )}
        </div>
      )}

      {/* Analysis Loading Modal */}
      <AnalysisLoadingModal
        isOpen={isAnalysisModalOpen}
        product={selectedProductForAnalysis}
        onComplete={handleAnalysisComplete}
      />

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        onSuccess={() => fetchCatalogProducts()}
      />

      {/* CSV Upload Modal */}
      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        products={catalogProducts}
        onSuccess={() => fetchCatalogProducts()}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete ${productToDelete?.name}? This will remove all attached reviews and analysis history.`}
        confirmLabel="Delete"
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
};

interface MarketplaceProductCardProps {
  product: MockMarketplaceProduct;
  onAnalyze: () => void;
}

const MarketplaceProductCard: React.FC<MarketplaceProductCardProps> = ({
  product,
  onAnalyze,
}) => {
  const isAmazon = product.source === 'amazon';

  return (
    <div className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500/80 transition-all duration-200">
      <div className="space-y-4">
        {/* Top: Marketplace badge & Tag */}
        <div className="flex items-center justify-between gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
              isAmazon
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                : 'bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-600/20'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>{isAmazon ? 'Amazon' : 'Flipkart'}</span>
          </div>

          {product.badge && (
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {product.badge}
            </span>
          )}
        </div>

        {/* Middle: Product image */}
        <div className="aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            referrerPolicy="no-referrer"
            onError={e => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Product Brand & Name */}
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {product.brand} · {product.category}
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Rating, Reviews count, and Price */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <RatingStars rating={product.rating} size="sm" showValue />
              <span className="text-xs text-slate-400">
                ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </div>
            <div className="text-base font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {product.formattedPrice}
            </div>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {product.availability}
          </div>
        </div>
      </div>

      {/* Card Actions Bottom */}
      <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
        <button
          type="button"
          onClick={onAnalyze}
          className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
          <span>Analyze Reviews</span>
        </button>

        <Link
          to={`/products/${product.targetSeededProductId}?source=${product.source}&mockName=${encodeURIComponent(
            product.name
          )}&mockPrice=${encodeURIComponent(product.formattedPrice)}&mockReviews=${product.reviewCount}&mockRating=${product.rating}`}
          className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition-all flex items-center gap-1"
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
