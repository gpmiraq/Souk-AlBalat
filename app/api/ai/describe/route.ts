import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { title, category } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        description: `بضاعة ${title || 'ممتازة'} مفحوصة 100% بحالة جيدة جداً، استيراد بالة وأمازون أوروبي مع الضمان كامل.`,
        category: category || 'إلكترونيات',
        specs: {
          'حالة الفحص': '100% شغال ومضمون',
          'المصدر': 'ستوك أمازون / طرد DHL',
          'الضمان': 'ضمان فحص عند الاستلام',
        },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `أنت مساعد متجر إلكتروني عراقي متخصص في بضائع أمازون والبالات وطرود DHL ("سوق البالات").
الرجاء كتابة تفاصيل المنتج التالية باللغة العربية بأسلوب تسويقي ممتازة وموجزة:
عنوان المنتج: ${title}
التصنيف المطلوب: ${category || 'تلقائي'}

قم بإرجاع النتيجة بتنسيق JSON فقط على الشكل التالي:
{
  "description": "وصف تسويقي مشوق ومختصر للمنتج مع التأكيد على جودته وفحصه",
  "suggestedCategory": "أحد تصنيفات المتجر (إلكترونيات، ملابس رجالية، ملابس نسائية، عطور وكوزمتك، أجهزة منزلية)",
  "specs": {
    "المواصفات الرئيسية": "تفاصيل جودة أو قياس",
    "حالة الفحص": "100% مفحوص وجاهز"
  }
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean JSON markdown if wrapped in ```json ... ```
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Gemini AI API Error:', error);
    return NextResponse.json(
      { error: 'فشل في الاتصال مع الذكاء الاصطناعي' },
      { status: 500 }
    );
  }
}
