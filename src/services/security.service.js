/* ==========================================================================
   Cryptographic & Security Service (SHA-256 Hashing & Security Safeguards)
   ========================================================================== */

export class SecurityService {
  /**
   * Hashes a string using Web Crypto API SHA-256
   */
  static async hashString(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input + "_souk_balat_salt_2026");
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validates if input matches a hashed target
   */
  static async verifyHash(input, hashedTarget) {
    const computed = await this.hashString(input);
    return computed === hashedTarget;
  }
}
