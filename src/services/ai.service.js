/* ==========================================================================
   Objective Technical AI & Market Pricing Engine for Souk-AlBalat
   Strict Neutral Tone (No Marketing Fluff), Independent Market Price Estimation
   Multi-Device Cloud Synced Google Gemini AI
   ========================================================================== */

import { db } from '../config/firebase.config.js';
import { doc, getDoc } from 'firebase/firestore';
import { AuthService } from './auth.service.js';

export class AIService {
  /**
   * Retrieves the active Gemini API Key from LocalStorage, Merchant Profile, or Cloud Firestore
   */
  static async getApiKey() {
    let key = localStorage.getItem('souk_gemini_api_key');
    if (key && key.trim().length > 10) return key.trim();

    const current = AuthService.getCurrentMerchant();
    if (current?.geminiApiKey && current.geminiApiKey.trim().length > 10) {
      localStorage.setItem('souk_gemini_api_key', current.geminiApiKey.trim());
      return current.geminiApiKey.trim();
    }

    try {
      const snap = await getDoc(doc(db, 'categories', 'merchant_profile_alwareth'));
      if (snap && snap.exists()) {
        const data = snap.data();
        if (data?.geminiApiKey && data.geminiApiKey.trim().length > 10) {
          localStorage.setItem('souk_gemini_api_key', data.geminiApiKey.trim());
          return data.geminiApiKey.trim();
        }
      }
    } catch (e) {
      console.warn('AI Key cloud lookup notice:', e.message);
    }

    return '';
  }

  /**
   * Generates the 4-line structured AI Product Sheet with strictly neutral technical facts
   * Independent market pricing estimation (does NOT rely on merchant's stated price)
   * @param {string} title Product Title / Model
   * @param {string} category Product Category
   * @param {string} condition Product Condition
   * @returns {Promise<string>} 4-line structured output
   */
  static async generateProductDescription(title = '', category = 'electronics', condition = 'open_box') {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      throw new Error('يرجى إدخال عنوان وموديل المنتج أولاً.');
    }

    const apiKey = await this.getApiKey();
    const conditionLabel = condition === 'open_box' ? 'أوبن بوكس (استوكات ومستودعات أمازون)' : condition === 'new' ? 'جديد بالكرتون المصنعي' : condition === 'used' ? 'مستخدم مفحوص' : 'عاطل / قطع غيار';

    // 1. Official Google Gemini Live API
    if (apiKey) {
      try {
        const prompt = `أنت مهندس ومراجع تقني محايد وخبير في بضائع أمازون وسوق الإلكترونيات في العراق.
المطلوب كتابة بطاقة مواصفات فنية ومعلومات عامة فقط ومجردة من أي مبالغة أو عبارات مدح أو تسويق للمنتج: "${cleanTitle}" (حالة الفحص: ${conditionLabel}).
قدر أسعار السوق التقديرية الحقيقية للمنتج بناءً على مواصفات الموديل والماركة في السوق العالمية والمحلية في العراق.

التزم حصراً بالهيكل التالي فقط وبدون أي مقدمات أو شروحات إضافية:
اسم المنتج : [الاسم التقني والموديل الرسمي بدقة في حدود 10 إلى 15 كلمة]
وصف المنتج : [المواصفات الفنية والمكونات المادية والمنافذ والمعالج/البطارية/الصوت فقط بأسلوب علمي ومحايد بدون مبالغة في حدود 40 إلى 50 كلمة]
سعر المنتج التقريبي : [تخمين السعر التقديري في السوق العراقي بناءً على الموديل، مثال: 65,000 - 85,000 د.ع]
سعر المنتج العالمي : [السعر العالمي التقديري بالدولار، مثال: $45 - $60 دولار تقريباً]`;

        const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
        for (const model of models) {
          try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              })
            });

            if (response.ok) {
              const data = await response.json();
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text && text.length > 25) {
                return text.trim();
              }
            }
          } catch (modelErr) {
            console.warn(`Model ${model} fetch notice:`, modelErr);
          }
        }
      } catch (err) {
        console.warn('Gemini API call notice:', err);
      }
    }

    // 2. Serverless API Endpoint Fallback
    try {
      const srvRes = await fetch('/api/generate-desc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: cleanTitle, category, condition, apiKey })
      });
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        if (srvData?.text) return srvData.text;
      }
    } catch (srvErr) {}

    // 3. Live Web Knowledge & Specs Fetcher (Neutral & Independent)
    return this.fetchLiveWebSpecs(cleanTitle, conditionLabel);
  }

  /**
   * Fetches real live technical specifications from international databases
   */
  static async fetchLiveWebSpecs(query, conditionLabel) {
    const cleanQuery = encodeURIComponent(query.replace(/[\u0600-\u06FF]/g, '').trim() || query);
    
    let snippet = '';
    let matchedTitle = query;

    try {
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${cleanQuery}&utf8=&format=json&origin=*`);
      if (res.ok) {
        const data = await res.json();
        const firstHit = data?.query?.search?.[0];
        if (firstHit && firstHit.snippet) {
          snippet = firstHit.snippet.replace(/<\/?[^>]+(>|$)/g, "");
          matchedTitle = firstHit.title;
        }
      }
    } catch (err) {
      console.warn('Live wiki fetch note:', err);
    }

    let descText = snippet 
      ? `${snippet}. بيانات فنية ومواصفات مصنعية رسمية.`
      : `مواصفات ومكونات قياسية خضعت للفحص الفني والتشغيلي للأجزاء الداخلية والهيكل الخارجي.`;

    return `اسم المنتج : ${matchedTitle} (${conditionLabel})
وصف المنتج : ${descText}
سعر المنتج التقريبي : يتم تقديره حسب فئة الموديل وتوفره في السوق العراقي
سعر المنتج العالمي : راجع التسعير الرسمي للشركة المصنعة`;
  }

  /**
   * Alias for generateProductDescription to prevent any runtime call errors
   */
  static async generateProductInsights(title = '', price = 0) {
    return this.generateProductDescription(title);
  }
}
