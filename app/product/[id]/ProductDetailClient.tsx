'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '../../../components/Navbar';
import { SplitCartDrawer } from '../../../components/SplitCartDrawer';
import { ConditionGuideModal } from '../../../components/ConditionGuideModal';
import { MobileNav } from '../../../components/MobileNav';
import { Product, Vendor } from '../../../types';
import { useCart } from '../../../context/CartContext';
import { ProductCard } from '../../../components/ProductCard';
import { ProductImageWithStamp } from '../../../components/ProductImageWithStamp';
import { MarketingPosterModal } from '../../../components/MarketingPosterModal';
import { ReportModal } from '../../../components/ReportModal';
import { FloatingWhatsAppSupport } from '../../../components/FloatingWhatsAppSupport';
import { ScrollToTop } from '../../../components/ScrollToTop';
import {
  ArrowRight,
  ShoppingBag,
  Send,
  ShieldCheck,
  Star,
  Clock,
  Share2,
  Check,
  Info,
  ChevronLeft,
  Download,
  AlertCircle,
  ShieldAlert,
  Flag,
  Eye,
  Phone,
  MessageCircle,
  Lock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Footer } from '../../../components/Footer';

interface ProductDetailClientProps {
  product: Product;
  vendor: Vendor;
  relatedProducts: Product[];
}

