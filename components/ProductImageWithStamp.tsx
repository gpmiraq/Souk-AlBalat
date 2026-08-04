'use client';

import React from 'react';

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

      {/* ─── Diagonal Center Watermark Stamp ───────────────────────────────
          Baked into the image render, more visible than before.
          opacity-[0.22] = شبه مرئي لكن يتكاد أن ترى
      ─────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.22 }}
      >
        {/* Stamp border box rotated */}
        <div
          className="flex flex-col items-center gap-1"
          style={{ transform: 'rotate(-30deg)' }}
        >
          {/* Outer Border Frame */}
          <div
            className="border-[3px] border-white px-5 py-2 rounded-xl text-white text-center"
            style={{
              boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
              backdropFilter: 'none',
            }}
          >
            <div
              className="font-black tracking-[0.25em] uppercase"
              style={{ fontSize: 'clamp(10px, 2.5vw, 18px)', letterSpacing: '0.2em', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
            >
              سوق البالات
            </div>
            <div
              className="font-bold tracking-widest"
              style={{ fontSize: 'clamp(7px, 1.5vw, 11px)', opacity: 0.85, textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
            >
              AMAZON OUTLET IQ 🇮🇶
            </div>
          </div>

          {/* Horizontal divider line across the stamp */}
          <div
            className="w-full h-[2px] bg-white"
            style={{ opacity: 0.7, marginTop: -2 }}
          />
        </div>
      </div>

      {/* ─── Subtle Bottom-Center text watermark (second layer) ───────────
          Extra branding line at very bottom
      ─────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 inset-x-0 text-center py-1 pointer-events-none"
        style={{ opacity: 0.18 }}
      >
        <span
          className="text-white font-black tracking-[0.4em] uppercase"
          style={{ fontSize: 'clamp(7px, 1.2vw, 10px)', textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}
        >
          سوق البالات — SOUK AL BALAT
        </span>
      </div>
    </div>
  );
};
