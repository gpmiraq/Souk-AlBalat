/* ==========================================================================
   Orders & WhatsApp Dispatch Engine
   Structured Multi-Line WhatsApp Invoices with Delivery & Merchant Action Codes
   Strict Iraqi Phone Validation & 18 Governorates
   ========================================================================== */

import { APP_CONFIG } from '../config/constants.js';
import { ProductsService } from './products.service.js';

export const IRAQI_GOVERNORATES = [
  "بغداد",
  "البصرة",
  "أربيل",
  "النجف الأشرف",
  "كربلاء المقدسة",
  "نينوى (الموصل)",
  "السليمانية",
  "كركوك",
  "بابل (الحلة)",
  "الأنبار",
  "ديالى",
  "ذي قار (الناصرية)",
  "صلاح الدين",
  "ميسان (العمارة)",
  "دهوك",
  "واسط (الكوت)",
  "القادسية (الديوانية)",
  "المثنى (السماوة)"
];

/**
 * Validates Iraqi phone numbers (AsiaCell, Zain, Korek)
 * Accepts formats: 077XXXXXXXX, 078XXXXXXXX, 075XXXXXXXX, 079XXXXXXXX, +9647XXXXXXXXX, 9647XXXXXXXXX
 */
export function isValidIraqiPhone(phone) {
  if (!phone) return false;
  const clean = String(phone).replace(/[^0-9]/g, '');
  return /^(?:(?:00964|\+964|964|0)?7[5789]\d{8})$/.test(clean);
}

export class OrdersService {
  /**
   * Processes cart items and generates structured multi-line WhatsApp orders
   */
  static processOrderAndGenerateWhatsApp(cartItems, customerInfo) {
    // Group items by merchant
    const merchantGroups = {};

    cartItems.forEach(item => {
      const merchantPhone = item.merchantPhone || "07707188166";
      if (!merchantGroups[merchantPhone]) {
        merchantGroups[merchantPhone] = {
          merchantName: item.merchantName || "أبو وارث أمازون",
          merchantPhone: merchantPhone,
          items: []
        };
      }
      merchantGroups[merchantPhone].items.push(item);

      // Decrement stock in catalog and mark reserved if quantity reaches 0
      ProductsService.decrementStock(item.id, 1);
    });

    const orders = [];
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://souk-al-balat.vercel.app';

    Object.keys(merchantGroups).forEach(phone => {
      const group = merchantGroups[phone];
      const itemsTotal = group.items.reduce((sum, it) => sum + Number(it.price), 0);
      const deliveryFee = APP_CONFIG.FIXED_DELIVERY_FEE;
      const grandTotal = itemsTotal + deliveryFee;

      let msg = `⚡ *طلب حجز بضاعة جديد من سوق البالات*\n\n`;
      msg += `👤 *معلومات الزبون والتوصيل:*\n`;
      msg += `الاسم : ${customerInfo.name}\n`;
      msg += `الهاتف : ${customerInfo.phone}\n`;
      msg += `المحافظة : ${customerInfo.province || 'العراق'}\n`;
      msg += `العنوان بالتفصيل : ${customerInfo.address}\n`;
      if (customerInfo.notes) {
        msg += `ملاحظات الزبون : ${customerInfo.notes}\n`;
      }
      msg += `\n📦 *تفاصيل المنتجات المحجوزة:*\n\n`;

      group.items.forEach((it, idx) => {
        msg += `رقم المنتج : ${idx + 1}\n`;
        msg += `اسم المنتج : ${it.title}\n`;
        msg += `رابط المنتج : ${origin}/p/${it.id}\n`;
        msg += `السعر : ${Number(it.price).toLocaleString()} د.ع\n\n`;
      });

      msg += `──────────────────────\n`;
      msg += `التوصيل : ${deliveryFee.toLocaleString()} د.ع لكافة محافظات العراق\n`;
      msg += `*السعر الكلي : ${grandTotal.toLocaleString()} د.ع*\n\n`;
      msg += `⚠️ *ملاحظة :* يجب فحص المنتج امام المندوب ولا يتحمل البائع مسؤولية سعر التوصيل في حال مغادرة المندوب.\n\n`;

      msg += `──────────────────────\n`;
      msg += `🔐 *كود تأكيد البائع:* \n`;
      group.items.forEach(it => {
        msg += `👉 ${origin}/m-manage-order?pid=${it.id}\n`;
      });

      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const waPhone = cleanPhone.startsWith('0') ? '964' + cleanPhone.slice(1) : (cleanPhone.startsWith('964') ? cleanPhone : '964' + cleanPhone);
      const waUrl = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(msg)}`;

      orders.push({
        merchantName: group.merchantName,
        merchantPhone: group.merchantPhone,
        itemsCount: group.items.length,
        total: grandTotal,
        waUrl: waUrl
      });
    });

    return orders;
  }
}
