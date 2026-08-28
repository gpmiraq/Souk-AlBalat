/* ==========================================================================
   Marketing Flyer & Poster Generator Service
   Ultra-HD Scannable QR Codes, Clean Visuals & Dual Standard Formats (Vertical / Horizontal)
   Blazing Fast Instant Rendering (Zero Hang / Zero Lag)
   ========================================================================== */

import { APP_CONFIG } from '../config/constants.js';
import QRCode from 'qrcode';

export const POSTER_THEMES = {
  dark_gold: {
    id: 'dark_gold',
    name: '🌙 داكن ذهبي (الأصلي)',
    bgStart: '#0f172a',
    bgEnd: '#020617',
    border: '#f59e0b',
    titleColor: '#ffffff',
    accentColor: '#f59e0b',
    subColor: '#94a3b8',
    priceBg: 'rgba(245, 158, 11, 0.15)',
    priceColor: '#f59e0b',
    textColor: '#f8fafc'
  },
  light_modern: {
    id: 'light_modern',
    name: '☀️ فاتح ناصع (مودرن)',
    bgStart: '#ffffff',
    bgEnd: '#f1f5f9',
    border: '#2563eb',
    titleColor: '#0f172a',
    accentColor: '#2563eb',
    subColor: '#64748b',
    priceBg: 'rgba(37, 99, 235, 0.08)',
    priceColor: '#1d4ed8',
    textColor: '#1e293b'
  },
  neon_cyber: {
    id: 'neon_cyber',
    name: '⚡ نيون سايبر (أزرق سماوي)',
    bgStart: '#090d16',
    bgEnd: '#020617',
    border: '#06b6d4',
    titleColor: '#ffffff',
    accentColor: '#22d3ee',
    subColor: '#94a3b8',
    priceBg: 'rgba(6, 182, 212, 0.15)',
    priceColor: '#06b6d4',
    textColor: '#f8fafc'
  },
  royal_purple: {
    id: 'royal_purple',
    name: '💎 ملكي فاخر (بنفسجي)',
    bgStart: '#1e112a',
    bgEnd: '#0d0517',
    border: '#c084fc',
    titleColor: '#ffffff',
    accentColor: '#e879f9',
    subColor: '#cbd5e1',
    priceBg: 'rgba(192, 132, 252, 0.15)',
    priceColor: '#c084fc',
    textColor: '#f8fafc'
  }
};

