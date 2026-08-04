'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Check, Settings } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('souk_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('souk_cookie_consent', JSON.stringify({ analytics: true, marketing: true, accepted_at: new Date().toISOString() }));
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('souk_cookie_consent', JSON.stringify({ analytics: false, marketing: false, accepted_at: new Date().toISOString() }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-5"
      role="dialog"
      aria-label="إشعار ملفات تعريف الارتباط"
    >
      <div className="max-w-4xl mx-auto bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-slate-950/60 overflow-hidden">
        
        {/* Main Banner */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          
          {/* Cookie Icon */}
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-6 h-6 text-amber-400" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-white text-sm mb-1">🍪 نستخدم ملفات تعريف الارتباط (Cookies)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك، تذكر تفضيلاتك، تحليل الأداء، وعرض محتوى مناسب لك.
              باستخدامك للموقع، تقر بالاطلاع على{' '}
              <Link href="/privacy" className="text-amber-400 hover:text-amber-300 underline">سياسة الخصوصية</Link>
              {' '}و{' '}
              <Link href="/terms" className="text-amber-400 hover:text-amber-300 underline">شروط الاستخدام</Link>.
            </p>
          </div>

          {/* Close */}
          <button
            onClick={handleAcceptEssential}
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details Section */}
        {showDetails && (
          <div className="px-5 sm:px-6 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t border-slate-800 pt-4">
            {[
              { title: '🔒 ضرورية', desc: 'تسجيل الدخول وجلسات المستخدم وسلة التسوق', required: true },
              { title: '📊 تحليلية', desc: 'إحصائيات الزيارات والمشاهدات لتحسين الموقع', required: false },
              { title: '📢 تسويقية', desc: 'عروض وإعلانات مخصصة بناء على تفضيلاتك', required: false },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{item.title}</span>
                  {item.required
                    ? <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">مطلوبة</span>
                    : <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded font-bold">اختياري</span>
                  }
                </div>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-5 sm:px-6 pb-5 flex flex-wrap items-center gap-2">
          <button
            onClick={handleAcceptAll}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md"
          >
            <Check className="w-3.5 h-3.5" />
            <span>قبول الكل</span>
          </button>
          <button
            onClick={handleAcceptEssential}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all border border-slate-700"
          >
            الضرورية فقط
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-white font-bold rounded-xl text-xs transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{showDetails ? 'إخفاء التفاصيل' : 'تخصيص الإعدادات'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
