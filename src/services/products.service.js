/* ==========================================================================
   Products Catalog & Inventory Service (Multi-Image, Stock Quantity & Cloud Sync)
   ========================================================================== */

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
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80"
    ],
    description: "سماعة سوني XM4 أصلية وارد مستودعات أمازون، العلبة مفتوحة للفحص فقط بحالة كالجديدة تماماً مع جميع الكابلات والحافظة الأصلية.",
    status: "available",
    freeDelivery: false,
    aiEnabled: true,
    createdAt: new Date().toISOString()
  }
];

export class ProductsService {
  static getProducts() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }

  static getProductById(id) {
    const products = this.getProducts();
    return products.find(p => String(p.id) === String(id)) || null;
  }

  static addProduct(productData) {
    const products = this.getProducts();
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
      description: productData.description || productData.title,
      status: 'available',
      freeDelivery: Boolean(productData.freeDelivery),
      aiEnabled: Boolean(productData.aiEnabled),
      createdAt: new Date().toISOString()
    };

    products.unshift(newProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return newProduct;
  }

  static updateProductStatus(id, status, quantity = null) {
    const products = this.getProducts();
    const product = products.find(p => String(p.id) === String(id));
    if (product) {
      product.status = status;
      if (quantity !== null) {
        product.quantity = Number(quantity);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      return true;
    }
    return false;
  }

  static decrementStock(id, count = 1) {
    const products = this.getProducts();
    const product = products.find(p => String(p.id) === String(id));
    if (product) {
      const currentQty = Number(product.quantity) || 1;
      const newQty = Math.max(0, currentQty - count);
      product.quantity = newQty;

      if (newQty === 0) {
        product.status = 'reserved';
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      return { success: true, newQuantity: newQty, status: product.status };
    }
    return { success: false };
  }

  static updateProductDiscount(id, discountPercent, freeDelivery) {
    const products = this.getProducts();
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
      return true;
    }
    return false;
  }

  static deleteProduct(id) {
    let products = this.getProducts();
    products = products.filter(p => String(p.id) !== String(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
}
