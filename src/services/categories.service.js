/* ==========================================================================
   Categories Service with Real-Time Google Firebase Firestore Sync
   Clean Deduplication & Proper Filtering of System Profile Documents
   ========================================================================== */

import { db } from '../config/firebase.config.js';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { DEFAULT_CATEGORIES } from '../config/constants.js';

const STORAGE_KEY = 'souk_custom_categories_v4';

export class CategoriesService {
  /**
   * Syncs categories from Firestore collection 'categories'
   */
  static async syncFromCloud() {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      if (!snap.empty) {
        const cloudCats = [];
        const seenNames = new Set();

        snap.forEach(docSnap => {
          const docId = docSnap.id;
          // Exclude system documents stored in categories collection
          if (docId.startsWith('merchant_profile') || docId.startsWith('site_')) return;

          const data = docSnap.data();
          const name = (data.name || '').trim();
          if (!name || seenNames.has(name) || name.includes('أبو وارث') || name.includes('أمازون')) return;

          const id = data.id || docId;
          seenNames.add(name);
          cloudCats.push({
            id,
            name,
            icon: data.icon || '📦',
            order: data.order || 99
          });
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(c => !c.id?.startsWith('merchant_profile') && !c.name?.includes('أبو وارث'));
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }

  static async addCategory(newCategory) {
    const categories = this.getCategories();
    if (!categories.some(c => c.id === newCategory.id || c.name === newCategory.name)) {
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
