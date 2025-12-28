
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// نظام تشفير متقدم لمحاكاة حماية البيانات
export class SecurityManager {
  private static readonly SALT = "djm_secret_v3_2025";

  static encrypt(text: string): string {
    return btoa(btoa(text + this.SALT));
  }

  static decrypt(encoded: string): string {
    try {
      const decoded = atob(atob(encoded));
      return decoded.replace(this.SALT, "");
    } catch (e) {
      return "";
    }
  }

  static obfuscateUrl(url: string): string {
    // استخدام بروكسي للصور لزيادة الخصوصية
    return `https://wsrv.nl/?url=${url.replace('http://', '')}&output=webp`;
  }
}
