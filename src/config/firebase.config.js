/* ==========================================================================
   Firebase Cloud Storage & Realtime Service
   Project: Souk-AlBalat-Drive (Bucket: souk-albalat-drive.appspot.com)
   ========================================================================== */

export const firebaseConfig = {
  projectId: "souk-albalat-drive",
  projectNumber: "277858300469",
  storageBucket: "souk-albalat-drive.appspot.com",
  authDomain: "souk-albalat-drive.firebaseapp.com",
};

export class CloudStorageProvider {
  /**
   * Uploads an image blob to Firebase Cloud Storage via REST API
   * Returns a direct, high-speed public CDN URL.
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
        // Construct the direct public media URL
        const downloadToken = data.downloadTokens || '';
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${cleanPath}?alt=media${downloadToken ? '&token=' + downloadToken : ''}`;
        return publicUrl;
      } else {
        console.warn('Firebase storage direct upload fallback to data URL');
      }
    } catch (error) {
      console.warn('Firebase Cloud Storage network notice:', error);
    }

    // Fallback to local DataURL if network is unavailable
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
}
