'use client';

import React, { useState } from 'react';
import { Home, Search, ShoppingBag, HelpCircle, QrCode } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { MobileQRCodeModal } from './MobileQRCodeModal';

interface MobileNavProps {
  onOpenConditionGuide: () => void;
  onFocusSearch: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  onOpenConditionGuide,
  onFocusSearch,
}) => {
  const { totalItemCount, setIsCartOpen, vendorSubCarts } = useCart();
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);

  return (
    <>
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-carbon-950/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-lg px-2 py-1.5 shadow-2xl">
        <div className="grid grid-cols-5 gap-1 items-center text-center">
          
          {/* Home */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center justify-center py-1 text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-1">الرئيسية</span>
          </button>

          {/* Search shortcut */}
          <button
            onClick={onFocusSearch}
            className="flex flex-col items-center justify-center py-1 text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
          >
            <Search className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-1">بحث</span>
          </button>

          {/* QR Scanner */}
          <button
            onClick={() => setIsQRCodeOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors"
          >
            <QrCode className="w-5 h-5 text-amber-500" />
            <span className="text-[9px] font-black mt-1">الباركود</span>
          </button>

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors relative"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-slate-900 text-amber-400 text-[9px] font-black flex items-center justify-center border border-amber-400">
                  {totalItemCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold mt-1 text-amber-600 dark:text-amber-400">
              السلة {vendorSubCarts.length > 0 ? `(${vendorSubCarts.length})` : ''}
            </span>
          </button>

          {/* Condition Guide */}
          <button
            onClick={onOpenConditionGuide}
            className="flex flex-col items-center justify-center py-1 text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-sky-500" />
            <span className="text-[9px] font-bold mt-1">دليل الحالات</span>
          </button>

        </div>
      </div>

      <MobileQRCodeModal
        isOpen={isQRCodeOpen}
        onClose={() => setIsQRCodeOpen(false)}
      />
    </>
  );
};
