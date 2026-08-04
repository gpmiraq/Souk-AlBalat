'use client';

import React, { useId } from 'react';
import { Search, X, ArrowUpDown, Tag, Layers } from 'lucide-react';
import { SearchFilters, Vendor } from '../types';

interface SmartSearchProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  vendors: Vendor[];
  totalResultsCount: number;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({
  filters,
  setFilters,
  vendors,
  totalResultsCount,
  searchInputRef,
}) => {
  const searchInputId = useId();
  const conditionTabs: { label: string; value: string; badgeClass: string }[] = [
    { label: 'الكل', value: 'ALL', badgeClass: 'bg-slate-200 dark:bg-carbon-800 text-slate-800 dark:text-slate-200' },
    { label: 'جديد (NEW)', value: 'NEW', badgeClass: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' },
    { label: 'أوبن بوكس (Open Box)', value: 'OPEN_BOX', badgeClass: 'badge-openbox' },
    { label: 'مستعمل (USED)', value: 'USED', badgeClass: 'badge-gradeB' },
    { label: 'فحم - لا يعمل (SCRAP)', value: 'SCRAP', badgeClass: 'badge-asis' },
  ];

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, query: e.target.value }));
  };

  const clearQuery = () => {
    setFilters((prev) => ({ ...prev, query: '' }));
  };

  const resetAllFilters = () => {
    setFilters({
      query: '',
      condition: 'ALL',
      category: 'الكل',
      vendorId: 'ALL',
      showSection: 'ALL',
      minPrice: 0,
      maxPrice: 2000000,
      sortBy: 'relevance',
    });
  };

  const isFiltered =
    filters.query !== '' ||
    filters.condition !== 'ALL' ||
    filters.vendorId !== 'ALL' ||
    filters.category !== 'الكل' ||
    filters.showSection !== 'ALL';

  return (
    <div className="w-full bg-white dark:bg-carbon-900 rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-200 dark:border-slate-800 mb-6 transition-colors">
      
      {/* Floating Smart Search Input */}
      <div className="relative mb-3">
        <label htmlFor={searchInputId} className="sr-only">
          بحث ذكي: ابحث بالعنوان، الموديل، التاجات...
        </label>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Search className="w-5 h-5 text-amber-500" />
        </div>
        
        <input
          id={searchInputId}
          ref={searchInputRef}
          type="text"
          value={filters.query}
          onChange={handleQueryChange}
          placeholder="بحث ذكي: ابحث بالعنوان، الموديل، التاجات (مثل Sony, OPEN BOX, DHL, شاحن)..."
          className="w-full pr-12 pl-10 py-3 sm:py-3.5 rounded-2xl bg-slate-50 dark:bg-carbon-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-medium shadow-inner transition-all"
        />

        {filters.query && (
          <button
            onClick={clearQuery}
            className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Condition Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-amber-500" />
          الحالة:
        </span>
        {conditionTabs.map((tab) => {
          const isActive = filters.condition === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setFilters((prev) => ({ ...prev, condition: tab.value }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                isActive
                  ? 'ring-2 ring-amber-500 scale-105 shadow-md font-black ' + tab.badgeClass
                  : 'bg-slate-100 dark:bg-carbon-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Controls: Vendor & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          {/* Vendor Filter */}
          <select
            value={filters.vendorId}
            onChange={(e) => setFilters((prev) => ({ ...prev, vendorId: e.target.value }))}
            className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 dark:bg-carbon-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="ALL">جميع التجار ({vendors.length})</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} (★{v.rating})
              </option>
            ))}
          </select>
        </div>

        {/* Right Side: Sorting & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as SearchFilters['sortBy'],
                }))
              }
              className="px-2.5 py-1.5 rounded-xl font-bold bg-slate-100 dark:bg-carbon-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              <option value="relevance">الأعلى تطابقاً (Relevance)</option>
              <option value="price_low">الأقل سعراً</option>
              <option value="price_high">الأعلى سعراً</option>
              <option value="newest">الأحدث وصولاً</option>
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={resetAllFilters}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>إعادة ضبط</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>
          معروض حالياً: <strong className="text-amber-500 font-bold">{totalResultsCount}</strong> قطعة
        </span>
        {filters.category !== 'الكل' && (
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-bold">
            التصنيف: {filters.category}
          </span>
        )}
      </div>

    </div>
  );
};
