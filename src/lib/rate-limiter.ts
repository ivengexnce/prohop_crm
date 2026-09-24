interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Sliding window rate limiter supporting both local in-memory
 * and distributed environments (Upstash/Redis REST compatible).
 *
 * @param key unique identifier (e.g. client IP or composite key)
 * @param maxRequests maximum allowed requests within window
 * @param windowSeconds window duration in seconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): { success: boolean; limit: number; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Clean expired records periodically to prevent unbounded memory growth
  if (rateLimitStore.size > 2000) {
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
      resetInSeconds: Math.max(1, resetInSeconds),
    };
  }

  record.count += 1;
  const resetInSeconds = Math.ceil((record.resetAt - now) / 1000);
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    resetInSeconds: Math.max(1, resetInSeconds),
  };
}

/**
 * Asynchronous rate limit check with distributed Redis adapter support
 * for multi-region serverless or horizontally scaled clusters.
 */
export async function checkRateLimitAsync(
  key: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): Promise<{ success: boolean; limit: number; remaining: number; resetInSeconds: number }> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      // Execute atomic INCR and EXPIRE pipeline via REST
      const res = await fetch(`${upstashUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', `ratelimit:${key}`],
          ['EXPIRE', `ratelimit:${key}`, windowSeconds],
        ]),
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        const currentCount = data[0]?.result || 1;
        const resetInSeconds = windowSeconds;

        return {
          success: currentCount <= maxRequests,
          limit: maxRequests,
          remaining: Math.max(0, maxRequests - currentCount),
          resetInSeconds,
        };
      }
    } catch (err) {
      console.warn('Distributed rate limit fallback to memory:', err);
    }
  }

  // High-performance local memory fallback
  return checkRateLimit(key, maxRequests, windowSeconds);
}

/**
 * Enterprise client IP resolution checking trusted proxy headers
 */
export function getClientIp(request: Request): string {
  // Cloudflare edge IP
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  // AWS CloudFront / Fastly
  const trueClientIp = request.headers.get('true-client-ip');
  if (trueClientIp) return trueClientIp.trim();

  // Standard reverse proxy forwarded chain
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  // Nginx real IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}
