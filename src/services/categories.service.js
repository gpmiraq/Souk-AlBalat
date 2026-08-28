/* ==========================================================================
   Categories Service with Real-Time Google Firebase Firestore Sync
   ========================================================================== */

import { db } from '../config/firebase.config.js';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { DEFAULT_CATEGORIES } from '../config/constants.js';

const STORAGE_KEY = 'souk_custom_categories_v2';

export class CategoriesService {
  /**
   * Syncs categories from Firestore collection 'categories'
   */
  static async syncFromCloud() {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      if (!snap.empty) {
        const cloudCats = [];
        snap.forEach(docSnap => {
          const data = docSnap.data();
          if (data.id && !String(data.id).startsWith('merchant_profile') && data.name) {
            cloudCats.push(data);
          }
        });
        if (cloudCats.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudCats));
          return cloudCats;
        }
      } else {
        // Seed default categories into Firestore Cloud
        for (const cat of DEFAULT_CATEGORIES) {
          await setDoc(doc(db, 'categories', cat.id), cat);
        }
      }
    } catch (err) {
      console.warn('Categories cloud sync notice:', err.message);
    }
    return this.getCategories();
  }

  static getCategories() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }

  static async addCategory(newCategory) {
    const categories = this.getCategories();
    if (!categories.some(c => c.id === newCategory.id)) {
      categories.push(newCategory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));

      // Cloud write
      setDoc(doc(db, 'categories', newCategory.id), newCategory).catch(e => console.warn(e));
    }
    return categories;
  }

  static async deleteCategory(catId) {
    let categories = this.getCategories();
    categories = categories.filter(c => c.id !== catId && c.id !== 'all');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));

    // Cloud delete
    deleteDoc(doc(db, 'categories', catId)).catch(e => console.warn(e));
    return categories;
  }
}
