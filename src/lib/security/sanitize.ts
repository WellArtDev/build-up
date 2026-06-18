/**
 * Input sanitization utilities.
 * All user inputs should pass through sanitize before DB operations.
 * Note: mysql2 with prepared statements already prevents SQL injection.
 * These helpers handle XSS prevention for rendered output.
 */

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /on\w+\s*=\s*"[^"]*"/gi,
  /on\w+\s*=\s*'[^']*'/gi,
  /javascript\s*:/gi,
];

/**
 * Strip HTML tags and XSS vectors from a string.
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';
  let clean = input;
  for (const pattern of XSS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }
  // Strip remaining HTML tags
  clean = clean.replace(/<[^>]*>/g, '');
  return clean.trim();
}

/**
 * Sanitize an object's string values recursively.
 * For API request body sanitization before DB operations.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = { ...obj };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeString(result[key]);
    } else if (typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
      result[key] = sanitizeObject(result[key]);
    }
  }
  return result as T;
}

/**
 * Validate Indonesian phone number format.
 * Accepts: 08xxxx, +628xxxx, 628xxxx
 */
export function isValidIndonesianPhone(phone: string): boolean {
  return /^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate NIK (Indonesian ID number - 16 digits).
 */
export function isValidNIK(nik: string): boolean {
  return /^\d{16}$/.test(nik);
}
