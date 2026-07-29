import redis from 'redis';

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

client.connect().catch((err) => {
  console.error('Error connecting to Redis:', err);
});

export const setValue = async (key, value, expirationInSeconds = 3600) => {
  try {
    await client.set(key, value, 'EX', expirationInSeconds);
    console.log(`Value set for key: ${key}`);
  } catch (error) {
    console.error('Error setting value in Redis:', error);
  }
};

export const getValue = async (key) => {
  try {
    const value = await client.get(key);
    console.log(`Value retrieved for key: ${key}`);
    return value;
  } catch (error) {
    console.error('Error getting value from Redis:', error);
    return null;
  }
};

export const deleteValue = async (key) => {
  try {
    await client.del(key);
    console.log(`Value deleted for key: ${key}`);
  } catch (error) {
    console.error('Error deleting value from Redis:', error);
  }
};

export default client;