/* ==========================================================================
   Official Google Firebase Cloud Storage & Cloud Firestore Service
   Project: Souk-AlBalat-Drive
   Bucket: souk-albalat-drive.firebasestorage.app
   Live Cloud Database & Storage Engine for Global Multi-Device Sync
   ========================================================================== */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "souk-albalat-drive",
  storageBucket: "souk-albalat-drive.firebasestorage.app"
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const storage = getStorage(app);
export const db = getFirestore(app);

export class CloudStorageProvider {
  /**
   * Uploads an image blob directly to Google Firebase Cloud Storage using the official SDK.
   * Throws an error if Firebase upload fails.
   * @param {Blob} blob WebP or image blob
   * @param {string} fileName Destination file name
   * @returns {Promise<string>} Direct public Google Firebase Cloud Storage URL
   */
  static async uploadBlobToFirebase(blob, fileName) {
    const storageRef = ref(storage, `products/${fileName}`);
    
    // Upload bytes directly via official SDK
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: 'image/webp'
    });

    // Obtain the official public download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log('Firebase Cloud Storage SDK Upload Success:', downloadUrl);
    return downloadUrl;
  }
}
