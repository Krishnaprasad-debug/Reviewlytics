import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { TopHeader } from './TopHeader.js';
import { ProductFormModal } from '../modals/ProductFormModal.js';
import { AddReviewModal } from '../modals/AddReviewModal.js';
import { CsvUploadModal } from '../modals/CsvUploadModal.js';
import { Product } from '../../types/index.js';
import { api } from '../../services/api.js';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Global modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [isCsvUploadOpen, setIsCsvUploadOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.products.getAll({ limit: 100 });
      if (res.success && res.data) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products for layout:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Derive page titles based on route
  const getPageInfo = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) {
      return {
        title: 'Executive Analytics Dashboard',
        subtitle: 'Real-time sentiment telemetry, rating trends, and AI aspect mining',
      };
    }
    if (path.startsWith('/products/')) {
      return {
        title: 'Product Intelligence & AI Summary',
        subtitle: 'Marketplace review synthesis, aspect sentiment, and buyer recommendation',
      };
    }
    if (path.startsWith('/products')) {
      return {
        title: 'Search Products',
        subtitle: 'Search multi-marketplace products and extract synthesized review intelligence',
      };
    }
    if (path.startsWith('/reviews')) {
      return {
        title: 'Customer Reviews Intelligence',
        subtitle: 'Search, filter, and inspect AI-extracted sentiment across all products',
      };
    }
    if (path.startsWith('/analytics')) {
      return {
        title: 'Deep Sentiment Analytics',
        subtitle: 'Comprehensive aspect matrices, volume trends, and ratings breakdowns',
      };
    }
    if (path.startsWith('/compare')) {
      return {
        title: 'AI Product Comparison Suite',
        subtitle: 'Comparative synthesis, head-to-head feature breakdown, and purchase advice',
      };
    }
    if (path.startsWith('/profile')) {
      return {
        title: 'User Profile & Credentials',
        subtitle: 'Manage your analyst identity and personal preferences',
      };
    }
    if (path.startsWith('/settings')) {
      return {
        title: 'Platform Settings & AI Engine',
        subtitle: 'Customize AI parameters, theme preferences, and data options',
      };
    }
    return {
      title: 'REVIEWLYTICS',
      subtitle: 'AI-Powered Product Review Analysis and Insight Platform',
    };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        onOpenCsvUpload={() => setIsCsvUploadOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onOpenAddReview={() => setIsAddReviewOpen(true)}
          title={title}
          subtitle={subtitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ refreshProducts: fetchProducts, products }} />
        </main>
      </div>

      {/* Global Modals */}
      <ProductFormModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSuccess={() => fetchProducts()}
      />

      <AddReviewModal
        isOpen={isAddReviewOpen}
        onClose={() => setIsAddReviewOpen(false)}
        products={products}
        onSuccess={() => fetchProducts()}
      />

      <CsvUploadModal
        isOpen={isCsvUploadOpen}
        onClose={() => setIsCsvUploadOpen(false)}
        products={products}
        onSuccess={() => fetchProducts()}
      />
    </div>
  );
};
