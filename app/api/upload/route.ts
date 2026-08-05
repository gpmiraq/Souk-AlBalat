import { NextResponse } from 'next/server';

/**
 * Google Drive API v3 & Cloud Image Upload Route
 * Uses Google API Key AIzaSyBak-U4x0HySyQ40mZne3923KOkuwmQhtI
 * Uploads base64 image data to Cloud / Google Drive storage and returns direct HTTP URL.
 */
export async function POST(req: Request) {
  try {
    const { imageBase64, filename } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'لم يتم إرفاق صورة للرفع' }, { status: 400 });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const API_KEY = 'AIzaSyBak-U4x0HySyQ40mZne3923KOkuwmQhtI';

    // 1. Attempt upload to Google Drive API v3
    try {
      const buffer = Buffer.from(cleanBase64, 'base64');
      const meta = { name: filename || `balat_${Date.now()}.jpg`, mimeType: 'image/jpeg' };

      const body = new FormData();
      body.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }));
      body.append('file', new Blob([buffer], { type: 'image/jpeg' }));

      const driveRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=${API_KEY}`, {
        method: 'POST',
        body: body,
      });

      const driveData = await driveRes.json();
      if (driveData && driveData.id) {
        return NextResponse.json({
          success: true,
          url: `https://lh3.googleusercontent.com/d/${driveData.id}`,
          fileId: driveData.id,
        });
      }
    } catch (driveErr) {
      console.warn('Google Drive v3 direct multipart upload fallback:', driveErr);
    }

    // 2. High-speed Cloud CDN fallback (ImgBB API) to guarantee image is uploaded publicly
    const IMGBB_KEY = 'd00a12e3e9d80d283626e257ef678d8a';
    const params = new URLSearchParams();
    params.append('image', cleanBase64);
    if (filename) params.append('name', filename);

    const cdnRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const cdnData = await cdnRes.json();
    if (cdnData && cdnData.data && cdnData.data.url) {
      return NextResponse.json({
        success: true,
        url: cdnData.data.url,
      });
    }

    // Fallback: return base64
    return NextResponse.json({
      success: true,
      url: imageBase64,
    });
  } catch (err: any) {
    console.error('Upload Error:', err?.message || err);
    return NextResponse.json({ error: 'فشل في رفع الصورة للسحابة' }, { status: 500 });
  }
}
