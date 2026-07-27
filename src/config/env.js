import dotenv from 'dotenv';

// `quiet` suppresses dotenv's startup banner so it stays out of the app log.
dotenv.config({ quiet: true });

/**
 * Read an environment variable.
 * Throws on startup when a required variable is missing, so the process fails
 * fast instead of blowing up on the first request that needs it.
 */
const get = (key, fallback) => {
  const value = process.env[key];

  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

const getNumber = (key, fallback) => {
  const value = Number(get(key, fallback));

  if (!Number.isFinite(value)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }

  return value;
};

export const env = {
  NODE_ENV: get('NODE_ENV', 'development'),
  HOST: get('HOST', 'localhost'),
  PORT: getNumber('PORT', '3000'),

  PGHOST: get('PGHOST'),
  PGPORT: getNumber('PGPORT', '5432'),
  PGUSER: get('PGUSER'),
  // Password may legitimately be empty (local trust auth), so it is not required.
  PGPASSWORD: process.env.PGPASSWORD ?? '',
  PGDATABASE: get('PGDATABASE'),

  ACCESS_TOKEN_KEY: get('ACCESS_TOKEN_KEY'),
  REFRESH_TOKEN_KEY: get('REFRESH_TOKEN_KEY'),
  ACCESS_TOKEN_AGE: get('ACCESS_TOKEN_AGE', '3h'),
};

env.isProduction = env.NODE_ENV === 'production';

export default env;
