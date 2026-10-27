import {
  User,
  Product,
  Review,
  Analysis,
  ProductSummary,
  DashboardAnalyticsData,
  ProductComparisonResponse,
  Pagination,
} from '../types/index.js';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Auth
  auth: {
    async register(payload: any): Promise<{ success: boolean; data: { user: User; token: string }; message: string }> {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async login(payload: any): Promise<{ success: boolean; data: { user: User; token: string }; message: string }> {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async getMe(): Promise<{ success: boolean; data: { user: User } }> {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async updateProfile(payload: any): Promise<{ success: boolean; data: { user: User }; message: string }> {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async changePassword(payload: any): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
      return this.changePassword({ currentPassword, newPassword });
    },
  },

  // Products
  products: {
    async getAll(params: Record<string, any> = {}): Promise<{
      success: boolean;
      data: { products: Product[]; pagination: Pagination };
    }> {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/products?${query}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async getById(id: string): Promise<{ success: boolean; data: { product: Product } }> {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async create(payload: Partial<Product>): Promise<{ success: boolean; data: { product: Product }; message: string }> {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async update(id: string, payload: Partial<Product>): Promise<{ success: boolean; data: { product: Product }; message: string }> {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async delete(id: string): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async getCategories(): Promise<{ success: boolean; data: { categories: string[]; brands: string[] } }> {
      const res = await fetch(`${API_BASE}/products/categories`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async getInsights(id: string): Promise<any> {
      const res = await fetch(`${API_BASE}/products/${id}/insights`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async getComparison(id: string): Promise<any> {
      const res = await fetch(`${API_BASE}/products/${id}/comparison`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Reviews
  reviews: {
    async getAll(params: Record<string, any> = {}): Promise<{
      success: boolean;
      data: { reviews: Review[]; pagination: Pagination };
    }> {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/reviews?${query}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async getByProduct(productId: string, params: Record<string, any> = {}): Promise<{
      success: boolean;
      data: { reviews: Review[]; pagination: Pagination };
    }> {
      return this.getAll({ productId, ...params });
    },

    async create(payload: Partial<Review> & { autoAnalyze?: boolean }): Promise<{
      success: boolean;
      data: { review: Review };
      message: string;
    }> {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async update(id: string, payload: Partial<Review> & { reanalyze?: boolean }): Promise<{
      success: boolean;
      data: { review: Review };
      message: string;
    }> {
      const res = await fetch(`${API_BASE}/reviews/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async delete(id: string): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/reviews/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // AI Analysis
  analysis: {
    async analyzeReview(reviewId: string, force = false): Promise<{
      success: boolean;
      data: { analysis: Analysis };
      message: string;
    }> {
      const res = await fetch(`${API_BASE}/analysis/review/${reviewId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ force }),
      });
      return handleResponse(res);
    },

    async analyzeBatch(productId: string, forceAll = false): Promise<{
      success: boolean;
      data: { summary: ProductSummary; stats: { processed: number; skipped: number; errors: number } };
      message: string;
    }> {
      const res = await fetch(`${API_BASE}/analysis/product/${productId}/batch`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ forceAll }),
      });
      return handleResponse(res);
    },

    async batchAnalyzeProduct(productId: string, forceAll = false): Promise<{
      success: boolean;
      data: { summary: ProductSummary; stats: { processed: number; skipped: number; errors: number } };
      message: string;
    }> {
      return this.analyzeBatch(productId, forceAll);
    },

    async getProductSummary(productId: string, regenerate = false): Promise<{
      success: boolean;
      data: { summary: ProductSummary };
      message?: string;
    }> {
      const res = await fetch(`${API_BASE}/analysis/product/${productId}/summary?regenerate=${regenerate}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async summarizeProduct(productId: string, regenerate = false): Promise<{
      success: boolean;
      data: { summary: ProductSummary };
      message?: string;
    }> {
      return this.getProductSummary(productId, regenerate);
    },

    async getSuspiciousReviews(productId?: string): Promise<{
      success: boolean;
      data: { suspiciousReviews: { analysis: Analysis; review: Review; productName: string }[] };
    }> {
      const q = productId ? `?productId=${productId}` : '';
      const res = await fetch(`${API_BASE}/analysis/suspicious${q}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Analytics & Compare
  analytics: {
    async getDashboard(params: Record<string, any> = {}): Promise<{
      success: boolean;
      data: DashboardAnalyticsData;
    }> {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/analytics/dashboard?${query}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async compare(productIds: string[]): Promise<{
      success: boolean;
      data: ProductComparisonResponse;
      message: string;
    }> {
      const res = await fetch(`${API_BASE}/analytics/compare`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productIds }),
      });
      return handleResponse(res);
    },

    async compareProducts(productIds: string[]): Promise<{
      success: boolean;
      data: ProductComparisonResponse;
      message: string;
    }> {
      return this.compare(productIds);
    },
  },

  // Upload CSV
  upload: {
    async previewCsv(file: File): Promise<{
      success: boolean;
      data: {
        fileName: string;
        fileSize: number;
        summary: { total: number; valid: number; invalid: number };
        errors: string[];
        previewRows: any[];
      };
      message: string;
    }> {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/upload/csv/preview`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      return handleResponse(res);
    },

    async importCsv(file: File, productId: string, autoAnalyze = false): Promise<{
      success: boolean;
      data: { importedCount: number; skippedCount: number; analyzedCount: number; product: string };
      message: string;
    }> {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', productId);
      formData.append('autoAnalyze', String(autoAnalyze));

      const res = await fetch(`${API_BASE}/upload/csv/import`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      return handleResponse(res);
    },
  },

  // Real-time Marketplace Ingestion (Apify)
  import: {
    async importAmazon(url: string, refresh: boolean = false): Promise<any> {
      const res = await fetch(`${API_BASE}/import/amazon`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ url, refresh }),
      });
      return handleResponse(res);
    },

    async importFlipkart(url: string, refresh: boolean = false): Promise<any> {
      const res = await fetch(`${API_BASE}/import/flipkart`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ url, refresh }),
      });
      return handleResponse(res);
    },

    async analyzeMulti(payload: { amazonUrl?: string; flipkartUrl?: string }): Promise<any> {
      const res = await fetch(`${API_BASE}/import/analyze`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    // Backward-compatible alias
    async importAmazonReviews(url: string): Promise<any> {
      return this.importAmazon(url);
    },
  },

  // Persistence & Database Settings
  settings: {
    async getDatabaseStatus(): Promise<{ success: boolean; data: DatabaseStatusData }> {
      const res = await fetch(`${API_BASE}/settings/database`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async saveMongoUri(uri: string): Promise<{ success: boolean; message: string; data?: DatabaseStatusData }> {
      const res = await fetch(`${API_BASE}/settings/database`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ uri }),
      });
      return handleResponse(res);
    },

    async testMongoUri(uri: string): Promise<{ success: boolean; message: string; host?: string; dbName?: string }> {
      const res = await fetch(`${API_BASE}/settings/database/test`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ uri }),
      });
      return handleResponse(res);
    },

    async disconnectMongo(): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/settings/database/disconnect`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async saveSupabaseConfig(supabaseUrl: string, supabaseServiceRoleKey: string): Promise<{ success: boolean; message: string; data?: DatabaseStatusData }> {
      const res = await fetch(`${API_BASE}/settings/database`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ supabaseUrl, supabaseServiceRoleKey }),
      });
      return handleResponse(res);
    },

    async testSupabaseConfig(supabaseUrl?: string, supabaseServiceRoleKey?: string): Promise<{
      success: boolean;
      message: string;
      readPass?: boolean;
      writePass?: boolean;
      tableCounts?: any;
    }> {
      const res = await fetch(`${API_BASE}/settings/database/test`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ supabaseUrl, supabaseServiceRoleKey }),
      });
      return handleResponse(res);
    },

    async syncSupabase(): Promise<{ success: boolean; message: string; counts?: any }> {
      const res = await fetch(`${API_BASE}/settings/database/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async getSchemaSql(): Promise<{ success: boolean; data: { filename: string; sql: string } }> {
      const res = await fetch(`${API_BASE}/settings/database/schema-sql`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async getApifyStatus(): Promise<{ success: boolean; data: { isConfigured: boolean; maskedToken: string | null; hasToken: boolean } }> {
      const res = await fetch(`${API_BASE}/settings/apify`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async saveApifyToken(token: string): Promise<{ success: boolean; message: string; data?: { isConfigured: boolean; maskedToken: string } }> {
      const res = await fetch(`${API_BASE}/settings/apify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ token }),
      });
      return handleResponse(res);
    },
  },
};

export interface DatabaseStatusData {
  isConnected: boolean;
  engine: 'supabase' | 'mongodb' | 'json';
  supabaseConfigured?: boolean;
  missingVars?: string[];
  hasMongoUri: boolean;
  maskedUri: string | null;
  host?: string;
  dbName?: string;
  lastError?: string | null;
  lastVerifiedAt?: string | null;
  synced?: {
    products: number;
    reviews: number;
    analyses: number;
    summaries: number;
    listings: number;
  };
  localStats: {
    products: number;
    reviews: number;
    analyses: number;
    summaries: number;
    listings: number;
  };
}

