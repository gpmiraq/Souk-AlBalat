'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Check, Clock, Eye, Download, Flag,
  ShieldCheck, Star, Zap
} from 'lucide-react';
import { ConditionType, Product, Vendor } from '../types';
import { useCart } from '../context/CartContext';
import { ProductImageWithStamp } from './ProductImageWithStamp';
import { MarketingPosterModal } from './MarketingPosterModal';
import { ReportModal } from './ReportModal';

interface ProductCardProps {
  product: Product;
  vendor: Vendor;
}

const CONDITION_MAP: Record<ConditionType, { label: string; badgeClass: string }> = {
  NEW:      { label: 'جديد بالختم', badgeClass: 'bg-emerald-600 text-white' },
  OPEN_BOX: { label: 'أوبن بوكس',  badgeClass: 'bg-sky-600 text-white' },
  USED:     { label: 'درجة أولى',   badgeClass: 'bg-amber-500 text-slate-950' },
  SCRAP:    { label: 'فحم - أدوات', badgeClass: 'bg-slate-800 text-white' },
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, vendor }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const publishedTime = new Date(product.publishedAt).getTime();
  const is24HoursPassed = Date.now() - publishedTime >= 24 * 3600 * 1000;
  const activePrice = is24HoursPassed ? product.outletPrice : product.retailPrice;
  const discountPercent = Math.round(
    ((product.retailPrice - product.outletPrice) / product.retailPrice) * 100
  );
  const savedAmount = product.retailPrice - product.outletPrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.status !== 'AVAILABLE') return;
    const success = addToCart(product);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const conditionBadge = CONDITION_MAP[product.condition] || CONDITION_MAP.USED;
  const isReserved = product.status === 'RESERVED';
  const isSold    = product.status === 'SOLD';
  const isAvailable = product.status === 'AVAILABLE';

  return (
    <>
      <div
        className={`group relative bg-white dark:bg-carbon-900 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
          isAvailable
            ? 'border-slate-200 dark:border-slate-800 hover:border-amber-400/60'
            : isReserved
            ? 'border-amber-400/50 bg-amber-50/20 dark:bg-amber-950/10'
            : 'border-slate-200 dark:border-slate-800 opacity-70'
        }`}
      >
        {/* ── 1. SQUARE IMAGE WITH AMAZON BADGES ───────────────────────── */}
        <div className="relative w-full aspect-square bg-slate-50 dark:bg-carbon-950 overflow-hidden border-b border-slate-100 dark:border-slate-800">
          <Link href={`/product/${product.id}`} className="block w-full h-full">
            <ProductImageWithStamp
              src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'}
              alt={product.title}
            />
          </Link>

          {/* Condition Tag — Top Right */}
          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-sm ${conditionBadge.badgeClass}`}>
              {conditionBadge.label}
            </span>
          </div>

          {/* Discount Badge — Top Left */}
          {discountPercent > 0 && isAvailable && (
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white shadow-sm">
                -{discountPercent}%
              </span>
            </div>
          )}

          {/* Status overlay for SOLD */}
          {isSold && (
            <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] z-10 flex items-center justify-center pointer-events-none">
              <span className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-black text-xs shadow-xl rotate-[-12deg]">
                مباع / الأرشيف ⏱️
              </span>
            </div>
          )}

          {/* RESERVED ribbon */}
          {isReserved && (
            <div className="absolute top-8 right-2.5 z-10 pointer-events-none">
              <div className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow animate-pulse">
                <Clock className="w-2.5 h-2.5" />
                محجوز ⏱️
              </div>
            </div>
          )}
        </div>

        {/* ── 2. COMPACT, CLEAN PRODUCT DETAILS ─────────────────────────── */}
        <div className="p-3 flex-1 flex flex-col justify-between space-y-2 text-right" dir="rtl">
          
          {/* Vendor Name & Actions Header */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="truncate">{vendor?.name || 'التاجر المعتمد'}</span>
            </span>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsPosterModalOpen(true); }}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-carbon-800 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-0.5"
                title="حفظ البوستر"
              >
                <Download className="w-2.5 h-2.5" />
                بوستر
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsReportModalOpen(true); }}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-colors flex items-center gap-0.5"
                title="إبلاغ"
              >
                <Flag className="w-2.5 h-2.5" />
                إبلاغ
              </button>
            </div>
          </div>

          {/* Product Title (2 lines max, soft typography) */}
          <Link href={`/product/${product.id}`} className="block">
            <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {product.title}
            </h3>
          </Link>

          {/* Rating & Stats Info Line */}
          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
              <span>4.8</span>
            </div>
            <span className="text-slate-400 font-mono">({product.viewsCount || 342} مشاهدة)</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" /> فحص 100%
            </span>
          </div>

          {/* Clean Price Section (Amazon Style: "السعر:" + Discount + Savings) */}
          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">السعر:</span>
                <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                  {activePrice.toLocaleString('en-US')} <span className="text-[10px] font-sans">د.ع</span>
                </span>
              </div>
              
              {discountPercent > 0 && (
                <span className="text-[11px] text-slate-400 line-through font-mono">
                  كان: {product.retailPrice.toLocaleString('en-US')}
                </span>
              )}
            </div>

            {/* Savings banner if discounted */}
            {discountPercent > 0 && isAvailable && (
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                وفّرت {savedAmount.toLocaleString('en-US')} د.ع ({discountPercent}% خصم)
              </div>
            )}
          </div>

          {/* Qty & Model */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            <span>الكمية: <strong className="text-slate-700 dark:text-slate-300 font-mono">{product.quantity}</strong></span>
            {product.model && <span className="font-mono text-[9px] text-slate-400 truncate max-w-[80px]">{product.model}</span>}
          </div>

          {/* Single-Line Compact CTA Button */}
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] whitespace-nowrap overflow-hidden text-ellipsis mt-1 ${
              added
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : isAvailable
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : isSold
                ? 'bg-slate-200 dark:bg-carbon-800 text-slate-400 cursor-not-allowed'
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 cursor-not-allowed'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>تمت الإضافة للسلة ✓</span>
              </>
            ) : isSold ? (
              <span>مباع / الأرشيف ⏱️</span>
            ) : isReserved ? (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>محجوز مؤقتاً</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>إضافة إلى عربة التسوق</span>
              </>
            )}
          </button>

        </div>
      </div>

      <MarketingPosterModal
        product={product}
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
      />
      <ReportModal
        product={product}
        vendor={vendor}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </>
  );
};
