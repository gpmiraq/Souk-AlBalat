import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.redirect(302, '/');
  }

  const sellerUrl = `https://souk-al-balat.vercel.app/seller/${encodeURIComponent(slug)}`;
  const storeName = slug === 'alwareth' || slug === 'm-alwareth' ? 'متجر أبو وارث أمازون' : `متجر ${slug}`;
  const ogTitle = `${storeName} | المتجر الرسمي المعتمد - سوق البالات`;
  const ogDescription = `تسوق أحدث بضائع أوتلت أمازون والبالات الأوروبية من ${storeName} | فحص شامل وضمان حقيقي وحجز فوري عبر الواتساب.`;
  const ogImage = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&h=630&fit=crop';

  let html = '';
  const possiblePaths = [
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        html = fs.readFileSync(p, 'utf8');
        break;
      } catch (e) {}
    }
  }

  if (!html) {
    html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ogTitle}</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/app.js"></script>
</body>
</html>`;
  }

  const dynamicMetaTags = `
  <title>${ogTitle}</title>
  <meta name="description" content="${escapeHtml(ogDescription)}">
  
  <!-- OpenGraph / Facebook / WhatsApp Dynamic Store Tags -->
  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="سوق البالات والأوتلت">
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(ogDescription)}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:secure_url" content="${ogImage}">
  <meta property="og:url" content="${sellerUrl}">
  
  <!-- Twitter Card Dynamic Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}">
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}">
  <meta name="twitter:image" content="${ogImage}">
  `;

  html = html
    .replace(/<title>.*?<\/title>/is, '')
    .replace(/<meta property="og:.*?>/gis, '')
    .replace(/<meta name="twitter:.*?>/gis, '')
    .replace(/<meta name="description".*?>/gis, '')
    .replace('<head>', `<head>\n${dynamicMetaTags}`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).send(html);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
