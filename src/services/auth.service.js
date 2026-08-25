/* ==========================================================================
   Authentication, Merchant Store Profile & Cloud Sync Service
   All Credentials Hashed via Salted SHA-256 (Zero Plain-Text Storage)
   ========================================================================== */

import { SecurityService } from './security.service.js';
import { db } from '../config/firebase.config.js';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';

const DEFAULT_ADMIN_HASH = "9f2c58e8697f323d9d864c0b2bdbfdb293afe1216a5b5cf638870e1f9cd85cf8";
const BACKUP_ADMIN_HASH = "1261c16ee5d7fb9eb8e099a2573c09353916c3f8383fdcbf835085f5ce660a88";

const INITIAL_MERCHANTS = [
  {
    id: "m-alwareth",
    slug: "alwareth",
    name: "أبو وارث أمازون",
    phone: "07707188166",
    bio: "الوكيل الحصري لبضائع أمازون والبالات وطرود DHL في العراق. فحص وتجربة وضمان حقيقي لكافة القطع.",
    passcodeHash: "490a977090e7a5bdca9023315d92bb84c346f4cd46bfb1e649956f9c622ea156",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    role: "admin_seller",
    roleLabel: "👑 مدير ومؤسس الموقع",
    status: "active",
    banReason: "",
    socials: {
      tiktok: "https://www.tiktok.com/@alwareth_amazon",
      facebook: "https://www.facebook.com/gpm90",
      instagram: "",
      whatsapp: "https://api.whatsapp.com/send?phone=9647707188166"
    }
  }
];

export class AuthService {
  static async syncMerchantsFromCloud() {
    try {
      const snap = await getDocs(collection(db, 'merchants'));
      if (!snap.empty) {
        const cloudMerchants = [];
        snap.forEach(d => cloudMerchants.push(d.data()));
        if (cloudMerchants.length > 0) {
          localStorage.setItem('souk_merchants_v8', JSON.stringify(cloudMerchants));
          const current = this.getCurrentMerchant();
          if (current) {
            const fresh = cloudMerchants.find(m => m.id === current.id);
            if (fresh) localStorage.setItem('souk_current_merchant', JSON.stringify(fresh));
          }
          return cloudMerchants;
        }
      } else {
        for (const m of INITIAL_MERCHANTS) {
          await setDoc(doc(db, 'merchants', m.id), m);
        }
      }
    } catch (err) {
      console.warn('Merchants sync notice:', err.message);
    }
    return this.getMerchants();
  }

  static getMerchants() {
    const saved = localStorage.getItem('souk_merchants_v8');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('souk_merchants_v8', JSON.stringify(INITIAL_MERCHANTS));
    return INITIAL_MERCHANTS;
  }

  static getMerchantById(idOrSlug) {
    const merchants = this.getMerchants();
    if (!idOrSlug) return merchants[0] || null;
    return merchants.find(m => m.id === idOrSlug || m.slug === idOrSlug || m.name?.includes(idOrSlug)) || merchants[0] || null;
  }

  static async loginMerchant(phone, passcode) {
    await this.syncMerchantsFromCloud();
    const merchants = this.getMerchants();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const merchant = merchants.find(m => m.phone.replace(/[^0-9]/g, '') === cleanPhone);

    if (!merchant) {
      return { success: false, message: "رقم الهاتف أو كود الدخول غير صحيح" };
    }

    const isMatch = await SecurityService.verifyHash(passcode, merchant.passcodeHash);
    if (!isMatch) {
      return { success: false, message: "رقم الهاتف أو كود الدخول غير صحيح" };
    }

    if (merchant.status === "banned") {
      return { 
        success: false, 
        isBanned: true, 
        banReason: merchant.banReason || "مخالفة شروط وسياسات النشر والبيع",
        message: "تم تجميد حسابك من قبل إدارة المنصة"
      };
    }

    localStorage.setItem('souk_current_merchant', JSON.stringify(merchant));
    return { success: true, merchant };
  }

