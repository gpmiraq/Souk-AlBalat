/* ==========================================================================
   Products Catalog & Real-Time Cloud Synchronization Service
   Integrated with Google Firebase Cloud Firestore + Local Cache
   Robust Data Sanitization & Zero-NaN / Zero-Broken-Image Protection
   ========================================================================== */

import { db } from '../config/firebase.config.js';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY = 'souk_products_v5';

const INITIAL_PRODUCTS = [
  {
    id: "out-701",
    title: "سماعات رأس لاسلكية Sony WH-1000XM4 عزل ضوضاء فائق",
    price: 185000,
    oldPrice: 240000,
    discountPercent: 23,
    condition: "open_box",
    conditionLabel: "📦 أوبن بوكس (Open Box)",
    category: "electronics",
    quantity: 1,
    merchantId: "m-alwareth",
    merchantName: "أبو وارث أمازون",
    merchantPhone: "07707188166",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
    ],
    description: "سماعة سوني XM4 أصلية وارد مستودعات أمازون، العلبة مفتوحة للفحص فقط بحالة كالجديدة تماماً مع جميع الكابلات والحافظة الأصلية.",
    aiDetails: "اسم المنتج : سماعة رأس لاسلكية Sony WH-1000XM4 أصلية عزل ضوضاء\nوصف المنتج : سماعة بلوتوث احترافية بمعالج HD QN1 لإلغاء الضوضاء، صوت عالي الدقة Hi-Res مع تقنية DSEE Extreme، بطارية تدوم 30 ساعة وشحن سريع مع مايكروفونات نقية.\nسعر المنتج التقريبي : 175,000 - 210,000 د.ع\nسعر المنتج العالمي : $140 دولار تقريباً",
    status: "available",
    freeDelivery: false,
    aiEnabled: true,
    createdAt: new Date().toISOString()
  }
];

export class ProductsService {
  /**
   * Sanitizes product object ensuring numbers and URLs are 100% valid
   */
  static sanitizeProduct(p) {
    if (!p || typeof p !== 'object') return null;

    let rawPrice = p.price;
    if (typeof rawPrice === 'string') {
      rawPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0;
    } else if (typeof rawPrice !== 'number' || isNaN(rawPrice)) {
      rawPrice = 0;
    }

    let rawOldPrice = p.oldPrice;
    if (rawOldPrice) {
      if (typeof rawOldPrice === 'string') {
        rawOldPrice = parseFloat(rawOldPrice.replace(/[^0-9.]/g, '')) || null;
      } else if (typeof rawOldPrice !== 'number' || isNaN(rawOldPrice)) {
        rawOldPrice = null;
      }
    } else {
      rawOldPrice = null;
    }

    const images = Array.isArray(p.images) && p.images.length > 0
      ? p.images.filter(url => typeof url === 'string' && url.length > 5)
      : (p.image && typeof p.image === 'string' && p.image.length > 5 ? [p.image] : []);

    const image = images[0] || p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

    return {
      id: String(p.id || `p-${Date.now()}`),
      title: String(p.title || 'منتج بالة أمازون'),
      price: rawPrice,
      oldPrice: rawOldPrice,
      discountPercent: Number(p.discountPercent) || 0,
      condition: p.condition || 'open_box',
      conditionLabel: p.conditionLabel || 'أوبن بوكس',
      category: p.category || 'all',
      quantity: Number(p.quantity) >= 0 ? Number(p.quantity) : 1,
      merchantId: p.merchantId || 'm-alwareth',
      merchantName: p.merchantName || 'أبو وارث أمازون',
      merchantPhone: p.merchantPhone || '07707188166',
      image: image,
      images: images.length > 0 ? images : [image],
      description: p.description || '',
      aiDetails: p.aiDetails || '',
      status: p.status || 'available',
      freeDelivery: Boolean(p.freeDelivery),
      aiEnabled: Boolean(p.aiEnabled),
      createdAt: p.createdAt || new Date().toISOString()
    };
  }

