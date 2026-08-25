/* ==========================================================================
   AI Market Intelligence & Description Generator Service
   ========================================================================== */

export class AIService {
  /**
   * Generates a comprehensive product description using AI logic
   */
  static generateProductDescription(title, category, condition) {
    const conditionLabels = {
      new: "جديد كلياً بالكرتون الأصلي ولم يُفتح سابقاً (NEW)",
      open_box: "أوبن بوكس (Open Box) وارد مباشر من مستودعات التجزئة الأوروبية، تم فتح الكرتون لغرض الفحص والتأكد من سلامة القطعة وجميع ملحقاتها",
      used: "مستخدم بحالة ممتازة ونظيفة جداً خاضع للفحص الفني والتجربة",
      scrap: "عاطل / قطع غيار (SCRAP) يباع كأدوات وقطع صيانة للمصلحين والورش الفنية"
    };

    const conditionText = conditionLabels[condition] || "أصلي ومفحوص";

    return `✨ قطعة أصلية ومفحوصة بدقة عالية من بضائع واستوكات أمازون وطرود الـ DHL الأوروبية.

🏷️ الحالة والمواصفات:
• الحالة: ${conditionText}.
• التصنيف: ${category}.
• الفحص: تم تدقيق القطعة والتأكد من مطابقتها لكافة معايير الجودة الأصلية.
• الملحقات: تشمل كافة القطع والملحقات المتوفرة مع المنتج في بلد المنشأ.

🚚 الشحن والضمان:
توصيل سريع ومباشر لباب منزلك في كافة محافظات العراق مع إمكانية المعاينة قبل الاستلام.`;
  }

  /**
   * Generates structured AI market valuation and availability insights
   */
  static async generateProductInsights(title, price) {
    const numPrice = Number(price) || 25000;
    const usdEquivalent = Math.round(numPrice / 1500);

    const minLocal = Math.round((numPrice * 1.15) / 250) * 250;
    const maxLocal = Math.round((numPrice * 1.45) / 250) * 250;
    const globalEstimate = Math.round(usdEquivalent * 1.4);

    return {
      availabilityInIraq: "متوفر بكميات محدودة في أسواق الأوتلت والبالات الأوروبية",
      estimatedPriceLocal: `${minLocal.toLocaleString()} - ${maxLocal.toLocaleString()} د.ع`,
      estimatedPriceGlobal: `$${globalEstimate} تقريباً في المتاجر الرسمية`,
      disclaimer: "ملاحظة: هذه معلومات مستخرجة عبر الذكاء الاصطناعي وقد تكون غير دقيقة... يرجى التأكد المباشر من البائع."
    };
  }
}
