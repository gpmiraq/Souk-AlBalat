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
      const primaryImage = fields.image?.stringValue || imagesArr[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=630&fit=crop';
      
      const rawPrice = fields.price?.integerValue || fields.price?.doubleValue || fields.price?.stringValue || '0';
      const numPrice = Number(rawPrice) || 0;

      product = {
        id: fields.id?.stringValue || id,
        title: fields.title?.stringValue || 'منتج بالة أوتلت أمازون',
        price: numPrice,
        image: primaryImage,
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
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=630&fit=crop',
      conditionLabel: 'أوبن بوكس',
      merchantName: 'سوق البالات',
      description: 'تسوق أفضل بضائع الأوتلت والبالات الأوروبية وطرود DHL بأسعار حصرية وحجز فوري عبر الواتساب.'
    };
  }

  const formattedPrice = product.price > 0 ? `${product.price.toLocaleString()} د.ع` : 'أفضل سعر';
  const ogTitle = `${product.title} | ${formattedPrice}`;
  const ogDescription = `⚡ السعر: ${formattedPrice} | الحالة: ${product.conditionLabel} | التاجر: ${product.merchantName} | اضغط للطلب والحجز المباشر عبر الواتساب والتوصيل لكافة المحافظات`;
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

  // If no static file found on filesystem, use standard shell
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

  // 3. Inject Dynamic OpenGraph & Twitter Meta Tags
  const dynamicMetaTags = `
  <title>${ogTitle} - سوق البالات</title>
  <meta name="description" content="${escapeHtml(ogDescription)}">
  
  <!-- OpenGraph / Facebook / WhatsApp / Telegram Dynamic Product Tags -->
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="سوق البالات والأوتلت">
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(ogDescription)}">
  <meta property="og:image" content="${escapeHtml(product.image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(product.image)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:alt" content="${escapeHtml(product.title)}">
  <meta property="og:url" content="${productUrl}">
  <meta property="product:price:amount" content="${product.price}">
  <meta property="product:price:currency" content="IQD">
  <meta property="product:condition" content="${escapeHtml(product.conditionLabel)}">
  <meta property="product:availability" content="${product.status === 'available' ? 'in stock' : 'out of stock'}">
  
  <!-- Twitter Card Dynamic Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}">
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}">
  <meta name="twitter:image" content="${escapeHtml(product.image)}">
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
