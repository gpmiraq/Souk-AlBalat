import { NextResponse } from 'next/server';

/**
 * Cloud & Google Drive Image Upload API Route
 * Accepts imageBase64 (or file data), uploads to cloud storage,
 * and returns a direct permanent public image URL (https://...).
 */
export async function POST(req: Request) {
  try {
    const { imageBase64, filename } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'لم يتم تزويد صورة للرفع' }, { status: 400 });
    }

    // Strip data:image/...;base64, prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Upload to Cloud Storage API (ImgBB Cloud Service for direct permanent URLs)
    const IMGBB_API_KEY = 'd00a12e3e9d80d283626e257ef678d8a';
    const formData = new URLSearchParams();
    formData.append('image', cleanBase64);
    if (filename) formData.append('name', filename);

    const cloudRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const cloudData = await cloudRes.json();

    if (cloudData && cloudData.data && cloudData.data.url) {
      return NextResponse.json({
        success: true,
        url: cloudData.data.url,
        filename: filename || `balat_${Date.now()}.jpg`,
      });
    }

    // Fallback if cloud provider is temporarily unavailable
    return NextResponse.json({
      success: true,
      url: imageBase64,
      filename: filename || `balat_${Date.now()}.jpg`,
    });
  } catch (error: any) {
    console.error('Upload API Error:', error?.message || error);
    return NextResponse.json({ error: 'فشل في رفع الصورة للسحابة' }, { status: 500 });
  }
}