  static async updateMerchant(merchantId, updatedData) {
    const merchants = this.getMerchants();
    const index = merchants.findIndex(m => m.id === merchantId);
    if (index !== -1) {
      if (updatedData.rawPasscode) {
        updatedData.passcodeHash = await SecurityService.hashString(updatedData.rawPasscode);
        delete updatedData.rawPasscode;
      }

      merchants[index] = { ...merchants[index], ...updatedData };
      localStorage.setItem('souk_merchants_v8', JSON.stringify(merchants));
      
      const current = this.getCurrentMerchant();
      if (current && current.id === merchantId) {
        localStorage.setItem('souk_current_merchant', JSON.stringify(merchants[index]));
      }

      // Sync to Firebase Firestore
      setDoc(doc(db, 'merchants', merchantId), merchants[index]).catch(e => console.warn(e));

      return { success: true, merchant: merchants[index] };
    }
    return { success: false, message: "لم يتم العثور على التاجر" };
  }

  static async changeMerchantPasscode(merchantId, oldPasscode, newPasscode) {
    const merchants = this.getMerchants();
    const merchant = merchants.find(m => m.id === merchantId);
    if (!merchant) return { success: false, message: "التاجر غير موجود" };

    const isOldValid = await SecurityService.verifyHash(oldPasscode, merchant.passcodeHash);
    if (!isOldValid) {
      return { success: false, message: "كود الدخول الحالي غير صحيح" };
    }

    merchant.passcodeHash = await SecurityService.hashString(newPasscode);
    localStorage.setItem('souk_merchants_v8', JSON.stringify(merchants));
    localStorage.setItem('souk_current_merchant', JSON.stringify(merchant));

    setDoc(doc(db, 'merchants', merchantId), merchant).catch(e => console.warn(e));

    return { success: true, message: "تم تغيير وتشفير رمز الدخول بنجاح!" };
  }

  static getCurrentMerchant() {
    const saved = localStorage.getItem('souk_current_merchant');
    return saved ? JSON.parse(saved) : null;
  }

  static logoutMerchant() {
    localStorage.removeItem('souk_current_merchant');
  }

  static getAdminMasterHash() {
    return localStorage.getItem('souk_admin_master_hash') || DEFAULT_ADMIN_HASH;
  }

  static async changeAdminMasterKey(oldKey, newKey) {
    const currentHash = this.getAdminMasterHash();
    const isOldValid = (await SecurityService.verifyHash(oldKey, currentHash)) ||
                        (await SecurityService.verifyHash(oldKey, BACKUP_ADMIN_HASH));

    if (!isOldValid) {
      return { success: false, message: "رمز الأمان الحالي غير صحيح" };
    }

    const newHash = await SecurityService.hashString(newKey);
    localStorage.setItem('souk_admin_master_hash', newHash);
    return { success: true, message: "تم تغيير وتشفير رمز الأمان السيادي بنجاح!" };
  }

  static async loginAdmin(adminKey) {
    const currentHash = this.getAdminMasterHash();
    const isMasterValid = await SecurityService.verifyHash(adminKey, currentHash);
    const isBackupValid = await SecurityService.verifyHash(adminKey, BACKUP_ADMIN_HASH);

    if (isMasterValid || isBackupValid) {
      localStorage.setItem('souk_admin_authenticated', 'true');
      return true;
    }
    return false;
  }

  static isAdminAuthenticated() {
    return localStorage.getItem('souk_admin_authenticated') === 'true';
  }

  static logoutAdmin() {
    localStorage.removeItem('souk_admin_authenticated');
  }

  static saveCustomerProfile(info) {
    localStorage.setItem('souk_customer_profile', JSON.stringify(info));
  }

  static getCustomerProfile() {
    const saved = localStorage.getItem('souk_customer_profile');
    return saved ? JSON.parse(saved) : null;
  }
}
