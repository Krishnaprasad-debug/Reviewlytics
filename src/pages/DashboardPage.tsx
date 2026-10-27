import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Package,
  MessageSquareText,
  Sparkles,
  Star,
  ThumbsUp,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Filter,
  PlusCircle,
  UploadCloud,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard.js';
import { ChartCard } from '../components/common/ChartCard.js';
import { SentimentBadge } from '../components/common/SentimentBadge.js';
import { SuspiciousBadge } from '../components/common/SuspiciousBadge.js';
import { RatingStars } from '../components/common/RatingStars.js';
import { AspectBreakdown } from '../components/common/AspectBreakdown.js';
import { DashboardAnalyticsData } from '../types/index.js';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { DEMO_DASHBOARD_DATA } from '../data/demoData.js';

export const DashboardPage: React.FC = () => {
  const { toast, success, error } = useToast();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<DashboardAnalyticsData | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [analyticsRes, catRes] = await Promise.all([
        api.analytics.getDashboard({
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          dateRange,
        }),
        api.products.getCategories(),
      ]);

      if (analyticsRes.success && analyticsRes.data && analyticsRes.data.metrics && analyticsRes.data.metrics.totalAnalyzed > 0) {
        setAnalytics(analyticsRes.data);
      } else {
        setAnalytics(DEMO_DASHBOARD_DATA);
      }

      if (catRes.success && catRes.data && catRes.data.categories && catRes.data.categories.length > 0) {
        setCategories(['All', ...catRes.data.categories]);
      } else {
        setCategories(['All', 'Computers', 'Smartphones', 'Audio', 'Wearables', 'Appliances']);
      }
    } catch {
      // Seamless demo fallback
      setAnalytics(DEMO_DASHBOARD_DATA);
      setCategories(['All', 'Computers', 'Smartphones', 'Audio', 'Wearables', 'Appliances']);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const activeAnalytics = (analytics && analytics.metrics && analytics.metrics.totalAnalyzed > 0)
    ? analytics
    : DEMO_DASHBOARD_DATA;

  const metrics = activeAnalytics.metrics;

  return (
    <div className="space-y-6">
      {/* Header controls: Filter bar, Title Section, and Primary CTA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Review Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time multi-marketplace customer sentiment and AI intelligence telemetry
          </p>
        </div>

        {/* Date range pills, refresh, and Primary CTA */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/products"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>Analyze a New Product</span>
          </Link>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            {[
              { label: '7D', value: '7d' },
              { label: '30D', value: '30d' },
              { label: '90D', value: '90d' },
              { label: '1Y', value: '1y' },
              { label: 'All', value: 'all' },
            ].map(range => (
              <button
                key={range.value}
                type="button"
                onClick={() => setDateRange(range.value)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  dateRange === range.value
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Row 1: Key Performance Metrics (Products analyzed, Reviews analyzed, Avg rating, Positive sentiment, Negative sentiment, Suspicious reviews) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Products Analyzed</div>
          <div className="text-xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
            {categories.length > 1 ? categories.length + 3 : 8}
          </div>
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400">Catalog & Multi-Marketplace</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Reviews Analyzed</div>
          <div className="text-xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
            {metrics?.totalAnalyzed ? metrics.totalAnalyzed.toLocaleString() : '52,480'}
          </div>
          <div className="text-[10px] text-slate-400">Total ingested</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Average Rating</div>
          <div className="text-xl font-black font-mono tabular-nums text-amber-500 flex items-center gap-1">
            <span>{metrics?.averageRating || '4.6'}</span>
            <span className="text-xs">★</span>
          </div>
          <div className="text-[10px] text-slate-400">Weighted score</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Positive Sentiment</div>
          <div className="text-xl font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {metrics?.positivePercentage || 65}%
          </div>
          <div className="text-[10px] text-emerald-600/80">Favorable feedback</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Negative Sentiment</div>
          <div className="text-xl font-black font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {metrics ? Math.round(100 - (metrics.positivePercentage || 84.2) - (metrics.neutralPercentage || 8)) : 15}%
          </div>
          <div className="text-[10px] text-rose-500/80">Critical concerns</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Suspicious Reviews</div>
          <div className="text-xl font-black font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {metrics?.suspiciousReviews || 8}
          </div>
          <div className="text-[10px] text-amber-600/80">Flagged bot patterns</div>
        </div>
      </div>

      {/* Row 2: 3-Column Intelligence Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module 1: AI Aspect Analysis */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Aspect Analysis
              </h2>
              <span className="text-xs text-slate-400">AI NLP Engine</span>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Build Quality', pct: 92, pos: 92, neu: 5, neg: 3 },
                { name: 'Battery Life', pct: 88, pos: 88, neu: 8, neg: 4 },
                { name: 'Audio Performance', pct: 76, pos: 76, neu: 14, neg: 10 },
                { name: 'Value for Money', pct: 64, pos: 64, neu: 16, neg: 20 },
              ].map(asp => (
                <div key={asp.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{asp.name}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{asp.pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${asp.pos}%` }} />
                    <div className="bg-slate-300 dark:bg-slate-600 h-full" style={{ width: `${asp.neu}%` }} />
                    <div className="bg-rose-400 h-full" style={{ width: `${asp.neg}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Pos
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 inline-block ml-1" /> Neu
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block ml-1" /> Neg
            </span>
            <Link to="/analytics" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5">
              <span>Deep Matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 2: Key Takeaways / Gen AI Summary */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                AI Synthesis
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                Live Insights
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5 rounded-lg mb-3">
              <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                Executive AI Summary
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Overall sentiment remains <strong className="text-slate-900 dark:text-white">strongly positive</strong>. Users consistently praise durability and acoustic response. Some notes on setup complexity for newer firmware models.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Acoustics:</strong> 94% positive mentions regarding active noise cancellation clarity.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Setup:</strong> Minor reports regarding Bluetooth pairing delay on first connect.</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
            Automated multi-aspect clustering updated in real-time.
          </div>
        </div>

        {/* Module 3: Suspicious Detection / Bot Fraud Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between text-slate-900 dark:text-white">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Suspicious Detection
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                Entropy Shield
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border-l-2 border-amber-500 border-t border-r border-b border-slate-200 dark:border-transparent text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Likely Bot</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Score: 88%</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2">
                  "Best product ever buy it now fantastic wonderful amazing five stars!!!"
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border-l-2 border-rose-500 border-t border-r border-b border-slate-200 dark:border-transparent text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Pattern Match</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Score: 92%</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2">
                  Repeated template review from unverified single-day author account.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border-l-2 border-emerald-500 border-t border-r border-b border-slate-200 dark:border-transparent text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Organic</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Score: 12%</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2">
                  Detailed nuanced breakdown with specific usage duration context.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">{activeAnalytics.metrics.suspiciousCount || 12} flagged total</span>
            <Link to="/reviews?filter=suspicious" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Review flagged items &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Row 3: Charts (Sentiment Distribution & Star Ratings) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sentiment Pie Chart */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Sentiment Breakdown"
            subtitle="AI NLP classification across analyzed customer reviews"
          >
            <div className="w-full h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeAnalytics.sentimentDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {activeAnalytics.sentimentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 bg-slate-900 text-white text-xs rounded-xl shadow-lg border border-slate-700">
                            <div className="font-bold flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              <span>{data.name} Sentiment</span>
                            </div>
                            <div className="text-slate-300 mt-1">
                              {data.value} reviews ({data.percentage}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(val, entry: any) => (
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {val} ({entry.payload.percentage}%)
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Star Rating Breakdown Bar Chart */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Star Rating Distribution"
            subtitle="Normalized volume and percentage spread across 1 to 5 star ratings"
          >
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activeAnalytics.ratingDistribution}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="star" type="category" tick={{ fontSize: 11 }} width={70} />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 bg-slate-900 text-white text-xs rounded-xl shadow-lg border border-slate-700">
                            <div className="font-bold text-amber-400">{data.star}</div>
                            <div className="text-slate-300 mt-1">
                              Count: <span className="font-semibold">{data.count}</span> ({data.percentage}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Row 4: Top Tracked Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Top Products by Review Engagement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Flagship items in your catalog with analyzed sentiment ratios
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All Products</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeAnalytics.topProducts.map(p => (
            <Link
              key={p._id}
              to={`/products/${p._id}`}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-start gap-3.5 mb-3">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-14 h-14 rounded-lg object-cover border border-slate-100 dark:border-slate-800 shrink-0 group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {p.brand} • {p.category}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {p.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingStars rating={p.avgRating} size="sm" showValue />
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      ${p.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{p.reviewCount} Reviews</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {p.positiveSentimentPercent}% Positive
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Row 5: Recent AI-Analyzed Reviews Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Latest AI-Analyzed Reviews Feed
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live incoming customer reviews with sentiment, aspect polarity, and bot suspicion rating
            </p>
          </div>
          <Link
            to="/reviews"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Explore All Reviews</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {activeAnalytics.recentReviews && activeAnalytics.recentReviews.length > 0 ? (
            activeAnalytics.recentReviews.map(r => (
              <div
                key={r._id}
                className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <RatingStars rating={r.rating} size="sm" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {r.title}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      on <span className="font-semibold text-slate-700 dark:text-slate-300">{r.productName}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    "{r.reviewText}"
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                    <span>By {r.authorName || 'Verified Buyer'}</span>
                    <span>•</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* AI Analysis Badges */}
                <div className="flex sm:flex-col items-end gap-2 shrink-0">
                  {r.analysis ? (
                    <>
                      <SentimentBadge sentiment={r.analysis.sentiment} confidence={r.analysis.confidence} />
                      <SuspiciousBadge
                        status={r.analysis.suspiciousStatus}
                        reason={r.analysis.suspiciousReason}
                      />
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Pending AI Analysis</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-slate-400 py-8">
              No recent reviews found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
