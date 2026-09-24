interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Sliding window in-memory rate limiter
 * @param key unique identifier (e.g. client IP or composite key)
 * @param maxRequests maximum allowed requests within window
 * @param windowSeconds window duration in seconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 20,
  windowSeconds: number = 60
): { success: boolean; limit: number; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Clean expired records periodically
  if (rateLimitStore.size > 5000) {
    for (const [k, rec] of rateLimitStore.entries()) {
      if (rec.resetAt < now) rateLimitStore.delete(k);
    }
  }

  const record = rateLimitStore.get(key);

  if (!record || record.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetInSeconds: windowSeconds,
    };
  }

  if (record.count >= maxRequests) {
    const resetInSeconds = Math.ceil((record.resetAt - now) / 1000);
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetInSeconds,
    };
  }

  record.count += 1;
  const resetInSeconds = Math.ceil((record.resetAt - now) / 1000);
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    resetInSeconds,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}
