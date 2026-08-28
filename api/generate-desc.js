/* ==========================================================================
   Serverless Technical Description & Pricing Engine (Google Gemini AI)
   ========================================================================== */

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { title = '', category = 'electronics', condition = 'open_box', price = 0, apiKey = '' } = req.body || req.query || {};

  const cleanTitle = (title || '').trim();
  if (!cleanTitle) {
    return res.status(400).json({ error: 'العنوان مطلوب' });
  }

  const conditionLabel = condition === 'open_box' ? 'أوبن بوكس (استوكات ومستودعات أمازون)' : condition === 'new' ? 'جديد بالكرتون المصنعي' : condition === 'used' ? 'مستخدم مفحوص' : 'عاطل / قطع غيار';

  const activeKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();

  // 1. If Gemini API key is available, call Gemini API
  if (activeKey) {
    try {
      const prompt = `أنت مهندس ومراجع تقني محايد وخبير في بضائع أمازون وسوق الإلكترونيات في العراق.
المطلوب كتابة بطاقة مواصفات فنية ومعلومات عامة فقط ومجردة من أي مبالغة أو عبارات مدح أو تسويق للمنتج: "${cleanTitle}" (حالة الفحص: ${conditionLabel}).
قدر أسعار السوق التقديرية الحقيقية للمنتج بناءً على مواصفات الموديل والماركة في السوق العالمية والمحلية في العراق.

التزم حصراً بالهيكل التالي فقط وبدون أي مقدمات أو شروحات إضافية:
اسم المنتج : [الاسم التقني والموديل الرسمي بدقة في حدود 10 إلى 15 كلمة]
وصف المنتج : [المواصفات الفنية والمكونات المادية والمنافذ والمعالج/البطارية/الصوت فقط بأسلوب علمي ومحايد بدون مبالغة في حدود 40 إلى 50 كلمة]
سعر المنتج التقريبي : [تخمين السعر التقديري في السوق العراقي بناءً على الموديل، مثال: 65,000 - 85,000 د.ع]
سعر المنتج العالمي : [السعر العالمي التقديري بالدولار، مثال: $45 - $60 دولار تقريباً]`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`, {
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
          return res.status(200).json({ text: text.trim() });
        }
      }
    } catch (geminiErr) {
      console.warn('Server Gemini error:', geminiErr);
    }
  }

  // 2. Wikipedia Search Fallback with Calculated Market Estimations
  try {
    const searchQuery = encodeURIComponent(cleanTitle.replace(/[\u0600-\u06FF]/g, '').trim() || cleanTitle);
    const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&utf8=&format=json&origin=*`);
    
    let liveWebSnippet = '';
    let matchedTitle = cleanTitle;

    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      const firstHit = wikiData?.query?.search?.[0];
      if (firstHit && firstHit.snippet) {
        liveWebSnippet = firstHit.snippet.replace(/<\/?[^>]+(>|$)/g, "");
        matchedTitle = firstHit.title;
      }
    }

    const numPrice = Number(price) || 50000;
    const estUsd = Math.max(30, Math.round(numPrice / 1500 * 1.25));
    const minIqd = (Math.round((numPrice * 1.15) / 250) * 250).toLocaleString();
    const maxIqd = (Math.round((numPrice * 1.45) / 250) * 250).toLocaleString();

    let outputDesc = liveWebSnippet 
      ? `${liveWebSnippet}. قطعة أصلية مطابقة للمواصفات القياسية للمصنع وسلاسل التوريد العالمية خضعت للفحص الفني والتشغيلي للأجزاء الداخلية والهيكل.`
      : `قطعة أصلية عالية الكفاءة من مستودعات أوتلت أمازون وطرود DHL خضعت للفحص الفني الدقيق لسلامة الأداء والاستقرار.`;

    const formattedOutput = `اسم المنتج : ${matchedTitle} (${conditionLabel})
وصف المنتج : ${outputDesc}
سعر المنتج التقريبي : ${minIqd} - ${maxIqd} د.ع
سعر المنتج العالمي : $${estUsd} دولار تقريباً`;

    return res.status(200).json({ text: formattedOutput });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
