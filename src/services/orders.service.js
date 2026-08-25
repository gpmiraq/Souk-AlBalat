/* ==========================================================================
   Orders & WhatsApp Dispatch Engine with Merchant Inventory Action Links
   ========================================================================== */

import { APP_CONFIG } from '../config/constants.js';
import { ProductsService } from './products.service.js';

export class OrdersService {
  /**
   * Processes cart items and generates grouped WhatsApp orders with secret action links
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

      let msg = `⚡ *فاتورة حجز بضاعة من منصة سوق البالات* 📦\n\n`;
      msg += `👤 *معلومات الزبون والتوصيل:*\n`;
      msg += `• الاسم: ${customerInfo.name}\n`;
      msg += `• الهاتف: ${customerInfo.phone}\n`;
      msg += `• العنوان: ${customerInfo.address}\n`;
      if (customerInfo.notes) {
        msg += `• ملاحظات إضافية: ${customerInfo.notes}\n`;
      }
      msg += `\n🛒 *البضائع المحجوزة:*\n`;

      group.items.forEach((it, idx) => {
        msg += `${idx + 1}. *${it.title}*\n`;
        msg += `   - السعر: ${Number(it.price).toLocaleString()} ${APP_CONFIG.CURRENCY}\n`;
        msg += `   - الحالة: ${it.conditionLabel || 'أوبن بوكس'}\n`;
        msg += `   - رابط المنتج: ${origin}/p/${it.id}\n`;
      });

      msg += `\n💵 *الحساب الإجمالي:*\n`;
      msg += `• مجموع البضائع: ${itemsTotal.toLocaleString()} د.ع\n`;
      msg += `• أجور التوصيل: ${deliveryFee.toLocaleString()} د.ع\n`;
      msg += `• *المبلغ الكلي المطلوب: ${grandTotal.toLocaleString()} د.ع*\n\n`;

      msg += `──────────────────────\n`;
      msg += `👑 *خيارات التاجر السريعة (إدارة المخزون):*\n`;
      group.items.forEach(it => {
        msg += `⚙️ لإعادة تفعيل أو تأكيد بيع (${it.title}):\n`;
        msg += `👉 ${origin}/m-manage-order?pid=${it.id}\n\n`;
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
