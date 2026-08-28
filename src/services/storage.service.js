/* ==========================================================================
   Image Processing & Strict Firebase Cloud Storage Pipeline
   Clean Elegant Watermark & Cloud-Synced Merchant Gallery across Devices
   ========================================================================== */

import { CloudStorageProvider, db } from '../config/firebase.config.js';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

export class StorageService {
  /**
   * Processes an image file: crops to 1:1, burns clean watermark, and uploads to Firebase Storage
   * Path: merchants/{merchantSlug}/{sanitizedTitle}_img{slot}_{timestamp}.webp
   * @param {File} file 
   * @param {string} merchantName 
   * @param {string} productTitle 
   * @param {number} slotIndex 
   * @param {string} merchantId
   * @returns {Promise<string>} Public Firebase Cloud Storage URL
   */
  static async processAndUploadImage(file, merchantName = 'abu_wareth', productTitle = 'item', slotIndex = 1, merchantId = 'm-alwareth') {
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

            // Cover crop 1:1
            const size = Math.min(img.width, img.height);
            const startX = (img.width - size) / 2;
            const startY = (img.height - size) / 2;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 1080, 1080);
            ctx.drawImage(img, startX, startY, size, size, 0, 0, 1080, 1080);

            // Clean, Subtle Watermark (Zero heavy black bars)
            ctx.save();
            ctx.font = 'bold 34px "Tajawal", "Segoe UI", sans-serif';
            ctx.textAlign = 'right';
            ctx.direction = 'rtl';
            
            // Soft Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.fillText('⚡ سوق البالات', 1042, 1042);
            
            // White Crisp Watermark
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText('⚡ سوق البالات', 1040, 1040);
            ctx.restore();

            // Convert to high-quality compressed WebP Blob
            canvas.toBlob(async (blob) => {
              if (!blob) {
                reject(new Error('فشل معالجة وضغط الصورة كملف WebP'));
                return;
              }

              try {
                // Sanitize names for clean Firebase Storage paths
                const cleanMerchant = merchantName.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_').substring(0, 25) || 'merchant';
                const cleanTitle = productTitle.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_').substring(0, 30) || 'product';
                const fileName = `${cleanMerchant}/${cleanTitle}_img${slotIndex}_${Date.now()}.webp`;

                const firebaseCloudUrl = await CloudStorageProvider.uploadBlobToFirebase(blob, fileName);
                
                // Save to Cloud Firestore & Local Gallery
                await StorageService.saveImageToGallery({
                  url: firebaseCloudUrl,
                  name: `${cleanTitle} (صورة ${slotIndex})`,
                  merchantId: merchantId,
                  createdAt: new Date().toISOString()
                }, merchantId);

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

  /**
   * Merchant Cloud Gallery Management (Synchronized with Google Firebase Firestore)
   */
  static async getCloudMerchantGallery(merchantId = 'm-alwareth') {
    let cloudList = [];
    try {
      const snap = await getDocs(collection(db, 'merchant_gallery'));
      if (!snap.empty) {
        snap.forEach(d => {
          const item = d.data();
          if (!item.merchantId || item.merchantId === merchantId) {
            cloudList.push(item);
          }
        });
      }
    } catch (err) {
      console.warn('Could not fetch cloud gallery, falling back to cache:', err);
    }

    // Merge with local cache for offline reliability
    const localGallery = this.getMerchantGallery();
    const map = new Map();

    cloudList.forEach(item => {
      if (item.url) map.set(item.url, item);
    });
    localGallery.forEach(item => {
      if (item.url && !map.has(item.url)) map.set(item.url, item);
    });

    const combined = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    localStorage.setItem('souk_merchant_gallery', JSON.stringify(combined.slice(0, 100)));
    return combined;
  }

  static getMerchantGallery() {
    try {
      const data = localStorage.getItem('souk_merchant_gallery');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static async saveImageToGallery(imgObj, merchantId = 'm-alwareth') {
    try {
      const gallery = this.getMerchantGallery();
      if (!gallery.some(g => g.url === imgObj.url)) {
        gallery.unshift(imgObj);
        localStorage.setItem('souk_merchant_gallery', JSON.stringify(gallery.slice(0, 100)));
      }

      // Save to Firebase Firestore
      const docId = 'g_' + (imgObj.url.split('/').pop()?.split('?')[0]?.replace(/[^a-zA-Z0-9]/g, '_') || Date.now());
      await setDoc(doc(db, 'merchant_gallery', docId), {
        ...imgObj,
        merchantId: merchantId || 'm-alwareth'
      }, { merge: true });
    } catch (e) {
      console.warn('Gallery save error:', e);
    }
  }

  static async deleteImageFromGallery(url, merchantId = 'm-alwareth') {
    try {
      const gallery = this.getMerchantGallery().filter(g => g.url !== url);
      localStorage.setItem('souk_merchant_gallery', JSON.stringify(gallery));

      const docId = 'g_' + (url.split('/').pop()?.split('?')[0]?.replace(/[^a-zA-Z0-9]/g, '_') || '');
      if (docId) {
        await deleteDoc(doc(db, 'merchant_gallery', docId)).catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  }
}
