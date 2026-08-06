'use client';

import React from 'react';
import { Layers, Tag, Check, Sparkles, X, Filter, Grid, AlertCircle, ShieldAlert, Sparkle } from 'lucide-react';
import { SearchFilters } from '../types';
import { useCart } from '../context/CartContext';

interface CategoriesSidebarProps {
  categories: string[];
  onAddCategory?: (newCat: string) => void;
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  categoryCounts: Record<string, number>;
  onCloseMobileSidebar?: () => void;
}

export const CategoriesSidebar: React.FC<CategoriesSidebarProps> = ({
  categories,
  filters,
  setFilters,
  categoryCounts,
  onCloseMobileSidebar,
}) => {

  const conditionsList = [
    { label: 'جميع الحالات', value: 'ALL', color: 'text-slate-600 dark:text-slate-400' },
    { label: 'جديد (NEW)', value: 'NEW', color: 'text-emerald-500 font-bold' },
    { label: 'أوبن بوكس (Open Box)', value: 'OPEN_BOX', color: 'text-sky-500 font-bold' },
    { label: 'مستعمل (USED)', value: 'USED', color: 'text-amber-500 font-bold' },
    { label: 'فحم - أدوات (SCRAP)', value: 'SCRAP', color: 'text-slate-500 font-bold' },
  ];

  const isClothingCategory =
    filters.category.includes('ملابس') ||
    filters.category.includes('أحذية') ||
    filters.category.includes('الملابس');

  const isCosmeticsCategory =
    filters.category.includes('عطور') ||
    filters.category.includes('كوزمتك');

  const { currentUser } = useCart();
  const isVendorOrAdmin = !!currentUser && (currentUser.isSiteAdmin || currentUser.role === 'ADMIN' || currentUser.role === 'VENDOR');

  return (
    <aside className="w-full bg-white dark:bg-carbon-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
      
      {/* Mobile Close Button Header */}
      {onCloseMobileSidebar && (
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 lg:hidden">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-500" />
            تصفية التصنيفات والحالات
          </span>
          <button
            onClick={onCloseMobileSidebar}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 1. FIRST SECTION: جميع تصنيفات البضائع */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Grid className="w-4 h-4 text-amber-500" />
          جميع تصنيفات البضائع:
        </h3>

        <div className="space-y-1.5 text-xs">
          {categories.map((cat) => {
            const isActive = filters.category === cat;
            const count = categoryCounts[cat] || 0;

            const isGroupTitle = cat.startsWith('الملابس') || cat.startsWith('عطور وكوزمتك');

            return (
              <button
                key={cat}
                onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-black'
                    : isGroupTitle
                    ? 'bg-slate-100 dark:bg-carbon-800 font-extrabold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-2'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-carbon-800'
                }`}
              >
                <span className="truncate">{cat}</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-carbon-800 text-slate-600 dark:text-slate-400 font-mono font-bold">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conditional Warning Banner 1: CLOTHING */}
      {isClothingCategory && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-black">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>تنبيه مهم لصفحات الملابس والأحذية:</span>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed font-bold">
            تأكد من التاجر أن جميع الملابس والأحذية (رجالي، نسائي، أطفال والاكسسوارات) المعروضة في المتجر جديدة فقط ** (لا نستقبل أو نعرض الملابس المستعملة نهائياً).
          </p>
        </div>
      )}

      {/* Conditional Warning Banner 2: COSMETICS & PERFUMES */}
      {isCosmeticsCategory && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-black">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>تنبيه العطور والكوزمتك:</span>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed font-bold">
            شراء العطور والكوزماتك يجب أن يكون بتاريخ صلاحية مقبولة وعلى مسؤولية الزبون ... لذلك تحقق مع التاجر حول أمان استخدامه أو مسؤولية ذلك ...
          </p>
        </div>
      )}

      {/* 2. SECOND SECTION: أقسام المتجر الرئيسية */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-amber-500" />
          أقسام المتجر الرئيسية:
        </h3>
        
        <div className="space-y-1.5 text-xs">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, showSection: 'ALL' }))}
            className={`w-full text-right px-3.5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-between ${
              filters.showSection === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-carbon-800'
            }`}
          >
            <span>جميع المعروضات</span>
            <span className="text-[10px] opacity-80">الرئيسية</span>
          </button>

          <button
            onClick={() => setFilters((prev) => ({ ...prev, showSection: 'FEATURED' }))}
            className={`w-full text-right px-3.5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-between ${
              filters.showSection === 'FEATURED'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-carbon-800'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              المنتجات المميزة
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded-md font-black">
              VIP
            </span>
          </button>

          <button
            onClick={() => setFilters((prev) => ({ ...prev, showSection: 'RECENT' }))}
            className={`w-full text-right px-3.5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-between ${
              filters.showSection === 'RECENT'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-carbon-800'
            }`}
          >
            <span>المضافة حديثاً (آخر 24 ساعة)</span>
            <span className="text-[10px] bg-sky-500/20 text-sky-600 dark:text-sky-300 px-2 py-0.5 rounded-md font-black">
              جديد
            </span>
          </button>

          {isVendorOrAdmin && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, showSection: 'SOLD' }))}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-between ${
                filters.showSection === 'SOLD'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-carbon-800'
              }`}
            >
              <span>الأرشيف والمباع / المحجوز</span>
              <span className="text-[10px] bg-red-500/20 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-md font-black">
                مباع ⏱️
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 3. THIRD SECTION: حالة القطعة البالة */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-amber-500" />
          حالة القطعة البالة:
        </h3>

        <div className="space-y-1.5 text-xs">
          {conditionsList.map((cond) => {
            const isActive = filters.condition === cond.value;
            return (
              <button
                key={cond.value}
                onClick={() => setFilters((prev) => ({ ...prev, condition: cond.value }))}
                className={`w-full text-right px-3.5 py-2 rounded-xl font-bold transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-carbon-800 dark:text-amber-400 font-black shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-carbon-800'
                }`}
              >
                <span className={cond.color}>{cond.label}</span>
                {isActive && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>

    </aside>
  );
};
