const memoryCache = new Map<string, { data: string; expires: number }>();

interface CacheOptions {
  ttl: number; // seconds
}

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  // Try Upstash Redis first
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const cached = await redisGet(key);
      if (cached) return JSON.parse(cached) as T;

      const data = await fetcher();
      await redisSet(key, JSON.stringify(data), options.ttl);
      return data;
    } catch {
      // Fall through to memory cache
    }
  }

  // Memory cache fallback
  const entry = memoryCache.get(key);
  if (entry && entry.expires > Date.now()) {
    return JSON.parse(entry.data) as T;
  }

  const data = await fetcher();
  memoryCache.set(key, {
    data: JSON.stringify(data),
    expires: Date.now() + options.ttl * 1000,
  });
  return data;
}

async function redisGet(key: string): Promise<string | null> {
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/get/${key}`,
    {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
      cache: "no-store",
    }
  );
  const json = await res.json();
  return json.result ?? null;
}

async function redisSet(key: string, value: string, ttl: number): Promise<void> {
  await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/set/${key}/${encodeURIComponent(value)}/ex/${ttl}`,
    {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
      cache: "no-store",
    }
  );
}
