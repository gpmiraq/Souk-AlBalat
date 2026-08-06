'use client';

import React, { useState, useId } from 'react';
import {
  X,
  ShieldCheck,
  Plus,
  Trash2,
  RefreshCw,
  MessageSquare,
  PackageCheck,
  AlertCircle,
  Settings,
  Sparkles,
  Camera,
  Eye,
  Star,
  Clock,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { ConditionType, Product, ProductStatus } from '../types';
import { useCart } from '../context/CartContext';
import { generateAIProductDescription } from '../utils/AIDescriptionGenerator';
import { createStampedImage } from '../utils/imageWatermark';

interface AdminVendorDashboardProps {
  products: Product[];
  onUpdateProductStatus: (productId: string, status: ProductStatus, quantity?: number) => void;
  onAddProduct: (newProduct: Product) => void;
}

export const AdminVendorDashboard: React.FC<AdminVendorDashboardProps> = ({
  products,
  onUpdateProductStatus,
  onAddProduct,
}) => {
  const {
    isAdminDashboardOpen,
    setIsAdminDashboardOpen,
    vendors,
    vendorUser,
    activatedVendorIds,
  } = useCart();

  const [activeTab, setActiveTab] = useState<'MANAGE' | 'ADD_PRODUCT' | 'COMMENTS' | 'VENDOR_REG'>('MANAGE');

  // Form state for adding new product
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState<ConditionType>('OPEN_BOX');
  const [retailPrice, setRetailPrice] = useState(250000);
  const [outletPrice, setOutletPrice] = useState(150000);
  const [category, setCategory] = useState('إلكترونيات');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // AI Description Generator Status
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessNotice, setAiSuccessNotice] = useState(false);

  const prodTitleId = useId();
  const prodModelId = useId();
  const prodCondId = useId();
  const prodCatId = useId();
  const prodRetailPriceId = useId();
  const prodOutletPriceId = useId();
  const prodDescId = useId();

  if (!isAdminDashboardOpen) return null;

  // AI Auto Description Generator Trigger
  const handleGenerateAIDescription = () => {
    setAiError(null);
    setAiSuccessNotice(false);

    const res = generateAIProductDescription(title, category, condition);
    if (!res.success) {
      setAiError(res.errorMessage || 'تعذر التوليد، يرجى كتابة المزيد من التفاصيل في العنوان.');
    } else {
      setDescription(res.content);
      setAiSuccessNotice(true);
      setTimeout(() => setAiSuccessNotice(false), 3000);
    }
  };

  const handleAddImage = () => {
    if (images.length >= 4) return;
    if (newImageUrl.trim()) {
      setImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    } else {
      // Add default mock image if empty
      setImages((prev) => [
        ...prev,
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
      ]);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) return; // Must keep at least 1 image
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProd: Product = {
      id: `p_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'بضاعة ستوك ممتازة وارد أوروبا وأمازون.',
      model: model.trim() || undefined,
      condition,
      conditionNotes: 'تم الفحص في مركز إدخال بضائع بالات العراق وتأكيد الكفاءة.',
      retailPrice: Number(retailPrice),
      outletPrice: Number(outletPrice),
      publishedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
      tags: ['جديد', 'سوق_البالات', category],
      vendorId: vendorUser?.id || vendors[0]?.id || 'v1',
      status: 'AVAILABLE',
      quantity: 3,
      category,
      isFeatured: true,
    };

    onAddProduct(newProd);
    setTitle('');
    setModel('');
    setDescription('');
    setActiveTab('MANAGE');
  };

  const currentVendorProducts = products.filter(
    (p) => !vendorUser || p.vendorId === vendorUser.id
  );

  const isCurrentVendorActivated = vendorUser ? activatedVendorIds.includes(vendorUser.id) : true;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={() => setIsAdminDashboardOpen(false)}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Main CMS Drawer Box */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-carbon-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 transition-colors max-h-[90vh] flex flex-col my-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>لوحة التاجر وإدارة المعروضات (WordPress Vendor CMS)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                  {vendorUser ? vendorUser.name : 'المركز الذهبي'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                نشر البضائع، توليد الوصف بالذكاء الاصطناعي، متابعة الحجوزات والمشاهدات
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminDashboardOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-carbon-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vendor Stats Overview Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs flex-shrink-0">
          <div className="p-3 bg-slate-50 dark:bg-carbon-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">عدد المشاهدات 👁️</span>
            <span className="text-base font-black text-slate-900 dark:text-white">1,480</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-carbon-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">عدد الحجوزات 📦</span>
            <span className="text-base font-black text-amber-500">12 شحنة</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-carbon-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">تقييم التاجر ⭐</span>
            <span className="text-base font-black text-emerald-500">
              ★ {vendorUser ? vendorUser.rating : 4.9}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-carbon-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">الاستجابة ⚡</span>
            <span className="text-base font-black text-sky-500">
              {vendorUser ? vendorUser.responseTime : '5 دقائق'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-carbon-950 rounded-2xl mb-6 text-xs font-bold flex-shrink-0">
          <button
            onClick={() => setActiveTab('MANAGE')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'MANAGE'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            البضائع المنشورة ({currentVendorProducts.length})
          </button>
          
          {isCurrentVendorActivated && (
            <button
              onClick={() => setActiveTab('ADD_PRODUCT')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeTab === 'ADD_PRODUCT'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              + نشر بضاعة جديدة (مع AI)
            </button>
          )}

          <button
            onClick={() => setActiveTab('COMMENTS')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'COMMENTS'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            التعليقات والاستفسارات
          </button>
        </div>

        {/* Tab 1: Manage Products */}
        {activeTab === 'MANAGE' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
            {currentVendorProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-[220px] flex-1">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-carbon-800 overflow-hidden flex-shrink-0 relative">
                    <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 dark:text-white truncate max-w-[260px]">
                      {prod.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                      <span>الموديل: {prod.model}</span>
                      <span>•</span>
                      <span className="text-amber-500 font-bold">{prod.outletPrice.toLocaleString('ar-IQ')} د.ع</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={prod.status}
                    onChange={(e) =>
                      onUpdateProductStatus(prod.id, e.target.value as ProductStatus, prod.quantity)
                    }
                    className={`px-3 py-1.5 rounded-xl font-bold border text-xs focus:outline-none ${
                      prod.status === 'AVAILABLE'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : prod.status === 'RESERVED'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                    }`}
                  >
                    <option value="AVAILABLE">متوفر للبيع</option>
                    <option value="RESERVED">محجوز مؤقتاً (1 ساعة)</option>
                    <option value="SOLD">مباع (الأرشيف)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Add Product Form (Wordpress Style with 1-4 Images Limit & AI Generator) */}
        {activeTab === 'ADD_PRODUCT' && isCurrentVendorActivated && (
          <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
            
            {/* Image Uploader Box (1 to 4 Images limit) */}
            <div className="p-4 bg-slate-50 dark:bg-carbon-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-500" />
                  صور الإعلان الحقيقية (حد أقصى 4 صور - حد أدنى صورة واحدة حقيقية): *
                </span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {images.length} / 4 صور
                </span>
              </div>

              {/* 1:1 Square Aspect Ratio Notice Banner */}
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                <span>📐 تنبيه التناسق: يتم اعتماد قص الصور المربعة 1:1 حصراً لضمان موائمة وجمالية التصميم في المتجر.</span>
              </div>

              {/* Images Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-white dark:bg-carbon-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover object-center" />
                    {idx === 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded text-[9px] font-black shadow">
                        الغلاف 1:1
                      </span>
                    )}
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute bottom-1.5 left-1.5 p-1 rounded-lg bg-red-600 text-white opacity-90 hover:opacity-100 transition-opacity"
                        title="حذف الصورة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {images.length < 4 && (
                  <label className="aspect-square bg-slate-100 dark:bg-carbon-900 hover:bg-amber-500/10 cursor-pointer rounded-xl border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-amber-500 transition-all">
                    <Camera className="w-5 h-5 text-amber-500" />
                    <span className="text-[10px] font-bold text-center px-1">رفع من الكاميرا / الاستوديو 📸</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            if (reader.result) {
                              const rawDataUrl = reader.result as string;
                              const stampedUrl = await createStampedImage(rawDataUrl, { opacity: 0.38 });
                              try {
                                const { uploadImageWithFallback } = await import('../lib/firebaseStorage');
                                const storageUrl = await uploadImageWithFallback(stampedUrl, file.name);
                                setImages((prev) => [...prev, storageUrl]);
                              } catch (err) {
                                setImages((prev) => [...prev, stampedUrl]);
                              }
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={prodTitleId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم / عنوان البضاعة: *
                </label>
                <input
                  id={prodTitleId}
                  type="text"
                  required
                  placeholder="مثال: سماعات سوني WH-1000XM5 عازلة للضوضاء"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor={prodModelId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الموديل / الرقم التسلسلي (اختياري إن توفر):
                </label>
                <input
                  id={prodModelId}
                  type="text"
                  placeholder="WH-1000XM5 / B (اختياري)"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor={prodCondId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">حالة البضاعة: *</label>
                <select
                  id={prodCondId}
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ConditionType)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="NEW">جديد بالختم (NEW)</option>
                  <option value="OPEN_BOX">علبة مفتوحة (OPEN BOX)</option>
                  <option value="USED">مستعمل (USED)</option>
                  <option value="SCRAP">فحم - أدوات (SCRAP)</option>
                </select>
              </div>

              <div>
                <label htmlFor={prodCatId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">التصنيف: *</label>
                <select
                  id={prodCatId}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="إلكترونيات">إلكترونيات</option>
                  <option value="ملابس رجالية (جديد)">ملابس رجالية (جديد)</option>
                  <option value="ملابس نسائية (جديد)">ملابس نسائية (جديد)</option>
                  <option value="ملابس أطفال (جديد)">ملابس أطفال (جديد)</option>
                  <option value="أحذية ومستلزمات رياضية (جديد)">أحذية ومستلزمات رياضية (جديد)</option>
                  <option value="أجهزة منزلية">أجهزة منزلية</option>
                  <option value="مستلزمات DHL وطرد بريدي">مستلزمات DHL وطرد بريدي</option>
                  <option value="أجهزة كهربائية">أجهزة كهربائية</option>
                  <option value="أدوات مطبخ">أدوات مطبخ</option>
                  <option value="هواتف واكسسوارات">هواتف واكسسوارات</option>
                </select>
              </div>

              <div>
                <label htmlFor={prodRetailPriceId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">السعر الأصلي (IQD):</label>
                <input
                  id={prodRetailPriceId}
                  type="number"
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor={prodOutletPriceId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">سعر الخصم بالدينار (IQD): *</label>
                <input
                  id={prodOutletPriceId}
                  type="number"
                  value={outletPrice}
                  onChange={(e) => setOutletPrice(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Description & AI Button Container */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor={prodDescId} className="block font-bold text-slate-700 dark:text-slate-300">
                  وصف الإعلان والمواصفات:
                </label>

                {/* AI Generator Button */}
                <button
                  type="button"
                  onClick={handleGenerateAIDescription}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>توليد الوصف بالذكاء الاصطناعي 🪄</span>
                </button>
              </div>

              {aiError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-[11px] font-bold">
                  {aiError}
                </div>
              )}

              {aiSuccessNotice && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-[11px] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم توليد الوصف بالذكاء الاصطناعي بنجاح بحسب المعايير المطلوبة!</span>
                </div>
              )}

              <textarea
                id={prodDescId}
                rows={6}
                placeholder="أدخل الوصف أو انقر فوق 'توليد الوصف بالذكاء الاصطناعي'..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <PackageCheck className="w-4 h-4 text-slate-950" />
              <span>نشر البضاعة فوراً في المتجر</span>
            </button>
          </form>
        )}

        {/* Tab 3: Comments & Customer Inquiries */}
        {activeTab === 'COMMENTS' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">الزبون: أحمد العراقي</span>
                <span className="text-[10px] text-slate-400 font-mono">قبل 15 دقيقة</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                مرحباً تاجرنا، هل متوفر كابل الشحن الأصلي مع طرد سماعات سوني الشحنة القادمة؟
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">الزبون: مصطفى بغداد</span>
                <span className="text-[10px] text-slate-400 font-mono">قبل 1 ساعة</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                تم حجز ماكينة ديلونجي وسأقوم بتأكيد الطلب على الواتساب فوراً. شكراً لكم.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
