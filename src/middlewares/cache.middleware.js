import { getCache, setCache } from "../utils/redis.js";

export const cacheMiddleware = (options = {}) => {
	return async (req, res, next) => {
		if (req.method !== "GET") {
			return next();
		}

		const cacheKey = options.key || `route:${req.originalUrl}`;
		const ex = options.ex || 3600; // Default 1 hour

		try {
			const cachedData = await getCache(cacheKey);
			if (cachedData) {
				res.setHeader("X-Data-Source", "cache");
				return res.json(cachedData);
			}
		} catch (err) {
			console.error("Cache error:", err);
		}

		res.setHeader("X-Data-Source", "database");

		const originalJson = res.json.bind(res);
		res.json = function (data) {
			if (res.statusCode < 400) {
				setCache(cacheKey, data, ex).catch((err) =>
					console.error("Error caching response:", err),
				);
			}
			return originalJson(data);
		};

		next();
	};
};

export default cacheMiddleware;
