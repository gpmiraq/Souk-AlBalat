'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ShoppingBag,
  Plus,
  Settings,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Phone,
  Camera,
  ImageIcon,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { ConditionType, Product, ProductStatus } from '../../../types';
import { generateAIProductDescription } from '../../../utils/AIDescriptionGenerator';
import { createStampedImage } from '../../../utils/imageWatermark';

export default function VendorPortalPage() {
  const router = useRouter();
  const {
    currentUser,
    vendorUser,
    logoutCustomer,
    logoutVendor,
    updateVendorProfile,
    products,
    categories,
    publishProductToFirestore,
    deleteProductFromFirestore,
  } = useCart();

  const activeVendor = vendorUser || (currentUser && (currentUser.role === 'VENDOR' || (currentUser as any).isSiteAdmin) ? {
    id: currentUser.id,
    name: currentUser.fullName,
    avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    phone: currentUser.phone,
    whatsappFormatted: currentUser.phone,
    location: currentUser.city || 'بغداد',
    trustTier: 5 as const,
    verifiedBadge: true,
    totalSales: 0,
    rating: 5.0,
    responseTime: 'سريع ⚡',
  } : null);

  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'ADD' | 'PROFILE'>('PRODUCTS');

  // Profile Edit State
  const [storeName, setStoreName] = useState(activeVendor?.name || 'المركز الذهبي لاستوكات بغداد');
  const [storePhone, setStorePhone] = useState(activeVendor?.phone || '9647701234567');
  const [storeLocation, setStoreLocation] = useState(activeVendor?.location || 'بغداد - شارع الصناعة');
  const [responseTime, setResponseTime] = useState(activeVendor?.responseTime || 'خلال 5 دقائق');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // New Product State
  const [title, setTitle] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [condition, setCondition] = useState<ConditionType>('OPEN_BOX');
  const [category, setCategory] = useState('إلكترونيات');
  const [retailPrice, setRetailPrice] = useState(350000);
  const [outletPrice, setOutletPrice] = useState(220000);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishNotice, setPublishNotice] = useState('');

  // AI Description State
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState(false);

  const titleInputId = useId();
  const modelInputId = useId();
  const snInputId = useId();
  const condInputId = useId();
  const catInputId = useId();
  const retailInputId = useId();
  const outletInputId = useId();
  const descInputId = useId();

  const storeNameInputId = useId();
  const storePhoneInputId = useId();
  const storeLocInputId = useId();
  const storeRespInputId = useId();

  if (!activeVendor) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4" dir="rtl">
        <div className="text-center bg-slate-900 p-8 rounded-3xl border border-slate-800 max-w-sm w-full shadow-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-black">حساب التاجر غير مسجل دخول</h2>
          <p className="text-xs text-slate-400">يرجى تسجيل الدخول بحساب تاجر معتمد لفتح لوحة نشر وإدارة البضائع.</p>
          <Link
            href="/"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-block shadow-lg transition-all"
          >
            العودة للمتجر الرئيسي
          </Link>
        </div>
      </div>
    );
  }

  // Filter products belonging exclusively to this vendor
  const myProducts = products.filter(
    (p) => p.vendorId === activeVendor.id || p.vendorId === currentUser?.id
  );

  const handleUpdateStatus = async (productId: string, newStatus: ProductStatus, newQty?: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const updated = {
      ...prod,
      status: newStatus,
      quantity: newQty !== undefined ? newQty : prod.quantity,
    };
    await publishProductToFirestore(updated);
  };

  const handleRenewExpiry = async (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const updated = {
      ...prod,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      status: 'AVAILABLE' as const,
    };
    await publishProductToFirestore(updated);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج نهائياً من قاعدة البيانات؟')) {
      await deleteProductFromFirestore(productId);
    }
  };

  const handleGenerateAIDescription = () => {
    setAiError(null);
    setAiSuccess(false);

    const res = generateAIProductDescription(title, category, condition);
    if (!res.success) {
      setAiError(res.errorMessage || 'تعذر التوليد، يرجى كتابة المزيد من التفاصيل في العنوان.');
    } else {
      setDescription(res.content);
      setAiSuccess(true);
      setTimeout(() => setAiSuccess(false), 3000);
    }
  };

  const handlePickImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setPublishNotice('جاري ضبط وختم الصور المختارة...');
    const processedImages: string[] = [];

    for (const file of selectedFiles) {
      if (!file.type.startsWith('image/')) continue;
      const base64Raw = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => resolve(evt.target?.result as string);
        reader.readAsDataURL(file);
      });

      try {
        const stamped = await createStampedImage(base64Raw, { stampText: 'سوق البالات', subText: title || 'AMAZON OUTLET' });
        const { uploadImageWithFallback } = await import('../../../lib/firebaseStorage');
        const storageUrl = await uploadImageWithFallback(stamped, file.name);
        processedImages.push(storageUrl);
      } catch (err) {
        processedImages.push(base64Raw);
      }
    }

    setImages((prev) => [...prev, ...processedImages].slice(0, 5));
    setPublishNotice('');
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateVendorProfile({
      name: storeName,
      phone: storePhone,
      location: storeLocation,
      responseTime: responseTime,
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2000);
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsPublishing(true);
    setPublishNotice('جاري نشر البضاعة في قاعدة بيانات المتجر المباشرة...');

    try {
      const finalImages = images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      ];

      const newProd: Product = {
        id: `p_${Date.now()}`,
        title: title.trim(),
        description: description.trim() || 'بضاعة ستوك ممتازة مفحوصة وارد أوروبا وأمازون.',
        model: model.trim() || 'STD-MODEL',
        serialNumber: serialNumber.trim() || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        condition,
        conditionNotes: 'تم الفحص وتأكيد كفاءة التشغيل في مركز إدخال بضائع بالات العراق.',
        retailPrice: Number(retailPrice),
        outletPrice: Number(outletPrice),
        publishedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        images: finalImages,
        tags: ['جديد', 'سوق_البالات', category],
        vendorId: activeVendor.id,
        status: 'AVAILABLE',
        quantity: 1,
        category,
        isFeatured: true,
      };

      await publishProductToFirestore(newProd);

      setTitle('');
      setModel('');
      setSerialNumber('');
      setDescription('');
      setImages([]);
      setPublishNotice('✅ تم نشر البضاعة فوراً في قاعدة بيانات المتجر أونلاين!');
      setTimeout(() => {
        setPublishNotice('');
        setActiveTab('PRODUCTS');
      }, 1500);
    } catch (err: any) {
      console.error('Vendor publish product error:', err);
      setPublishNotice('❌ فشل نشر المنتج: ' + (err?.message || 'خطأ اتصال'));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLogout = async () => {
    await logoutCustomer();
    logoutVendor();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans transition-colors" dir="rtl">

      {/* Top Header Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors">
              <ArrowRight className="w-4 h-4" />
              <span>العودة للمتجر</span>
            </Link>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs">
                {activeVendor.name.charAt(0)}
              </div>
              <span className="font-extrabold text-sm truncate max-w-[160px] sm:max-w-none">
                لوحة التاجر: {activeVendor.name}
              </span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Vendor Dashboard Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">

        {/* Vendor Header Stats Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 rounded-3xl p-6 border border-slate-800 text-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xl border border-amber-500/30">
                ★5
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mb-1">
                  <span>{activeVendor.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                    حساب تاجر موثق ⚡
                  </span>
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {activeVendor.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    {activeVendor.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[100px]">
                <span className="text-slate-400 block text-[10px]">إجمالي المعروض:</span>
                <span className="text-amber-400 font-black text-base">{myProducts.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[100px]">
                <span className="text-slate-400 block text-[10px]">متوفر حالياً:</span>
                <span className="text-emerald-400 font-black text-base">
                  {myProducts.filter((p) => p.status === 'AVAILABLE').length}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-bold shadow-sm">
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'PRODUCTS'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>منشوراتي أونلاين ({myProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ADD')}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ADD'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة منتج جديد (مع AI)</span>
          </button>

          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'PROFILE'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إدارة حساب المعرض</span>
          </button>
        </div>

        {/* Tab 1: My Products List */}
        {activeTab === 'PRODUCTS' && (
          <div className="space-y-3">
            {myProducts.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800">
                <Package className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h3 className="text-base font-bold">لا توجد منتجات منشورة حالياً في معرضك</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">اضغط على إضافة منتج جديد لإدراج أول قطعة أونلاين في متجر بالات العراق</p>
                <button
                  onClick={() => setActiveTab('ADD')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all"
                >
                  + إضافة منتج جديد
                </button>
              </div>
            ) : (
              myProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-4 min-w-[240px] flex-1">
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 overflow-hidden relative flex-shrink-0 border border-slate-800">
                      <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white leading-tight mb-1">
                        {prod.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span>التصنيف: {prod.category}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-black">
                          {prod.outletPrice.toLocaleString('en-US')} د.ع
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Status Changer */}
                    <select
                      value={prod.status}
                      onChange={(e) => handleUpdateStatus(prod.id, e.target.value as ProductStatus, prod.quantity)}
                      className={`px-3 py-2 rounded-xl font-black text-xs border focus:outline-none ${
                        prod.status === 'AVAILABLE'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : prod.status === 'RESERVED'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : prod.status === 'SOLD'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      }`}
                    >
                      <option value="AVAILABLE">متوفر للبيع</option>
                      <option value="RESERVED">محجوز مؤقتاً (1 ساعة)</option>
                      <option value="SOLD">مباع (الأرشيف)</option>
                      <option value="ARCHIVED">مؤرشف 🔒</option>
                    </select>

                    {/* Renew 7-day lifespan */}
                    <button
                      onClick={() => handleRenewExpiry(prod.id)}
                      className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold transition-colors"
                      title="تجديد صلاحية العرض 7 أيام جديدة"
                    >
                      تجديد 7 أيام
                    </button>

                    {/* Delete Product */}
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="حذف المنتج"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Add New Product Form */}
        {activeTab === 'ADD' && (
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl max-w-2xl mx-auto space-y-5">
            
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              <span>إضافة بضاعة أو ستوك جديد للمعرض (مباشر إلى Firestore)</span>
            </h3>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={titleInputId} className="block font-bold text-slate-300 mb-1">عنوان المنتج الكامل: *</label>
                  <input
                    id={titleInputId}
                    type="text"
                    required
                    placeholder="مثال: سماعة سوني WH-1000XM5 أوبن بوكس"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor={modelInputId} className="block font-bold text-slate-300 mb-1">الموديل / الرقم التسلسلي:</label>
                  <input
                    id={modelInputId}
                    type="text"
                    placeholder="WH-1000XM5 / B"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor={condInputId} className="block font-bold text-slate-300 mb-1">حالة البضاعة:</label>
                  <select
                    id={condInputId}
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ConditionType)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  >
                    <option value="NEW">جديد (NEW)</option>
                    <option value="OPEN_BOX">علبة مفتوحة (OPEN BOX)</option>
                    <option value="USED">مستعمل (USED)</option>
                    <option value="SCRAP">فحم - لا يعمل (SCRAP)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={catInputId} className="block font-bold text-slate-300 mb-1">التصنيف الرئيسي:</label>
                  <select
                    id={catInputId}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  >
                    {categories.filter(c => c !== 'الكل').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={retailInputId} className="block font-bold text-slate-300 mb-1">سعر أمازون الأصلي (IQD):</label>
                  <input
                    id={retailInputId}
                    type="number"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label htmlFor={outletInputId} className="block font-bold text-slate-300 mb-1">سعر الستوك / الخصم الحالي (IQD): *</label>
                  <input
                    id={outletInputId}
                    type="number"
                    required
                    value={outletPrice}
                    onChange={(e) => setOutletPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-bold"
                  />
                </div>
              </div>

              {/* AI Description Generator Button & Textarea */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label htmlFor={descInputId} className="block font-bold text-slate-300">وصف وتفاصيل البضاعة:</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>توليد الوصف بالذكاء الاصطناعي 🪄</span>
                  </button>
                </div>

                {aiError && (
                  <p className="text-[11px] font-bold text-red-400 bg-red-500/10 p-2 rounded-xl border border-red-500/20">{aiError}</p>
                )}

                {aiSuccess && (
                  <p className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">✅ تم إنشاء الوصف الاحترافي تلقائياً بنجاح!</p>
                )}

                <textarea
                  id={descInputId}
                  rows={4}
                  placeholder="اكتب وصف المنتج وملاحظات الفحص والملحقات المرفقة هنا..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Image Upload Picker Section (Studio / Camera) */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <label className="block text-slate-300 font-bold">إضافة صور المنتج (رفع مباشر من الاستوديو / الكاميرا) 📸</label>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer px-4 py-2.5 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold rounded-xl flex items-center gap-2 transition-all">
                    <ImageIcon className="w-4 h-4" />
                    <span>اختر صور من الاستوديو أو الكاميرا 📷</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePickImages}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400 font-bold">{images.length} صور تم اختيارها</span>
                </div>

                {/* Thumbnails preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-amber-500/30 group bg-slate-900">
                        <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 text-white rounded-lg opacity-90 hover:opacity-100 transition-all"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {publishNotice && (
                <div className={`p-3.5 rounded-xl border text-xs font-black leading-relaxed ${
                  publishNotice.includes('✅')
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : publishNotice.includes('❌')
                    ? 'bg-red-500/15 border-red-500/30 text-red-300'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300 animate-pulse'
                }`}>
                  {publishNotice}
                </div>
              )}

              <button
                type="submit"
                disabled={isPublishing}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-98"
              >
                {isPublishing ? 'جاري رفع ونشر البضاعة أونلاين...' : '+ نشر البضاعة فوراً في المتجر'}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Store Profile Settings */}
        {activeTab === 'PROFILE' && (
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl max-w-xl mx-auto space-y-4">
            {profileSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-xs text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم حفظ بيانات المعرض بنجاح!</span>
              </div>
            )}

            <h3 className="text-base font-black text-white">
              إدارة بيانات حساب التاجر والمعرض
            </h3>

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div>
                <label htmlFor={storeNameInputId} className="block font-bold text-slate-300 mb-1">اسم المعرض / المتجر:</label>
                <input
                  id={storeNameInputId}
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label htmlFor={storePhoneInputId} className="block font-bold text-slate-300 mb-1">رقم الواتساب لاستلام الطلبات (دولي):</label>
                <input
                  id={storePhoneInputId}
                  type="text"
                  required
                  placeholder="9647701234567"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label htmlFor={storeLocInputId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المحافظة / موقع المعرض الرئيسي:</label>
                <input
                  id={storeLocInputId}
                  type="text"
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor={storeRespInputId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">معدل سرعة الرد على الواتساب:</label>
                <input
                  id={storeRespInputId}
                  type="text"
                  value={responseTime}
                  onChange={(e) => setResponseTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات والتحديث المباشر</span>
              </button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
}
