'use client';

import React, { useState, useId } from 'react';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, Send, ShieldCheck, MapPin, Star, ShoppingBag, UserCheck, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const IRAQ_GOVERNORATES = [
  'بغداد',
  'البصرة',
  'نينوى (الموصل)',
  'أربيل',
  'السليمانية',
  'دهوك',
  'النجف الأشرف',
  'كربلاء المقدسة',
  'بابل (الحلة)',
  'كركوك',
  'ذي قار (الناصرية)',
  'الأنبار (الرمادي)',
  'ديالي (بعقوبة)',
  'صلاح الدين (تكريت)',
  'واسط (الكوت)',
  'القادسية (الديوانية)',
  'ميسان (العمارة)',
  'المثنى (السماوة)',
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
    customerDetails,
    setCustomerDetails,
    generateWhatsAppLink,
  } = useCart();

  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);

  const fullNameId = useId();
  const phoneId = useId();
  const cityId = useId();
  const addressId = useId();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-lg bg-white dark:bg-carbon-900 shadow-2xl flex flex-col justify-between transition-colors">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-carbon-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>سلة المشتريات المقسمة</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                    {totalItemCount} قطع
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Customer Details Entry Box */}
            <div className="bg-slate-50 dark:bg-carbon-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                معلومات الحجز والتوصيل (تضمّن في طلب الواتساب):
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label htmlFor={fullNameId} className="block text-slate-600 dark:text-slate-400 font-bold mb-1">الاسم الكامل:</label>
                  <input
                    id={fullNameId}
                    type="text"
                    placeholder="مثال: أحمد العبيدي"
                    value={customerDetails.fullName}
                    onChange={(e) => setCustomerDetails((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-carbon-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label htmlFor={phoneId} className="block text-slate-600 dark:text-slate-400 font-bold mb-1">رقم الهاتف (واتساب):</label>
                  <input
                    id={phoneId}
                    type="text"
                    placeholder="07701234567"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-carbon-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label htmlFor={cityId} className="block text-slate-600 dark:text-slate-400 font-bold mb-1">المحافظة (18 محافظة):</label>
                  <select
                    id={cityId}
                    value={customerDetails.city}
                    onChange={(e) => setCustomerDetails((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-carbon-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                  >
                    {IRAQ_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={addressId} className="block text-slate-600 dark:text-slate-400 font-bold mb-1">العنوان التفصيلي:</label>
                  <input
                    id={addressId}
                    type="text"
                    placeholder="الحي / الشارع / أقرب نقطة دالة"
                    value={customerDetails.address}
                    onChange={(e) => setCustomerDetails((prev) => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-carbon-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Disclaimer Required Checkbox Box */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-slate-800 dark:text-slate-200 font-bold">
                <input
                  type="checkbox"
                  checked={disclaimerAgreed}
                  onChange={(e) => setDisclaimerAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="leading-relaxed text-[11px]">
                  <strong>إخلاء مسؤولية:</strong> إن الموقع هو وسيلة ربط بينك وبين تجار وبائعي الأمازون والبالات، ولا يتحمل مسؤولية التعامل والموثوقية المباشرة.
                </span>
              </label>
            </div>

            {/* Empty Cart Notice */}
            {vendorSubCarts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-carbon-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300">السلة فارغة حالياً</h4>
                <p className="text-xs text-slate-400 mt-1">تصفح بضائع بالات العراق وأضف المنتجات لسلتك</p>
              </div>
            ) : (
              /* Isolated Sub-Carts List per Vendor */
              <div className="space-y-6">
                {vendorSubCarts.map((subCart, vIdx) => {
                  const whatsappUrl = generateWhatsAppLink(subCart.vendor.id);
                  const isDetailsMissing = !customerDetails.fullName || !customerDetails.phone;
                  const isButtonDisabled = isDetailsMissing || !disclaimerAgreed;

                  return (
                    <div
                      key={subCart.vendor.id}
                      className="bg-white dark:bg-carbon-950 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-4 shadow-md transition-all relative overflow-hidden"
                    >
                      {/* Sub-Cart Vendor Header Banner */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-sm">
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
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {subCart.vendor.location}
                              </span>
                              <span>•</span>
                              <span className="text-amber-500 font-bold">★ {subCart.vendor.rating}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => clearVendorSubCart(subCart.vendor.id)}
                          className="text-xs text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="حذف سلة هذا التاجر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Items in this Vendor Sub-Cart */}
                      <div className="space-y-3 mb-4">
                        {subCart.items.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-carbon-900 border border-slate-100 dark:border-slate-800"
                          >
                            <div className="relative w-12 h-12 rounded-lg bg-slate-200 dark:bg-carbon-800 overflow-hidden flex-shrink-0">
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
                                <span className="text-[10px] font-mono text-slate-400">
                                  {item.product.model}
                                </span>
                                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                                  {item.product.outletPrice.toLocaleString('en-US')} د.ع
                                </span>
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1.5 bg-white dark:bg-carbon-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black text-slate-900 dark:text-white w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Sub-total Header */}
                      <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800 mb-3 text-xs">
                        <span className="font-bold text-slate-600 dark:text-slate-400">
                          حساب سلة ({subCart.vendor.name}):
                        </span>
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {subCart.subTotal.toLocaleString('en-US')} د.ع
                        </span>
                      </div>

                      {/* Warnings */}
                      {isDetailsMissing && (
                        <div className="mb-2 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-xl flex items-center gap-1.5 font-bold">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>يرجى كتابة الاسم ورقم الهاتف أعلاه لإكمال الشراء</span>
                        </div>
                      )}

                      {!disclaimerAgreed && !isDetailsMissing && (
                        <div className="mb-2 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-xl flex items-center gap-1.5 font-bold">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>يرجى التحديد على خيار إخلاء المسؤولية لتمكين الشراء</span>
                        </div>
                      )}

                      <a
                        href={isButtonDisabled ? '#' : whatsappUrl}
                        target={isButtonDisabled ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                          isButtonDisabled
                            ? 'bg-slate-300 dark:bg-carbon-800 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-98'
                        }`}
                      >
                        <Send className="w-4 h-4 text-white" />
                        <span>تأكيد وحجز عبر واتساب [{subCart.vendor.name}]</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Grand Total Footer */}
          {vendorSubCarts.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-carbon-950">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-600 dark:text-slate-400 text-sm">
                  المجموع الكلي لجميع السلات ({vendorSubCarts.length} تجار):
                </span>
                <span className="font-black text-lg text-amber-600 dark:text-amber-400 font-mono">
                  {totalGrandPrice.toLocaleString('en-US')} د.ع
                </span>
              </div>
              <p className="text-[11px] text-slate-400 text-center font-medium">
                * يتم تأكيد كل سلة فرعية مباشرة مع التاجر المختص عبر الواتساب للحصول على التوصيل السريع.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
