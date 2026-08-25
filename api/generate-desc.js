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
    res.status(200).end();
    return;
  }

  const { title = '', category = 'electronics', condition = 'open_box', price = 0 } = req.body || req.query || {};

  const cleanTitle = (title || '').trim();
  if (!cleanTitle) {
    return res.status(400).json({ error: 'العنوان مطلوب' });
  }

  const conditionLabel = condition === 'open_box' ? 'أوبن بوكس (استوكات أمازون)' : condition === 'new' ? 'جديد بالكرتون المصنعي' : condition === 'used' ? 'مستخدم نظيف ومفحوص' : 'عاطل / قطع غيار';

  // 1. Live Web Search Query to extract real technical specifications
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

    const numPrice = Number(price) || 35000;
    const estUsd = Math.max(20, Math.round(numPrice / 1500 * 1.3));
    const minIqd = (Math.round((numPrice * 1.15) / 250) * 250).toLocaleString();
    const maxIqd = (Math.round((numPrice * 1.45) / 250) * 250).toLocaleString();

    let outputDesc = liveWebSnippet 
      ? `${liveWebSnippet}. قطعة معتمدة ومطابقة للمواصفات الفنية القياسية للمصنع وسلاسل التوريد العالمية تم فحص كفاءتها التشغيلية.`
      : `قطعة أصلية عالية الكفاءة والمتانة من مستودعات أوتلت أمازون الأوروبية خضعت للفحص الفني الدقيق للتأكد من سلامة الهيكل والأداء.`;

    const formattedOutput = `اسم المنتج : ${matchedTitle} (${conditionLabel})
وصف المنتج : ${outputDesc}
سعر المنتج التقريبي : ${minIqd} - ${maxIqd} د.ع
سعر المنتج العالمي : $${estUsd} دولار تقريباً`;

    return res.status(200).json({ text: formattedOutput });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
