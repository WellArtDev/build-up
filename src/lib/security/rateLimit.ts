/**
 * Simple in-memory rate limiter.
 * For production: use Redis-backed rate limiter or Vercel KV.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60000);

/**
 * Check rate limit for a given key.
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  key: string,
  options: { maxRequests: number; windowMs: number },
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.maxRequests - 1, resetAt: now + options.windowMs };
  }

  if (entry.count >= options.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: options.maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * Generate rate limit key from request IP.
 */
export function getRateLimitKey(req: Request, prefix = 'rl'): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return `${prefix}:${ip}`;
}

/**
 * Rate limit presets for different endpoint types.
 */
export const RATE_LIMITS = {
  AUTH: { maxRequests: 5, windowMs: 60000 },        // 5 login attempts per minute
  API: { maxRequests: 30, windowMs: 60000 },         // 30 API calls per minute
  UPLOAD: { maxRequests: 10, windowMs: 60000 },       // 10 uploads per minute
  PUBLIC: { maxRequests: 60, windowMs: 60000 },       // 60 public requests per minute
} as const;
