'use client';

import React from 'react';
import { X, Download, Zap, ShieldCheck, Store, Tag } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface MarketingPosterModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MarketingPosterModal: React.FC<MarketingPosterModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { vendors } = useCart();

  if (!isOpen || !product) return null;

  const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.id}` : 'https://amazon-outlet.iq';

  const vendor = vendors.find((v) => v.id === product.vendorId) || vendors[0];

  const conditionLabel =
    product.condition === 'NEW'
      ? 'جديد بالختم (NEW)'
      : product.condition === 'OPEN_BOX'
      ? 'أوبن بوكس (Open Box)'
      : product.condition === 'USED'
      ? 'مستعمل درجة أولى'
      : 'فحم - أدوات (SCRAP)';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" />

      {/* Main Container Box */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-carbon-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 transition-colors my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>هوية تسويقية احترافية للمنتج (جاهزة للحفظ والتسويق)</span>
          </h3>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-carbon-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Marketing Identity Card: 2/3 Product Image Full Height (Right), 1/3 Info (Left) */}
        <div
          id="marketing-poster-card"
          className="relative w-full aspect-[16/9] sm:h-80 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-carbon-950 text-white overflow-hidden shadow-2xl border-2 border-amber-500/50 flex flex-row-reverse items-stretch"
        >
          {/* 2/3 Width: Product Image Full Height (Top to Bottom) */}
          <div className="w-2/3 relative h-full overflow-hidden border-l-2 border-amber-500/30 flex-shrink-0 bg-slate-950">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />

            {/* Condition Badge Stamp over photo */}
            <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-xl shadow-lg border border-amber-300">
              {conditionLabel}
            </div>

            {/* Subtle Watermark Stamp */}
            <div className="absolute bottom-3 right-3 text-white/30 text-[10px] font-black tracking-widest uppercase pointer-events-none">
              سوق البالات 🇮🇶
            </div>
          </div>

          {/* 1/3 Width: Product Info, Vendor Name, Price, and QR Code */}
          <div className="w-1/3 p-4 sm:p-5 flex flex-col justify-between text-right space-y-2 bg-gradient-to-b from-slate-900 to-slate-950">
            
            {/* Header Brand & Vendor Name */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs">
                <Zap className="w-4 h-4 fill-amber-400 flex-shrink-0" />
                <span className="truncate">سوق البالات</span>
              </div>

              {/* Vendor Name right under site logo */}
              <div className="text-[11px] text-amber-200/90 font-extrabold flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                <Store className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span className="truncate">التاجر: {vendor?.name || 'المركز الذهبي'}</span>
              </div>

              {/* Title */}
              <h4 className="font-black text-xs sm:text-sm text-white leading-snug line-clamp-2 pt-1">
                {product.title}
              </h4>

              {/* Optional Model Display */}
              {product.model && product.model.trim() !== '' && (
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  الموديل: {product.model}
                </div>
              )}
            </div>

            {/* Price Box */}
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-center">
              <span className="text-[10px] text-slate-300 block font-bold">السعر المباشر:</span>
              <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
                {product.outletPrice.toLocaleString('ar-IQ')} <span className="text-[10px]">د.ع</span>
              </div>
            </div>

            {/* QR Code & Site Link */}
            <div className="pt-2 border-t border-white/10 flex items-center gap-2">
              <div className="bg-white p-1 rounded-lg flex-shrink-0 shadow">
                <QRCodeSVG value={currentUrl} size={36} level="M" />
              </div>
              <div className="text-[8px] leading-tight font-bold text-slate-300">
                <span className="block text-white font-extrabold">امسح للتسوق 📍</span>
                <span className="font-mono text-amber-400">amazon-outlet.iq</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            * يمكنك حفظ البطاقة أو التقاط شاشة (Screenshot) ونشرها فوراً على حساباتك للتسويق.
          </p>

          <button
            onClick={() => {
              window.print();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>حفظ البوستر كصورة 📸</span>
          </button>
        </div>

      </div>
    </div>
  );
};
