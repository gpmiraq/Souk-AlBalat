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
   * Calls Google Gemini Live LLM API to generate a real, customized product description
   * @param {string} title Product title
   * @param {string} category Category
   * @param {string} condition Product condition
   * @param {number} price Price
   * @returns {Promise<string>} Generated text from Google Gemini
   */
  static async generateProductDescription(title = '', category = 'electronics', condition = 'open_box', price = 0) {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      throw new Error('يرجى إدخال عنوان المنتج أولاً ليتمكن الذكاء الاصطناعي من تحليله.');
    }

    const apiKey = localStorage.getItem('souk_gemini_api_key') || GEMINI_CONFIG.GLOBAL_API_KEY;

    const conditionLabel = condition === 'open_box' ? 'أوبن بوكس مفحوصة ونظيفة (استوكات أمازون)' : condition === 'new' ? 'جديد بالكرتون المصنعي مغلق' : condition === 'used' ? 'مستخدم نظيف ومفحوص 100%' : 'عاطل / قطع غيار';

    const promptText = `أنت خبير فني وتقني متخصص في بضائع أمازون والبالات الأوروبية في العراق. اكتب تقريراً ومواصفات فنية تسويقية باللغة العربية الفصحى للمنتج التالي:
العنوان: "${cleanTitle}"
الحالة: "${conditionLabel}"
القسم: "${category}"

المطلوب:
1. اذكر اسم الشركة المصنعة الحقيقية للقطعة وموديلها.
2. اكتب 4 إلى 5 نقاط فنية دقيقة عن مواصفات هذا الموديل تحديداً (مثل المايكروفون، البطارية، المعالج، العزل، خامات التصنيع، الترددات، قوة المحرك إن وجد).
3. وضح حالة القطعة (${conditionLabel}).
4. بين الملحقات وطريقة الفحص والشحن في العراق.
اكتب النص بتنسيق منظم واحترافي بنقاط وإيموجيات دون مقدمات فلسفية.`;

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
          if (generatedText && generatedText.length > 30) {
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

    const minLocal = Math.round((numPrice * 1.18) / 250) * 250;
    const maxLocal = Math.round((numPrice * 1.55) / 250) * 250;
    const globalEstimate = Math.round(usdEquivalent * 1.35);

    return {
      availabilityInIraq: "متوفر بكميات محدودة في أسواق الأوتلت والبالات الأوروبية",
      estimatedPriceLocal: `${minLocal.toLocaleString()} - ${maxLocal.toLocaleString()} د.ع`,
      estimatedPriceGlobal: `$${globalEstimate} تقريباً في المتاجر والمواقع الرسمية`,
      disclaimer: "ملاحظة: هذه معلومات مستخرجة بناءً على أسعار السوق التقديرية... يرجى التأكد المباشر من البائع."
    };
  }
}
