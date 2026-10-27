export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  profileImage?: string;
  settings?: {
    theme?: 'light' | 'dark' | 'system';
    emailNotifications?: boolean;
    autoAnalyzeReviews?: boolean;
    aiTemperature?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AspectSentiment {
  aspect?: string;
  name?: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  score?: number;
  mentions?: number;
}

export interface Analysis {
  _id: string;
  reviewId?: string;
  productId: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  confidence: number;
  aspects: AspectSentiment[];
  pros: string[];
  cons: string[];
  keywords: string[];
  suspiciousStatus: 'Genuine' | 'Suspicious' | 'Uncertain';
  suspiciousReason?: string;
  suspiciousScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  productId: string;
  userId?: string;
  authorName?: string;
  rating: number;
  title: string;
  reviewText: string;
  source: 'manual' | 'csv' | 'api';
  verifiedPurchase?: boolean;
  productName?: string;
  productBrand?: string;
  productImage?: string;
  analysis?: Analysis | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSummary {
  _id: string;
  productId: string;
  overallSummary?: string;
  executiveSummary?: string;
  overview?: string;
  recommendation?: string;
  sentimentScore?: number;
  positiveHighlights?: string[];
  negativeHighlights?: string[];
  keyObservations?: string[];
  topStrengths?: string[];
  topWeaknesses?: string[];
  pros?: string[];
  cons?: string[];
  aspectBreakdown?: AspectSentiment[];
  sentimentBreakdown?: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  };
  topPros?: { text: string; count: number }[];
  topCons?: { text: string; count: number }[];
  topKeywords?: { keyword: string; count: number }[];
  suspiciousCount?: number;
  totalAnalyzed?: number;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  image: string;
  createdBy: string;
  totalReviews?: number;
  averageRating?: number;
  sentimentScore?: number | null;
  hasSummary?: boolean;
  ratingDistribution?: { star: number; count: number; percentage: number }[];
  sentimentStats?: {
    analyzed: number;
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
    positivePercent: number;
    suspiciousCount: number;
  };
  summary?: ProductSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalReviews: number;
  totalAnalyzed: number;
  averageRating: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  mixedCount: number;
  positivePercentage: number;
  suspiciousCount: number;
  uncertainCount: number;
  suspiciousPercentage: number;
}

export interface SentimentDistributionItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface RatingDistributionItem {
  star: string;
  rating: number;
  count: number;
  percentage: number;
}

export interface ReviewTrendItem {
  month: string;
  reviews: number;
  positive: number;
  negative: number;
  avgRating: number;
}

export interface AspectAnalyticsItem {
  name: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  positiveRatio: number;
}

export interface DashboardAnalyticsData {
  metrics: DashboardMetrics;
  sentimentDistribution: SentimentDistributionItem[];
  ratingDistribution: RatingDistributionItem[];
  reviewTrends: ReviewTrendItem[];
  aspectAnalytics: AspectAnalyticsItem[];
  topProducts: {
    _id: string;
    name: string;
    brand: string;
    category: string;
    image: string;
    price: number;
    reviewCount: number;
    avgRating: number;
    positiveSentimentPercent: number;
  }[];
  recentReviews: Review[];
}

export interface ProductComparisonResponse {
  products: any[];
  aiComparison?: any;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
