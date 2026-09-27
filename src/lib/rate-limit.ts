import { NextRequest } from 'next/server';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function getClientKey(request: NextRequest, scope: string, identity?: string | null) {
  const ip = (request as NextRequest & { ip?: string }).ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  return `${scope}:${identity || 'anonymous'}:${ip}`;
}

function cleanupExpired(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function consumeRateLimit(
  request: NextRequest,
  scope: string,
  options: { limit: number; windowMs: number; identity?: string | null },
) {
  const now = Date.now();
  cleanupExpired(now);
  const key = getClientKey(request, scope, options.identity);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { limited: false, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count <= options.limit) {
    return { limited: false, retryAfterSeconds: 0 };
  }

  return {
    limited: true,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}
