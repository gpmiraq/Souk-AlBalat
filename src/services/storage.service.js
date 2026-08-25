/* ==========================================================================
   Image Processing & Strict Firebase Cloud Storage Pipeline
   Crops 1:1, Inlays Watermark & Uploads Directly to Google Firebase
   ========================================================================== */

import { CloudStorageProvider } from '../config/firebase.config.js';

export class StorageService {
  /**
   * Processes an image file: crops to 1:1, burns watermark, and uploads strictly to Google Firebase.
   * Throws an error if upload fails.
   * @param {File} file 
   * @param {string} customId
   * @returns {Promise<string>} Public Firebase Cloud Storage URL
   */
  static async processAndUploadImage(file, customId = `img_${Date.now()}`) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          try {
            // Create 1080x1080 square canvas
            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1080;
            const ctx = canvas.getContext('2d');

            // Cover crop
            const size = Math.min(img.width, img.height);
            const startX = (img.width - size) / 2;
            const startY = (img.height - size) / 2;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 1080, 1080);
            ctx.drawImage(img, startX, startY, size, size, 0, 0, 1080, 1080);

            // Watermark overlay
            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
            ctx.fillRect(0, 960, 1080, 120);

            // Brand text
            ctx.font = 'bold 36px "Tajawal", "Segoe UI", sans-serif';
            ctx.fillStyle = '#f59e0b';
            ctx.textAlign = 'right';
            ctx.direction = 'rtl';
            ctx.fillText('⚡ سوق البالات | AMAZON & DHL OUTLET', 1040, 1035);

            // Verified Badge
            ctx.font = '26px "Tajawal", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.direction = 'ltr';
            ctx.fillText('✅ VERIFIED OUTLET ITEM', 40, 1035);
            ctx.restore();

            // Convert to high-quality compressed WebP Blob
            canvas.toBlob(async (blob) => {
              if (!blob) {
                reject(new Error('فشل معالجة وضغط الصورة كملف WebP'));
                return;
              }

              try {
                const fileName = `${customId}_${Date.now()}.webp`;
                const firebaseCloudUrl = await CloudStorageProvider.uploadBlobToFirebase(blob, fileName);
                resolve(firebaseCloudUrl);
              } catch (cloudErr) {
                console.error('Firebase Upload Error:', cloudErr);
                reject(new Error(`فشل الرفع إلى فايربيس: ${cloudErr.message || 'خطأ في الاتصال بالخادم'}`));
              }
            }, 'image/webp', 0.88);
          } catch (err) {
            reject(err);
          }
        };
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
