require('dotenv').config();

const get = (key, fallback) => {
  const value = process.env[key];
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

module.exports = {
  HOST: get('HOST', 'localhost'),
  PORT: Number(get('PORT', '3000')),
  PGUSER: get('PGUSER'),
  PGPASSWORD: process.env.PGPASSWORD ?? '',
  PGDATABASE: get('PGDATABASE'),
  PGHOST: get('PGHOST'),
  PGPORT: Number(get('PGPORT', '5432')),
  ACCESS_TOKEN_KEY: get('ACCESS_TOKEN_KEY'),
  REFRESH_TOKEN_KEY: get('REFRESH_TOKEN_KEY'),
};
