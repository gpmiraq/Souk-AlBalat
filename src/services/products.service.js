/* ==========================================================================
   Products Catalog & Real-Time Cloud Synchronization Service
   Integrated with Google Firebase Cloud Firestore + Local Cache
   Ensures products published from any phone/browser are globally available
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
   * Syncs all products from Google Firebase Firestore Cloud
   * Updates local cache and returns the latest catalog
   */
  static async syncFromCloud() {
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (!snap.empty) {
        const cloudList = [];
        snap.forEach(docSnap => {
          cloudList.push(docSnap.data());
        });
        cloudList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudList));
        return cloudList;
      } else {
        // First-time seed into Firestore Cloud
        for (const item of INITIAL_PRODUCTS) {
          await setDoc(doc(db, 'products', item.id), item);
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
      try { list = JSON.parse(saved); } catch (e) { console.error(e); }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    }
    return includeDeleted ? list : list.filter(p => p.status !== 'deleted');
  }

  static getDeletedProducts(merchantId = null) {
    const saved = localStorage.getItem(STORAGE_KEY);
    let list = [];
    if (saved) {
      try { list = JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return list.filter(p => p.status === 'deleted' && (!merchantId || p.merchantId === merchantId));
  }

  static getProductById(id) {
    const products = this.getProducts(true);
    return products.find(p => String(p.id) === String(id)) || null;
  }

  static addProduct(productData) {
    const products = this.getProducts(true);
    const newProduct = {
      id: `p-${Date.now()}`,
      title: productData.title,
      price: Number(productData.price),
      oldPrice: productData.oldPrice ? Number(productData.oldPrice) : null,
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
    };

    products.unshift(newProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

    // Async Cloud write
    setDoc(doc(db, 'products', newProduct.id), newProduct).catch(e => console.warn('Cloud sync error:', e));

    return newProduct;
  }

  static updateProduct(id, updatedData) {
    const products = this.getProducts(true);
    const index = products.findIndex(p => String(p.id) === String(id));
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updatedData,
        price: updatedData.price !== undefined ? Number(updatedData.price) : products[index].price,
        quantity: updatedData.quantity !== undefined ? Number(updatedData.quantity) : products[index].quantity,
        images: updatedData.images?.length > 0 ? updatedData.images : (updatedData.image ? [updatedData.image] : products[index].images),
        image: updatedData.images?.[0] || updatedData.image || products[index].image,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

      // Async Cloud write
      setDoc(doc(db, 'products', id), products[index], { merge: true }).catch(e => console.warn('Cloud update error:', e));

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

      // Async Cloud write
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

      // Async Cloud write
      setDoc(doc(db, 'products', id), { status: 'available' }, { merge: true }).catch(e => console.warn('Cloud restore error:', e));

      return true;
    }
    return false;
  }

  static hardDeleteProduct(id) {
    let products = this.getProducts(true);
    products = products.filter(p => String(p.id) !== String(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

    // Async Cloud delete
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

      // Async Cloud write
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

      // Async Cloud write
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
      if (discountPercent > 0) {
        product.oldPrice = Math.round(product.price / (1 - discountPercent / 100));
      } else {
        product.oldPrice = null;
      }
      product.freeDelivery = Boolean(freeDelivery);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

      // Async Cloud write
      setDoc(doc(db, 'products', id), { discountPercent: product.discountPercent, oldPrice: product.oldPrice, freeDelivery: product.freeDelivery }, { merge: true }).catch(e => console.warn('Cloud discount error:', e));

      return true;
    }
    return false;
  }
}
