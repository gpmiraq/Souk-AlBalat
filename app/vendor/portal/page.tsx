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
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { ConditionType, Product, ProductStatus } from '../../../types';
import { INITIAL_PRODUCTS } from '../../../data/mockData';

export default function VendorPortalPage() {
  const router = useRouter();
  const {
    vendorUser,
    logoutVendor,
    updateVendorProfile,
    vendors,
  } = useCart();

  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'ADD' | 'PROFILE'>('PRODUCTS');
  const [productsList, setProductsList] = useState<Product[]>(INITIAL_PRODUCTS);

  // Profile Edit State
  const [storeName, setStoreName] = useState(vendorUser?.name || 'المركز الذهبي لاستوكات بغداد');
  const [storePhone, setStorePhone] = useState(vendorUser?.phone || '9647701234567');
  const [storeLocation, setStoreLocation] = useState(vendorUser?.location || 'بغداد - شارع الصناعة');
  const [responseTime, setResponseTime] = useState(vendorUser?.responseTime || 'خلال 5 دقائق');
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
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80');
  const [addSuccess, setAddSuccess] = useState(false);

  const titleInputId = useId();
  const modelInputId = useId();
  const snInputId = useId();
  const condInputId = useId();
  const catInputId = useId();
  const retailInputId = useId();
  const outletInputId = useId();
  const imgInputId = useId();
  const descInputId = useId();

  const storeNameInputId = useId();
  const storePhoneInputId = useId();
  const storeLocInputId = useId();
  const storeRespInputId = useId();

  if (!vendorUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center bg-carbon-900 p-8 rounded-3xl border border-slate-800 max-w-sm w-full shadow-2xl">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-black mb-2">جلسة التاجر منتهية</h2>
          <p className="text-xs text-slate-400 mb-6">يرجى تسجيل الدخول بحساب demo / demo لبدء إدارة المعروضات</p>
          <Link
            href="/vendor/login"
            className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs inline-block shadow-lg"
          >
            التوجه لصفحة دخول التجار
          </Link>
        </div>
      </div>
    );
  }

  // Filter products owned by current vendor (or demo products)
  const myProducts = productsList.filter(
    (p) => p.vendorId === vendorUser.id || vendorUser.id === 'v1'
  );

  const handleUpdateStatus = (productId: string, newStatus: ProductStatus, newQty?: number) => {
    setProductsList((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              status: newStatus,
              quantity: newQty !== undefined ? newQty : p.quantity,
              reservedAt: newStatus === 'RESERVED' ? new Date().toISOString() : undefined,
            }
          : p
      )
    );
  };

  const handleRenewExpiry = (productId: string) => {
    setProductsList((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
              status: 'AVAILABLE',
            }
          : p
      )
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== productId));
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

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !model.trim()) return;

    const newProd: Product = {
      id: `p_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'بضاعة ستوك ممتازة مفحوصة وارد أوروبا وأمازون.',
      model: model.trim(),
      serialNumber: serialNumber.trim() || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      condition,
      conditionNotes: 'تم الفحص وتأكيد كفاءة التشغيل في مركز إدخال بضائع بالات العراق.',
      retailPrice: Number(retailPrice),
      outletPrice: Number(outletPrice),
      publishedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      images: [imageUrl.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
      tags: ['جديد', 'بالات_العراق', category],
      vendorId: vendorUser.id,
      status: 'AVAILABLE',
      quantity: 3,
      category,
      isFeatured: true,
    };

    setProductsList((prev) => [newProd, ...prev]);
    setTitle('');
    setModel('');
    setSerialNumber('');
    setDescription('');
    setAddSuccess(true);
    setTimeout(() => {
      setAddSuccess(false);
      setActiveTab('PRODUCTS');
    }, 1500);
  };

  const handleLogout = () => {
    logoutVendor();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-carbon-950 text-slate-900 dark:text-white flex flex-col font-sans transition-colors">
      
      {/* Top Header Navbar */}
      <header className="bg-white dark:bg-carbon-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-500 transition-colors">
              <ArrowRight className="w-4 h-4" />
              <span>العودة للمتجر</span>
            </Link>

            <span className="text-slate-300">|</span>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 font-black flex items-center justify-center text-xs">
                {vendorUser.name.charAt(0)}
              </div>
              <span className="font-extrabold text-sm truncate max-w-[160px] sm:max-w-none">
                لوحة التاجر: {vendorUser.name}
              </span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Vendor Dashboard Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        
        {/* Vendor Header Stats Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-carbon-900 to-amber-950/40 rounded-3xl p-6 border border-slate-800 text-white shadow-2xl mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xl border border-amber-500/30">
                ★5
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mb-1">
                  <span>{vendorUser.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                    حساب تاجر موثق (demo)
                  </span>
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {vendorUser.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    {vendorUser.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center min-w-[90px]">
                <span className="text-slate-400 block text-[10px]">إجمالي المعروض:</span>
                <span className="text-amber-400 font-black text-base">{myProducts.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center min-w-[90px]">
                <span className="text-slate-400 block text-[10px]">متوفر حالياً:</span>
                <span className="text-emerald-400 font-black text-base">
                  {myProducts.filter((p) => p.status === 'AVAILABLE').length}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-carbon-900 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 text-xs font-bold shadow-sm">
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'PRODUCTS'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>منشوراتي ({myProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ADD')}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ADD'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة منتج جديد</span>
          </button>

          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'PROFILE'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إدارة حساب المعرض</span>
          </button>
        </div>

        {/* Tab 1: My Products List */}
        {activeTab === 'PRODUCTS' && (
          <div className="space-y-4">
            {myProducts.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-carbon-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold">لا توجد منتجات منشورة حالياً في معرضك</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">اضغط على إضافة منتج جديد لإدراج أول قطعة في متجر بالات العراق</p>
                <button
                  onClick={() => setActiveTab('ADD')}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
                >
                  + إضافة منتج جديد
                </button>
              </div>
            ) : (
              myProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-carbon-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md transition-all flex flex-wrap items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-4 min-w-[240px] flex-1">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-carbon-950 overflow-hidden relative flex-shrink-0">
                      <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight mb-1">
                        {prod.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span>الموديل: {prod.model}</span>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-black">
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

                    {/* Quantity modifier */}
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-carbon-950 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold">العدد:</span>
                      <input
                        type="number"
                        min="0"
                        value={prod.quantity}
                        onChange={(e) => handleUpdateStatus(prod.id, prod.status, Number(e.target.value))}
                        className="w-12 text-center font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    {/* Renew 7-day lifespan */}
                    <button
                      onClick={() => handleRenewExpiry(prod.id)}
                      className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold transition-colors"
                      title="تجديد صلاحية العرض 7 أيام جديدة"
                    >
                      تجديد 7 أيام
                    </button>

                    {/* Delete Product */}
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
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
          <div className="bg-white dark:bg-carbon-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto">
            {addSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-black text-xs text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم نشر المنتج بنجاح وتحديث المتجر المباشر!</span>
              </div>
            )}

            <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">
              إضافة بضاعة أو ستوك جديد للمعرض
            </h3>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={titleInputId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان المنتج الكامل:</label>
                  <input
                    id={titleInputId}
                    type="text"
                    required
                    placeholder="مثال: سماعة سوني WH-1000XM5"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor={modelInputId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الموديل / الرقم التسلسلي:</label>
                  <input
                    id={modelInputId}
                    type="text"
                    required
                    placeholder="WH-1000XM5 / B"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor={condInputId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">حالة البضاعة:</label>
                  <select
                    id={condInputId}
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ConditionType)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="NEW">جديد (NEW)</option>
                    <option value="OPEN_BOX">علبة مفتوحة (OPEN BOX)</option>
                    <option value="USED">مستعمل (USED)</option>
                    <option value="SCRAP">فحم - لا يعمل (SCRAP)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={catInputId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">التصنيف الرئيسي:</label>
                  <select
                    id={catInputId}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="إلكترونيات">إلكترونيات</option>
                    <option value="أجهزة منزلية">أجهزة منزلية</option>
                    <option value="مستلزمات DHL وطرد بريدي">مستلزمات DHL وطرد بريدي</option>
                    <option value="أجهزة كهربائية">أجهزة كهربائية</option>
                    <option value="أدوات مطبخ">أدوات مطبخ</option>
                    <option value="هواتف واكسسوارات">هواتف واكسسوارات</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={retailInputId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">سعر أمازون الأصلي (IQD):</label>
                  <input
                    id={retailInputId}
                    type="number"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor={outletInputId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">سعر الخصم بعد 24 ساعة (IQD):</label>
                  <input
                    id={outletInputId}
                    type="number"
                    value={outletPrice}
                    onChange={(e) => setOutletPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={imgInputId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رابط صورة المنتج (URL):</label>
                <input
                  id={imgInputId}
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label htmlFor={descInputId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تقرير الفحص والملحقات:</label>
                <textarea
                  id={descInputId}
                  rows={3}
                  placeholder="اكتب تقرير حالة القطعة والكابلات المرفقة..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-98"
              >
                نشر البضاعة فوراً في المتجر
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Store Profile Settings */}
        {activeTab === 'PROFILE' && (
          <div className="bg-white dark:bg-carbon-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl mx-auto">
            {profileSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-black text-xs text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم حفظ بيانات المعرض بنجاح!</span>
              </div>
            )}

            <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">
              إدارة بيانات حساب التاجر والمعرض
            </h3>

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div>
                <label htmlFor={storeNameInputId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المعرض / المتجر:</label>
                <input
                  id={storeNameInputId}
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-carbon-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor={storePhoneInputId} className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الواتساب لاستلام الطلبات (دولي):</label>
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
