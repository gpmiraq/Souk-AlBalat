/* ==========================================================================
   Authentication, Merchant Store Profile & Cloud Sync Service
   All Credentials Hashed via Salted SHA-256 (Zero Plain-Text Storage)
   ========================================================================== */

import { SecurityService } from './security.service.js';
import { db } from '../config/firebase.config.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DEFAULT_ADMIN_HASH = "9f2c58e8697f323d9d864c0b2bdbfdb293afe1216a5b5cf638870e1f9cd85cf8";
const BACKUP_ADMIN_HASH = "1261c16ee5d7fb9eb8e099a2573c09353916c3f8383fdcbf835085f5ce660a88";

export const ABU_WARETH_AVATAR = "https://firebasestorage.googleapis.com/v0/b/souk-albalat-drive.firebasestorage.app/o/products%2F%D8%A3%D8%A8%D9%88_%D9%88%D8%A7%D8%B1%D8%AB_%D8%A3%D9%85%D8%A7%D8%B2%D9%88%D9%86%2Favatar_img1_1787906655211.webp?alt=media&token=6d1e2274-9845-4559-ac02-d62005c7e654";

const INITIAL_MERCHANTS = [
  {
    id: "m-alwareth",
    slug: "alwareth",
    name: "أبو وارث أمازون",
    phone: "07707188166",
    bio: "الوكيل الحصري لبضائع أمازون والبالات وطرود DHL في العراق. فحص وتجربة وضمان حقيقي لكافة القطع.",
    passcodeHash: "490a977090e7a5bdca9023315d92bb84c346f4cd46bfb1e649956f9c622ea156",
    avatar: ABU_WARETH_AVATAR,
    geminiApiKey: "",
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
  static sanitizeAvatar(avatarUrl) {
    if (!avatarUrl || typeof avatarUrl !== 'string' || avatarUrl.includes('photo-1534528741775-53994a69daeb')) {
      return ABU_WARETH_AVATAR;
    }
    return avatarUrl;
  }

  static getMerchantAvatar(merchantObj = null) {
    if (merchantObj?.avatar && !merchantObj.avatar.includes('photo-1534528741775-53994a69daeb')) {
      return merchantObj.avatar;
    }
    const current = this.getCurrentMerchant();
    if (current?.avatar && !current.avatar.includes('photo-1534528741775-53994a69daeb')) {
      return current.avatar;
    }
    const merchants = this.getMerchants();
    const primary = merchants.find(m => m.avatar && !m.avatar.includes('photo-1534528741775-53994a69daeb'));
    if (primary?.avatar) return primary.avatar;

    return ABU_WARETH_AVATAR;
  }

  static async syncMerchantsFromCloud() {
    try {
      const profileSnap = await getDoc(doc(db, 'categories', 'merchant_profile_alwareth')).catch(() => null);

      let cloudMerchants = [];
      if (profileSnap && profileSnap.exists()) {
        const pData = profileSnap.data();
        if (pData.avatar) pData.avatar = this.sanitizeAvatar(pData.avatar);
        
        // Sync Gemini AI key from cloud to local storage across all devices
        if (pData.geminiApiKey) {
          localStorage.setItem('souk_gemini_api_key', pData.geminiApiKey);
        }

        cloudMerchants.push({
          ...INITIAL_MERCHANTS[0],
          ...pData
        });
      } else {
        cloudMerchants = [...INITIAL_MERCHANTS];
        await setDoc(doc(db, 'categories', 'merchant_profile_alwareth'), INITIAL_MERCHANTS[0], { merge: true }).catch(() => {});
      }

      if (cloudMerchants.length > 0) {
        localStorage.setItem('souk_merchants_v10', JSON.stringify(cloudMerchants));
        const current = this.getCurrentMerchant();
        const active = current 
          ? (cloudMerchants.find(m => m.id === current.id || m.phone === current.phone || m.name === current.name) || cloudMerchants[0])
          : cloudMerchants[0];
        
        if (active) localStorage.setItem('souk_current_merchant', JSON.stringify(active));
        return cloudMerchants;
      }
    } catch (err) {
      console.warn('Merchants sync notice:', err.message);
    }
    return this.getMerchants();
  }

  static getMerchants() {
    const saved = localStorage.getItem('souk_merchants_v10');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(m => ({ ...m, avatar: this.sanitizeAvatar(m.avatar) }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('souk_merchants_v10', JSON.stringify(INITIAL_MERCHANTS));
    return INITIAL_MERCHANTS;
  }

  static getMerchantById(idOrSlug) {
    const merchants = this.getMerchants();
    if (!idOrSlug) return merchants[0] || null;
    const found = merchants.find(m => m.id === idOrSlug || m.slug === idOrSlug || m.name?.includes(idOrSlug)) || merchants[0] || null;
    if (found) {
      found.avatar = this.sanitizeAvatar(found.avatar);
    }
    return found;
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
    let index = merchants.findIndex(m => m.id === merchantId || m.slug === merchantId || m.name?.includes('أبو وارث'));
    if (index === -1) {
      merchants.push({ id: merchantId || 'm-alwareth', slug: 'alwareth', name: 'أبو وارث أمازون', phone: '07707188166', ...updatedData });
      index = merchants.length - 1;
    }
    
    if (updatedData.rawPasscode) {
      updatedData.passcodeHash = await SecurityService.hashString(updatedData.rawPasscode);
      delete updatedData.rawPasscode;
    }

    merchants[index] = { ...merchants[index], ...updatedData };
    if (merchants[index].avatar) {
      merchants[index].avatar = this.sanitizeAvatar(merchants[index].avatar);
    }

    localStorage.setItem('souk_merchants_v10', JSON.stringify(merchants));
    localStorage.setItem('souk_current_merchant', JSON.stringify(merchants[index]));

    // Sync to Firebase Firestore under permitted collection
    try {
      await setDoc(doc(db, 'categories', 'merchant_profile_alwareth'), {
        ...merchants[index],
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore merchant sync error:', err);
    }

    return { success: true, merchant: merchants[index] };
  }

  static async changeMerchantPasscode(merchantId, oldPasscode, newPasscode) {
    const merchants = this.getMerchants();
    const merchant = merchants.find(m => m.id === merchantId);
    if (!merchant) return { success: false, message: "التاجر غير موجود" };

    const isMatch = await SecurityService.verifyHash(oldPasscode, merchant.passcodeHash);
    if (!isMatch) return { success: false, message: "كود الدخول الحالي غير صحيح" };

    const newHash = await SecurityService.hashString(newPasscode);
    return await this.updateMerchant(merchantId, { passcodeHash: newHash });
  }

  static getCurrentMerchant() {
    const data = localStorage.getItem('souk_current_merchant');
    if (!data) {
      const merchants = this.getMerchants();
      return merchants[0] || null;
    }
    try {
      const parsed = JSON.parse(data);
      if (parsed) parsed.avatar = this.sanitizeAvatar(parsed.avatar);
      return parsed;
    } catch {
      return null;
    }
  }

  static logoutMerchant() {
    localStorage.removeItem('souk_current_merchant');
  }

  static async loginAdmin(passcode) {
    const isMaster = await SecurityService.verifyHash(passcode, DEFAULT_ADMIN_HASH);
    const isBackup = await SecurityService.verifyHash(passcode, BACKUP_ADMIN_HASH);

    if (isMaster || isBackup) {
      const adminSession = {
        role: 'super_admin',
        name: 'مدير النظام الأعلى',
        authenticatedAt: new Date().toISOString()
      };
      localStorage.setItem('souk_admin_session', JSON.stringify(adminSession));
      return { success: true, user: adminSession };
    }
    return { success: false, message: "كود الدخول السري غير صحيح" };
  }

  static isAdminLoggedIn() {
    const session = localStorage.getItem('souk_admin_session');
    if (!session) return false;
    try {
      const parsed = JSON.parse(session);
      return parsed.role === 'super_admin';
    } catch {
      return false;
    }
  }

  static isAdminAuthenticated() {
    return this.isAdminLoggedIn();
  }

  static logoutAdmin() {
    localStorage.removeItem('souk_admin_session');
  }

  static getCustomerProfile() {
    try {
      const saved = localStorage.getItem('souk_customer_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  static saveCustomerProfile(profile) {
    try {
      localStorage.setItem('souk_customer_profile', JSON.stringify(profile));
      return true;
    } catch (e) {
      console.warn('Customer profile save error:', e);
      return false;
    }
  }
}
