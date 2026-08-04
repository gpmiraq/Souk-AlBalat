'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const FloatingWhatsAppSupport: React.FC = () => {
  const { currentUser, setIsAuthModalOpen, siteSettings } = useCart();

  const handleSupportClick = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const supportMsg = `مرحباً إدارة دعم ${siteSettings.siteName}، أنا الزبون *${currentUser.fullName}* (هاتف: ${currentUser.phone})، أحتاج إلى استفسار ومساعدة.`;
    const whatsappUrl = `https://wa.me/${siteSettings.adminPhone}?text=${encodeURIComponent(supportMsg)}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed right-4 bottom-20 sm:bottom-6 z-40">
      <button
        onClick={handleSupportClick}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-2xl shadow-emerald-600/40 border border-emerald-400/40 transition-all hover:scale-105 active:scale-95"
        title="مراسلة الدعم الفني عبر الواتساب"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-white stroke-emerald-600" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
        </div>

        <span className="font-black text-xs">
          الدعم
        </span>
      </button>
    </div>
  );
};
