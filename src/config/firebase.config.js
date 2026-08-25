/* ==========================================================================
   Firebase & Google Cloud Configuration (Project: Souk-AlBalat-Drive)
   ========================================================================== */

export const firebaseConfig = {
  projectId: "souk-albalat-drive",
  projectNumber: "277858300469",
  storageBucket: "souk-albalat-drive.appspot.com",
  authDomain: "souk-albalat-drive.firebaseapp.com",
};

// Storage helper with fallback for local offline testing
export class CloudStorageProvider {
  static async uploadFile(fileBlob, path) {
    // In browser client context: return local object URL or Cloud storage URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(fileBlob);
    });
  }
}
