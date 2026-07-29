import { createClient } from 'redis';
import env from '../config/env.js';

export const DEFAULT_TTL = 3600; // 1 hour, as required by the submission.

const client = createClient({
  socket: { host: env.REDIS_HOST, port: env.REDIS_PORT },
  ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
});

let errorLogged = false;

// Redis is a cache, not a dependency: a dead Redis must never break a request,
// and it must not flood the log with one error per reconnect attempt either.
client.on('error', (error) => {
  if (errorLogged) return;

  errorLogged = true;
  console.error('Redis error:', error.message);
});

client.on('ready', () => {
  errorLogged = false;
  console.log('Redis connected');
});

client.connect().catch((error) => {
  console.error('Redis connection failed:', error.message);
});

const isUsable = () => client.isReady;

export const getCache = async (key) => {
  if (!isUsable()) return null;

  try {
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Redis get failed:', error.message);
    return null;
  }
};

export const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  if (!isUsable()) return;

  try {
    await client.set(key, JSON.stringify(value), { EX: ttl });
  } catch (error) {
    console.error('Redis set failed:', error.message);
  }
};

export const deleteCache = async (key) => {
  if (!isUsable()) return;

  try {
    await client.del(key);
  } catch (error) {
    console.error('Redis del failed:', error.message);
  }
};

/** Invalidates a whole family of keys, e.g. `applications:*`. */
export const deleteCachePattern = async (pattern) => {
  if (!isUsable()) return;

  try {
    const keys = await client.keys(pattern);
    if (keys.length) await client.del(keys);
  } catch (error) {
    console.error('Redis pattern del failed:', error.message);
  }
};

export const closeRedis = async () => {
  if (client.isOpen) await client.quit();
};

export default client;
