import { Product, Vendor } from '../types';

export const INITIAL_CATEGORIES = [
  'الكل',
  'إلكترونيات',
  'أجهزة منزلية',
  'الملابس (رجالي، نسائي، أطفال، أحذية واكسسوارات)',
  'ملابس رجالية',
  'ملابس نسائية',
  'ملابس أطفال',
  'أحذية واكسسوارات',
  'عطور وكوزمتك',
  'عطور',
  'كوزمتك عناية',
  'كوزمتك تجميل',
  'مستلزمات DHL وطرد بريدي',
  'أجهزة كهربائية',
  'أدوات مطبخ',
  'هواتف واكسسوارات',
  'كمبيوتر وملحقات',
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'v_admin',
    name: 'أبو وارث أمازون (مدير الموقع 👑)',
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
  }
];

export const INITIAL_PRODUCTS: Product[] = [];
