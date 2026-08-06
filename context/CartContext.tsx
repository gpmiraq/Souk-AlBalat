'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, CustomerDetails, Product, UserProfile, Vendor, VendorSubCart } from '../types';
import { INITIAL_VENDORS, INITIAL_PRODUCTS } from '../data/mockData';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';

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
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loginCustomer: (phoneOrProfile: string | UserProfile, name?: string, city?: string, address?: string, landmark?: string) => void;
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

  // Categories & Vendors Database (Live Firestore)
  categories: string[];
  publishCategoryToFirestore: (categoryName: string) => Promise<void>;
  publishVendorToFirestore: (vendor: Vendor) => Promise<void>;

  // Products Database
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  publishProductToFirestore: (product: Product) => Promise<void>;
  deleteProductFromFirestore: (productId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isMasterAdminOpen, setIsMasterAdminOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [categories, setCategories] = useState<string[]>(['الكل']);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorUser, setVendorUser] = useState<Vendor | null>(null);
  const [activatedVendorIds, setActivatedVendorIds] = useState<string[]>(['v_admin']);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

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

  // Load live Firestore collections (Products, Categories, Vendors)
  useEffect(() => {
    const fetchLiveFirestoreData = async () => {
      // 1. Products
      try {
        const prodSnap = await getDocs(collection(db, 'products'));
        const liveProductsList: Product[] = [];
        prodSnap.forEach((docSnap) => {
          liveProductsList.push({ id: docSnap.id, ...docSnap.data() } as Product);
        });
        setProducts(liveProductsList);
      } catch (err: any) {
        console.error('Firestore Products fetch error:', err?.message || err);
      }

      // 2. Categories
      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        if (!catSnap.empty) {
          const list: string[] = [];
          catSnap.forEach((d) => {
            const data = d.data();
            if (data.name) list.push(data.name);
          });
          if (list.length > 0) {
            setCategories(Array.from(new Set(['الكل', ...list])));
          }
        } else {
          // Seed initial categories once into Firestore
          const defaultCats = [
            'إلكترونيات', 'أجهزة منزلية', 'الملابس (رجالي، نسائي، أطفال، أحذية واكسسوارات)',
            'ملابس رجالية', 'ملابس نسائية', 'ملابس أطفال', 'أحذية واكسسوارات',
            'عطور وكوزمتك', 'عطور', 'كوزمتك عناية', 'كوزمتك تجميل',
            'مستلزمات DHL وطرد بريدي', 'أجهزة كهربائية', 'أدوات مطبخ', 'هواتف واكسسوارات', 'كمبيوتر وملحقات'
          ];
          for (let i = 0; i < defaultCats.length; i++) {
            await setDoc(doc(db, 'categories', `cat_${i + 1}`), { name: defaultCats[i], order: i + 1 });
          }
          setCategories(['الكل', ...defaultCats]);
        }
      } catch (err: any) {
        console.error('Firestore Categories fetch error:', err?.message || err);
      }

      // 3. Vendors
      try {
        const vendorSnap = await getDocs(collection(db, 'vendors'));
        if (!vendorSnap.empty) {
          const list: Vendor[] = [];
          vendorSnap.forEach((d) => list.push({ id: d.id, ...d.data() } as Vendor));
          setVendors(list);
        } else {
          // Seed master vendor once into Firestore
          const masterVendor: Vendor = {
            id: 'v_admin',
            name: 'أبو وارث أمازون',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            phone: '9647701234567',
            whatsappFormatted: '0770 123 4567',
            location: 'بغداد - المقر الرئيسي للمدير',
            trustTier: 5,
            verifiedBadge: true,
            totalSales: 3500,
            rating: 5.0,
            responseTime: 'فوري ⚡',
            isSiteAdmin: true,
          };
          await setDoc(doc(db, 'vendors', 'v_admin'), masterVendor);
          setVendors([masterVendor]);
        }
      } catch (err: any) {
        console.error('Firestore Vendors fetch error:', err?.message || err);
      }
    };

    fetchLiveFirestoreData();

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

  const publishCategoryToFirestore = async (categoryName: string): Promise<void> => {
    const cleanName = categoryName.trim();
    if (!cleanName) return;
    const catId = `cat_${Date.now()}`;
    await setDoc(doc(db, 'categories', catId), { name: cleanName, createdAt: new Date().toISOString() });
    setCategories((prev) => Array.from(new Set([...prev, cleanName])));
  };

  const publishVendorToFirestore = async (vendor: Vendor): Promise<void> => {
    await setDoc(doc(db, 'vendors', vendor.id), vendor, { merge: true });
    setVendors((prev) => {
      const exists = prev.find((v) => v.id === vendor.id);
      return exists ? prev.map((v) => (v.id === vendor.id ? vendor : v)) : [...prev, vendor];
    });
  };

  // Save products to localStorage as local cache only
  useEffect(() => {
    try {
      localStorage.setItem('balat_iq_products', JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products cache:', e);
    }
  }, [products]);

  // ─ Firestore product publish/delete ────────────────────────
  const publishProductToFirestore = async (product: Product): Promise<void> => {
    const isAdmin = !!currentUser?.isSiteAdmin || currentUser?.role === 'ADMIN' || !!vendorUser?.isSiteAdmin || vendorUser?.id === 'v_admin';
    const isVendor = !!vendorUser;
    if (!isAdmin && !isVendor) {
      console.warn('Unauthorized: Only admins or vendors can publish products.');
      return;
    }
    await setDoc(doc(db, 'products', product.id), product);
    setProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      return exists ? prev.map(p => p.id === product.id ? product : p) : [product, ...prev];
    });
  };

  const deleteProductFromFirestore = async (productId: string): Promise<void> => {
    const isAdmin = !!currentUser?.isSiteAdmin || currentUser?.role === 'ADMIN' || !!vendorUser?.isSiteAdmin || vendorUser?.id === 'v_admin';
    const isVendor = !!vendorUser;
    if (!isAdmin && !isVendor) {
      console.warn('Unauthorized: Only admins or vendors can delete products.');
      return;
    }
    await deleteDoc(doc(db, 'products', productId));
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

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

  // Save user profile & synchronize Vendor profile as ONE unified account
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('balat_iq_user', JSON.stringify(currentUser));

        // Find if this currentUser is a registered vendor
        const matchedVendor = vendors.find(
          (v) => v.id === currentUser.id || (v.phone && currentUser.phone && v.phone === currentUser.phone)
        );

        if (currentUser.role === 'VENDOR' || matchedVendor || currentUser.role === 'ADMIN' || currentUser.isSiteAdmin) {
          const vObj: Vendor = matchedVendor || {
            id: currentUser.id,
            name: currentUser.fullName,
            avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            phone: currentUser.phone,
            whatsappFormatted: currentUser.phone,
            location: currentUser.city || 'بغداد',
            trustTier: 3,
            verifiedBadge: true,
            totalSales: 0,
            rating: 5.0,
            responseTime: 'سريع ⚡',
            isSiteAdmin: !!currentUser.isSiteAdmin || currentUser.role === 'ADMIN',
          };

          setVendorUser(vObj);
          localStorage.setItem('balat_iq_vendor', JSON.stringify(vObj));
          setActivatedVendorIds((prev) => Array.from(new Set([...prev, vObj.id])));
        } else {
          setVendorUser(null);
          localStorage.removeItem('balat_iq_vendor');
        }
      } else {
        localStorage.removeItem('balat_iq_user');
        setVendorUser(null);
        localStorage.removeItem('balat_iq_vendor');
      }
    } catch (e) {
      console.error('Error saving user profile:', e);
    }
  }, [currentUser, vendors]);

  const updateSiteSettings = (updated: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...updated }));
  };

  const toggleVendorActivation = (vendorId: string) => {
    setActivatedVendorIds((prev) =>
      prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]
    );
  };

  const loginCustomer = (phoneOrProfile: string | UserProfile, name: string = '', city: string = 'بغداد', address: string = '', landmark: string = '') => {
    let user: UserProfile;
    if (typeof phoneOrProfile === 'object') {
      // Called with a full UserProfile (from Google OAuth flow)
      user = phoneOrProfile;
      setCustomerDetails((prev) => ({
        ...prev,
        fullName: user.fullName,
        phone: user.phone,
        city: user.city || 'بغداد',
        address: user.address || '',
      }));
    } else {
      const fullAddressString = [city, address, landmark ? `(أقرب نقطة دالة: ${landmark})` : ''].filter(Boolean).join(' - ');
      user = {
        id: `usr_${Date.now()}`,
        fullName: name,
        phone: phoneOrProfile,
        role: 'CUSTOMER',
        isMember: true,
        city,
        address: fullAddressString,
      };
      setCustomerDetails((prev) => ({
        ...prev,
        fullName: name,
        phone: phoneOrProfile,
        city,
        address: fullAddressString,
      }));
    }
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const logoutCustomer = async () => {
    try {
      const { auth } = await import('../lib/firebase');
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (err) {
      console.error('Firebase signOut error:', err);
    }
    setCurrentUser(null);
    setVendorUser(null);
    localStorage.removeItem('balat_iq_user');
    localStorage.removeItem('balat_iq_vendor');
    sessionStorage.removeItem('souk_admin_authed');
    sessionStorage.setItem('souk_admin_manual_logout', 'true');
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

  const [cartToastNotice, setCartToastNotice] = useState<string | null>(null);

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

    // Show toast notification without opening drawer!
    setCartToastNotice(`🛒 تم إضافة "${product.title}" إلى سلة المشتريات!`);
    setTimeout(() => {
      setCartToastNotice(null);
    }, 3500);

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

    // Use live currentUser profile details
    const liveName = currentUser?.fullName || customerDetails.fullName || 'غير مدخل';
    const livePhone = currentUser?.phone || customerDetails.phone || 'غير مدخل';
    const liveCity = currentUser?.city || customerDetails.city || 'بغداد';
    const liveAddress = currentUser?.address || customerDetails.address || 'حسب الاتفاق';

    const messageLines = [
      `*طلب شراء جديد من متجر ${siteSettings.siteName}*`,
      '----------------------------------------',
      `*رقم الطلب:* #${orderId}`,
      `*التاجر الموجه إليه:* ${subCart.vendor.name}`,
      '',
      '*معلومات الزبون المسجل:*',
      `• *الاسم:* ${liveName}`,
      `• *الهاتف:* ${livePhone}`,
      `• *المحافظة/المدينة:* ${liveCity}`,
      `• *العنوان وأقرب نقطة دالة:* ${liveAddress}`,
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

    let rawVendorPhone = subCart.vendor.phone;
    if ((subCart.vendor.id === 'v_admin' || subCart.vendor.isSiteAdmin) && siteSettings.adminPhone) {
      rawVendorPhone = siteSettings.adminPhone;
    }
    const cleanPhone = rawVendorPhone.replace(/\D/g, '').replace(/^0/, '964');

    return `https://wa.me/${cleanPhone}?text=${encoded}`;
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
        setCurrentUser,
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
        categories,
        publishCategoryToFirestore,
        publishVendorToFirestore,
        products,
        setProducts,
        publishProductToFirestore,
        deleteProductFromFirestore,
      }}
    >
      {children}

      {/* Floating Add to Cart Toast Notification */}
      {cartToastNotice && (
        <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 z-[9999] max-w-md px-5 py-3.5 bg-slate-900 border border-amber-500/50 text-white rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-2.5 text-xs font-bold truncate">
            <span className="text-base flex-shrink-0">🛒</span>
            <span className="truncate">{cartToastNotice}</span>
          </div>
          <button
            onClick={() => { setIsCartOpen(true); setCartToastNotice(null); }}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all flex-shrink-0 shadow-md"
          >
            عرض السلة ↗
          </button>
        </div>
      )}
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
