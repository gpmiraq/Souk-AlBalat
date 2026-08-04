'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, CustomerDetails, Product, UserProfile, Vendor, VendorSubCart } from '../types';
import { INITIAL_VENDORS } from '../data/mockData';

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  topBannerText: string;
  heroTitle: string;
  primaryColor: string;
  adminPhone: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  clearVendorSubCart: (vendorId: string) => void;
  vendorSubCarts: VendorSubCart[];
  totalItemCount: number;
  totalGrandPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  customerDetails: CustomerDetails;
  setCustomerDetails: React.Dispatch<React.SetStateAction<CustomerDetails>>;
  generateWhatsAppLink: (vendorId: string) => string;
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  
  // Customer Auth
  currentUser: UserProfile | null;
  loginCustomer: (phone: string, name: string, city?: string, address?: string, landmark?: string) => void;
  logoutCustomer: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  
  // Vendor Dashboard State
  isAdminDashboardOpen: boolean;
  setIsAdminDashboardOpen: (open: boolean) => void;

  // Master Admin & Site Dynamic CMS Variables
  isMasterAdminOpen: boolean;
  setIsMasterAdminOpen: (open: boolean) => void;
  siteSettings: SiteSettings;
  updateSiteSettings: (updated: Partial<SiteSettings>) => void;
  activatedVendorIds: string[];
  toggleVendorActivation: (vendorId: string) => void;

  // Vendor Portal Auth & State
  vendorUser: Vendor | null;
  loginVendor: (user: string, pass: string) => boolean;
  logoutVendor: () => void;
  updateVendorProfile: (updated: Partial<Vendor>) => void;

  // Reserve a product for 1 hour
  reserveProduct: (productId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isMasterAdminOpen, setIsMasterAdminOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [vendorUser, setVendorUser] = useState<Vendor | null>(INITIAL_VENDORS[0]);
  const [activatedVendorIds, setActivatedVendorIds] = useState<string[]>(['v1', 'v2', 'v3']);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'سوق البالات',
    siteTagline: 'AMAZON & DHL OUTLET IQ',
    topBannerText: 'أول منصة لبضائع أمازون والبالة والـ DHL في العراق 🇮🇶',
    heroTitle: 'سوق البالات | بضائع أمازون، أوبن بوكس، وطرود DHL بأفضل الأسعار',
    primaryColor: '#f59e0b',
    adminPhone: '9647701234567',
  });

  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    fullName: '',
    phone: '',
    city: 'بغداد',
    address: '',
    notes: '',
  });

  // Load state from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('balat_iq_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedCustomer = localStorage.getItem('balat_iq_customer');
      if (savedCustomer) setCustomerDetails(JSON.parse(savedCustomer));

      const savedUser = localStorage.getItem('balat_iq_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedVendor = localStorage.getItem('balat_iq_vendor');
      if (savedVendor) setVendorUser(JSON.parse(savedVendor));

      const savedSettings = localStorage.getItem('balat_iq_settings');
      if (savedSettings) setSiteSettings(JSON.parse(savedSettings));

      const savedActivatedVendors = localStorage.getItem('balat_iq_activated_vendors');
      if (savedActivatedVendors) setActivatedVendorIds(JSON.parse(savedActivatedVendors));
    } catch (e) {
      console.error('Error loading state:', e);
    }
  }, []);

  // Save cart
  useEffect(() => {
    try {
      localStorage.setItem('balat_iq_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cart]);

  // Save site settings
  useEffect(() => {
    try {
      localStorage.setItem('balat_iq_settings', JSON.stringify(siteSettings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }, [siteSettings]);

  // Save activated vendors
  useEffect(() => {
    try {
      localStorage.setItem('balat_iq_activated_vendors', JSON.stringify(activatedVendorIds));
    } catch (e) {
      console.error('Error saving activated vendors:', e);
    }
  }, [activatedVendorIds]);

  // Save customer details
  useEffect(() => {
    try {
      localStorage.setItem('balat_iq_customer', JSON.stringify(customerDetails));
    } catch (e) {
      console.error('Error saving customer:', e);
    }
  }, [customerDetails]);

  // Save user profile
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('balat_iq_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('balat_iq_user');
      }
    } catch (e) {
      console.error('Error saving user profile:', e);
    }
  }, [currentUser]);

  const updateSiteSettings = (updated: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...updated }));
  };

  const toggleVendorActivation = (vendorId: string) => {
    setActivatedVendorIds((prev) =>
      prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]
    );
  };

  const loginCustomer = (phone: string, name: string, city: string = 'بغداد', address: string = '', landmark: string = '') => {
    const fullAddressString = [city, address, landmark ? `(أقرب نقطة دالة: ${landmark})` : ''].filter(Boolean).join(' - ');
    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      fullName: name,
      phone: phone,
      role: 'CUSTOMER',
      isMember: true,
      city: city,
      address: fullAddressString,
    };
    setCurrentUser(user);
    setCustomerDetails((prev) => ({
      ...prev,
      fullName: name,
      phone: phone,
      city: city,
      address: fullAddressString,
    }));
    setIsAuthModalOpen(false);
  };

  const logoutCustomer = () => {
    setCurrentUser(null);
  };

  const loginVendor = (user: string, pass: string): boolean => {
    const cleanUser = user.trim().toLowerCase();
    const cleanPass = pass.trim().toLowerCase();

    if ((cleanUser === 'demo' && cleanPass === 'demo') || cleanUser === 'admin') {
      setVendorUser(INITIAL_VENDORS[0]);
      return true;
    }

    const matched = vendors.find((v) => v.id.toLowerCase() === cleanUser || v.name.includes(user));
    if (matched) {
      setVendorUser(matched);
      return true;
    }

    setVendorUser(INITIAL_VENDORS[0]);
    return true;
  };

  const logoutVendor = () => {
    setVendorUser(null);
  };

  const updateVendorProfile = (updated: Partial<Vendor>) => {
    if (!vendorUser) return;
    const newVendor = { ...vendorUser, ...updated };
    setVendorUser(newVendor);
    setVendors((prev) => prev.map((v) => (v.id === vendorUser.id ? newVendor : v)));
  };

  const addToCart = (product: Product, quantity: number = 1): boolean => {
    // REQUIRE USER AUTHENTICATION FOR PURCHASING / RESERVING!
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return false;
    }

    if (product.status !== 'AVAILABLE') return false;
    
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity }];
      }
    });
    setIsCartOpen(true);
    return true;
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const clearVendorSubCart = (vendorId: string) => {
    setCart((prev) => prev.filter((item) => item.product.vendorId !== vendorId));
  };

  // Reserve: mark the cart item's product status to RESERVED with timestamp
  const reserveProduct = (productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              product: {
                ...item.product,
                status: 'RESERVED' as const,
                reservedAt: new Date().toISOString(),
              },
            }
          : item
      )
    );
  };

  const vendorSubCarts = useMemo(() => {
    const map = new Map<string, VendorSubCart>();

    cart.forEach((item) => {
      const vId = item.product.vendorId;
      const vendor = vendors.find((v) => v.id === vId) || vendors[0];

      if (!map.has(vId)) {
        map.set(vId, {
          vendor,
          items: [],
          subTotal: 0,
        });
      }

      const subCart = map.get(vId)!;
      subCart.items.push(item);

      const pubDate = new Date(item.product.publishedAt).getTime();
      const is24hPassed = Date.now() - pubDate >= 24 * 3600 * 1000;
      const activePrice = is24hPassed ? item.product.outletPrice : item.product.retailPrice;

      subCart.subTotal += activePrice * item.quantity;
    });

    return Array.from(map.values());
  }, [cart, vendors]);

  const totalItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalGrandPrice = useMemo(() => {
    return vendorSubCarts.reduce((sum, sc) => sum + sc.subTotal, 0);
  }, [vendorSubCarts]);

  const generateWhatsAppLink = (vendorId: string): string => {
    const subCart = vendorSubCarts.find((sc) => sc.vendor.id === vendorId);
    if (!subCart) return '#';

    const orderId = `IQ-${Math.floor(100000 + Math.random() * 900000)}`;

    const itemsText = subCart.items
      .map((i, idx) => {
        const pubDate = new Date(i.product.publishedAt).getTime();
        const is24hPassed = Date.now() - pubDate >= 24 * 3600 * 1000;
        const activePrice = is24hPassed ? i.product.outletPrice : i.product.retailPrice;
        const conditionLabel =
          i.product.condition === 'NEW'
            ? 'جديد'
            : i.product.condition === 'OPEN_BOX'
            ? 'علبة مفتوحة (OPEN BOX)'
            : i.product.condition === 'USED'
            ? 'مستعمل'
            : 'فحم - أدوات';

        return `${idx + 1}. *${i.product.title.trim()}*\n   • الحالة: ${conditionLabel}\n   • الموديل: ${i.product.model}\n   • الكمية: ${i.quantity} x ${activePrice.toLocaleString('en-US')} د.ع`;
      })
      .join('\n\n');

    const messageLines = [
      `*طلب شراء جديد من متجر ${siteSettings.siteName}*`,
      '----------------------------------------',
      `*رقم الطلب:* #${orderId}`,
      `*التاجر الموجه إليه:* ${subCart.vendor.name}`,
      '',
      '*معلومات الزبون المسجل:*',
      `• *الاسم:* ${customerDetails.fullName || 'غير مدخل'}`,
      `• *الهاتف:* ${customerDetails.phone || 'غير مدخل'}`,
      `• *المحافظة/المدينة:* ${customerDetails.city || 'بغداد'}`,
      `• *العنوان وأقرب نقطة دالة:* ${customerDetails.address || 'حسب الاتفاق'}`,
      customerDetails.notes ? `• *ملاحظات:* ${customerDetails.notes}` : '',
      '----------------------------------------',
      '*قائمة المنتجات المطلوبة:*',
      '',
      itemsText,
      '',
      '----------------------------------------',
      `*إجمالي حساب هذا التاجر:* *${subCart.subTotal.toLocaleString('en-US')} د.ع*`,
      '----------------------------------------',
      `تم إنشاء هذا الطلب آلياً عبر منصة ${siteSettings.siteName}`,
    ].filter(Boolean);

    const messageString = messageLines.join('\n');
    const encoded = encodeURIComponent(messageString);
    return `https://wa.me/${subCart.vendor.phone}?text=${encoded}`;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        clearVendorSubCart,
        vendorSubCarts,
        totalItemCount,
        totalGrandPrice,
        isCartOpen,
        setIsCartOpen,
        customerDetails,
        setCustomerDetails,
        generateWhatsAppLink,
        vendors,
        setVendors,

        currentUser,
        loginCustomer,
        logoutCustomer,
        isAuthModalOpen,
        setIsAuthModalOpen,

        isAdminDashboardOpen,
        setIsAdminDashboardOpen,

        isMasterAdminOpen,
        setIsMasterAdminOpen,
        siteSettings,
        updateSiteSettings,
        activatedVendorIds,
        toggleVendorActivation,

        vendorUser,
        loginVendor,
        logoutVendor,
        updateVendorProfile,
        reserveProduct,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
