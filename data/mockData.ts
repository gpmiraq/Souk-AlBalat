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

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 3600 * 1000).toISOString();

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'سماعات رأس لاسلكية Sony WH-1000XM5 عازلة للضوضاء',
    description: 'سماعة سوني الأصلي رادع الضوضاء الفائق، وارد أمازون أمريكا. كارتون مفتوح مع كامل الملحقات الأصلية. الشحن يدوم حتى 30 ساعة.',
    model: 'WH-1000XM5 / B',
    serialNumber: 'SN-SNY-992183',
    condition: 'OPEN_BOX',
    conditionNotes: 'العلبة مفتوحة فقط للتأكد من المحتويات، السماعة جديدة 100% بدون أي خدش، مع الحقيبة الكابلات الأصلية.',
    retailPrice: 480000,
    outletPrice: 320000,
    publishedAt: hoursAgo(48),
    expiresAt: hoursAgo(-120),
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['سوني', 'سماعات', 'Sony', 'صوتيات', 'أمازون'],
    vendorId: 'v1',
    status: 'AVAILABLE',
    quantity: 3,
    category: 'إلكترونيات',
    isFeatured: true,
    specs: {
      'الماركة': 'Sony',
      'عزل الضوضاء': 'نشط ANC',
      'عمر البطارية': '30 ساعة',
    },
    viewsCount: 342,
  },
  {
    id: 'p9',
    title: 'جاكيت شتوي رجالي مقاوم للماء Columbia Omni-Heat - جديد',
    description: 'جاكيت كولومبيا الشتوي الأصلي بتقنية العزل الحراري المتقدمة، وارد أمازون أوروبا. بضاعة جديدة بالتاغ والكرتون.',
    model: 'COL-OMNI-2024',
    serialNumber: 'SN-COL-99011',
    condition: 'NEW',
    conditionNotes: 'جديد 100% بالكرتون والتاغ الأصلي. القياسات المتوفرة: M, L, XL',
    retailPrice: 185000,
    outletPrice: 120000,
    publishedAt: hoursAgo(10),
    expiresAt: hoursAgo(-140),
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['ملابس', 'كولومبيا', 'جاكيت', 'جديد', 'رجالي'],
    vendorId: 'v1',
    status: 'AVAILABLE',
    quantity: 6,
    category: 'ملابس رجالية',
    isFeatured: true,
    specs: {
      'الماركة': 'Columbia',
      'الحالة': 'جديد بالتاغ 100%',
      'القياسات المتوفرة': 'M, L, XL',
      'النوع': 'رجالي شتوي'
    }
  },
  {
    id: 'p10',
    title: 'حذاء رياضي Nike Air Zoom Pegasus 40 - جديد بالأصل',
    description: 'حذاء نايوكي الجري الأصلي للأنشطة الرياضية والركض، وارد أوتلت أمازون ألمانيا.',
    model: 'PEGASUS-40-EU',
    serialNumber: 'SN-NKE-4401',
    condition: 'NEW',
    conditionNotes: 'جديد 100% بالعلبة والتاغ الأصلي. القياسات المتوفرة: EU 41, 42, 43, 44',
    retailPrice: 210000,
    outletPrice: 145000,
    publishedAt: hoursAgo(15),
    expiresAt: hoursAgo(-130),
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['نايكي', 'Nike', 'أحذية', 'جديد'],
    vendorId: 'v2',
    status: 'AVAILABLE',
    quantity: 4,
    category: 'أحذية واكسسوارات',
    isFeatured: true,
    specs: {
      'الماركة': 'Nike',
      'الحالة': 'جديد بالكرتون',
      'القياسات المتوفرة': 'EU 41, 42, 43, 44',
      'الاستخدام': 'جري / رياضي'
    }
  },
  {
    id: 'p11',
    title: 'عطر رجالي فاخر Dior Sauvage Eau de Parfum 100ml - جديد',
    description: 'عطر ديور سوفاج الفرنسي الأصلي تركيز أودي بارفان، وارد بالات أوتلت فرنسا. بختم النايلون الأصلي.',
    model: 'DIOR-SAUV-100',
    serialNumber: 'SN-DIR-00918',
    condition: 'NEW',
    conditionNotes: 'جديد بالختم والكرتون الأصلي مع الباركود والسيليكون.',
    retailPrice: 240000,
    outletPrice: 165000,
    publishedAt: hoursAgo(8),
    expiresAt: hoursAgo(-140),
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['عطر', 'ديور', 'كوزمتك', 'جديد'],
    vendorId: 'v3',
    status: 'AVAILABLE',
    quantity: 5,
    category: 'عطور',
    isFeatured: true,
    specs: {
      'الماركة': 'Christian Dior',
      'الحجم': '100 مل',
      'تاريخ الصلاحية': 'مقبولة وتاريخ حديث 2027',
    }
  },
  {
    id: 'p2',
    title: 'طرد بريدي مغلق DHL اروپي - وجبة إلكترونيات منوعة',
    description: 'طرد بريدي مراجع DHL المانيا مغلف بحالة الشركة الأصلية. يحتوي على قطع الكترونية عشوائية عالية القيمة مفحوصة الوزن.',
    model: 'DHL-EU-BOX-99',
    serialNumber: 'SN-DHL-00918',
    condition: 'NEW',
    conditionNotes: 'جديد بختم شركة DHL المانيا، طرد بريدي أصلي بضاعة اروپية.',
    retailPrice: 250000,
    outletPrice: 180000,
    publishedAt: hoursAgo(12),
    expiresAt: hoursAgo(-144),
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['DHL', 'طرد بريدي', 'جديد', 'أوروبي', 'بالة'],
    vendorId: 'v3',
    status: 'AVAILABLE',
    quantity: 5,
    category: 'مستلزمات DHL وطرد بريدي',
    isFeatured: true,
    specs: {
      'المصدر': 'DHL المانيا',
      'الحالة': 'جديد بالختم',
      'الوزن': '4.5 كغم'
    }
  },
  {
    id: 'p3',
    title: 'ماكينة إعداد القهوة DeLonghi Magnifica S أوتوماتيكية',
    description: 'ماكينة ديلونجي ديلوكس لإعداد الإسبريسو والكبوتشينو بطحن طازج للحبوب. ستوك أمازون ألمانيا.',
    model: 'ECAM22.110.B',
    serialNumber: 'SN-DLG-440192',
    condition: 'USED',
    conditionNotes: 'مستعمل بحالة ممتازة مع بعض الآثار السطحية الاستعمال، مفحوصة والمضخة تعمل بكفاءة 100%.',
    retailPrice: 750000,
    outletPrice: 440000,
    publishedAt: hoursAgo(36),
    expiresAt: hoursAgo(-100),
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['قهوة', 'ديلونجي', 'DeLonghi', 'مطبخ'],
    vendorId: 'v1',
    status: 'AVAILABLE',
    quantity: 2,
    category: 'أدوات مطبخ',
    isFeatured: true,
    specs: {
      'الماركة': 'DeLonghi',
      'الضغط': '15 بار',
    }
  },
  {
    id: 'p4',
    title: 'ماوس احترافي Logitech MX Master 3S - علبة مفتوحة',
    description: 'الماوس الأحدث والأكثر راحة للمبرمجين والمصممين. نقرات صامتة وعجلة التمرير المغناطيسية MagSpeed. ستوك أمازون بريطانيا.',
    model: 'MX Master 3S',
    serialNumber: 'SN-LOG-881204',
    condition: 'OPEN_BOX',
    conditionNotes: 'علبة مفتوحة فقط، الماوس لم يستخدم ومرفق مع دانجل Logi Bolt الأصلي.',
    retailPrice: 160000,
    outletPrice: 95000,
    publishedAt: hoursAgo(30),
    expiresAt: hoursAgo(-110),
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['لوجيتك', 'Logitech', 'ماوس', 'كمبيوتر'],
    vendorId: 'v2',
    status: 'AVAILABLE',
    quantity: 4,
    category: 'كمبيوتر وملحقات',
    isFeatured: false,
  },
  {
    id: 'p5',
    title: 'قلاية هوائية Philips XXL 7.2L - قطع (فحم - لا يعمل)',
    description: 'مقلاة فيليبس بدون زيت بحجم كبير. للقطع والتصليح أو كقطع غيار (توقف البورد أو الهيتر). بضاعة بالتصليح.',
    model: 'HD9867/90 - PARTS',
    serialNumber: 'SN-PHL-SCRAP-01',
    condition: 'SCRAP',
    conditionNotes: 'فحم - لا تعمل، تباع كما هي كقطع غيار للمصلحين والورش (الهيكل والأواني بحالة ممتازة).',
    retailPrice: 390000,
    outletPrice: 45000,
    publishedAt: hoursAgo(72),
    expiresAt: hoursAgo(-48),
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['فحم', 'قطع غيار', 'تصليح', 'فيليبس', 'Philips'],
    vendorId: 'v2',
    status: 'AVAILABLE',
    quantity: 1,
    category: 'أجهزة كهربائية',
    isFeatured: false,
  }
];
