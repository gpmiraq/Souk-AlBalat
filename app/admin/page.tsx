'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, ShoppingBag, Store, Sliders, BarChart3,
  CheckCircle2, XCircle, Eye, EyeOff, Plus, ArrowRight,
  TrendingUp, DollarSign, Users, Search, Zap, Globe, Settings,
  Bell, Check, Phone, Layers, Sparkles, FolderPlus, Download,
  ShieldCheck, UserCheck, AlertOctagon, Copy, Tag, Package, Award,
  ChevronRight, ChevronDown, FolderOpen, Folder, Trash2, Edit,
  X, Monitor, Smartphone, Clock, MapPin, Activity, FileText,
  Filter, SortAsc, MoreVertical, RefreshCw, ExternalLink,
  Upload, Image as ImageIcon, AlertTriangle, Info, Shield
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../../data/mockData';
import { Product, Vendor, UserProfile, ReportItem, TreeCategory, ActivityLogEntry } from '../../types';
import { createStampedImage } from '../../utils/imageWatermark';

// ─── Mock extended user data with tracking ──────────────────────────────────
const MOCK_USERS: UserProfile[] = [
  {
    id: 'u1', fullName: 'علي المحمداوي', phone: '07701112233', city: 'بغداد',
    address: 'المنصور / قرب البريد', role: 'CUSTOMER', isMember: true,
    registeredAt: '2024-11-15T10:30:00Z', lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    loginCount: 24, lastIp: '185.112.32.44', deviceInfo: 'Chrome 124 / Windows 10',
    totalOrders: 5,
    activityLog: [
      { id: 'a1', action: 'LOGIN', description: 'تسجيل دخول ناجح', ip: '185.112.32.44', device: 'Chrome / Windows', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'a2', action: 'VIEW_PRODUCT', description: 'مشاهدة: سماعات سوني WH-1000XM5', ip: '185.112.32.44', timestamp: new Date(Date.now() - 3200000).toISOString() },
      { id: 'a3', action: 'RESERVE', description: 'حجز: سماعات سوني WH-1000XM5', ip: '185.112.32.44', timestamp: new Date(Date.now() - 3000000).toISOString() },
    ],
  },
  {
    id: 'u2', fullName: 'مصطفى البصري', phone: '07802223344', city: 'البصرة',
    address: 'الجزائر / شارع الميناء', role: 'CUSTOMER', isMember: true,
    registeredAt: '2024-12-01T08:00:00Z', lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    loginCount: 7, lastIp: '103.45.67.89', deviceInfo: 'Safari / iPhone 15',
    totalOrders: 2,
    activityLog: [
      { id: 'b1', action: 'REGISTER', description: 'تسجيل حساب جديد عبر OTP', ip: '103.45.67.89', device: 'Safari / iPhone', timestamp: '2024-12-01T08:00:00Z' },
      { id: 'b2', action: 'LOGIN', description: 'تسجيل دخول ناجح', ip: '103.45.67.89', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ],
  },
  {
    id: 'u3', fullName: 'عمر الكردي', phone: '07503334455', city: 'أربيل',
    address: 'شارع 100م / قرب المول', role: 'CUSTOMER', isMember: true,
    registeredAt: '2025-01-20T14:00:00Z', lastLoginAt: new Date(Date.now() - 172800000).toISOString(),
    loginCount: 12, lastIp: '94.23.156.12', deviceInfo: 'Chrome 125 / Android',
    totalOrders: 8,
    activityLog: [
      { id: 'c1', action: 'LOGIN', description: 'تسجيل دخول', ip: '94.23.156.12', timestamp: new Date(Date.now() - 172800000).toISOString() },
      { id: 'c2', action: 'BUY', description: 'شراء: لابتوب Dell XPS 15', ip: '94.23.156.12', timestamp: new Date(Date.now() - 170000000).toISOString() },
    ],
  },
  {
    id: 'u4', fullName: 'سارة الموصلية', phone: '07604445566', city: 'الموصل',
    address: 'الدواسة / الجانب الأيمن', role: 'CUSTOMER', isMember: true,
    registeredAt: '2025-02-10T11:00:00Z', lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
    loginCount: 3, lastIp: '212.58.140.100', deviceInfo: 'Firefox / Windows 11',
    totalOrders: 1,
    activityLog: [
      { id: 'd1', action: 'REGISTER', description: 'تسجيل جديد', ip: '212.58.140.100', timestamp: '2025-02-10T11:00:00Z' },
    ],
  },
];

// ─── Initial Tree Categories ─────────────────────────────────────────────────
const INITIAL_TREE_CATEGORIES: TreeCategory[] = [
  { id: 'c1', name: 'إلكترونيات', slug: 'electronics', icon: '💻', children: [
    { id: 'c1_1', name: 'هواتف وأجهزة لوحية', slug: 'phones', parentId: 'c1' },
    { id: 'c1_2', name: 'لابتوبات وحواسيب', slug: 'laptops', parentId: 'c1' },
    { id: 'c1_3', name: 'سماعات وصوتيات', slug: 'audio', parentId: 'c1' },
  ]},
  { id: 'c2', name: 'ملابس', slug: 'clothes', icon: '👔', children: [
    { id: 'c2_1', name: 'ملابس رجالية', slug: 'mens', parentId: 'c2' },
    { id: 'c2_2', name: 'ملابس نسائية', slug: 'womens', parentId: 'c2' },
    { id: 'c2_3', name: 'ملابس أطفال', slug: 'kids', parentId: 'c2' },
    { id: 'c2_4', name: 'أحذية', slug: 'shoes', parentId: 'c2' },
    { id: 'c2_5', name: 'اكسسوارات', slug: 'accessories', parentId: 'c2' },
  ]},
  { id: 'c3', name: 'عطور وكوزمتك', slug: 'perfumes', icon: '🌸', children: [
    { id: 'c3_1', name: 'عطور', slug: 'perfumes_sub', parentId: 'c3' },
    { id: 'c3_2', name: 'كوزمتك عناية', slug: 'skincare', parentId: 'c3' },
    { id: 'c3_3', name: 'كوزمتك تجميل', slug: 'makeup', parentId: 'c3' },
  ]},
  { id: 'c4', name: 'أجهزة منزلية', slug: 'home', icon: '🏠', children: [] },
  { id: 'c5', name: 'مستلزمات DHL وطرد بريدي', slug: 'dhl', icon: '📦', children: [] },
  { id: 'c6', name: 'فحم - أدوات (SCRAP)', slug: 'scrap', icon: '🔧', children: [] },
];

type AdminTab = 'DASHBOARD' | 'PRODUCTS' | 'CATEGORIES' | 'SALES' | 'USERS' | 'REPORTS' | 'BRANDING';

// ── Utility ─────────────────────────────────────────────────────────────────
function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  const days = Math.floor(hrs / 24);
  return `منذ ${days} يوم`;
}

