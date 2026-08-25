/* ==========================================================================
   Orders & WhatsApp Checkout Dispatcher Service
   Handles split cart by vendor, delivery calculation, and WhatsApp invoicing
   ========================================================================== */

import { APP_CONFIG } from '../config/constants.js';
import { ProductsService } from './products.service.js';

export class OrdersService {
  /**
   * Group cart items by merchant and generate formatted WhatsApp checkout messages
   * @param {Array} cartItems 
   * @param {Object} customerInfo { name, phone, address, notes }
   */
  static processOrderAndGenerateWhatsApp(cartItems, customerInfo) {
    if (!cartItems || cartItems.length === 0) return [];

    // 1. Group items by Merchant ID
    const groupsByMerchant = {};
    cartItems.forEach(item => {
      const merchantKey = item.merchantPhone || APP_CONFIG.SUPPORT_PHONE;
      if (!groupsByMerchant[merchantKey]) {
        groupsByMerchant[merchantKey] = {
          merchantName: item.merchantName || APP_CONFIG.STORE_NAME_SHORT,
          merchantPhone: merchantKey,
          items: [],
          subtotal: 0,
          deliveryFee: item.freeDelivery ? 0 : APP_CONFIG.FIXED_DELIVERY_FEE
        };
      }
      groupsByMerchant[merchantKey].items.push(item);
      groupsByMerchant[merchantKey].subtotal += Number(item.price);
    });

    const results = [];
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    Object.values(groupsByMerchant).forEach(group => {
      const totalAmount = group.subtotal + group.deliveryFee;

      // Lock products status to 'reserved'
      group.items.forEach(item => {
        ProductsService.updateProductStatus(item.id, 'reserved');
      });

      // Construct Professional WhatsApp Invoice
      let msg = `🛒 *طلب حجز جديد من منصة ${APP_CONFIG.STORE_NAME_SHORT}*\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `📋 *رقم الطلب:* #${orderId}\n`;
      msg += `👤 *اسم الزبون:* ${customerInfo.name}\n`;
      msg += `📱 *رقم الهاتف:* ${customerInfo.phone}\n`;
      msg += `📍 *العنوان / المحافظة:* ${customerInfo.address}\n`;
      if (customerInfo.notes) {
        msg += `📝 *ملاحظات:* ${customerInfo.notes}\n`;
      }
      msg += `━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `📦 *المنتجات المطلوبة:*\n`;

      group.items.forEach((item, idx) => {
        msg += `${idx + 1}. *${item.title}*\n`;
        msg += `   └ السعر: ${Number(item.price).toLocaleString()} ${APP_CONFIG.CURRENCY}\n`;
      });

      msg += `━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `💵 *المجموع الفرعي:* ${group.subtotal.toLocaleString()} ${APP_CONFIG.CURRENCY}\n`;
      msg += `🚚 *أجور التوصيل:* ${group.deliveryFee === 0 ? 'مجاني 🎁' : `${group.deliveryFee.toLocaleString()} ${APP_CONFIG.CURRENCY}`}\n`;
      msg += `⭐ *الإجمالي الكلي:* ${totalAmount.toLocaleString()} ${APP_CONFIG.CURRENCY}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `🔗 *إدارة الطلب للتاجر:* ${window.location.origin}${APP_CONFIG.ROUTES.MERCHANT_PORTAL}?order_id=${orderId}`;

      // Clean phone number (remove + or spaces)
      const cleanPhone = group.merchantPhone.replace(/[^0-9]/g, '');
      const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;

      // Save order to history
      const savedOrders = JSON.parse(localStorage.getItem('souk_orders') || '[]');
      savedOrders.unshift({
        orderId,
        date: new Date().toISOString(),
        customerInfo,
        merchantName: group.merchantName,
        merchantPhone: group.merchantPhone,
        items: group.items,
        totalAmount,
        status: 'pending'
      });
      localStorage.setItem('souk_orders', JSON.stringify(savedOrders));

      results.push({
        merchantName: group.merchantName,
        merchantPhone: group.merchantPhone,
        orderId,
        totalAmount,
        waUrl
      });
    });

    return results;
  }
}
