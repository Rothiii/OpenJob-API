import dotenv from 'dotenv';

// `quiet` suppresses dotenv's startup banner so it stays out of the app log.
dotenv.config({ quiet: true });

/**
 * Read an environment variable.
 * Throws on startup when a required variable is missing, so the process fails
 * fast instead of blowing up on the first message it has to handle.
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

  PGHOST: get('PGHOST'),
  PGPORT: getNumber('PGPORT', '5432'),
  PGUSER: get('PGUSER'),
  // Password may legitimately be empty (local trust auth), so it is not required.
  PGPASSWORD: process.env.PGPASSWORD ?? '',
  PGDATABASE: get('PGDATABASE'),

  RABBITMQ_HOST: get('RABBITMQ_HOST', 'localhost'),
  RABBITMQ_PORT: getNumber('RABBITMQ_PORT', '5672'),
  RABBITMQ_USER: get('RABBITMQ_USER', 'guest'),
  RABBITMQ_PASSWORD: get('RABBITMQ_PASSWORD', 'guest'),
  // Optional shortcut: when set it wins over the individual RABBITMQ_* parts.
  AMQP_URL: process.env.AMQP_URL ?? '',

  MAIL_HOST: get('MAIL_HOST', 'localhost'),
  MAIL_PORT: getNumber('MAIL_PORT', '587'),
  MAIL_USER: process.env.MAIL_USER ?? '',
  MAIL_PASSWORD: process.env.MAIL_PASSWORD ?? '',
  MAIL_FROM: process.env.MAIL_FROM ?? '',
};

env.isProduction = env.NODE_ENV === 'production';

export default env;