  /**
   * Syncs all products from Google Firebase Firestore Cloud
   * Updates local cache and returns the latest catalog
   */
  static async syncFromCloud() {
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (!snap.empty) {
        const cloudList = [];
        snap.forEach(docSnap => {
          const item = docSnap.data();
          const clean = this.sanitizeProduct(item);
          if (clean && clean.price > 0) {
            cloudList.push(clean);
          }
        });

        if (cloudList.length > 0) {
          cloudList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudList));
          return cloudList;
        }
      }
    } catch (err) {
      console.warn('Firebase Cloud Sync info:', err.message);
    }
    return this.getProducts(true);
  }

  static getProducts(includeDeleted = false) {
    const saved = localStorage.getItem(STORAGE_KEY);
    let list = INITIAL_PRODUCTS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed.map(p => this.sanitizeProduct(p)).filter(Boolean);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    }
    return includeDeleted ? list : list.filter(p => p.status !== 'deleted');
  }

  static getDeletedProducts(merchantId = null) {
    const products = this.getProducts(true);
    return products.filter(p => p.status === 'deleted' && (!merchantId || p.merchantId === merchantId));
  }

  static getProductById(id) {
    const products = this.getProducts(true);
    return products.find(p => String(p.id) === String(id)) || null;
  }

  static addProduct(productData) {
    const products = this.getProducts(true);
    const newProduct = this.sanitizeProduct({
      id: `p-${Date.now()}`,
      title: productData.title,
      price: productData.price,
      oldPrice: productData.oldPrice,
      discountPercent: productData.discountPercent || 0,
      condition: productData.condition || 'open_box',
      conditionLabel: productData.conditionLabel || 'أوبن بوكس',
      category: productData.category || 'all',
      quantity: Number(productData.quantity) || 1,
      merchantId: productData.merchantId || 'm-alwareth',
      merchantName: productData.merchantName || 'أبو وارث أمازون',
      merchantPhone: productData.merchantPhone || '07707188166',
      image: productData.images?.[0] || productData.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      images: productData.images?.length > 0 ? productData.images : [productData.image],
      description: productData.description || '',
      aiDetails: productData.aiDetails || '',
      status: 'available',
      freeDelivery: Boolean(productData.freeDelivery),
      aiEnabled: Boolean(productData.aiEnabled),
      createdAt: new Date().toISOString()
    });

    products.unshift(newProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

    // Cloud write
    setDoc(doc(db, 'products', newProduct.id), newProduct).catch(e => console.warn('Cloud sync error:', e));

    return newProduct;
  }

  static updateProduct(id, updatedData) {
    const products = this.getProducts(true);
    const index = products.findIndex(p => String(p.id) === String(id));
    if (index !== -1) {
      const merged = this.sanitizeProduct({
        ...products[index],
        ...updatedData,
        images: updatedData.images?.length > 0 ? updatedData.images : (updatedData.image ? [updatedData.image] : products[index].images),
        image: updatedData.images?.[0] || updatedData.image || products[index].image,
        updatedAt: new Date().toISOString()
      });
      products[index] = merged;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

      // Cloud write
      setDoc(doc(db, 'products', id), merged, { merge: true }).catch(e => console.warn('Cloud update error:', e));

      return products[index];
    }
    return null;
  }

  static softDeleteProduct(id) {
    const products = this.getProducts(true);
    const product = products.find(p => String(p.id) === String(id));
    if (product) {
      product.status = 'deleted';
      product.deletedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

      // Cloud write
      setDoc(doc(db, 'products', id), { status: 'deleted', deletedAt: product.deletedAt }, { merge: true }).catch(e => console.warn('Cloud soft delete error:', e));

      return true;
    }
    return false;
  }

  static restoreProduct(id) {
    const products = this.getProducts(true);
    const product = products.find(p => String(p.id) === String(id));
    if (product) {
      product.status = 'available';
      delete product.deletedAt;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

      // Cloud write
      setDoc(doc(db, 'products', id), { status: 'available' }, { merge: true }).catch(e => console.warn('Cloud restore error:', e));

      return true;
    }
    return false;
  }

  static hardDeleteProduct(id) {
    let products = this.getProducts(true);
    products = products.filter(p => String(p.id) !== String(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

    // Cloud delete
    deleteDoc(doc(db, 'products', id)).catch(e => console.warn('Cloud hard delete error:', e));
  }

  static updateProductStatus(id, status, quantity = null) {
    const products = this.getProducts(true);
    const product = products.find(p => String(p.id) === String(id));
    if (product) {
      product.status = status;
      if (quantity !== null) {
        product.quantity = Number(quantity);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

      // Cloud write
      setDoc(doc(db, 'products', id), { status, ...(quantity !== null ? { quantity: Number(quantity) } : {}) }, { merge: true }).catch(e => console.warn('Cloud status update error:', e));

      return true;
    }
    return false;
  }

  static decrementStock(id, count = 1) {
    const products = this.getProducts(true);
    const product = products.find(p => String(p.id) === String(id));
    if (product) {
      const currentQty = Number(product.quantity) || 1;
      const newQty = Math.max(0, currentQty - count);
      product.quantity = newQty;

      if (newQty === 0) {
        product.status = 'reserved';
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

      // Cloud write
      setDoc(doc(db, 'products', id), { quantity: newQty, status: product.status }, { merge: true }).catch(e => console.warn('Cloud stock decrement error:', e));

      return { success: true, newQuantity: newQty, status: product.status };
    }
    return { success: false };
  }

  static updateProductDiscount(id, discountPercent, freeDelivery) {
    const products = this.getProducts(true);
    const product = products.find(p => String(p.id) === String(id));
    if (product) {
      product.discountPercent = Number(discountPercent);
      if (discountPercent > 0 && product.price > 0) {
        product.oldPrice = Math.round(product.price / (1 - discountPercent / 100));
      } else {
        product.oldPrice = null;
      }
      product.freeDelivery = Boolean(freeDelivery);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

      // Cloud write
      setDoc(doc(db, 'products', id), { discountPercent: product.discountPercent, oldPrice: product.oldPrice, freeDelivery: product.freeDelivery }, { merge: true }).catch(e => console.warn('Cloud discount error:', e));

      return true;
    }
    return false;
  }
}
