/* ==========================================================================
   Project Constants & Security Configuration
   ========================================================================== */

export const APP_CONFIG = {
  STORE_NAME: "سوق البالات | Amazon & DHL Outlet IQ",
  STORE_NAME_SHORT: "سوق البالات",
  TAGLINE: "أول منصة لبضائع أمازون والبالة والـ DHL في العراق",
  CURRENCY: "د.ع",
  FIXED_DELIVERY_FEE: 5000, // 5,000 IQD fixed delivery rate
  SUPPORT_PHONE: "+9647700000000", // Admin WhatsApp Support
  DEFAULT_DISCLAIMER: "تنبيه إخلاء المسؤولية: إن الموقع هو وسيلة ربط بينك وبين تجار وبائعي الأمازون والبالات، ولا نتحمل مسؤولية التعامل والافتراضيات المباشرة.",
  
  // Obfuscated / Secret URL Routes for Security
  ROUTES: {
    HOME: "/",
    PRODUCT: "/p",
    MERCHANT_STORE: "/seller",
    MERCHANT_PORTAL: "/v-space-k90",
    SUPER_ADMIN: "/hub-mgr-secure-x90",
  }
};

export const PRODUCT_CONDITIONS = {
  NEW: {
    id: "new",
    label: "جديد غير مفتوح (NEW)",
    shortLabel: "جديد غير مفتوح",
    subtitle: "بضائع جديدة كلياً بالكرتون ولم تفتح",
    icon: "✨",
    badgeClass: "badge-new",
  },
  OPEN_BOX: {
    id: "open_box",
    label: "أوبن بوكس (Open Box)",
    shortLabel: "أوبن بوكس",
    subtitle: "جديد بالكرتون لكن مفتوح لغرض الفحص",
    icon: "📦",
    badgeClass: "badge-new",
  },
  USED: {
    id: "used",
    label: "مستخدم فحص (Used)",
    shortLabel: "مستخدم فحص",
    subtitle: "بضائع مستخدمة خاضعة للفحص والتجربة",
    icon: "🔍",
    badgeClass: "badge-used",
  },
  SCRAP: {
    id: "scrap",
    label: "عاطل - أدوات (SCRAP)",
    shortLabel: "عاطل (أدوات)",
    subtitle: "بضاعة عاطلة تباع كأدوات وقطع غيار للمصلحين",
    icon: "🔧",
    badgeClass: "badge-scrap",
  }
};

export const DEFAULT_CATEGORIES = [
  { id: "all", name: "الكل", icon: "✨" },
  { id: "electronics", name: "إلكترونيات", icon: "🎧" },
  { id: "home", name: "أجهزة منزلية", icon: "☕" },
  { id: "clothing_men", name: "ملابس رجالية", icon: "👕" },
  { id: "clothing_women", name: "ملابس نسائية", icon: "👗" },
  { id: "shoes", name: "أحذية وإكسسوارات", icon: "👟" },
  { id: "tools", name: "أدوات وقطع صيانة", icon: "🔧" },
  { id: "dhl_parcels", name: "طرود DHL الألمانية", icon: "📦" }
];
