type Bucket = {
  count: number;
  resetAt: number;
};

const globalRateLimit = globalThis as typeof globalThis & {
  cafeRateLimitBuckets?: Map<string, Bucket>;
  cafeRateLimitLastSweep?: number;
};

const buckets =
  globalRateLimit.cafeRateLimitBuckets || new Map<string, Bucket>();
globalRateLimit.cafeRateLimitBuckets = buckets;

const sweepExpiredBuckets = (now: number) => {
  if (globalRateLimit.cafeRateLimitLastSweep) {
    if (now - globalRateLimit.cafeRateLimitLastSweep < 60_000) return;
  }

  globalRateLimit.cafeRateLimitLastSweep = now;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
};

export const checkRateLimit = (
  key: string,
  limit = 12,
  windowMs = 60_000,
) => {
  const now = Date.now();
  sweepExpiredBuckets(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
};
