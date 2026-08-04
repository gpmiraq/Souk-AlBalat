'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X, Trash2, Plus, Minus, Send, ShieldCheck,
  MapPin, ShoppingBag, AlertCircle, User, Phone, LogIn
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const IRAQ_GOVERNORATES = [
  'بغداد','البصرة','نينوى (الموصل)','أربيل','السليمانية','دهوك',
  'النجف الأشرف','كربلاء المقدسة','بابل (الحلة)','كركوك',
  'ذي قار (الناصرية)','الأنبار (الرمادي)','ديالي (بعقوبة)',
  'صلاح الدين (تكريت)','واسط (الكوت)','القادسية (الديوانية)',
  'ميسان (العمارة)','المثنى (السماوة)',
];

export const SplitCartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    vendorSubCarts,
    totalItemCount,
    totalGrandPrice,
    updateQuantity,
    clearVendorSubCart,
    generateWhatsAppLink,
    currentUser,
    setIsAuthModalOpen,
  } = useCart();

  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);

  if (!isCartOpen) return null;

  // Derive customer info from logged-in user profile
  const customerName = currentUser?.fullName || '';
  const customerPhone = currentUser?.phone || '';
  const customerCity = currentUser?.city || '';
  const customerAddress = currentUser?.address || '';
  const isLoggedIn = !!currentUser;
  const hasCompleteProfile = isLoggedIn && !!customerPhone && customerPhone !== '07709988776';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-lg bg-white dark:bg-carbon-900 shadow-2xl flex flex-col">

          {/* ── Header ── */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-carbon-950 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  سلة المشتريات المقسمة
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                    {totalItemCount} قطع
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  يتم تقسيم الطلب تلقائياً إلى سلات فرعية حسب التاجر
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-carbon-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

            {/* ─ Customer Info Card (read-only from profile) ─ */}
            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-200 dark:border-amber-500/30 p-4">
              <h3 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                معلومات الحجز والتوصيل (تضمّن في طلب الواتساب):
              </h3>

              {isLoggedIn ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Name */}
                  <div className="bg-white dark:bg-carbon-900 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-400 text-[10px] font-bold mb-0.5">الاسم الكامل:</p>
                    <p className="font-black text-slate-900 dark:text-white truncate">{customerName || '—'}</p>
                  </div>
                  {/* Phone */}
                  <div className="bg-white dark:bg-carbon-900 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-400 text-[10px] font-bold mb-0.5">رقم الهاتف (واتساب):</p>
                    <p className="font-black text-slate-900 dark:text-white font-mono">
                      {hasCompleteProfile ? customerPhone : <span className="text-amber-500">لم يُضف بعد</span>}
                    </p>
                  </div>
                  {/* City */}
                  <div className="bg-white dark:bg-carbon-900 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-400 text-[10px] font-bold mb-0.5">المحافظة (18 محافظة):</p>
                    <p className="font-black text-slate-900 dark:text-white">{customerCity || 'بغداد'}</p>
                  </div>
                  {/* Address */}
                  <div className="bg-white dark:bg-carbon-900 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 col-span-2">
                    <p className="text-slate-400 text-[10px] font-bold mb-0.5">العنوان التفصيلي:</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      {customerAddress || <span className="text-amber-500">لم يُضف بعد — أكمل بياناتك من الملف الشخصي</span>}
                    </p>
                  </div>
                </div>
              ) : (
                /* Not logged in prompt */
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-bold">
                    سجّل دخولك لإتمام الطلب
                  </p>
                  <button
                    onClick={() => { setIsCartOpen(false); setIsAuthModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    تسجيل الدخول
                  </button>
                </div>
              )}
            </div>

            {/* ─ Disclaimer Checkbox ─ */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={disclaimerAgreed}
                  onChange={e => setDisclaimerAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 flex-shrink-0"
                />
                <span className="text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 font-bold">
                  <strong>إخلاء مسؤولية:</strong> إن الموقع هو وسيلة ربط بينك وبين تجار وبائعي الأمازون والبالات، ولا يتحمل مسؤولية التعامل والموثوقية المباشرة.
                </span>
              </label>
            </div>

            {/* ─ Empty Cart Notice ─ */}
            {vendorSubCarts.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-carbon-800 text-slate-300 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300">السلة فارغة حالياً</h4>
                <p className="text-xs text-slate-400 mt-1">تصفح البضائع وأضف منتجاً لسلتك</p>
              </div>
            ) : (
              <div className="space-y-5">
                {vendorSubCarts.map((subCart, vIdx) => {
                  const whatsappUrl = generateWhatsAppLink(subCart.vendor.id);
                  const isDetailsMissing = !hasCompleteProfile;
                  const isButtonDisabled = isDetailsMissing || !disclaimerAgreed;

                  return (
                    <div
                      key={subCart.vendor.id}
                      className="bg-white dark:bg-carbon-950 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                    >
                      {/* Vendor Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-carbon-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
                            {vIdx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                {subCart.vendor.name}
                              </h4>
                              {subCart.vendor.verifiedBadge && (
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <MapPin className="w-3 h-3" />
                              {subCart.vendor.location}
                              <span>•</span>
                              <span className="text-amber-500 font-bold">★ {subCart.vendor.rating}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => clearVendorSubCart(subCart.vendor.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="حذف سلة هذا التاجر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Items */}
                      <div className="p-3 space-y-2.5">
                        {subCart.items.map(item => (
                          <div
                            key={item.product.id}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-carbon-900 border border-slate-100 dark:border-slate-800"
                          >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {item.product.title}
                              </h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                {item.product.model && (
                                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[80px]">
                                    {item.product.model}
                                  </span>
                                )}
                                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                                  {item.product.outletPrice.toLocaleString('en-US')} د.ع
                                </span>
                              </div>
                            </div>
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1 bg-white dark:bg-carbon-950 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black text-slate-900 dark:text-white w-5 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Sub-total */}
                      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-carbon-900/50 text-xs">
                        <span className="font-bold text-slate-500 dark:text-slate-400">
                          حساب سلة ({subCart.vendor.name}):
                        </span>
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {subCart.subTotal.toLocaleString('en-US')} <span className="text-amber-500">د.ع</span>
                        </span>
                      </div>

                      {/* Warning messages */}
                      <div className="px-3 pb-3">
                        {!isLoggedIn && (
                          <div className="mb-2 text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 p-2 rounded-xl flex items-center gap-1.5 font-bold">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            يرجى تسجيل الدخول أولاً لإتمام الشراء
                          </div>
                        )}
                        {isLoggedIn && !hasCompleteProfile && (
                          <div className="mb-2 text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 p-2 rounded-xl flex items-center gap-1.5 font-bold">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            يرجى إكمال بيانات ملفك (رقم الهاتف) لتمكين الشراء
                          </div>
                        )}
                        {!disclaimerAgreed && hasCompleteProfile && (
                          <div className="mb-2 text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 p-2 rounded-xl flex items-center gap-1.5 font-bold">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            يرجى التحديد على خيار إخلاء المسؤولية لتمكين الشراء
                          </div>
                        )}

                        {/* WhatsApp Order Button */}
                        <a
                          href={isButtonDisabled ? '#' : whatsappUrl}
                          target={isButtonDisabled ? '_self' : '_blank'}
                          rel="noopener noreferrer"
                          onClick={e => isButtonDisabled && e.preventDefault()}
                          className={`w-full mt-1 py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                            isButtonDisabled
                              ? 'bg-slate-200 dark:bg-carbon-800 text-slate-400 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.98]'
                          }`}
                        >
                          <Send className="w-4 h-4" />
                          تأكيد وحجز عبر واتساب [{subCart.vendor.name}]
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Grand Total Footer ── */}
          {vendorSubCarts.length > 0 && (
            <div className="flex-shrink-0 px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-carbon-950">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-600 dark:text-slate-400 text-sm">
                  المجموع الكلي لجميع السلات ({vendorSubCarts.length} تجار):
                </span>
                <span className="font-black text-xl text-amber-600 dark:text-amber-400 font-mono">
                  {totalGrandPrice.toLocaleString('en-US')} <span className="text-sm">د.ع</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 text-center font-medium mt-1">
                * يتم تأكيد كل سلة فرعية مباشرة مع التاجر المختص عبر الواتساب للحصول على التوصيل السريع.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
