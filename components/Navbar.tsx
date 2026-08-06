'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Sun,
  Moon,
  Sparkles,
  User,
  Settings,
  Smartphone,
  Store,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Truck,
  Sliders,
  PlusCircle,
  LogOut,
  Edit3,
  Crown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { MobileQRCodeModal } from './MobileQRCodeModal';
import { INITIAL_CATEGORIES } from '../data/mockData';

interface NavbarProps {
  onOpenConditionGuide: () => void;
  onToggleMobileSidebar?: () => void;
  onSearchQueryChange?: (query: string) => void;
  onCategorySelect?: (cat: string) => void;
  selectedCategory?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenConditionGuide,
  onToggleMobileSidebar,
  onSearchQueryChange,
  onCategorySelect,
  selectedCategory = 'الكل',
}) => {
  const { theme, toggleTheme } = useTheme();
  const {
    totalItemCount,
    setIsCartOpen,
    currentUser,
    setIsAuthModalOpen,
    setIsAdminDashboardOpen,
    setIsMasterAdminOpen,
    siteSettings,
    activatedVendorIds,
    vendorUser,
    logoutCustomer,
    categories,
  } = useCart();

  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const scrollCategories = (dir: 'right' | 'left') => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: dir === 'left' ? -180 : 180, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchQueryChange) {
      onSearchQueryChange(searchInputValue);
    }
  };

  const activeVendorObj = vendorUser || (currentUser?.role === 'VENDOR' ? {
    id: currentUser.id,
    name: currentUser.fullName,
    avatar: currentUser.avatar || '',
    phone: currentUser.phone,
    whatsappFormatted: currentUser.phone,
    location: currentUser.city || 'بغداد',
    trustTier: 3 as const,
    verifiedBadge: true,
    totalSales: 0,
    rating: 5.0,
    responseTime: 'سريع ⚡',
  } : null);

  const isVendorActivated = activeVendorObj ? activatedVendorIds.includes(activeVendorObj.id) : true;

  return (
    <>
      {/* Dynamic Top Announcement Bar */}
      <div className="bg-amber-500 dark:bg-amber-600 text-slate-950 font-bold text-xs py-1.5 px-4 text-center flex items-center justify-between gap-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4 text-[11px] sm:text-xs">
          <div className="flex items-center gap-3">
            <span className="bg-slate-950 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-black tracking-wide">
              أوتلت أمازون بالعراق
            </span>
            <span className="hidden sm:inline">{siteSettings.topBannerText}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-900 font-extrabold flex-shrink-0">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> شحن لجميع المحافظات
            </span>
            <span className="flex items-center gap-1 hidden md:inline-flex">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-950" /> فحص 100%
            </span>
            <button
              onClick={onOpenConditionGuide}
              className="underline hover:text-slate-950 transition-colors text-[11px]"
            >
              دليل درجات الفحص 📋
            </button>
          </div>
        </div>
      </div>

      {/* Main E-Commerce Navbar */}
      <header className="sticky top-0 z-40 w-full transition-colors duration-200 bg-slate-900 dark:bg-carbon-950 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-2xl tracking-tight text-white font-sans">
                  {siteSettings.siteName.split(' ')[0]}<span className="text-amber-400"> {siteSettings.siteName.split(' ').slice(1).join(' ')}</span>
                </span>
              </div>
              <span className="text-[10px] text-amber-300/90 font-bold -mt-1 tracking-wider">
                {siteSettings.siteTagline}
              </span>
            </div>
          </Link>

          {/* Wide Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-2xl hidden md:flex items-center rounded-xl bg-white text-slate-900 overflow-hidden shadow-inner border border-slate-200 focus-within:ring-2 focus-within:ring-amber-500 transition-all"
          >
            <div className="relative border-l border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 px-3 py-2.5 cursor-pointer flex items-center gap-1 flex-shrink-0">
              <span>{selectedCategory}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <input
              type="text"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              placeholder="ابحث عن قطعة، ملابس، موديل، ماركة (مثل: Sony, Columbia, OPEN_BOX)..."
              className="w-full px-3 py-2 text-xs text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 font-medium"
            />

            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 transition-colors flex items-center justify-center flex-shrink-0"
              title="بحث"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Action Buttons Cluster */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

            {/* 1. Vendor Add Listing Button (ONLY visible when a vendor is logged in AND activated) */}
            {activeVendorObj && isVendorActivated && (
              <button
                onClick={() => setIsAdminDashboardOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-md transition-all active:scale-95"
                title="لوحة التاجر ونشر جديد"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>نشر بضاعة جديدة</span>
              </button>
            )}

            {/* 2. Vendor Portal */}
            {activeVendorObj && (
              <Link
                href="/vendor/portal"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                title="بوابة التجار"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">{activeVendorObj.name.slice(0, 12)}</span>
              </Link>
            )}

            {/* 3. Customer Login / Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              {isMounted && currentUser ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(v => !v)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                  >
                    {Boolean((currentUser as any)?.isSiteAdmin || currentUser.role === 'ADMIN') ? (
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                    ) : (currentUser.role === 'VENDOR' || activeVendorObj) ? (
                      <Store className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <User className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="max-w-[90px] truncate">{currentUser.fullName}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute left-0 top-full mt-2 w-52 rounded-2xl shadow-2xl overflow-hidden z-50"
                      style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-slate-700">
                        <p className="font-black text-white text-sm truncate">{currentUser.fullName}</p>
                        {currentUser.email && (
                          <p className="text-slate-400 text-xs truncate">{currentUser.email}</p>
                        )}
                        {(currentUser.isSiteAdmin || currentUser.role === 'ADMIN') ? (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black">
                            <Crown className="w-3 h-3" /> مدير الموقع
                          </span>
                        ) : (currentUser.role === 'VENDOR' || activeVendorObj) ? (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black">
                            <Store className="w-3 h-3" /> تاجر معتمد ⚡
                          </span>
                        ) : null}
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        {(currentUser.role === 'VENDOR' || activeVendorObj) && (
                          <button
                            onClick={() => { setIsUserMenuOpen(false); setIsAdminDashboardOpen(true); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-300 font-bold hover:bg-white/5 transition-colors text-right"
                          >
                            <PlusCircle className="w-4 h-4 text-amber-400" />
                            نشر بضاعة جديدة 📦
                          </button>
                        )}
                        <button
                          onClick={() => { setIsUserMenuOpen(false); setIsAuthModalOpen(true); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-right"
                        >
                          <Edit3 className="w-4 h-4 text-slate-400" />
                          تعديل بياناتي
                        </button>
                        <button
                          onClick={() => { logoutCustomer(); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-right"
                        >
                          <LogOut className="w-4 h-4" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  <span>تسجيل الدخول</span>
                </button>
              )}
            </div>

            {/* 4. Master Admin CMS Link (ONLY for admin) */}
            {((currentUser as any)?.isSiteAdmin || vendorUser?.isSiteAdmin || vendorUser?.id === 'v_admin') && (
              <a
                href="/balat-admin-x99"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors border border-amber-500/30"
                title="لوحة المدير العامة"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">الإدارة 👑</span>
              </a>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
              title="تبديل المظهر"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                {totalItemCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 w-4 h-4 rounded-full bg-slate-950 text-amber-400 text-[9px] font-black flex items-center justify-center border border-amber-400">
                    {totalItemCount}
                  </span>
                )}
              </div>
              <span className="font-extrabold hidden sm:inline">السلة</span>
            </button>

          </div>

        </div>

        {/* Categories Carousel Strip - with scroll arrows */}
        <div className="bg-slate-800/90 dark:bg-carbon-900 border-t border-slate-700/80 text-xs py-1.5 px-2 relative">
          <div className="max-w-7xl mx-auto flex items-center gap-1">
            {/* Scroll Left Arrow (RTL: scroll to show more right items) */}
            <button
              onClick={() => scrollCategories('right')}
              className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-400 flex items-center justify-center transition-all z-10"
              aria-label="تمرير يساراً"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Scrollable Strip */}
            <div
              ref={categoryScrollRef}
              className="flex-1 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none whitespace-nowrap px-1"
            >
              {(categories.length > 0 ? categories : ['الكل']).map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => onCategorySelect && onCategorySelect(cat)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Arrow */}
            <button
              onClick={() => scrollCategories('left')}
              className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-400 flex items-center justify-center transition-all z-10"
              aria-label="تمرير يميناً"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

      </header>

      {/* Mobile QR Modal */}
      <MobileQRCodeModal
        isOpen={isQRCodeOpen}
        onClose={() => setIsQRCodeOpen(false)}
      />
    </>
  );
};
