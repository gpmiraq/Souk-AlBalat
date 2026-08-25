/* ==========================================================================
   Marketing Flyer & Poster Generator Service
   Ultra-HD Scannable QR Codes, Clean Watermark-Free Visuals & Multi-Theme System
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
        width: 400,
        errorCorrectionLevel: 'H',
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
   * Generates and downloads the flyer card as an image in selected format and theme
   * @param {Object} product 
   * @param {'horizontal' | 'vertical'} format 
   * @param {string} themeKey
   */
  static async exportFlyerAsImage(product, format = 'horizontal', themeKey = 'dark_gold') {
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

    const img = new Image();
    img.crossOrigin = 'anonymous';

    return new Promise((resolve) => {
      img.onload = () => {
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

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(imgX, imgY, imgSize, imgSize, 36);
          ctx.clip();
          ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
          ctx.restore();

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
          const words = product.title.split(' ');
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

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(imgX, imgY, imgSize, imgSize, 24);
          ctx.clip();
          ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
          ctx.restore();

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
          const words = product.title.split(' ');
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

        // Trigger Download
        const link = document.createElement('a');
        link.download = `poster_${product.id}_${format}_${themeKey}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        resolve(true);
      };

      img.onerror = () => {
        resolve(false);
      };

      img.src = product.image;
    });
  }
}
