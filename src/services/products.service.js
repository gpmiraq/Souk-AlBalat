/* ==========================================================================
   Products & Catalog Management Service
   Clean, Fresh State for Abu Wareth Amazon Store
   ========================================================================== */

import { PRODUCT_CONDITIONS } from '../config/constants.js';

const INITIAL_PRODUCTS = [];

export class ProductsService {
  static getProducts() {
    const saved = localStorage.getItem('souk_products_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('souk_products_v4', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }

  static getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  }

  static addProduct(productData) {
    const products = this.getProducts();
    const newProduct = {
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "available",
      discountPercent: 0,
      freeDelivery: false,
      ...productData
    };
    products.unshift(newProduct);
    localStorage.setItem('souk_products_v4', JSON.stringify(products));
    return newProduct;
  }

  static updateProductStatus(productId, status) {
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
      product.status = status;
      localStorage.setItem('souk_products_v4', JSON.stringify(products));
    }
    return product;
  }

  static updateProductDiscount(productId, discountPercent, freeDelivery) {
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
      product.discountPercent = Number(discountPercent) || 0;
      product.freeDelivery = !!freeDelivery;
      if (product.discountPercent > 0) {
        product.oldPrice = product.price;
        product.price = Math.round(product.price * (1 - product.discountPercent / 100));
      }
      localStorage.setItem('souk_products_v4', JSON.stringify(products));
    }
    return product;
  }
}
