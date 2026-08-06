export type ConditionType = 'NEW' | 'OPEN_BOX' | 'USED' | 'SCRAP';
export type ProductStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'ARCHIVED';

export interface Vendor {
  id: string;
  name: string;
  avatar: string;
  phone: string; // WhatsApp phone e.g. "9647701234567"
  whatsappFormatted: string;
  location: string;
  trustTier: 1 | 2 | 3 | 4 | 5; // 1 to 5 stars
  verifiedBadge: boolean;
  totalSales: number;
  rating: number;
  responseTime: string;
  isSiteAdmin?: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  model?: string;
  serialNumber?: string;
  condition: ConditionType;
  conditionNotes: string;
  retailPrice: number; // Original retail price in IQD
  outletPrice: number; // Outlet price after discount in IQD
  publishedAt: string; // ISO String (used to evaluate 24h discount rule)
  reservedAt?: string; // ISO String timestamp if RESERVED (1-hour timeout rule)
  expiresAt: string; // ISO String timestamp (7-day lifespan rule)
  images: string[];
  tags: string[];
  vendorId: string;
  status: ProductStatus;
  quantity: number;
  category: string;
  isFeatured?: boolean;
  specs?: Record<string, string>;
  viewsCount?: number;
}

export interface ReportItem {
  id: string;
  targetName: string;
  targetCode: string;
  reasonCategory: string;
  customDetails?: string;
  reporterName: string;
  reporterPhone: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface VendorSubCart {
  vendor: Vendor;
  items: CartItem[];
  subTotal: number;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
}

// Activity log entry per session/action
export interface ActivityLogEntry {
  id: string;
  action: 'LOGIN' | 'LOGOUT' | 'VIEW_PRODUCT' | 'RESERVE' | 'BUY' | 'REPORT' | 'REGISTER' | 'PUBLISH';
  description: string;
  ip: string;
  device?: string;
  timestamp: string; // ISO
}

// Extended UserProfile with tracking fields
export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  isMember: boolean;
  isSiteAdmin?: boolean;
  city?: string;
  address?: string;
  // Tracking fields
  registeredAt?: string;
  lastLoginAt?: string;
  loginCount?: number;
  lastIp?: string;
  deviceInfo?: string;
  totalOrders?: number;
  activityLog?: ActivityLogEntry[];
}

// Tree-based category structure
export interface TreeCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  children?: TreeCategory[];
  postCount?: number;
  icon?: string;
}

export interface SearchFilters {
  query: string;
  condition: string;
  category: string;
  vendorId: string;
  showSection: 'ALL' | 'FEATURED' | 'RECENT' | 'SOLD';
  minPrice: number;
  maxPrice: number;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'newest';
}
