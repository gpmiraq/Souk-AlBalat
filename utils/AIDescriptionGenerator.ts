/**
 * Utility for generating AI-structured product descriptions
 * according to Iraqi marketplace specifications.
 */

export interface AIGeneratedDescriptionResult {
  success: boolean;
  content: string;
  errorMessage?: string;
}

export function generateAIProductDescription(
  title: string,
  category: string,
  condition: string
): AIGeneratedDescriptionResult {
  const trimmedTitle = title.trim();

  // If title is too short or underspecified, request more details
  if (trimmedTitle.length < 5 || trimmedTitle.split(/\s+/).length < 2) {
    return {
      success: false,
      content: '',
      errorMessage:
        'يرجى كتابة المزيد من التفاصيل في عنوان البضاعة (مثل اسم الماركة والموديل) حتى يتمكن الذكاء الاصطناعي من التوليد بدقة.',
    };
  }

  const isElectronics = category.includes('إلكترونيات') || category.includes('هواتف') || category.includes('كمبيوتر');
  const isClothing = category.includes('ملابس') || category.includes('أحذية');
  const isDHL = category.includes('DHL') || category.includes('طرد');
  const isAppliance = category.includes('منزلية') || category.includes('كهربائية') || category.includes('مطبخ');

  let usageText = 'متعدد الاستخدامات ومناسب للاستعمال اليومي المنزلي أو الشخصي.';
  let availabilityText = 'متوفر بكميات محدودة في وجبات الاستوكات والبالات.';
  let approxIqdPrice = '120,000 د.ع - 250,000 د.ع';
  let approxUsdPrice = '$80 - $165';

  if (isElectronics) {
    usageText = 'استخدام تقني عالي الأداء، تشغيل الأجهزة والصوتيات والدعم الذكي.';
    approxIqdPrice = '150,000 د.ع - 450,000 د.ع';
    approxUsdPrice = '$100 - $320';
  } else if (isClothing) {
    usageText = 'استخدام شخصي رياضي أو يومي، خامات عالية الجودة جديدة بالتاغ الأصلي.';
    approxIqdPrice = '45,000 د.ع - 135,000 د.ع';
    approxUsdPrice = '$30 - $90';
  } else if (isDHL) {
    usageText = 'طرد بريدي أوروبي محتويات مفاجئة ومفحوصة الوزن.';
    approxIqdPrice = '180,000 د.ع - 280,000 د.ع';
    approxUsdPrice = '$120 - $190';
  } else if (isAppliance) {
    usageText = 'إعداد وتجهيز الأطعمة والمشروبات والأعمال المنزلية اليومية.';
    approxIqdPrice = '85,000 د.ع - 350,000 د.ع';
    approxUsdPrice = '$60 - $240';
  }

  const descriptionText = `تنبيه : الوصف مولد بالذكاء الاصطناعي وقد لا يكون مطابق للمعلومات 100% تحقق من البائع ...

شرح مختصر للمنتج:
منتج أصلي وارد بالات وأوتلت أمازون (${trimmedTitle}) بحالة (${condition})، تتميز هذه القطعة بالمتانة والجودة العالية وتأتي مع الضمان والفحص الكامل.

الاستخدام :
${usageText}

التوفر بالسوق العراقي : متوفر (كمية محددة)

سعره التقريبي بالسوق العراقي : ${approxIqdPrice}

سعره العالمي : ${approxUsdPrice}`;

  return {
    success: true,
    content: descriptionText,
  };
}
