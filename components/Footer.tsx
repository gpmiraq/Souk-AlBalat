'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Clock, Headphones, MapPin, Phone, Zap, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const Footer: React.FC = () => {
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://amazon-outlet.iq';

  return (
    <footer className="w-full bg-slate-900 dark:bg-carbon-950 text-white pt-12 pb-8 border-t border-slate-800 transition-colors">
      
      {/* 4 Core Trust Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 border-b border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-right">
          
          <div className="flex items-center gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white mb-0.5">فحص الموثوقية 100%</h4>
              <p className="text-xs text-slate-400">فحص شامل ومطابقة الصور قبل الشحن</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white mb-0.5">خصم الـ 24 ساعة</h4>
              <p className="text-xs text-slate-400">تطبيق تلقائي للخصم للبضائع غير المحجوزة</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white mb-0.5">شحن لكافة المحافظات</h4>
              <p className="text-xs text-slate-400">توصيل آمن وسريع لباب المنزل</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white mb-0.5">حجز الواتساب المباشر</h4>
              <p className="text-xs text-slate-400">تواصل فوري وتأكيد الطلب مع التجار</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Links & Permanent Fixed QR Code Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
              <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <span className="font-black text-xl text-white">سوق البالات</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            المنصة الأولى لبضائع واستوكات أمازون، البالات الأوروبية، وطرود DHL بالمفرد وبأفضل الأسعار في العراق مع ضمان الفحص الكامل.
          </p>
          <div className="text-xs text-slate-400 space-y-1 pt-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>بغداد - أربيل - البصرة (العراق)</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>دعم الواتساب: 0770 123 4567</span>
            </div>
          </div>
        </div>

        {/* Categories Links */}
        <div>
          <h4 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider mb-4">أبرز التصنيفات</h4>
          <ul className="space-y-2 text-xs text-slate-300">
            <li><Link href="/" className="hover:text-amber-400 transition-colors">إلكترونيات وسماعات سوني</Link></li>
            <li><Link href="/" className="hover:text-amber-400 transition-colors">ملابس وأحذية جديدة بالتاغ</Link></li>
            <li><Link href="/" className="hover:text-amber-400 transition-colors">عطور وكوزمتك عناية وتجميل</Link></li>
            <li><Link href="/" className="hover:text-amber-400 transition-colors">طرود DHL البريدية المغلقة</Link></li>
            <li><Link href="/" className="hover:text-amber-400 transition-colors">أجهزة كمبيوتر وملحقات لوجيتك</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider mb-4">معلومات وتجار</h4>
          <ul className="space-y-2 text-xs text-slate-300">
            <li><Link href="/admin" className="hover:text-amber-400 transition-colors font-bold text-amber-400">لوحة الإدارة (WordPress CMS)</Link></li>
            <li><Link href="/vendor/portal" className="hover:text-amber-400 transition-colors">بوابة التجار والبائعين</Link></li>
            <li><Link href="/about" className="hover:text-amber-400 transition-colors">من نحن</Link></li>
            <li><Link href="/contact" className="hover:text-amber-400 transition-colors">تواصل معنا</Link></li>
            <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">سياسة الخصوصية</Link></li>
            <li><Link href="/terms" className="hover:text-amber-400 transition-colors">شروط الاستخدام</Link></li>
          </ul>
        </div>

        {/* Permanent Fixed QR Code Scanner Box */}
        <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
            <QrCode className="w-4 h-4" />
            <span>مسح باركود المتجر على هاتف آخر:</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl flex-shrink-0 shadow-md">
              <QRCodeSVG value={currentUrl} size={64} level="M" />
            </div>

            <div className="text-[11px] text-slate-300 space-y-1">
              <p className="font-bold leading-tight">وجّه كاميرا هاتفك لمسح الرابط وفتح السلة بالموبايل فوراً</p>
              <span className="text-[10px] text-amber-400 font-mono block">www.amazon-outlet.iq</span>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright Footer Line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        جميع الحقوق محفوظة © {new Date().getFullYear()} سوق البالات - Amazon & DHL Outlet IQ
      </div>

    </footer>
  );
};
