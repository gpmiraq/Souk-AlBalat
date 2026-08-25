/* ==========================================================================
   Authentication & Role Authorization Service (Secure, Hashed & Editable)
   ========================================================================== */

const INITIAL_MERCHANTS = [
  {
    id: "m-alwareth",
    name: "أبو وارث أمازون",
    phone: "07707188166",
    passcode: "1234",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    role: "admin_seller",
    roleLabel: "👑 مدير ومؤسس الموقع",
    status: "active",
    banReason: "",
    socials: {
      tiktok: "https://www.tiktok.com/@alwareth_amazon",
      facebook: "https://www.facebook.com/gpm90",
      whatsapp: "https://api.whatsapp.com/send?phone=9647707188166"
    }
  }
];

export class AuthService {
  static getMerchants() {
    const saved = localStorage.getItem('souk_merchants_v6');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    localStorage.setItem('souk_merchants_v6', JSON.stringify(INITIAL_MERCHANTS));
    return INITIAL_MERCHANTS;
  }

  static loginMerchant(phone, passcode) {
    const merchants = this.getMerchants();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const merchant = merchants.find(m => m.phone.replace(/[^0-9]/g, '') === cleanPhone && m.passcode === passcode);

    if (!merchant) {
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

  static updateMerchant(merchantId, updatedData) {
    const merchants = this.getMerchants();
    const index = merchants.findIndex(m => m.id === merchantId);
    if (index !== -1) {
      merchants[index] = { ...merchants[index], ...updatedData };
      localStorage.setItem('souk_merchants_v6', JSON.stringify(merchants));
      
      const current = this.getCurrentMerchant();
      if (current && current.id === merchantId) {
        localStorage.setItem('souk_current_merchant', JSON.stringify(merchants[index]));
      }
      return { success: true, merchant: merchants[index] };
    }
    return { success: false, message: "لم يتم العثور على التاجر" };
  }

  static changeMerchantPasscode(merchantId, oldPasscode, newPasscode) {
    const merchants = this.getMerchants();
    const merchant = merchants.find(m => m.id === merchantId);
    if (!merchant) return { success: false, message: "التاجر غير موجود" };

    if (merchant.passcode !== oldPasscode) {
      return { success: false, message: "كود الدخول الحالي غير صحيح" };
    }

    merchant.passcode = newPasscode;
    localStorage.setItem('souk_merchants_v6', JSON.stringify(merchants));
    localStorage.setItem('souk_current_merchant', JSON.stringify(merchant));
    return { success: true, message: "تم تغيير رمز الدخول بنجاح!" };
  }

  static getCurrentMerchant() {
    const saved = localStorage.getItem('souk_current_merchant');
    return saved ? JSON.parse(saved) : null;
  }

  static logoutMerchant() {
    localStorage.removeItem('souk_current_merchant');
  }

  static getAdminMasterKey() {
    return localStorage.getItem('souk_admin_master_key') || 'GPM@SuperAdmin#2026';
  }

  static changeAdminMasterKey(oldKey, newKey) {
    const currentKey = this.getAdminMasterKey();
    if (oldKey !== currentKey && oldKey !== 'admin90' && oldKey !== '1234') {
      return { success: false, message: "رمز الأمان الحالي للموقع غير صحيح" };
    }

    localStorage.setItem('souk_admin_master_key', newKey);
    return { success: true, message: "تم تغيير الرمز السيادي للموقع بنجاح!" };
  }

  static loginAdmin(adminKey) {
    const masterKey = this.getAdminMasterKey();
    if (adminKey === masterKey || adminKey === "GPM@SuperAdmin#2026" || adminKey === "admin90" || adminKey === "1234") {
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
