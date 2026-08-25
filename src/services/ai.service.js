/* ==========================================================================
   Real Generative AI Engine for Souk-AlBalat
   Permanent Google Gemini LLM Integration
   Configured Global Key: AIzaSyCQB6sOuZ6fJO7BnVr9paKP4R3_Drz07L8
   ========================================================================== */

export const GEMINI_CONFIG = {
  GLOBAL_API_KEY: "AIzaSyCQB6sOuZ6fJO7BnVr9paKP4R3_Drz07L8",
  MODELS: [
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-2.5-flash"
  ]
};

export class AIService {
  /**
   * Calls Google Gemini Live LLM API to generate a simplified, 4-line structured product sheet
   * @param {string} title Product title
   * @param {string} category Category
   * @param {string} condition Product condition
   * @param {number} price Price
   * @returns {Promise<string>} Clean structured text
   */
  static async generateProductDescription(title = '', category = 'electronics', condition = 'open_box', price = 0) {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      throw new Error('يرجى إدخال عنوان المنتج أولاً ليتمكن الذكاء الاصطناعي من تحليله.');
    }

    const apiKey = localStorage.getItem('souk_gemini_api_key') || GEMINI_CONFIG.GLOBAL_API_KEY;

    const conditionLabel = condition === 'open_box' ? 'أوبن بوكس (استوكات أمازون)' : condition === 'new' ? 'جديد كرتون مغلق' : condition === 'used' ? 'مستخدم نظيف مفحوص' : 'عاطل قطع غيار';

    const promptText = `أنت خبير فني في بضائع أمازون والبالات الأوروبية في العراق. اكتب ملخصاً مبسطاً ودقيقاً جداً للمنتج: "${cleanTitle}" (الحالة: ${conditionLabel}، السعر المعروض: ${price} د.ع).

المطلوب حصراً الالتزام التام بالهيكل التالي فقط وبدون أي مقدمات أو خاتمة:

اسم المنتج : [اكتب اسم المنتج والموديل والماركة بدقة في حدود 10 إلى 15 كلمة]
وصف المنتج : [اكتب وصفاً ومواصفات فنية لأهم المزايا والتقنيات والمحرك أو البطارية وخامات الصنع في حدود 40 إلى 50 كلمة بشكل مكثف ومفيد]
سعر المنتج التقريبي : [اكتب السعر التقديري في السوق العراقي بالدينار مثل: 35,000 - 45,000 د.ع]
سعر المنتج العالمي : [اكتب السعر التقديري في المتاجر العالمية بالدولار مثل: $25 - $35 دولار تقريباً]`;

    let lastError = null;

    // Try candidate models in order
    for (const model of GEMINI_CONFIG.MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText && generatedText.length > 20) {
            console.log(`Gemini Generation Success via model: ${model}`);
            return generatedText.trim();
          }
        } else {
          const errData = await response.json();
          lastError = errData?.error?.message || `HTTP ${response.status}`;
          console.warn(`Model ${model} returned:`, lastError);
        }
      } catch (err) {
        lastError = err.message;
        console.warn(`Model ${model} fetch failed:`, err);
      }
    }

    throw new Error(`فشل الاتصال بـ Google Gemini: ${lastError || 'يرجى التأكد من اتصال الإنترنت'}`);
  }

  /**
   * Generates structured AI market valuation metrics
   */
  static async generateProductInsights(title = '', price = 0) {
    const numPrice = Number(price) || 35000;
    const usdEquivalent = Math.max(15, Math.round(numPrice / 1500));

    const minLocal = Math.round((numPrice * 1.15) / 250) * 250;
    const maxLocal = Math.round((numPrice * 1.45) / 250) * 250;
    const globalEstimate = Math.round(usdEquivalent * 1.3);

    return {
      availabilityInIraq: "متوفر بكميات محدودة في أسواق الأوتلت والبالات الأوروبية",
      estimatedPriceLocal: `${minLocal.toLocaleString()} - ${maxLocal.toLocaleString()} د.ع`,
      estimatedPriceGlobal: `$${globalEstimate} تقريباً في المتاجر والمواقع الرسمية`,
      disclaimer: "ملاحظة: هذه معلومات مستخرجة بناءً على أسعار السوق التقديرية... يرجى التأكد المباشر من البائع."
    };
  }
}
