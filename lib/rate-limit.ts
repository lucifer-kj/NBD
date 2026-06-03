import { getRedisClient } from './redis';

export async function rateLimit(
  ip: string,
  limit: number = 5,
  durationSeconds: number = 60
): Promise<{ success: boolean; remaining: number }> {
  const redis = getRedisClient();
  if (!redis) {
    // If Redis is not configured, fail-open to avoid blocking logins in dev
    return { success: true, remaining: limit };
  }

  const key = `ratelimit:login:${ip}`;
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, durationSeconds);
    }
    return {
      success: current <= limit,
      remaining: Math.max(0, limit - current)
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    return { success: true, remaining: limit }; // Fail-open on network hiccups
  }
}
