/* ==========================================================================
   Marketing Flyer & Poster Generator Service
   Supports Horizontal (1200x630) and Vertical Story (1080x1920) Formats
   ========================================================================== */

import { APP_CONFIG } from '../config/constants.js';

export class PosterService {
  /**
   * Generates and downloads the flyer card as an image in selected format
   * @param {Object} product 
   * @param {'horizontal' | 'vertical'} format 
   */
  static async exportFlyerAsImage(product, format = 'horizontal') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const isVertical = format === 'vertical';
    canvas.width = isVertical ? 1080 : 1200;
    canvas.height = isVertical ? 1920 : 630;

    const width = canvas.width;
    const height = canvas.height;

    // 1. High-Contrast Deep Dark Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#020617');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Gold Accent Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = isVertical ? 8 : 4;
    ctx.strokeRect(isVertical ? 24 : 16, isVertical ? 24 : 16, width - (isVertical ? 48 : 32), height - (isVertical ? 48 : 32));

    const img = new Image();
    img.crossOrigin = 'anonymous';

    return new Promise((resolve) => {
      img.onload = () => {
        ctx.textAlign = 'right';
        ctx.direction = 'rtl';

        if (isVertical) {
          // --- 📱 VERTICAL STORY / STATUS (1080 x 1920) ---
          
          // Header Logo & Store Name
          ctx.font = 'bold 46px Cairo, sans-serif';
          ctx.fillStyle = '#f59e0b';
          ctx.fillText(`⚡ ${APP_CONFIG.STORE_NAME_SHORT}`, width - 70, 130);

          ctx.font = '32px Outfit, sans-serif';
          ctx.fillStyle = '#94a3b8';
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

          // Condition Badge on Image
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.roundRect(width - 400, 270, 300, 60, 30);
          ctx.fill();
          ctx.font = 'bold 30px Cairo, sans-serif';
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.fillText(product.conditionLabel || 'أوبن بوكس', width - 250, 312);

          // Product Title
          ctx.textAlign = 'right';
          ctx.font = 'bold 54px Cairo, sans-serif';
          ctx.fillStyle = '#ffffff';
          const words = product.title.split(' ');
          let line1 = words.slice(0, 5).join(' ');
          let line2 = words.slice(5, 10).join(' ');
          ctx.fillText(line1, width - 70, 1250);
          if (line2) {
            ctx.fillText(line2, width - 70, 1320);
          }

          // Merchant
          ctx.font = '34px Cairo, sans-serif';
          ctx.fillStyle = '#cbd5e1';
          ctx.fillText(`🏪 التاجر: ${product.merchantName}`, width - 70, 1400);

          // Price Highlight Box
          ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
          ctx.beginPath();
          ctx.roundRect(70, 1450, 940, 160, 28);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.font = 'bold 38px Cairo, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('السعر المباشر:', width - 120, 1550);

          ctx.font = 'bold 72px Outfit, sans-serif';
          ctx.fillStyle = '#f59e0b';
          ctx.textAlign = 'left';
          ctx.fillText(`${Number(product.price).toLocaleString()} د.ع`, 120, 1560);

          // Footer QR & Link
          ctx.textAlign = 'right';
          ctx.font = 'bold 32px Cairo, sans-serif';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText('امسح الكود للتسوق والطلب الفوري', width - 280, 1730);

          ctx.font = '26px Outfit, sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('souk-al-balat.vercel.app', width - 280, 1780);

          // Mini QR Box
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(width - 240, 1670, 140, 140, 16);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.fillRect(width - 225, 1685, 40, 40);
          ctx.fillRect(width - 150, 1685, 40, 40);
          ctx.fillRect(width - 225, 1755, 40, 40);

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

          // Brand
          ctx.font = 'bold 26px Cairo, sans-serif';
          ctx.fillStyle = '#f59e0b';
          ctx.fillText(`⚡ ${APP_CONFIG.STORE_NAME}`, 600, 110);

          // Title
          ctx.font = 'bold 36px Cairo, sans-serif';
          ctx.fillStyle = '#ffffff';
          const words = product.title.split(' ');
          let line1 = words.slice(0, 5).join(' ');
          let line2 = words.slice(5).join(' ');
          ctx.fillText(line1, 600, 170);
          if (line2) {
            ctx.fillText(line2, 600, 220);
          }

          // Condition & Seller
          ctx.font = '20px Outfit, Cairo, sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`الحالة: ${product.conditionLabel || 'ممتاز'} | التاجر: ${product.merchantName}`, 600, 270);

          // Price Box
          ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
          ctx.beginPath();
          ctx.roundRect(60, 310, 540, 110, 18);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = 'bold 22px Cairo, sans-serif';
          ctx.fillStyle = '#e5e7eb';
          ctx.fillText('السعر المباشر:', 570, 375);

          ctx.font = 'bold 44px Outfit, sans-serif';
          ctx.fillStyle = '#f59e0b';
          ctx.textAlign = 'left';
          ctx.fillText(`${Number(product.price).toLocaleString()} د.ع`, 90, 380);

          // Footer
          ctx.textAlign = 'right';
          ctx.font = 'bold 18px Cairo, sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('امسح الكود للتسوق والطلب المباشر', 450, 510);

          ctx.font = '14px Outfit, sans-serif';
          ctx.fillStyle = '#64748b';
          ctx.fillText('souk-al-balat.vercel.app', 450, 540);

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(470, 470, 90, 90, 10);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.fillRect(480, 480, 24, 24);
          ctx.fillRect(526, 480, 24, 24);
          ctx.fillRect(480, 526, 24, 24);
        }

        // Trigger Download
        const link = document.createElement('a');
        link.download = `poster-${product.id}-${format}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        resolve(true);
      };

      img.src = product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';
    });
  }
}
