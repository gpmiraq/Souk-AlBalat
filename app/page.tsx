'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { DemoNoticeBanner } from '../components/DemoNoticeBanner';
import { CategoriesSidebar } from '../components/CategoriesSidebar';
import { ProductGrid } from '../components/ProductGrid';
import { SplitCartDrawer } from '../components/SplitCartDrawer';
import { ConditionGuideModal } from '../components/ConditionGuideModal';
import { UserAuthModal } from '../components/UserAuthModal';
import { AdminVendorDashboard } from '../components/AdminVendorDashboard';
import { MasterAdminCMS } from '../components/MasterAdminCMS';
import { FloatingWhatsAppSupport } from '../components/FloatingWhatsAppSupport';
import { ScrollToTop } from '../components/ScrollToTop';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import { CookieConsentBanner } from '../components/CookieConsentBanner';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_VENDORS } from '../data/mockData';
import { Product, ProductStatus, SearchFilters } from '../types';
import { useCart } from '../context/CartContext';
import { Sparkles, ShieldCheck, Zap, ArrowLeft, Clock, Award, Package, Truck } from 'lucide-react';

export default function HomePage() {
  const { products, setProducts } = useCart();
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [isConditionGuideOpen, setIsConditionGuideOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    condition: 'ALL',
    category: 'الكل',
    vendorId: 'ALL',
    showSection: 'ALL',
    minPrice: 0,
    maxPrice: 2000000,
    sortBy: 'relevance',
  });

  // 1-Hour Reservation Timeout & 7-Day Expiry Check Logic
  useEffect(() => {
    const checkTimeouts = () => {
      const now = Date.now();
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          if (p.status === 'RESERVED' && p.reservedAt) {
            const reservedTime = new Date(p.reservedAt).getTime();
            if (now - reservedTime >= 3600 * 1000) {
              return { ...p, status: 'AVAILABLE', reservedAt: undefined };
            }
          }

          if (p.status === 'AVAILABLE' && p.expiresAt) {
            const expTime = new Date(p.expiresAt).getTime();
            if (now >= expTime) {
              return { ...p, status: 'SOLD' };
            }
          }

          return p;
        })
      );
    };

    checkTimeouts();
    const interval = setInterval(checkTimeouts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddCategory = (newCat: string) => {
    if (!categories.includes(newCat)) {
      setCategories((prev) => [...prev, newCat]);
    }
  };

  const handleUpdateProductStatus = (productId: string, status: ProductStatus, quantity?: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              status,
              quantity: quantity !== undefined ? quantity : p.quantity,
              reservedAt: status === 'RESERVED' ? new Date().toISOString() : undefined,
            }
          : p
      )
    );
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'الكل': products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const rawQuery = filters.query.trim().toLowerCase();
    const queryTokens = rawQuery.split(/\s+/).filter(Boolean);

    let result = products.filter((p) => {
      if (filters.category !== 'الكل' && p.category !== filters.category) {
        return false;
      }
      if (filters.condition !== 'ALL' && p.condition !== filters.condition) {
        return false;
      }
      if (filters.vendorId !== 'ALL' && p.vendorId !== filters.vendorId) {
        return false;
      }
      if (filters.showSection === 'FEATURED' && !p.isFeatured) {
        return false;
      }
      if (filters.showSection === 'RECENT') {
        const pubTime = new Date(p.publishedAt).getTime();
        const isWithin24h = Date.now() - pubTime < 24 * 3600 * 1000;
        if (!isWithin24h) return false;
      }
      if (filters.showSection === 'SOLD' && p.status === 'AVAILABLE') {
        return false;
      }

      if (queryTokens.length > 0) {
        const vendor = INITIAL_VENDORS.find((v) => v.id === p.vendorId);
        const searchableText = [
          p.title,
          p.description,
          p.model,
          p.serialNumber || '',
          p.condition,
          p.category,
          vendor?.name || '',
          ...(p.tags || []),
        ]
          .join(' ')
          .toLowerCase();

        return queryTokens.every((token) => searchableText.includes(token));
      }

      return true;
    });

    if (filters.sortBy === 'price_low') {
      result.sort((a, b) => a.outletPrice - b.outletPrice);
    } else if (filters.sortBy === 'price_high') {
      result.sort((a, b) => b.outletPrice - a.outletPrice);
    } else if (filters.sortBy === 'newest') {
      result.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    return result;
  }, [products, filters]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-carbon-950 text-slate-900 dark:text-white pb-20 sm:pb-8 transition-colors duration-200">
      
      {/* Navbar */}
      <Navbar
        onOpenConditionGuide={() => setIsConditionGuideOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onSearchQueryChange={(query) => setFilters((prev) => ({ ...prev, query }))}
        onCategorySelect={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
        selectedCategory={filters.category}
      />

      {/* Demo Notice Banner */}
      <DemoNoticeBanner />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full space-y-8">
        
        {/* Amazon & Noon Inspired Hero & Deals Section */}
        <section className="space-y-6">
          
          {/* Main Hero Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-900 text-white p-6 sm:p-10 overflow-hidden shadow-xl border border-slate-800">
            {/* Background Accent Graphics */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-3xl">
              <div>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black border border-amber-500/30">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>أول منصة لبضائع أمازون والبالة والـ DHL في العراق 🇮🇶</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black leading-relaxed tracking-normal text-white py-1">
                سوق البالات | بضائع أمازون، أوبن بوكس، وطرود DHL بأفضل الأسعار
              </h1>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, showSection: 'FEATURED' }))}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                >
                  <span>تصفح البضائع المميزة</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsConditionGuideOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>دليل درجات الفحص والضمان</span>
                </button>
              </div>
            </div>
          </div>

          {/* Amazon-Style 4 Cards Showcase Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <button
              onClick={() => setFilters((prev) => ({ ...prev, condition: 'OPEN_BOX' }))}
              className="p-5 rounded-2xl bg-white dark:bg-carbon-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-right group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-amber-600 transition-colors">
                أوبن بوكس (Open Box)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                بضائع بالعلبة المفتوحة بحالة كالجديدة تماماً وملحقاتها الكاملة
              </p>
            </button>

            <button
              onClick={() => setFilters((prev) => ({ ...prev, category: 'مستلزمات DHL وطرد بريدي' }))}
              className="p-5 rounded-2xl bg-white dark:bg-carbon-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-right group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-amber-600 transition-colors">
                طرود DHL الألمانية
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                طرد بريدي مغلق ومفحوص الوزن مباشر من ألمانيا
              </p>
            </button>

            <button
              onClick={() => setFilters((prev) => ({ ...prev, showSection: 'RECENT' }))}
              className="p-5 rounded-2xl bg-white dark:bg-carbon-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-right group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-amber-600 transition-colors">
                المضافة حديثاً (آخر 24 ساعة)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أحدث البضائع الواصلة للمعارض
              </p>
            </button>

            <button
              onClick={() => setFilters((prev) => ({ ...prev, condition: 'SCRAP' }))}
              className="p-5 rounded-2xl bg-white dark:bg-carbon-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-right group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-amber-600 transition-colors">
                فحم - أدوات (SCRAP)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                بضاعة نقص أو عاطلة تنفع أدوات وقطع للمصلحين
              </p>
            </button>

          </div>

        </section>

        {/* Main Content Layout: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Right Sidebar (Filter & Categories) - 3 Columns */}
          <div className={`lg:col-span-3 ${isMobileSidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <CategoriesSidebar
              categories={categories}
              onAddCategory={handleAddCategory}
              filters={filters}
              setFilters={setFilters}
              categoryCounts={categoryCounts}
              onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
            />
          </div>

          {/* Left Product Grid Showcase - 9 Columns */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Products Grid Header & Sort Controls */}
            <div className="bg-white dark:bg-carbon-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>البضائع المعروضة</span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    ({filteredProducts.length} قطعة)
                  </span>
                </h2>
                {filters.category !== 'الكل' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    التصنيف المختار: <strong className="text-slate-900 dark:text-white">{filters.category}</strong>
                  </p>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
                <span className="text-slate-500 font-bold whitespace-nowrap">الترتيب:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value as SearchFilters['sortBy'],
                    }))
                  }
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-carbon-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="relevance">الأعلى تطابقاً (Relevance)</option>
                  <option value="newest">الأحدث وصولاً</option>
                  <option value="price_low">السعر: من الأقل للأعلى</option>
                  <option value="price_high">السعر: من الأعلى للأقل</option>
                </select>
              </div>
            </div>

            {/* Product Cards Grid */}
            <ProductGrid
              products={filteredProducts}
              vendors={INITIAL_VENDORS}
            />

          </div>

        </div>

      </main>

      {/* Cart Drawer */}
      <SplitCartDrawer />

      {/* Modals & Overlays */}
      <ConditionGuideModal
        isOpen={isConditionGuideOpen}
        onClose={() => setIsConditionGuideOpen(false)}
      />

      <UserAuthModal />

      <AdminVendorDashboard
        products={products}
        onUpdateProductStatus={handleUpdateProductStatus}
        onAddProduct={handleAddProduct}
      />

      <FloatingWhatsAppSupport />
      <ScrollToTop />

      {/* Mobile Navigation */}
      <MobileNav
        onOpenConditionGuide={() => setIsConditionGuideOpen(true)}
        onFocusSearch={() => {}}
      />

      {/* Cookie Consent Banner */}
      <CookieConsentBanner />

      {/* E-Commerce Footer */}
      <Footer />

    </div>
  );
}
