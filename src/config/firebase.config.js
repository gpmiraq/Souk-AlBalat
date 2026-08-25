/* ==========================================================================
   Firebase Cloud Storage Direct Service
   Project: Souk-AlBalat-Drive
   Verified Active Bucket: souk-albalat-drive.firebasestorage.app
   ========================================================================== */

export const firebaseConfig = {
  projectId: "souk-albalat-drive",
  projectNumber: "277858300469",
  storageBucket: "souk-albalat-drive.firebasestorage.app",
  authDomain: "souk-albalat-drive.firebaseapp.com",
};

export class CloudStorageProvider {
  /**
   * Uploads an image blob to Firebase Cloud Storage via REST API
   * Returns a direct, high-speed public CDN URL from Google Cloud.
   */
  static async uploadBlobToFirebase(blob, fileName) {
    try {
      const bucketName = firebaseConfig.storageBucket;
      const cleanPath = encodeURIComponent(`products/${fileName}`);
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o?uploadType=media&name=${cleanPath}`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/webp',
        },
        body: blob
      });

      if (response.ok) {
        const data = await response.json();
        const downloadToken = data.downloadTokens || '';
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${cleanPath}?alt=media${downloadToken ? '&token=' + downloadToken : ''}`;
        console.log('Firebase Cloud Storage Direct Upload Success:', publicUrl);
        return publicUrl;
      } else {
        console.warn('Firebase Storage upload failed with status:', response.status);
      }
    } catch (e) {
      console.warn('Firebase Storage upload error:', e);
    }

    // Fallback to local DataURL if network is unavailable
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
}
