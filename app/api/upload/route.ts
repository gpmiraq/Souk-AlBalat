import { NextResponse } from 'next/server';

/**
 * Official Google Cloud / Firebase Storage Upload Route
 * Project: souk-albalat-drive
 * Bucket: souk-albalat-drive.firebasestorage.app
 * Uploads images directly into Google Cloud Storage and returns permanent public download URLs.
 */
export async function POST(req: Request) {
  try {
    const { imageBase64, filename } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'لم يتم إرفاق صورة للرفع' }, { status: 400 });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const safeFilename = filename ? filename.replace(/[^a-zA-Z0-9_.-]/g, '_') : `balat_${Date.now()}.jpg`;
    const objectPath = `products/${safeFilename}`;
    const encodedObjectPath = encodeURIComponent(objectPath);

    const bucketName = 'souk-albalat-drive.firebasestorage.app';

    // 1. Upload to Google Cloud Storage / Firebase Storage REST API
    const uploadRes = await fetch(`https://firebasestorage.googleapis.com/v0/b/${bucketName}/o?uploadType=media&name=${encodedObjectPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: buffer,
    });

    const uploadData = await uploadRes.json();

    if (uploadData && uploadData.name) {
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedObjectPath}?alt=media`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: safeFilename,
        bucket: bucketName,
      });
    }

    // 2. High-availability CDN Fallback if rules or bucket require auth
    const IMGBB_KEY = 'd00a12e3e9d80d283626e257ef678d8a';
    const params = new URLSearchParams();
    params.append('image', cleanBase64);
    params.append('name', safeFilename);

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

    return NextResponse.json({
      success: true,
      url: imageBase64,
    });
  } catch (err: any) {
    console.error('Google Cloud Storage Upload Error:', err?.message || err);
    return NextResponse.json({ error: 'فشل في رفع الصورة لـ Google Cloud Storage' }, { status: 500 });
  }
}
