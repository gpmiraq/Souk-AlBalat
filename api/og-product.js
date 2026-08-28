import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.redirect(302, '/');
  }

  // 1. Fetch live product from Firestore Cloud REST API
  let product = null;
  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/souk-albalat-drive/databases/(default)/documents/products/${encodeURIComponent(id)}`;
    const response = await fetch(firestoreUrl);
    if (response.ok) {
      const doc = await response.json();
      const fields = doc.fields || {};
      
      const imagesArr = fields.images?.arrayValue?.values?.map(v => v.stringValue).filter(Boolean) || [];
      const primaryImage = fields.image?.stringValue || imagesArr[0] || 'https://souk-al-balat.vercel.app/og-banner.jpg';
      
      const rawPrice = fields.price?.integerValue || fields.price?.doubleValue || fields.price?.stringValue || '0';
      const numPrice = Number(rawPrice) || 0;

      // Extract all unique valid images for multi-image preview selection
      const allImages = Array.from(new Set([primaryImage, ...imagesArr])).filter(Boolean);

      product = {
        id: fields.id?.stringValue || id,
        title: fields.title?.stringValue || 'منتج بالة أوتلت أمازون',
        price: numPrice,
        image: primaryImage,
        images: allImages.length > 0 ? allImages : [primaryImage],
        condition: fields.condition?.stringValue || 'open_box',
        conditionLabel: fields.conditionLabel?.stringValue || 'أوبن بوكس (استوكات أمازون)',
        merchantName: fields.merchantName?.stringValue || 'أبو وارث أمازون',
        merchantPhone: fields.merchantPhone?.stringValue || '07707188166',
        description: fields.description?.stringValue || fields.aiDetails?.stringValue || 'قطعة أصلية معتمدة وارد أوتلت أمازون الأوروبي.',
        status: fields.status?.stringValue || 'available'
      };
    }
  } catch (err) {
    console.error('Error fetching product for OG preview:', err);
  }

  // Fallback if product not found or Firestore error
  if (!product) {
    product = {
      id: id,
      title: 'بضائع أمازون والبالات الأوروبية | سوق البالات',
      price: 0,
      image: 'https://souk-al-balat.vercel.app/og-banner.jpg',
      images: ['https://souk-al-balat.vercel.app/og-banner.jpg'],
      conditionLabel: 'أوبن بوكس',
      merchantName: 'سوق البالات',
      description: 'تسوق أفضل بضائع الأوتلت والبالات الأوروبية وطرود DHL بأسعار حصرية وحجز فوري عبر الواتساب.'
    };
  }

  const formattedPrice = product.price > 0 ? `${product.price.toLocaleString()} د.ع` : 'أفضل سعر';
  
  // Custom CTA Title badge that emulates an action button right inside the social card header
  const ogTitle = `⚡【 احجز الآن : ${formattedPrice} 】${product.title}`;
  const ogDescription = `👈 اضغط هنا لمعاينة كافة الصور والطلب الفوري عبر الواتساب | الحالة: ${product.conditionLabel} | التاجر: ${product.merchantName} | توصيل سريع لكافة محافظات العراق`;
  const productUrl = `https://souk-al-balat.vercel.app/p/${encodeURIComponent(product.id)}`;

  // 2. Read template HTML file
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

  // 3. Generate Multiple Image Tags so Facebook Desktop offers multi-image selection preview
  const multiImageMetaTags = product.images.map(imgUrl => `
  <meta property="og:image" content="${escapeHtml(imgUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(imgUrl)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(product.title)}">
  `).join('\n');

  // 4. Inject Dynamic OpenGraph & Twitter Meta Tags
  const dynamicMetaTags = `
  <title>${ogTitle} - سوق البالات</title>
  <meta name="description" content="${escapeHtml(ogDescription)}">
  
  <!-- OpenGraph / Facebook / WhatsApp / Telegram Dynamic Multi-Image Tags -->
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="سوق البالات ⚡ متجر الطلب والحجز الفوري">
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(ogDescription)}">
  <meta property="og:url" content="${productUrl}">
${multiImageMetaTags}
  <meta property="product:price:amount" content="${product.price}">
  <meta property="product:price:currency" content="IQD">
  <meta property="product:condition" content="${escapeHtml(product.conditionLabel)}">
  <meta property="product:availability" content="${product.status === 'available' ? 'in stock' : 'out of stock'}">
  
  <!-- Twitter Card Dynamic Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}">
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}">
  <meta name="twitter:image" content="${escapeHtml(product.images[0])}">
  `;

  // Replace existing meta tags or inject into <head>
  html = html
    .replace(/<title>.*?<\/title>/is, '')
    .replace(/<meta property="og:.*?>/gis, '')
    .replace(/<meta name="twitter:.*?>/gis, '')
    .replace(/<meta name="description".*?>/gis, '')
    .replace('<head>', `<head>\n${dynamicMetaTags}`);

  // Set proper cache and content headers
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
