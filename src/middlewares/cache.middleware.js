import { getCache, setCache, DEFAULT_TTL } from '../utils/redis.js';

/**
 * Caches successful GET responses in Redis for one hour and reports where the
 * body came from through the `X-Data-Source` header.
 *
 * @param key  a string, or a function of the request for per-user keys
 * @param ttl  lifetime in seconds
 */
export const cache = (key, ttl = DEFAULT_TTL) => {
  const resolveKey = typeof key === 'function' ? key : () => key;

  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const cacheKey = resolveKey(req);

    const cached = await getCache(cacheKey);
    if (cached) {
      res.setHeader('X-Data-Source', 'cache');
      return res.json(cached);
    }

    res.setHeader('X-Data-Source', 'database');

    // Store whatever the controller ends up sending, but only when it succeeded.
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode < 400) setCache(cacheKey, body, ttl);

      return originalJson(body);
    };

    return next();
  };
};

export default cache;