export class PosterService {
  /**
   * Generates High-Resolution scannable QR Code DataURL for a product
   */
  static async generateProductQRCode(productId) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://souk-al-balat.vercel.app';
    const productUrl = `${origin}/p/${productId}`;
    try {
      return await QRCode.toDataURL(productUrl, {
        margin: 1,
        width: 360,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (e) {
      console.warn('QR Code generation fallback:', e);
      return '';
    }
  }

  /**
   * Safely and rapidly loads an image URL with strict 2-second timeout to avoid any hang
   */
  static async safeLoadImage(url) {
    if (!url) return null;
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), 2000);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        clearTimeout(timer);
        resolve(img);
      };
      img.onerror = () => {
        clearTimeout(timer);
        const fallback = new Image();
        fallback.onload = () => resolve(fallback);
        fallback.onerror = () => resolve(null);
        fallback.src = url;
      };
      img.src = url;
    });
  }

  /**
   * Fast, reliable poster delivery (Instant Direct Download + Mobile Saved Dialog)
   */
  static async deliverPoster(canvas, filename, title) {
    try {
      const dataUrl = canvas.toDataURL('image/png');

      // Instant download trigger
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => link.remove(), 600);

      // On mobile devices, also show the long-press save dialog
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        this.showSavedPosterDialog(dataUrl, filename, title);
      }
      return true;
    } catch (e) {
      console.error('Deliver poster error:', e);
      try {
        const dataUrl = canvas.toDataURL('image/png');
        this.showSavedPosterDialog(dataUrl, filename, title);
      } catch (err) {}
      return true;
    }
  }

  /**
   * Shows a visual save dialog with the generated image for instant long-press save to mobile camera roll
   */
  static showSavedPosterDialog(dataUrl, filename, title) {
    const existing = document.getElementById('modal-saved-poster-preview');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-saved-poster-preview';
    modal.className = 'modal-overlay active';
    modal.style.zIndex = '999999';
    modal.innerHTML = `
      <div class="modal-container" style="max-width: 400px; max-height: 90vh; text-align: center; padding: 16px;">
        <div class="modal-header" style="border-bottom: none; padding-bottom: 0;">
          <div class="modal-title" style="font-size: 1.05rem;">✅ تم تجهيز البوستر بنجاح!</div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>
        <div class="modal-body" style="padding: 10px 0;">
          <p style="font-size: 0.82rem; color: #10b981; font-weight: 800; margin-bottom: 10px;">
            📱 للحفظ في ألبوم الصور بالموبايل: اضغط مطولاً على الصورة أدناه واختر <strong>(حفظ الصورة في الصور)</strong>.
          </p>
          <div style="max-height: 50vh; overflow: hidden; border-radius: 12px; border: 2px solid var(--brand-primary); box-shadow: var(--card-shadow); display: inline-block;">
            <img src="${dataUrl}" style="max-width: 100%; max-height: 50vh; display: block; object-fit: contain;" alt="Poster Preview">
          </div>
        </div>
        <div class="modal-footer" style="display: flex; gap: 8px; justify-content: center; padding-top: 10px; border-top: none;">
          <button class="btn btn-secondary" style="font-size: 0.85rem; padding: 8px 16px;" onclick="this.closest('.modal-overlay').remove()">إغلاق</button>
          <a class="btn btn-primary" style="font-size: 0.85rem; padding: 8px 16px; text-decoration: none; font-weight: 800;" href="${dataUrl}" download="${filename}">
            📥 تنزيل الصورة
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  /**
   * Generates and downloads the flyer card as an image in selected format and theme
   * @param {Object} product 
   * @param {'horizontal' | 'vertical'} format 
   * @param {string} themeKey
   */
  static async exportFlyerAsImage(product, format = 'vertical', themeKey = 'dark_gold') {
    const theme = POSTER_THEMES[themeKey] || POSTER_THEMES.dark_gold;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const isVertical = format === 'vertical';
    canvas.width = isVertical ? 1080 : 1200;
    canvas.height = isVertical ? 1920 : 630;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, theme.bgStart);
    bgGradient.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Accent Border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = isVertical ? 8 : 4;
    ctx.strokeRect(isVertical ? 24 : 16, isVertical ? 24 : 16, width - (isVertical ? 48 : 32), height - (isVertical ? 48 : 32));

    // Generate real QR code image
    const qrDataUrl = await this.generateProductQRCode(product.id);
    const qrImg = new Image();
    if (qrDataUrl) {
      qrImg.src = qrDataUrl;
      await new Promise(r => { qrImg.onload = r; qrImg.onerror = r; });
    }

    const img = await this.safeLoadImage(product.image);

    ctx.textAlign = 'right';
    ctx.direction = 'rtl';

    if (isVertical) {
      // --- 📱 VERTICAL STORY / STATUS (1080 x 1920) ---
      
      // Header Logo & Store Name
      ctx.font = 'bold 48px Cairo, sans-serif';
      ctx.fillStyle = theme.accentColor;
      ctx.fillText(`⚡ ${APP_CONFIG.STORE_NAME_SHORT}`, width - 70, 130);

      ctx.font = '32px Outfit, sans-serif';
      ctx.fillStyle = theme.subColor;
      ctx.fillText('AMAZON & DHL OUTLET IQ', width - 70, 185);

      // Product Image Square Center
      const imgSize = 940;
      const imgX = 70;
      const imgY = 240;

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgSize, imgSize, 36);
      ctx.fill();

      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgSize, imgSize, 36);
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        ctx.restore();
      }

      // Condition Badge Cleanly on Top-Right Corner INSIDE Image
      ctx.fillStyle = theme.accentColor;
      ctx.beginPath();
      ctx.roundRect(width - 380, 270, 280, 60, 30);
      ctx.fill();
      ctx.font = 'bold 30px Cairo, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText(product.conditionLabel || 'أوبن بوكس', width - 240, 312);

      // Product Title
      ctx.textAlign = 'right';
      ctx.font = 'bold 52px Cairo, sans-serif';
      ctx.fillStyle = theme.titleColor;
      const words = (product.title || '').split(' ');
      let line1 = words.slice(0, 5).join(' ');
      let line2 = words.slice(5, 10).join(' ');
      ctx.fillText(line1, width - 70, 1250);
      if (line2) {
        ctx.fillText(line2, width - 70, 1320);
      }

      // Merchant with Verified Badge
      ctx.font = '34px Cairo, sans-serif';
      ctx.fillStyle = theme.accentColor;
      ctx.fillText(`🏪 التاجر: ${product.merchantName || 'أبو وارث أمازون'} ✓`, width - 70, 1400);

      // Price Highlight Box
      ctx.fillStyle = theme.priceBg;
      ctx.beginPath();
      ctx.roundRect(70, 1450, 940, 160, 28);
      ctx.fill();
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.font = 'bold 38px Cairo, sans-serif';
      ctx.fillStyle = theme.textColor;
      ctx.fillText('السعر المباشر:', width - 120, 1550);

      ctx.font = 'bold 72px Outfit, sans-serif';
      ctx.fillStyle = theme.priceColor;
      ctx.textAlign = 'left';
      ctx.fillText(`${Number(product.price).toLocaleString()} د.ع`, 120, 1560);

      // Footer Real QR Code & Link (Extra Large & Crisp)
      ctx.textAlign = 'right';
      ctx.font = 'bold 34px Cairo, sans-serif';
      ctx.fillStyle = theme.textColor;
      ctx.fillText('امسح الكود بكاميرا الموبايل للطلب', width - 290, 1730);

      ctx.font = '28px Outfit, sans-serif';
      ctx.fillStyle = theme.subColor;
      ctx.fillText('souk-al-balat.vercel.app', width - 290, 1785);

      // Draw Large White QR Box & Image
      const qrBoxSize = 190;
      const qrX = width - 260;
      const qrY = 1660;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrBoxSize, qrBoxSize, 20);
      ctx.fill();
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 3;
      ctx.stroke();

      if (qrImg.complete && qrImg.naturalWidth > 0) {
        ctx.drawImage(qrImg, qrX + 10, qrY + 10, qrBoxSize - 20, qrBoxSize - 20);
      }

    } else {
      // --- 🖥️ HORIZONTAL BANNER (1200 x 630) ---
      const imgSize = 480;
      const imgX = 660;
      const imgY = 75;

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgSize, imgSize, 24);
      ctx.fill();

      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgSize, imgSize, 24);
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        ctx.restore();
      }

      // Condition Badge inside Image Top-Right
      ctx.fillStyle = theme.accentColor;
      ctx.beginPath();
      ctx.roundRect(width - 320, 95, 230, 48, 24);
      ctx.fill();
      ctx.font = 'bold 24px Cairo, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText(product.conditionLabel || 'أوبن بوكس', width - 205, 128);

      // Left Info Column
      ctx.textAlign = 'right';
      ctx.font = 'bold 36px Cairo, sans-serif';
      ctx.fillStyle = theme.accentColor;
      ctx.fillText(`⚡ ${APP_CONFIG.STORE_NAME_SHORT}`, 610, 120);

      ctx.font = '22px Cairo, sans-serif';
      ctx.fillStyle = theme.subColor;
      ctx.fillText(`| ${product.merchantName || 'أبو وارث'} ✓`, 420, 120);

      // Title
      ctx.font = 'bold 40px Cairo, sans-serif';
      ctx.fillStyle = theme.titleColor;
      const words = (product.title || '').split(' ');
      let line1 = words.slice(0, 5).join(' ');
      let line2 = words.slice(5, 10).join(' ');
      ctx.fillText(line1, 610, 200);
      if (line2) {
        ctx.fillText(line2, 610, 255);
      }

      // Price Box
      ctx.fillStyle = theme.priceBg;
      ctx.beginPath();
      ctx.roundRect(60, 310, 550, 110, 20);
      ctx.fill();
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = 'bold 30px Cairo, sans-serif';
      ctx.fillStyle = theme.textColor;
      ctx.fillText('السعر:', 580, 375);

      ctx.font = 'bold 54px Outfit, sans-serif';
      ctx.fillStyle = theme.priceColor;
      ctx.textAlign = 'left';
      ctx.fillText(`${Number(product.price).toLocaleString()} د.ع`, 90, 385);

      // QR Code Footer
      ctx.textAlign = 'right';
      ctx.font = 'bold 26px Cairo, sans-serif';
      ctx.fillStyle = theme.textColor;
      ctx.fillText('امسح الكود للتسوق المباشر', 460, 490);

      ctx.font = '22px Outfit, sans-serif';
      ctx.fillStyle = theme.subColor;
      ctx.fillText('souk-al-balat.vercel.app', 460, 530);

      // Draw QR Box
      const qrBoxSize = 135;
      const qrX = 480;
      const qrY = 445;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrBoxSize, qrBoxSize, 16);
      ctx.fill();
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (qrImg.complete && qrImg.naturalWidth > 0) {
        ctx.drawImage(qrImg, qrX + 8, qrY + 8, qrBoxSize - 16, qrBoxSize - 16);
      }
    }

    const filename = `poster_${product.id}_${format}_${themeKey}.png`;
    return await this.deliverPoster(canvas, filename, product.title);
  }

  /**
   * Generates High-Resolution scannable QR Code DataURL for Merchant Store
   */
  static async generateStoreQRCode(merchantIdOrSlug) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://souk-al-balat.vercel.app';
    const storeUrl = `${origin}/seller/${merchantIdOrSlug}`;
    try {
      return await QRCode.toDataURL(storeUrl, {
        margin: 1,
        width: 360,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' }
      });
    } catch (e) {
      console.warn('Store QR Code generation fallback:', e);
      return '';
    }
  }

  /**
   * Generates High-Definition Marketing Poster for Merchant Store Page (Horizontal & Vertical)
   */
  static async exportMerchantStorePosterAsImage(merchant, products = [], format = 'vertical', themeKey = 'dark_gold') {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://souk-al-balat.vercel.app';
    const storeUrl = `${origin}/seller/${merchant.slug || merchant.id}`;
    const qrDataUrl = await this.generateStoreQRCode(merchant.slug || merchant.id);

    const theme = POSTER_THEMES[themeKey] || POSTER_THEMES.dark_gold;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const isVertical = format === 'vertical';
    canvas.width = isVertical ? 1080 : 1200;
    canvas.height = isVertical ? 1920 : 630;

    const width = canvas.width;
    const height = canvas.height;

    const qrImg = new Image();
    if (qrDataUrl) {
      qrImg.src = qrDataUrl;
      await new Promise(r => { qrImg.onload = r; qrImg.onerror = r; });
    }

    const avatarImg = merchant.avatar ? await this.safeLoadImage(merchant.avatar) : null;

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, theme.bgStart);
    bgGrad.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer Border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = isVertical ? 12 : 6;
    ctx.strokeRect(isVertical ? 24 : 16, isVertical ? 24 : 16, width - (isVertical ? 48 : 32), height - (isVertical ? 48 : 32));

    ctx.textAlign = 'center';
    ctx.direction = 'rtl';

    if (isVertical) {
      // Top Platform Badge
      ctx.fillStyle = theme.priceBg;
      ctx.beginPath();
      ctx.roundRect(80, 70, 920, 90, 24);
      ctx.fill();
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = 'bold 42px Cairo, sans-serif';
      ctx.fillStyle = theme.accentColor;
      ctx.fillText(`⚡ ${APP_CONFIG.STORE_NAME_SHORT} | المتجر الرسمي`, 540, 132);

      // Circular Merchant Avatar DIRECTLY ABOVE Name
      const avatarSize = 200;
      const avatarX = (width - avatarSize) / 2;
      const avatarY = 200;

      if (avatarImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(540, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // Border around Avatar
        ctx.beginPath();
        ctx.arc(540, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 8;
        ctx.stroke();
      }

      // Merchant Name
      ctx.font = 'bold 56px Cairo, sans-serif';
      ctx.fillStyle = theme.titleColor;
      ctx.fillText(`🏪 ${merchant.name} ✓`, 540, 470);

      ctx.font = 'bold 32px Cairo, sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('👑 مدير ومؤسس الموقع | حساب معتمد وموثوق', 540, 525);

      ctx.font = '28px Cairo, sans-serif';
      ctx.fillStyle = theme.subColor;
      ctx.fillText(`📞 واتساب: ${merchant.phone} | 📦 معروض حالياً: ${products.length} قطعة بالة`, 540, 575);

      // Highlighted Products
      if (products.length > 0) {
        ctx.font = 'bold 36px Cairo, sans-serif';
        ctx.fillStyle = theme.accentColor;
        ctx.fillText('✨ عينات من بضائع المتجر المتوفرة:', 540, 665);

        const topProducts = products.slice(0, 3);
        let pY = 720;
        for (const p of topProducts) {
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          ctx.beginPath();
          ctx.roundRect(80, pY, 920, 125, 20);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.12)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.textAlign = 'right';
          ctx.font = 'bold 32px Cairo, sans-serif';
          ctx.fillStyle = theme.textColor;
          ctx.fillText(p.title.slice(0, 35) + (p.title.length > 35 ? '...' : ''), 960, pY + 52);

          ctx.font = '24px Cairo, sans-serif';
          ctx.fillStyle = theme.subColor;
          ctx.fillText(p.conditionLabel || 'أوبن بوكس', 960, pY + 95);

          ctx.textAlign = 'left';
          ctx.font = 'bold 36px Outfit, sans-serif';
          ctx.fillStyle = theme.priceColor;
          ctx.fillText(`${Number(p.price).toLocaleString()} د.ع`, 110, pY + 75);

          pY += 150;
        }
      }

      // QR Code Box
      const qrBoxSize = 380;
      const qrX = (1080 - qrBoxSize) / 2;
      const qrY = 1250;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrX - 16, qrY - 16, qrBoxSize + 32, qrBoxSize + 32, 28);
      ctx.fill();
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 6;
      ctx.stroke();

      if (qrImg.complete && qrImg.naturalWidth > 0) {
        ctx.drawImage(qrImg, qrX, qrY, qrBoxSize, qrBoxSize);
      }

      ctx.textAlign = 'center';
      ctx.font = 'bold 40px Cairo, sans-serif';
      ctx.fillStyle = theme.textColor;
      ctx.fillText('📷 امسح الكود بكاميرا الموبايل لزيارة متجري', 540, 1740);

      ctx.font = 'bold 30px Outfit, sans-serif';
      ctx.fillStyle = theme.accentColor;
      ctx.fillText(storeUrl, 540, 1795);
    } else {
      // --- 🖥️ HORIZONTAL BANNER (1200 x 630) ---
      const qrBoxSize = 260;
      const qrX = 80;
      const qrY = 185;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrX - 12, qrY - 12, qrBoxSize + 24, qrBoxSize + 24, 20);
      ctx.fill();
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 4;
      ctx.stroke();

      if (qrImg.complete && qrImg.naturalWidth > 0) {
        ctx.drawImage(qrImg, qrX, qrY, qrBoxSize, qrBoxSize);
      }

      ctx.textAlign = 'center';
      ctx.font = 'bold 22px Cairo, sans-serif';
      ctx.fillStyle = theme.textColor;
      ctx.fillText('امسح لزيارة المتجر 📷', qrX + qrBoxSize / 2, qrY + qrBoxSize + 45);

      // Right side: Avatar directly above Name + Info
      const avatarSize = 130;
      const avatarX = 750;
      const avatarY = 65;

      if (avatarImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      ctx.textAlign = 'right';
      ctx.font = 'bold 44px Cairo, sans-serif';
      ctx.fillStyle = theme.titleColor;
      ctx.fillText(`🏪 ${merchant.name} ✓`, 1120, 260);

      ctx.font = 'bold 26px Cairo, sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('👑 مدير ومؤسس الموقع | حساب موثوق ومضمون', 1120, 310);

      ctx.font = '24px Cairo, sans-serif';
      ctx.fillStyle = theme.subColor;
      ctx.fillText(`📞 واتساب: ${merchant.phone} | 📦 المعروض: ${products.length} قطعة`, 1120, 360);

      ctx.font = 'bold 28px Cairo, sans-serif';
      ctx.fillStyle = theme.accentColor;
      ctx.fillText(`⚡ ${APP_CONFIG.STORE_NAME}`, 1120, 440);

      ctx.font = '22px Outfit, sans-serif';
      ctx.fillStyle = theme.subColor;
      ctx.fillText(storeUrl, 1120, 480);
    }

    const filename = `poster_store_${merchant.slug || merchant.id}_${format}_${themeKey}.png`;
    return await this.deliverPoster(canvas, filename, `متجر ${merchant.name}`);
  }
}
