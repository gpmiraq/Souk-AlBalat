'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ProductImageWithStampProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProductImageWithStamp: React.FC<ProductImageWithStampProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
}) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://souk-al-balat.vercel.app';

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Base Product Image */}
      <img
        src={src}
        alt={alt}
        className={className}
        draggable={false}
        style={{ userSelect: 'none', WebkitUserDrag: 'none' } as React.CSSProperties}
      />

      {/* ─── Center Diagonal Watermark Stamp (سوق البالات) ───────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.28 }}
      >
        <div
          className="flex flex-col items-center gap-1 border-[3px] border-white px-5 py-2 rounded-2xl text-white text-center shadow-lg"
          style={{ transform: 'rotate(-25deg)' }}
        >
          <div
            className="font-black tracking-[0.2em] uppercase"
            style={{ fontSize: 'clamp(11px, 2.8vw, 20px)', textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}
          >
            سوق البالات
          </div>
          <div
            className="font-bold tracking-widest text-[9px] text-amber-300"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}
          >
            AMAZON & DHL OUTLET IQ 🇮🇶
          </div>
        </div>
      </div>

      {/* ─── Bottom-Left QR Barcode Stamp Baked into Image ───────────── */}
      <div className="absolute bottom-2 left-2 z-10 bg-slate-950/85 backdrop-blur-md text-white p-1.5 rounded-xl border border-white/20 shadow-lg flex items-center gap-1.5 pointer-events-none">
        <div className="bg-white p-0.5 rounded-md">
          <QRCodeSVG value={currentUrl} size={28} level="L" />
        </div>
        <div className="flex flex-col text-[8px] leading-tight font-black">
          <span className="text-amber-400">سوق البالات</span>
          <span className="text-slate-300 font-mono">SCAN TO OPEN</span>
        </div>
      </div>
    </div>
  );
};
