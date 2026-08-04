'use client';

import React, { useState } from 'react';
import { Smartphone, QrCode, Sparkles } from 'lucide-react';
import { MobileQRCodeModal } from './MobileQRCodeModal';

export const PinnedBottomQRBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Pinned Fixed Bottom Button */}
      <div className="fixed bottom-4 left-4 z-40 hidden sm:block">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-2xl border-2 border-amber-300 hover:scale-105 active:scale-95 transition-all group"
          title="فتح الرابط عبر الباركود على هاتف آخر"
        >
          <div className="w-6 h-6 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center">
            <QrCode className="w-4 h-4" />
          </div>
          <span>مسح الباركود على هاتف آخر 📱</span>
        </button>
      </div>

      {/* Modal */}
      <MobileQRCodeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
