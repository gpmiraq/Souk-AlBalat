'use client';

import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { Product } from '../types';

interface VendorToggleBarProps {
  products: Product[];
  onToggleAllStock: (inStock: boolean) => void;
}

export const VendorToggleBar: React.FC<VendorToggleBarProps> = ({
  products,
  onToggleAllStock,
}) => {
  const inStockCount = products.filter((p) => p.status === 'AVAILABLE').length;
  const soldOutCount = products.length - inStockCount;

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-carbon-900 to-slate-900 text-white rounded-2xl p-3 sm:p-4 mb-6 border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-extrabold text-amber-400">لوحة تجارب التوفر لمشرفي المتجر:</span>
        <span className="text-slate-300 hidden sm:inline">
          متوفر: <strong className="text-emerald-400 font-bold">{inStockCount}</strong> | مباع / محجوز: <strong className="text-red-400 font-bold">{soldOutCount}</strong>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleAllStock(true)}
          className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold transition-all flex items-center gap-1 active:scale-95 text-[11px]"
        >
          <ToggleRight className="w-4 h-4 text-emerald-400" />
          <span>جعْل الكل (متوفر للبيع)</span>
        </button>

        <button
          onClick={() => onToggleAllStock(false)}
          className="px-3 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold transition-all flex items-center gap-1 active:scale-95 text-[11px]"
        >
          <ToggleLeft className="w-4 h-4 text-red-400" />
          <span>معاينة قسم (المباع)</span>
        </button>
      </div>
    </div>
  );
};
