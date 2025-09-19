import { kv } from '@vercel/kv';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function rateLimit(
  identifier: string,
  limit: number = 5,
  window: number = 3600 // 1 hour in seconds
): Promise<RateLimitResult> {
  try {
    const key = `rate_limit:${identifier}`;
    const current = await kv.get<number>(key) || 0;

    if (current >= limit) {
      const ttl = await kv.ttl(key);
      return {
        success: false,
        limit,
        remaining: 0,
        reset: Date.now() + (ttl * 1000),
      };
    }

    const pipeline = kv.pipeline();
    pipeline.incr(key);
    if (current === 0) {
      pipeline.expire(key, window);
    }
    await pipeline.exec();

    return {
      success: true,
      limit,
      remaining: limit - current - 1,
      reset: Date.now() + (window * 1000),
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request (fail open)
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Date.now() + (window * 1000),
    };
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}