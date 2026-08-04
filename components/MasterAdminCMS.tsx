'use client';

import React, { useState } from 'react';
import {
  X,
  Settings,
  Store,
  Package,
  Layers,
  Palette,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
  Zap,
  Save,
  Plus,
  Trash2,
  BarChart3,
  ShieldAlert,
  Edit
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface MasterAdminCMSProps {
  products: Product[];
  onUpdateProductStatus: (productId: string, status: any) => void;
  onAddProduct: (product: Product) => void;
}

export const MasterAdminCMS: React.FC<MasterAdminCMSProps> = ({
  products,
  onUpdateProductStatus,
}) => {
  const {
    isMasterAdminOpen,
    setIsMasterAdminOpen,
    siteSettings,
    updateSiteSettings,
    vendors,
    activatedVendorIds,
    toggleVendorActivation,
  } = useCart();

  const [activeTab, setActiveTab] = useState<'BRANDING' | 'VENDORS' | 'PRODUCTS' | 'ANALYTICS'>('BRANDING');

  // Form states for site branding
  const [siteName, setSiteName] = useState(siteSettings.siteName);
  const [siteTagline, setSiteTagline] = useState(siteSettings.siteTagline);
  const [topBannerText, setTopBannerText] = useState(siteSettings.topBannerText);
  const [heroTitle, setHeroTitle] = useState(siteSettings.heroTitle);
  const [primaryColor, setPrimaryColor] = useState(siteSettings.primaryColor);
  const [adminPhone, setAdminPhone] = useState(siteSettings.adminPhone || '9647701234567');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isMasterAdminOpen) return null;

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      siteName,
      siteTagline,
      topBannerText,
      heroTitle,
      primaryColor,
      adminPhone,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={() => setIsMasterAdminOpen(false)}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
      />

      {/* Main CMS Window */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-carbon-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 transition-colors my-8">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Zap className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>لوحة التحكم والإدارة الشاملة (Master Admin CMS)</span>
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                  SUPER ADMIN
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                إدارة كافة نصوص وتصميم ومتغيرات المتجر، تفعيل التجار، وإيقاف أو إظهار المنتجات
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMasterAdminOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-carbon-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CMS Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-carbon-950 rounded-2xl mb-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('BRANDING')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'BRANDING'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>متغيرات الموقع والهوية</span>
          </button>

          <button
            onClick={() => setActiveTab('VENDORS')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'VENDORS'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>إدارة وتفعيل حسابات التجار ({vendors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'PRODUCTS'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>إدارة البضائع والظهور ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'ANALYTICS'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>الإحصائيات والتقرير العام</span>
          </button>
        </div>

        {/* Tab 1: Branding & Variable Settings */}
        {activeTab === 'BRANDING' && (
          <form onSubmit={handleSaveBranding} className="space-y-5 text-xs">
            {savedNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم حفظ وتحديث كافة متغيرات الموقع بنجاح!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  اسم المنصة الرئيسي (Brand Name):
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  الوصف الفرعي بالإنجليزية (Tagline):
                </label>
                <input
                  type="text"
                  value={siteTagline}
                  onChange={(e) => setSiteTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                نص الشريط الذهبي العلوي (Top Announcement Bar):
              </label>
              <input
                type="text"
                value={topBannerText}
                onChange={(e) => setTopBannerText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                عنوان الهيدر الرئيسي (Hero H1 Headline):
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                رقم واتساب الإدارة المباشر (لاستلام بلاغات الإبلاغ والدعم الفني):
              </label>
              <input
                type="text"
                placeholder="9647701234567"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وتطبيق التغييرات فورا</span>
            </button>
          </form>
        )}

        {/* Tab 2: Vendors Approval System */}
        {activeTab === 'VENDORS' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              * التحكم بحسابات التجار: تفعيل التاجر يمنحه زر "نشر بضاعة جديدة" في الهيدر واللوحة الخاصة به.
            </p>

            <div className="space-y-3">
              {vendors.map((vendor) => {
                const isActivated = activatedVendorIds.includes(vendor.id);
                return (
                  <div
                    key={vendor.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                        {vendor.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {vendor.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {vendor.location} • المبيعات: {vendor.totalSales} • التقييم: ★{vendor.rating}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${
                        isActivated ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'
                      }`}>
                        {isActivated ? 'حساب مفعّل بالكامل ✅' : 'موقوف / قيد المراجعة ⛔'}
                      </span>

                      <button
                        onClick={() => toggleVendorActivation(vendor.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                          isActivated
                            ? 'bg-red-600 text-white hover:bg-red-500'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                      >
                        {isActivated ? 'إيقاف حساب التاجر' : 'تفعيل صلاحية النشر'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Global Products Control */}
        {activeTab === 'PRODUCTS' && (
          <div className="space-y-4 text-xs">
            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      prod.status === 'AVAILABLE' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {prod.status}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[280px]">
                      {prod.title}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ({prod.outletPrice.toLocaleString('ar-IQ')} د.ع)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onUpdateProductStatus(prod.id, prod.status === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                        prod.status === 'AVAILABLE'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500'
                      }`}
                    >
                      {prod.status === 'AVAILABLE' ? 'إيقاف المنشور (إخفاء)' : 'إعادة إظهار المنشور'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Analytics */}
        {activeTab === 'ANALYTICS' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-slate-400 font-bold block mb-1">إجمالي البضائع المعروضة</span>
              <span className="text-3xl font-black text-amber-500">{products.length}</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-slate-400 font-bold block mb-1">التجار المفعلين بالمنصة</span>
              <span className="text-3xl font-black text-emerald-500">{activatedVendorIds.length}</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-slate-400 font-bold block mb-1">نسبة التجاوب والاستجابة</span>
              <span className="text-3xl font-black text-sky-500">100%</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
