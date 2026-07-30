import pg from 'pg';
import env from './env.js';

const { Pool } = pg;

const pool = new Pool({
  host: env.PGHOST,
  port: env.PGPORT,
  user: env.PGUSER,
  password: env.PGPASSWORD,
  database: env.PGDATABASE,
});

pool.on('error', (error) => {
  console.error('Unexpected error on idle database client', error);
});

/** Single entry point for SQL so repositories never touch the pool directly. */
export const query = (text, params) => pool.query(text, params);

export const closePool = () => pool.end();

export default pool;