// ── 3-Step Order Flow ────────────────────────────────────────────────────────
// Step 1: IDLE           → زر "إضافة إلى السلة"
// Step 2: ADDED_TO_CART  → زر "حجز مؤقت (1 ساعة)" + زر "الغاء"
// Step 3: RESERVED       → زر "تثبيت الطلب عبر واتساب"
type OrderStep = 'IDLE' | 'ADDED_TO_CART' | 'RESERVED';

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  vendor,
  relatedProducts,
}) => {
  const { addToCart, setIsCartOpen, reserveProduct, vendors } = useCart();
  const activeVendor = vendors.find((v) => v.id === product.vendorId) || vendor;
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [copied, setCopied] = useState(false);
  const [isConditionGuideOpen, setIsConditionGuideOpen] = useState(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);

  // 3-step order flow state
  const [orderStep, setOrderStep] = useState<OrderStep>('IDLE');

  const discountPercent = Math.round(
    ((product.retailPrice - product.outletPrice) / product.retailPrice) * 100
  );

  const isAvailable = product.status === 'AVAILABLE';

  // Format vendor phone for WhatsApp (remove leading 0, add 964 prefix)
  const vendorWhatsapp = (activeVendor.phone || '9647701234567').replace(/^0/, '964');
  const buildOrderWhatsappUrl = () => {
    const msg = encodeURIComponent(
      `مرحباً ${activeVendor.name}، أريد تثبيت طلب:\n\n` +
      `📦 المنتج: ${product.title}\n` +
      (product.model ? `🔖 الموديل: ${product.model}\n` : '') +
      (product.serialNumber ? `🔢 الرقم التسلسلي: ${product.serialNumber}\n` : '') +
      `💰 السعر: ${product.outletPrice.toLocaleString('en-US')} د.ع\n` +
      `📍 المحافظة: —\n` +
      `📝 ملاحظات: —\n\n` +
      `🔗 رابط المنتج: ${typeof window !== 'undefined' ? window.location.href : ''}`
    );
    return `https://wa.me/${vendorWhatsapp}?text=${msg}`;
  };

  // Step 1 → 2: Add to cart
  const handleAddToCart = () => {
    if (!isAvailable || !disclaimerAgreed || orderStep !== 'IDLE') return;
    const success = addToCart(product);
    if (success) setOrderStep('ADDED_TO_CART');
  };

  // Step 2 → 3: Reserve (mark as reserved in context, starts 1-hour countdown)
  const handleReserve = () => {
    if (orderStep !== 'ADDED_TO_CART') return;
    // Trigger reservation in context/state
    if (typeof reserveProduct === 'function') {
      reserveProduct(product.id);
    }
    setOrderStep('RESERVED');
  };

  // Cancel reservation back to IDLE
  const handleCancel = () => {
    setOrderStep('IDLE');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const conditionLabels: Record<string, { label: string; badge: string }> = {
    NEW: { label: 'جديد بالختم (NEW)', badge: 'bg-emerald-600 text-white' },
    OPEN_BOX: { label: 'علبة مفتوحة (Open Box)', badge: 'bg-sky-600 text-white' },
    USED: { label: 'درجة أولى (USED)', badge: 'bg-amber-500 text-slate-950' },
    SCRAP: { label: 'فحم - أدوات (SCRAP)', badge: 'bg-slate-900 text-white' },
  };

  const conditionInfo = conditionLabels[product.condition] || conditionLabels.OPEN_BOX;

  const isClothing =
    product.category.includes('ملابس') ||
    product.category.includes('أحذية') ||
    product.category.includes('الملابس');

  const isCosmetics =
    product.category.includes('عطور') ||
    product.category.includes('كوزمتك');

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-carbon-950 text-slate-900 dark:text-white pb-20 sm:pb-0">
      <Navbar onOpenConditionGuide={() => setIsConditionGuideOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 w-full">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>الرئيسية</span>
          </Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{product.category}</span>
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-bold truncate max-w-[200px]">
            {product.title}
          </span>
        </div>

        {/* Product Detail Main Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Left Column: Gallery (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative w-full aspect-[4/3] bg-white dark:bg-carbon-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
              <ProductImageWithStamp src={selectedImage} alt={product.title} />
              
              <div className="absolute top-4 right-4 z-10 pointer-events-none">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-black backdrop-blur-md shadow-lg ${conditionInfo.badge}`}>
                  {conditionInfo.label}
                </span>
              </div>

              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-red-600 text-white shadow-lg animate-pulse">
                    وفر {discountPercent}%
                  </span>
                </div>
              )}

              <button
                onClick={() => setIsPosterModalOpen(true)}
                className="absolute top-14 left-4 z-20 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>حفظ الصورة كبوستر تسويقي 📸</span>
              </button>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === img
                        ? 'border-amber-500 scale-105 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`معاينة ${idx}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Category Warnings */}
            {isClothing && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-black">
                  <AlertCircle className="w-4 h-4" />
                  <span>تنبيه مهم لقطاع الملابس والأحذية:</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-200 font-bold leading-relaxed">
                  تأكد من التاجر أن جميع الملابس والأحذية المعروضة جديدة فقط (لا نستقبل أو نعرض الملابس المستعملة نهائياً).
                </p>
              </div>
            )}

            {isCosmetics && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-black">
                  <ShieldAlert className="w-4 h-4" />
                  <span>تنبيه العطور والكوزمتك:</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-200 font-bold leading-relaxed">
                  شراء العطور والكوزماتك يجب أن يكون بتاريخ صلاحية مقبولة وعلى مسؤولية الزبون ... تحقق مع التاجر حول أمان استخدامه.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Product Meta & Purchase Box (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* ── Vendor Trust Card ── */}
              <div className="mb-4 p-4 rounded-2xl bg-gradient-to-l from-amber-500/10 to-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base">
                      {activeVendor.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                        <span>{activeVendor.name}</span>
                        {activeVendor.verifiedBadge && <ShieldCheck className="w-4 h-4 text-amber-500" />}
                        {activeVendor.isSiteAdmin && (
                          <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-black">مدير الموقع 👑</span>
                        )}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {activeVendor.location} • سرعة الرد: {activeVendor.responseTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-xl text-xs font-black text-amber-600 dark:text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{activeVendor.rating}/5</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug mb-3">
                {product.title}
              </h1>

              {/* Serial & Model & Views */}
              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-mono">
                {product.model && (
                  <span className="bg-white dark:bg-carbon-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                    الموديل: {product.model}
                  </span>
                )}
                {product.serialNumber && (
                  <span className="bg-white dark:bg-carbon-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                    الرقم التسلسلي: {product.serialNumber}
                  </span>
                )}
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-1 rounded-lg border border-amber-500/20 shadow-sm flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{product.viewsCount || 342} مشاهدة</span>
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-white dark:bg-carbon-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-5">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">سعر أمازون الأصلي:</span>
                  <span className="text-sm font-bold text-slate-400 line-through">
                    {product.retailPrice.toLocaleString('en-US')} د.ع
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">السعر الحالي:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                      {product.outletPrice.toLocaleString('en-US')}
                    </span>
                    <span className="text-xs font-bold text-slate-500">د.ع</span>
                  </div>
                </div>
              </div>

              {/* Condition Notes */}
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 mb-5">
                <div className="flex items-center gap-1.5 text-xs font-black text-sky-600 dark:text-sky-400 mb-1">
                  <Info className="w-4 h-4" />
                  <span>تقرير حالة الفحص:</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {product.conditionNotes}
                </p>
              </div>

              {/* Specs */}
              {product.specs && (
                <div className="mb-5">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    المواصفات الفنية والقياسات:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="p-2.5 rounded-xl bg-white dark:bg-carbon-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-slate-400 block text-[10px]">{key}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── DISCLAIMER ── */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={disclaimerAgreed}
                  onChange={(e) => setDisclaimerAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="leading-relaxed">
                  <strong>إخلاء مسؤولية:</strong> إن الموقع هو وسيلة ربط بينك وبين تجار وبائعي الأمازون والبالات، ولا يتحمل مسؤولية التعامل والموثوقية المباشرة.
                </span>
              </label>
            </div>

            {/* ── 3-STEP ORDER FLOW ──────────────────────────────────────── */}
            <div className="space-y-3">

              {/* Step Progress Indicator */}
              <div className="flex items-center gap-1 text-[10px] font-bold mb-1">
                {[
                  { step: 1, label: 'الإضافة للسلة', active: orderStep !== 'IDLE' },
                  { step: 2, label: 'الحجز المؤقت', active: orderStep === 'RESERVED' },
                  { step: 3, label: 'تثبيت الطلب', active: false },
                ].map((s, i) => (
                  <React.Fragment key={s.step}>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                      s.active ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-carbon-800 text-slate-400'
                    }`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                        s.active ? 'bg-slate-950 text-amber-400' : 'bg-slate-400 text-white'
                      }`}>{s.step}</span>
                      <span className="hidden sm:inline">{s.label}</span>
                    </div>
                    {i < 2 && <div className="flex-1 h-0.5 bg-slate-200 dark:bg-carbon-800 rounded" />}
                  </React.Fragment>
                ))}
              </div>

              {/* ── STEP 1: Add to Cart (IDLE state) ── */}
              {orderStep === 'IDLE' && (
                <button
                  onClick={handleAddToCart}
                  disabled={!isAvailable || !disclaimerAgreed}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    !isAvailable || !disclaimerAgreed
                      ? 'bg-slate-200 dark:bg-carbon-800 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-[0.98]'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    {!isAvailable ? 'البضاعة مباعة / محجوزة' : !disclaimerAgreed ? 'وافق على إخلاء المسؤولية أولاً' : 'إضافة إلى السلة — الخطوة 1 من 3'}
                  </span>
                </button>
              )}

              {/* ── STEP 2: Reserve (ADDED_TO_CART state) ── */}
              {orderStep === 'ADDED_TO_CART' && (
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>✅ تمت الإضافة للسلة — الآن حجز مؤقت لمدة ساعة واحدة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReserve}
                      className="flex-1 py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20 transition-all active:scale-[0.98]"
                    >
                      <Clock className="w-5 h-5" />
                      <span>حجز مؤقت (1 ساعة) — الخطوة 2 من 3</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-3.5 rounded-2xl bg-slate-200 dark:bg-carbon-800 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all"
                      title="إلغاء"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold bg-white dark:bg-carbon-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>فتح السلة ومتابعة التسوق</span>
                  </button>
                </div>
              )}

              {/* ── STEP 3: Confirm via WhatsApp (RESERVED state) ── */}
              {orderStep === 'RESERVED' && (
                <div className="space-y-2">
                  <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
                    <Clock className="w-4 h-4 flex-shrink-0 animate-pulse" />
                    <span>⏱️ البضاعة محجوزة لك لمدة ساعة واحدة — ثبّت الطلب الآن</span>
                  </div>
                  <a
                    href={buildOrderWhatsappUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 transition-all active:scale-[0.98]"
                  >
                    <Send className="w-5 h-5" />
                    <span>تثبيت الطلب عبر واتساب [{vendor.name}] — الخطوة 3 من 3</span>
                  </a>
                  <button
                    onClick={handleCancel}
                    className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>إلغاء الحجز</span>
                  </button>
                </div>
              )}

              {/* Share & Report */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-white dark:bg-carbon-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm flex items-center justify-center gap-2 text-xs font-bold"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? 'تم نسخ الرابط!' : 'مشاركة الرابط'}</span>
                </button>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 border border-red-500/20 transition-all"
                >
                  <Flag className="w-4 h-4 text-red-500" />
                  <span>إبلاغ عن احتيال 🚩</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">
              بضائع أخرى ذات صلة من نفس الفئة:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard
                  key={rp.id}
                  product={rp}
                  vendor={vendor}
                />
              ))}
            </div>
          </section>
        )}

      </main>

      <MarketingPosterModal
        product={product}
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
      />

      <ReportModal
        product={product}
        vendor={vendor}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <FloatingWhatsAppSupport />
      <ScrollToTop />

      <SplitCartDrawer />
      <ConditionGuideModal
        isOpen={isConditionGuideOpen}
        onClose={() => setIsConditionGuideOpen(false)}
      />
      <MobileNav
        onOpenConditionGuide={() => setIsConditionGuideOpen(true)}
        onFocusSearch={() => {}}
      />
      <Footer />
    </div>
  );
};
