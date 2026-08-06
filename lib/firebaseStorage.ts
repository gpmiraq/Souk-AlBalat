import { storage } from './firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

/**
 * Uploads base64 image data directly into Firebase Cloud Storage bucket:
 * souk-albalat-drive.firebasestorage.app/products/
 * Returns direct public HTTPS download URL.
 */
export async function uploadToFirebaseStorage(base64DataUrl: string, originalFilename?: string): Promise<string> {
  try {
    const cleanFilename = originalFilename ? originalFilename.replace(/[^a-zA-Z0-9_.-]/g, '_') : `img_${Date.now()}.jpg`;
    const imagePath = `products/balat_${Date.now()}_${cleanFilename}`;
    const storageRef = ref(storage, imagePath);

    // Upload base64 data URL
    await uploadString(storageRef, base64DataUrl, 'data_url');

    // Get public download URL
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (err: any) {
    console.error('Firebase Client Storage upload error:', err?.message || err);
    throw err;
  }
}

/**
 * High-reliability upload helper: tries direct Firebase Storage SDK first,
 * and falls back to server REST API /api/upload to guarantee a permanent HTTPS URL.
 */
export async function uploadImageWithFallback(base64DataUrl: string, originalFilename?: string): Promise<string> {
  try {
    return await uploadToFirebaseStorage(base64DataUrl, originalFilename);
  } catch (sdkErr) {
    console.warn('Firebase SDK storage error, falling back to /api/upload:', sdkErr);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64DataUrl, filename: originalFilename }),
      });
      const data = await res.json();
      if (data.url) return data.url;
    } catch (apiErr) {
      console.error('API upload fallback failed:', apiErr);
    }
    return base64DataUrl;
  }
}