// ─── TreeCategory Component ──────────────────────────────────────────────────
interface TreeNodeProps {
  node: TreeCategory;
  productList: Product[];
  depth: number;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string, name: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, productList, depth, onDelete, onAddChild }) => {
  const [expanded, setExpanded] = useState(true);
  const [addingChild, setAddingChild] = useState(false);
  const [childName, setChildName] = useState('');
  const postCount = productList.filter(p => p.category.toLowerCase().includes(node.name.toLowerCase())).length;
  const hasChildren = node.children && node.children.length > 0;

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (childName.trim()) { onAddChild(node.id, childName.trim()); setChildName(''); setAddingChild(false); }
  };

  return (
    <div className={`${depth > 0 ? 'border-r border-slate-700 mr-4 pr-4' : ''}`}>
      <div className="flex items-center gap-2 py-2 group">
        <button onClick={() => setExpanded(!expanded)} className="text-slate-500 hover:text-white flex-shrink-0 w-4">
          {hasChildren ? (expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />) : <span className="w-3.5" />}
        </button>
        {node.icon && <span className="text-sm">{node.icon}</span>}
        {hasChildren || depth === 0
          ? <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
          : <Folder className="w-4 h-4 text-slate-500 flex-shrink-0" />
        }
        <span className={`font-bold text-sm ${depth === 0 ? 'text-white' : 'text-slate-300'}`}>{node.name}</span>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">{postCount}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-auto">
          <button onClick={() => setAddingChild(true)} className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="إضافة فرعي">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(node.id)} className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors" title="حذف">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {addingChild && (
        <form onSubmit={handleAddChild} className="flex items-center gap-2 py-1 mr-10">
          <input autoFocus value={childName} onChange={e => setChildName(e.target.value)}
            placeholder="اسم التصنيف الفرعي..."
            className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-amber-500/40 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500" />
          <button type="submit" className="px-2.5 py-1.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-black">+</button>
          <button type="button" onClick={() => setAddingChild(false)} className="px-2.5 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-xs">إلغاء</button>
        </form>
      )}

      {expanded && hasChildren && (
        <div>
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} productList={productList} depth={depth + 1} onDelete={onDelete} onAddChild={onAddChild} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── User Card Modal ─────────────────────────────────────────────────────────
interface UserCardModalProps {
  user: UserProfile;
  onClose: () => void;
  onConvertToVendor: (user: UserProfile) => void;
}

const UserCardModal: React.FC<UserCardModalProps> = ({ user, onClose, onConvertToVendor }) => {
  const actionIcons: Record<string, string> = {
    LOGIN: '🔑', LOGOUT: '🚪', VIEW_PRODUCT: '👁️', RESERVE: '⏱️',
    BUY: '💰', REPORT: '🚨', REGISTER: '✅', PUBLISH: '📢',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
      <div className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-5 flex items-center gap-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 text-2xl font-black flex-shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="font-black text-white text-lg flex items-center gap-2">
              {user.fullName}
              {user.role === 'ADMIN' && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">ADMIN</span>}
            </h2>
            <p className="text-sm text-slate-400 font-mono">{user.phone}</p>
            <p className="text-xs text-slate-500">{user.city} • {user.address}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 border-b border-slate-800">
          {[
            { label: 'مرات الدخول', value: user.loginCount || 0, icon: '🔑' },
            { label: 'الطلبات', value: user.totalOrders || 0, icon: '📦' },
            { label: 'آخر دخول', value: user.lastLoginAt ? timeAgo(user.lastLoginAt) : 'غير معروف', icon: '⏰' },
            { label: 'تاريخ التسجيل', value: user.registeredAt ? new Date(user.registeredAt).toLocaleDateString('ar-IQ') : '—', icon: '📅' },
          ].map((s, i) => (
            <div key={i} className="p-3 bg-slate-800 rounded-2xl text-center">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="font-black text-white text-sm">{s.value}</div>
              <div className="text-[10px] text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* IP & Device */}
        <div className="px-5 py-3 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-xl">
            <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div>
              <div className="text-slate-400">آخر عنوان IP</div>
              <div className="font-mono font-bold text-white">{user.lastIp || '—'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-xl">
            <Monitor className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div>
              <div className="text-slate-400">الجهاز والمتصفح</div>
              <div className="font-bold text-white">{user.deviceInfo || '—'}</div>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="p-5">
          <h3 className="font-black text-white text-sm mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            سجل النشاط والتتبع
          </h3>
          <div className="max-h-44 overflow-y-auto space-y-2 pl-1">
            {(user.activityLog || []).length === 0
              ? <p className="text-slate-500 text-xs">لا يوجد سجل نشاط بعد</p>
              : (user.activityLog || []).map(log => (
                <div key={log.id} className="flex items-start gap-3 p-2.5 bg-slate-800 rounded-xl text-xs">
                  <span className="text-base mt-0.5 flex-shrink-0">{actionIcons[log.action] || '•'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-200">{log.description}</div>
                    <div className="text-slate-500 flex items-center gap-2 flex-wrap">
                      <span className="font-mono">IP: {log.ip}</span>
                      {log.device && <span>• {log.device}</span>}
                      <span>• {timeAgo(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-wrap gap-2">
          <button
            onClick={() => { onConvertToVendor(user); onClose(); }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>تحويل إلى تاجر معتمد</span>
          </button>
          <a
            href={`https://wa.me/${user.phone.replace(/^0/, '964')}?text=مرحباً ${user.fullName}، تواصل من إدارة سوق البالات`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>واتساب</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── Detailed Vendor Card Modal ──────────────────────────────────────────────
const VendorCardModal: React.FC<{
  vendor: Vendor;
  products: Product[];
  isActive: boolean;
  onClose: () => void;
  onToggleActivation: (id: string) => void;
}> = ({ vendor, products, isActive, onClose, onToggleActivation }) => {
  const vProds = products.filter(p => p.vendorId === vendor.id);
  const available = vProds.filter(p => p.status === 'AVAILABLE').length;
  const reserved = vProds.filter(p => p.status === 'RESERVED').length;
  const sold = vProds.filter(p => p.status === 'SOLD').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <img src={vendor.avatar} alt={vendor.name} className="w-12 h-12 rounded-2xl object-cover border border-amber-500/30" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base">{vendor.name}</h3>
                {vendor.verifiedBadge && <ShieldCheck className="w-4 h-4 text-amber-500" />}
                {vendor.isSiteAdmin && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">مدير الموقع 👑</span>}
              </div>
              <p className="text-xs text-slate-400 font-medium">{vendor.location} • سرعة الرد: {vendor.responseTime}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detailed Stats */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/50 text-center text-xs">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block font-bold mb-1">التقييم العام</span>
            <span className="text-amber-400 font-black text-base">★ {vendor.rating}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-emerald-400 text-[11px] block font-bold mb-1">المتاحة للحجز</span>
            <span className="text-emerald-400 font-black text-base">{available}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-amber-400 text-[11px] block font-bold mb-1">محجوزة حالياً</span>
            <span className="text-amber-400 font-black text-base">{reserved}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-red-400 text-[11px] block font-bold mb-1">تم بيعها</span>
            <span className="text-red-400 font-black text-base">{sold}</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="px-5 py-3 border-y border-slate-800 flex items-center justify-between text-xs bg-slate-950">
          <span className="text-slate-400 font-bold">رقم التواصل والواتساب:</span>
          <span className="font-mono text-white font-bold">{vendor.phone}</span>
        </div>

        {/* Products List owned by vendor */}
        <div className="p-5 space-y-3">
          <h4 className="font-black text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            بضائع ومنشورات هذا التاجر ({vProds.length}):
          </h4>
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {vProds.length === 0 ? (
              <p className="text-slate-500 text-xs py-4 text-center">لا توجد بضائع منشورة لهذا التاجر بعد.</p>
            ) : (
              vProds.map(prod => (
                <div key={prod.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    {prod.images[0] && (
                      <img src={prod.images[0]} alt={prod.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h5 className="font-bold text-white truncate">{prod.title}</h5>
                      <span className="text-amber-400 font-mono text-[11px]">{prod.outletPrice.toLocaleString('en-US')} د.ع</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                    prod.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' :
                    prod.status === 'RESERVED' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {prod.status === 'AVAILABLE' ? 'متاح' : prod.status === 'RESERVED' ? 'محجوز' : 'مباع'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-950">
          <a
            href={`https://wa.me/${vendor.phone.replace(/^0/, '964')}?text=مرحباً ${vendor.name}، تواصل من إدارة سوق البالات`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Phone className="w-4 h-4" />
            <span>مراسلة عبر واتساب</span>
          </a>
          <button
            onClick={() => onToggleActivation(vendor.id)}
            className={`px-5 py-3 rounded-xl text-xs font-black transition-all ${
              isActive ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isActive ? 'إيقاف التاجر' : 'تفعيل التاجر'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function MasterAdminPage() {
  const { siteSettings, updateSiteSettings, vendors, setVendors, toggleVendorActivation, activatedVendorIds, products: productList, setProducts: setProductList, publishProductToFirestore, deleteProductFromFirestore } = useCart();
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');

  const [treeCategories, setTreeCategories] = useState<TreeCategory[]>(INITIAL_TREE_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState<'ALL' | 'AVAILABLE' | 'SOLD'>('ALL');

  // Admin Authentication State
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminUserInput, setAdminUserInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');

  // Check existing session
  React.useEffect(() => {
    const savedAuth = sessionStorage.getItem('souk_admin_authed');
    if (savedAuth === 'true') {
      setIsAdminAuth(true);
    }
  }, []);

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [realUsers, setRealUsers] = useState<UserProfile[]>([]);

  // Fetch real users from Firestore
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        const snap = await getDocs(collection(db, 'users'));
        const list: UserProfile[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as UserProfile));
        setRealUsers(list);
      } catch (err) {
        console.error('Failed to fetch real users:', err);
      }
    };
    fetchUsers();
  }, []);

  const { currentUser } = useCart();

  // Auto-auth if logged in as site admin (gpm.iraq@gmail.com)
  React.useEffect(() => {
    if ((currentUser as any)?.isSiteAdmin) {
      setIsAdminAuth(true);
      sessionStorage.setItem('souk_admin_authed', 'true');
    }
  }, [currentUser]);

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = adminUserInput.trim().toLowerCase();
    const p = adminPassInput.trim();
    // Secure: only allow access if the admin PIN matches (removed demo/open credentials)
    if (u === 'ابو وارث' && p === 'GPM@2025!') {
      setIsAdminAuth(true);
      sessionStorage.setItem('souk_admin_authed', 'true');
      setAdminAuthError('');
    } else {
      setAdminAuthError('بيانات الدخول غير صحيحة! يرجى استخدام حساب Google الموثّق.');
    }
  };

  // Add product form
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newRetailPrice, setNewRetailPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategorySelect, setNewCategorySelect] = useState('إلكترونيات');
  const [newVendorId, setNewVendorId] = useState('v_admin');
  const [newCatName, setNewCatName] = useState('');
  const [newUploadedImages, setNewUploadedImages] = useState<string[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiNotice, setAiNotice] = useState('');

  const handleGenerateAi = async () => {
    if (!newTitle.trim()) {
      alert('يرجى كتابة عنوان البضاعة أولاً ليتسنى للذكاء الاصطناعي توليد الوصف!');
      return;
    }
    setIsGeneratingAi(true);
    setAiNotice('');
    try {
      const res = await fetch('/api/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), category: newCategorySelect }),
      });
      const data = await res.json();
      if (data.description) {
        setNewDescription(data.description);
        if (data.suggestedCategory) setNewCategorySelect(data.suggestedCategory);
        setAiNotice('تم توليد الوصف والتصنيف بالذكاء الاصطناعي بنجاح ✨');
      }
    } catch (e) {
      console.error(e);
      setNewDescription(`بضاعة ${newTitle} مفحوصة 100% بحالة ممتازة، استيراد بالة وأمازون أوروبي مع الضمان كامل.`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          if (reader.result) {
            const rawDataUrl = reader.result as string;
            const stampedUrl = await createStampedImage(rawDataUrl, { opacity: 0.38 });
            setNewUploadedImages(prev => [...prev, stampedUrl]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeUploadedImage = (index: number) => {
    setNewUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Users
  const [usersList, setUsersList] = useState<UserProfile[]>(MOCK_USERS);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [copiedNotice, setCopiedNotice] = useState('');

  // Reports
  const [reportsInbox, setReportsInbox] = useState<ReportItem[]>([
    { id: 'rep_1', targetName: 'سماعات سوني WH-1000XM5', targetCode: 'WH-1000XM5', reasonCategory: 'عدم تطابق المواصفات', customDetails: 'السماعة بها خدش في الجانب الأيسر', reporterName: 'علي المحمداوي', reporterPhone: '07701112233', createdAt: new Date().toISOString() },
    { id: 'rep_2', targetName: 'تاجر: أبو علي إلكترونيات', targetCode: 'v_2', reasonCategory: 'احتيال في الوصف', customDetails: 'الجهاز عليه كسر لم يُذكر في الإعلان', reporterName: 'مصطفى البصري', reporterPhone: '07802223344', createdAt: new Date(Date.now() - 7200000).toISOString() },
  ]);

  // Branding
  const [siteName, setSiteName] = useState(siteSettings.siteName);
  const [siteTagline, setSiteTagline] = useState(siteSettings.siteTagline);
  const [topBannerText, setTopBannerText] = useState(siteSettings.topBannerText);
  const [heroTitle, setHeroTitle] = useState(siteSettings.heroTitle);
  const [adminPhone, setAdminPhone] = useState(siteSettings.adminPhone || '9647701234567');
  const [savedNotice, setSavedNotice] = useState(false);

  // ─ Handlers ────────────────────────────────────────────────────────────────
  const handleToggleProductStatus = (productId: string) => {
    setProductList(prev => prev.map(p => p.id === productId ? { ...p, status: p.status === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE' } : p));
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('هل تريد حذف هذا المنشور نهائياً؟')) {
      try {
        await deleteProductFromFirestore(productId);
      } catch (err) {
        console.error('Firestore delete failed:', err);
        // Fallback: remove from local state
        setProductList(prev => prev.filter(p => p.id !== productId));
      }
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;
    const finalImages = newUploadedImages.length > 0 ? newUploadedImages : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'];
    const outletP = Number(newPrice);
    const retailP = newRetailPrice ? Number(newRetailPrice) : Math.round(outletP * 1.35);

    const prod: Product = {
      id: `p_${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'بضاعة ممتازة مفحوصة 100% بحالة أصلية.',
      condition: 'NEW',
      conditionNotes: 'جديد بالختم وفحص 100%.',
      retailPrice: retailP,
      outletPrice: outletP,
      publishedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      images: finalImages,
      tags: ['جديد', 'أمازون'],
      vendorId: newVendorId,
      status: 'AVAILABLE',
      quantity: 1,
      category: newCatName.trim() || newCategorySelect,
      viewsCount: 1,
    };
    if (newCatName.trim()) {
      const id = `c_${Date.now()}`;
      setTreeCategories(prev => [...prev, { id, name: newCatName.trim(), slug: newCatName.trim().replace(/\s+/g, '-'), icon: '📁' }]);
    }
    // Publish to Firestore with role-protection
    publishProductToFirestore(prod);
    setNewTitle(''); setNewPrice(''); setNewRetailPrice(''); setNewDescription(''); setNewCatName(''); setNewUploadedImages([]); setAiNotice('');
  };

  // Tree category handlers
  const addChildCategory = (parentId: string, name: string) => {
    const newChild: TreeCategory = { id: `c_${Date.now()}`, name, slug: name.replace(/\s+/g, '-'), parentId };
    const addToTree = (nodes: TreeCategory[]): TreeCategory[] =>
      nodes.map(n => n.id === parentId ? { ...n, children: [...(n.children || []), newChild] } : { ...n, children: n.children ? addToTree(n.children) : [] });
    setTreeCategories(prev => addToTree(prev));
  };

  const addRootCategory = (name: string) => {
    if (!name.trim()) return;
    setTreeCategories(prev => [...prev, { id: `c_${Date.now()}`, name: name.trim(), slug: name.trim().replace(/\s+/g, '-'), icon: '📁', children: [] }]);
  };

  const deleteCategoryFromTree = (id: string) => {
    const remove = (nodes: TreeCategory[]): TreeCategory[] =>
      nodes.filter(n => n.id !== id).map(n => ({ ...n, children: n.children ? remove(n.children) : [] }));
    setTreeCategories(prev => remove(prev));
  };

  const handleConvertUserToVendor = (user: UserProfile) => {
    const newVendor: Vendor = {
      id: `v_${Date.now()}`, name: user.fullName,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      phone: user.phone, whatsappFormatted: user.phone, location: user.city || 'بغداد',
      trustTier: 3, verifiedBadge: true, totalSales: 0, rating: 5.0, responseTime: 'سريع ⚡',
    };
    setVendors(prev => [...prev, newVendor]);
    toggleVendorActivation(newVendor.id);
  };

  const handleExportExcel = () => {
    const headers = ['الاسم', 'الهاتف', 'المدينة', 'العنوان', 'الطلبات', 'تاريخ التسجيل', 'آخر دخول', 'آخر IP'];
    const rows = realUsers.map(u => [
      u.fullName, u.phone, u.city || '', u.address || '',
      String(u.totalOrders || 0), u.registeredAt ? new Date(u.registeredAt).toLocaleDateString('ar-IQ') : '',
      u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('ar-IQ') : '', u.lastIp || '',
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'souk_users.csv';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    setCopiedNotice('تم تصدير بيانات الزبائن كملف Excel! ✅');
    setTimeout(() => setCopiedNotice(''), 3000);
  };

  const handleCopyPhones = () => {
    navigator.clipboard.writeText(realUsers.map(u => u.phone).join('\n'));
    setCopiedNotice('تم نسخ كافة الأرقام للحافظة! ✅');
    setTimeout(() => setCopiedNotice(''), 3000);
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({ siteName, siteTagline, topBannerText, heroTitle, primaryColor: '#f59e0b', adminPhone });
    setSavedNotice(true); setTimeout(() => setSavedNotice(false), 2500);
  };

  // Filtered products
  const filteredProducts = useMemo(() => productList.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = productFilter === 'ALL' || p.status === productFilter;
    return matchSearch && matchFilter;
  }), [productList, searchTerm, productFilter]);

  const filteredUsers = useMemo(() =>
    realUsers.filter(u => u.fullName.includes(userSearch) || u.phone.includes(userSearch) || (u.city || '').includes(userSearch)),
    [realUsers, userSearch]);

  // Nav items
  const navItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: number | string }[] = [
    { id: 'DASHBOARD', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'PRODUCTS', label: `المنشورات والبضائع`, icon: ShoppingBag, badge: productList.length },
    { id: 'CATEGORIES', label: 'إدارة التصنيفات', icon: Layers },
    { id: 'SALES', label: 'المبيعات والتجار', icon: BarChart3 },
    { id: 'USERS', label: 'المستخدمون', icon: Users, badge: realUsers.length },
    { id: 'REPORTS', label: 'البلاغات والشكاوي', icon: AlertOctagon, badge: reportsInbox.length },
    { id: 'BRANDING', label: 'إعدادات القالب', icon: Sliders },
  ];

  // Guard: Show Admin Login Screen if not authenticated
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-amber-500/20">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-white">دخول لوحة إدارة المدير 👑</h1>
            <p className="text-xs text-slate-400">سوق البالات — حساب المدير الرسمي (أبو وارث أمازون)</p>
          </div>

          {adminAuthError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-bold text-red-400 text-center">
              {adminAuthError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">اسم حساب المدير *</label>
              <input
                type="text"
                required
                value={adminUserInput}
                onChange={(e) => setAdminUserInput(e.target.value)}
                placeholder="أبو وارث أمازون أو admin"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">كلمة السر / PIN *</label>
              <input
                type="password"
                required
                value={adminPassInput}
                onChange={(e) => setAdminPassInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-98"
            >
              دخول اللوحة الرئيسية 🔑
            </button>
          </form>

          <div className="text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← العودة للواجهة الرئيسية للمتجر
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col md:flex-row" dir="rtl" style={{ textAlign: 'right' }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-l border-slate-800 flex flex-col flex-shrink-0">
        
        {/* Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h1 className="font-black text-sm text-white">سوق البالات CMS</h1>
              <span className="text-[10px] text-amber-400 font-mono">Master Admin Panel</span>
            </div>
          </div>
          <Link href="/" title="زيارة الموقع" className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <Globe className="w-4 h-4" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full py-2.5 px-3 rounded-xl flex items-center gap-3 text-xs font-bold transition-all ${
                activeTab === item.id ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-right">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-black ${
                  activeTab === item.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Links */}
        <div className="p-3 border-t border-slate-800 space-y-1 text-xs">
          {[
            { href: '/about', label: 'من نحن' },
            { href: '/contact', label: 'اتصل بنا' },
            { href: '/privacy', label: 'سياسة الخصوصية' },
            { href: '/terms', label: 'شروط الاستخدام' },
          ].map(link => (
            <Link key={link.href} href={link.href} target="_blank"
              className="flex items-center gap-2 px-2 py-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
              <ExternalLink className="w-3 h-3" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Admin badge */}
        <div className="p-4 border-t border-slate-800">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="font-black text-amber-300 text-xs">أبو وارث أمازون 👑</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">حساب مدير الموقع الرسمي المعتمد</p>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto space-y-6">

        {/* Top Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">لوحة إدارة سوق البالات الاحترافية</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-md">
              <span>معاينة الواجهة</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </header>

        {/* ── 1. DASHBOARD ─────────────────────────────────────────────────── */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'إجمالي المبيعات', value: '18,450,000 د.ع', gradient: 'from-amber-500 to-amber-600', icon: DollarSign, dark: true },
                { label: 'المنتجات النشطة', value: `${productList.filter(p=>p.status==='AVAILABLE').length} مادة`, gradient: 'from-purple-600 to-indigo-700', icon: Package, dark: false },
                { label: 'التجار المفعلين', value: `${vendors.length} تاجر`, gradient: 'from-pink-600 to-rose-700', icon: Store, dark: false },
                { label: 'إجمالي المشاهدات', value: `${productList.reduce((acc, p) => acc + (p.viewsCount || 342), 0).toLocaleString()} مشاهدة`, gradient: 'from-sky-600 to-blue-700', icon: Eye, dark: false },
              ].map((kpi, i) => (
                <div key={i} className={`p-5 rounded-2xl bg-gradient-to-br ${kpi.gradient} ${kpi.dark ? 'text-slate-950' : 'text-white'} shadow-xl space-y-2`}>
                  <div className="flex items-center justify-between">
                    <kpi.icon className="w-5 h-5 opacity-80" />
                    <TrendingUp className="w-4 h-4 opacity-60" />
                  </div>
                  <div className="text-xl font-black font-mono">{kpi.value}</div>
                  <div className="text-xs font-bold opacity-80">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {[
                { label: 'مستخدمون مسجلون', value: usersList.length, color: 'text-emerald-400' },
                { label: 'حجوزات نشطة', value: productList.filter(p=>p.status==='RESERVED').length, color: 'text-amber-400' },
                { label: 'بضائع مباعة', value: productList.filter(p=>p.status==='SOLD').length, color: 'text-red-400' },
                { label: 'بلاغات معلقة', value: reportsInbox.length, color: 'text-rose-400' },
              ].map((s, i) => (
                <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center">
                  <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
                  <div className="text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Reports Alert */}
            {reportsInbox.length > 0 && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-xs">
                <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-slate-300">لديك <strong className="text-red-400">{reportsInbox.length} بلاغات</strong> جديدة تنتظر المراجعة.</span>
                <button onClick={() => setActiveTab('REPORTS')} className="mr-auto px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition-all">مراجعة الآن</button>
              </div>
            )}
          </div>
        )}

        {/* ── 2. PRODUCTS ──────────────────────────────────────────────────── */}
        {activeTab === 'PRODUCTS' && (
          <div className="space-y-5">
            {/* Add Product Form */}
            <form onSubmit={handleAddProduct} className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-4 text-xs">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" />
                إضافة منشور / بضاعة جديدة
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">عنوان البضاعة *</label>
                  <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="مثال: سماعات رأس لاسلكية Sony WH-1000XM5 أوبن بوكس"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-1 focus:ring-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">التاجر الناشر</label>
                  <select value={newVendorId} onChange={e => setNewVendorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none">
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Prices Row (Retail & Outlet) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">سعر الستوك / الخصم الحالي (د.ع) *</label>
                  <input required type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="320000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-400 font-mono font-black focus:ring-1 focus:ring-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">سعر أمازون الأصلي قبل الخصم (اختياري - د.ع)</label>
                  <input type="number" value={newRetailPrice} onChange={e => setNewRetailPrice(e.target.value)} placeholder="480000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none" />
                </div>
              </div>

              {/* Description & AI Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold">وصف وتفاصيل البضاعة:</label>
                  <button
                    type="button"
                    onClick={handleGenerateAi}
                    disabled={isGeneratingAi}
                    className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-black text-[11px] border border-amber-500/40 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isGeneratingAi ? 'جاري التوليد بالذكاء الاصطناعي...' : 'توليد الوصف والتصنيف بالذكاء الاصطناعي ✨'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="اكتب وصف المنتج وملاحظات الفحص هنا..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
                {aiNotice && <p className="text-[11px] text-emerald-400 font-bold font-mono">{aiNotice}</p>}
              </div>

              {/* Categories Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اختر من التصنيفات الموجودة</label>
                  <select value={newCategorySelect} onChange={e => setNewCategorySelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none">
                    {treeCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-amber-400 font-bold mb-1">أو اكتب تصنيفاً جديداً (إذا لم تجده)</label>
                  <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="تصنيف جديد..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/30 text-white focus:ring-1 focus:ring-amber-500 focus:outline-none" />
                </div>
              </div>

              {/* Image Upload Picker Section (Studio / Camera) */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <label className="block text-slate-300 font-bold">إضافة صور المنتج (من المعرض / الاستوديو أو الكاميرا) 📸</label>
                
                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer px-4 py-2.5 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold rounded-xl flex items-center gap-2 transition-all">
                    <ImageIcon className="w-4 h-4" />
                    <span>اختر صور من الاستوديو أو الكاميرا</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {newUploadedImages.length} صور تم اختيارها
                  </span>
                </div>

                {/* Selected Thumbnails Preview Grid */}
                {newUploadedImages.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pt-2">
                    {newUploadedImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0 group">
                        <img src={img} alt={`رفع ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(idx)}
                          className="absolute top-1 left-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow opacity-90 hover:opacity-100"
                          title="حذف الصورة"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-2 shadow-md transition-all">
                <Plus className="w-4 h-4" />
                نشر البضاعة
              </button>
            </form>

            {/* Filter & Search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="بحث في المنشورات..."
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none" />
              </div>
              {(['ALL', 'AVAILABLE', 'SOLD'] as const).map(f => (
                <button key={f} onClick={() => setProductFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${productFilter === f ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}>
                  {f === 'ALL' ? 'الكل' : f === 'AVAILABLE' ? 'متاح' : 'مباع'}
                </button>
              ))}
              <span className="text-xs text-slate-500 mr-auto">{filteredProducts.length} منشور</span>
            </div>

            {/* Products Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-right px-4 py-3 font-bold">المنشور</th>
                    <th className="text-right px-4 py-3 font-bold hidden sm:table-cell">التصنيف</th>
                    <th className="text-right px-4 py-3 font-bold hidden md:table-cell">السعر</th>
                    <th className="text-right px-4 py-3 font-bold hidden lg:table-cell">المشاهدات</th>
                    <th className="text-right px-4 py-3 font-bold">الحالة</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0]} alt={p.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-slate-700" />
                          <span className="font-bold text-white truncate max-w-[160px]">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{p.category}</td>
                      <td className="px-4 py-3 font-mono text-amber-400 font-bold hidden md:table-cell">{p.outletPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">👁️ {p.viewsCount || 342}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${p.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {p.status === 'AVAILABLE' ? 'متاح' : 'مباع'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleToggleProductStatus(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors" title="تبديل الحالة">
                            {p.status === 'AVAILABLE' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="حذف">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>لا توجد منشورات مطابقة</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 3. CATEGORIES (TREE) ──────────────────────────────────────────── */}
        {activeTab === 'CATEGORIES' && (
          <div className="space-y-5">
            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                <FolderPlus className="w-4 h-4 text-amber-500" />
                إضافة تصنيف رئيسي جديد
              </h3>
              <div className="flex items-center gap-3">
                <input id="newRootCat" placeholder="اسم التصنيف الرئيسي..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none" />
                <button
                  onClick={() => {
                    const input = document.getElementById('newRootCat') as HTMLInputElement;
                    if (input?.value) { addRootCategory(input.value); input.value = ''; }
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> إضافة
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">لإضافة تصنيف فرعي، اضغط على أيقونة + بجانب التصنيف الرئيسي في الشجرة أدناه.</p>
            </div>

            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-white">هيكل التصنيفات الشجري</h3>
                <span className="text-xs text-slate-500">{treeCategories.length} تصنيف رئيسي</span>
              </div>
              <div className="space-y-1">
                {treeCategories.map(node => (
                  <TreeNode key={node.id} node={node} productList={productList} depth={0} onDelete={deleteCategoryFromTree} onAddChild={addChildCategory} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 4. SALES ─────────────────────────────────────────────────────── */}
        {activeTab === 'SALES' && (
          <div className="space-y-5">
            {selectedVendor && (
              <VendorCardModal
                vendor={selectedVendor}
                products={productList}
                isActive={activatedVendorIds.includes(selectedVendor.id)}
                onClose={() => setSelectedVendor(null)}
                onToggleActivation={toggleVendorActivation}
              />
            )}
            <h3 className="text-sm font-black text-white">إحصائيات المبيعات والتجار (اضغط للتفاصيل الكاملة)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map(v => {
                const vProds = productList.filter(p => p.vendorId === v.id);
                const available = vProds.filter(p => p.status === 'AVAILABLE').length;
                const sold = vProds.filter(p => p.status === 'SOLD').length;
                const reserved = vProds.filter(p => p.status === 'RESERVED').length;
                const isActive = activatedVendorIds.includes(v.id);
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVendor(v)}
                    className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer rounded-2xl space-y-3 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <img src={v.avatar} alt={v.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-white text-sm truncate">{v.name}</h4>
                        <p className="text-xs text-slate-400">{v.location} • ★{v.rating}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {isActive ? 'مفعّل ✅' : 'موقوف ⛔'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div className="p-2 bg-slate-950 rounded-xl"><span className="text-emerald-400 font-bold block">{available}</span><span className="text-slate-500 text-[10px]">متاح</span></div>
                      <div className="p-2 bg-slate-950 rounded-xl"><span className="text-amber-400 font-bold block">{reserved}</span><span className="text-slate-500 text-[10px]">محجوز</span></div>
                      <div className="p-2 bg-slate-950 rounded-xl"><span className="text-red-400 font-bold block">{sold}</span><span className="text-slate-500 text-[10px]">مباع</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedVendor(v); }}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl transition-all"
                      >
                        عرض التفاصيل 🔍
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleVendorActivation(v.id); }}
                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${isActive ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                      >
                        {isActive ? 'إيقاف' : 'تفعيل'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 5. USERS ─────────────────────────────────────────────────────── */}
        {activeTab === 'USERS' && (
          <div className="space-y-5">
            {selectedUser && (
              <UserCardModal user={selectedUser} onClose={() => setSelectedUser(null)} onConvertToVendor={handleConvertUserToVendor} />
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف..."
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none" />
              </div>
              <button onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition-all">
                <Download className="w-3.5 h-3.5" />
                <span>تصدير Excel</span>
              </button>
              <button onClick={handleCopyPhones}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all">
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الأرقام</span>
              </button>
            </div>

            {copiedNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {copiedNotice}
              </div>
            )}

            {/* Users List */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-right px-4 py-3 font-bold">المستخدم</th>
                    <th className="text-right px-4 py-3 font-bold hidden sm:table-cell">المدينة</th>
                    <th className="text-right px-4 py-3 font-bold hidden md:table-cell">آخر IP</th>
                    <th className="text-right px-4 py-3 font-bold hidden lg:table-cell">الدخولات</th>
                    <th className="text-right px-4 py-3 font-bold hidden lg:table-cell">الطلبات</th>
                    <th className="text-right px-4 py-3 font-bold">آخر نشاط</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map(user => (
                    <tr key={user.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm flex-shrink-0">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white">{user.fullName}</div>
                            <div className="text-slate-500 font-mono">{user.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{user.city || '—'}</td>
                      <td className="px-4 py-3 font-mono text-slate-400 hidden md:table-cell">{user.lastIp || '—'}</td>
                      <td className="px-4 py-3 text-slate-300 hidden lg:table-cell font-mono">{user.loginCount || 0}</td>
                      <td className="px-4 py-3 text-slate-300 hidden lg:table-cell font-mono">{user.totalOrders || 0}</td>
                      <td className="px-4 py-3 text-slate-400">{user.lastLoginAt ? timeAgo(user.lastLoginAt) : '—'}</td>
                      <td className="px-4 py-3">
                        <Info className="w-4 h-4 text-slate-500 hover:text-amber-400 transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>لا يوجد مستخدمون مطابقون</p>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              اضغط على أي صف لعرض بطاقة المستخدم الكاملة مع سجل النشاط والتتبع.
            </p>
          </div>
        )}

        {/* ── 6. REPORTS ───────────────────────────────────────────────────── */}
        {activeTab === 'REPORTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-500" />
                صندوق البلاغات الواردة ({reportsInbox.length})
              </h3>
              <button onClick={() => setReportsInbox([])} className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> مسح الكل
              </button>
            </div>
            {reportsInbox.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-400" />
                <p className="font-bold text-emerald-400">لا يوجد بلاغات - كل شيء تمام! ✅</p>
              </div>
            )}
            <div className="space-y-3">
              {reportsInbox.map(rep => (
                <div key={rep.id} className="p-4 bg-slate-900 border border-red-500/30 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                      <span className="font-extrabold text-red-400 text-sm">{rep.reasonCategory}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">{timeAgo(rep.createdAt)}</span>
                      <button onClick={() => setReportsInbox(prev => prev.filter(r => r.id !== rep.id))} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl text-xs text-slate-200">
                    <strong className="text-white">المبلغ عنه:</strong> {rep.targetName}
                    {rep.customDetails && <p className="text-slate-400 mt-1">{rep.customDetails}</p>}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">المُبلّغ: {rep.reporterName} • {rep.reporterPhone}</span>
                    <a href={`https://wa.me/${rep.reporterPhone.replace(/^0/, '964')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all">
                      <Phone className="w-3 h-3" /> تواصل
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 7. BRANDING ──────────────────────────────────────────────────── */}
        {activeTab === 'BRANDING' && (
          <form onSubmit={handleSaveBranding} className="max-w-2xl space-y-5 text-xs">
            {savedNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>تم حفظ وتحديث كافة متغيرات الموقع بنجاح!</span>
              </div>
            )}
            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                إعدادات الهوية والمظهر العام
              </h3>
              {[
                { label: 'اسم المنصة (Brand Name)', value: siteName, onChange: setSiteName, type: 'text' },
                { label: 'الوصف الفرعي (Tagline)', value: siteTagline, onChange: setSiteTagline, type: 'text' },
                { label: 'نص الشريط الذهبي العلوي', value: topBannerText, onChange: setTopBannerText, type: 'text' },
                { label: 'عنوان الهيدر الرئيسي (H1)', value: heroTitle, onChange: setHeroTitle, type: 'text' },
                { label: 'رقم واتساب الإدارة (مع كود الدولة)', value: adminPhone, onChange: setAdminPhone, type: 'text' },
              ].map((field, i) => (
                <div key={i}>
                  <label className="block text-slate-300 font-bold mb-1">{field.label}:</label>
                  <input type={field.type} value={field.value} onChange={e => field.onChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                </div>
              ))}
            </div>

            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-white">روابط الصفحات القانونية</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: '/about', label: 'من نحن' },
                  { href: '/contact', label: 'اتصل بنا' },
                  { href: '/privacy', label: 'سياسة الخصوصية' },
                  { href: '/terms', label: 'شروط الاستخدام' },
                ].map(link => (
                  <Link key={link.href} href={link.href} target="_blank"
                    className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-all">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <button type="submit" className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg transition-all flex items-center gap-2">
              <Check className="w-4 h-4" />
              حفظ وتطبيق التغييرات فورا
            </button>
          </form>
        )}

      </main>
    </div>
  );
}
