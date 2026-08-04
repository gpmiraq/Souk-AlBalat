'use client';

import React from 'react';
import { Product, Vendor } from '../types';
import { ProductCard } from './ProductCard';
import { PackageX, RefreshCw } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  vendors: Vendor[];
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  vendors,
  onResetFilters,
}) => {
  const vendorMap = new Map<string, Vendor>();
  vendors.forEach((v) => vendorMap.set(v.id, v));

  if (products.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-carbon-900 rounded-3xl p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-800 shadow-lg my-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
          <PackageX className="w-8 h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
          لا توجد بضائع مطابقة للتصنيف أو حالة الفلترة الحالية
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto mb-6">
          جرّب اختيار تصنيف آخر من السايدبار أو تغيير حالة الفلترة (جديد، أوبن بوكس، مستعمل).
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 mx-auto shadow-md transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>عرض جميع بضائع بالات العراق</span>
          </button>
        )}
      </div>
    );
  }

  return (
    /* Clean, Wide Amazon Responsive Grid (no squeezed 140px columns) */
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => {
        const vendor = vendorMap.get(product.vendorId) || vendors[0];

        return (
          <ProductCard
            key={product.id}
            product={product}
            vendor={vendor}
          />
        );
      })}
    </div>
  );
};
