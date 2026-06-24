type Bucket = {
  count: number;
  resetAt: number;
};

const globalRateLimit = globalThis as typeof globalThis & {
  cafeRateLimitBuckets?: Map<string, Bucket>;
};

const buckets =
  globalRateLimit.cafeRateLimitBuckets || new Map<string, Bucket>();

if (process.env.NODE_ENV !== "production") {
  globalRateLimit.cafeRateLimitBuckets = buckets;
}

export const checkRateLimit = (
  key: string,
  limit = 12,
  windowMs = 60_000,
) => {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
};
