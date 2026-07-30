import pg from 'pg';
import env from './env.js';

const { Pool } = pg;

const pool = new Pool({
  host: env.PGHOST,
  port: env.PGPORT,
  user: env.PGUSER,
  password: env.PGPASSWORD,
  database: env.PGDATABASE,
  // One message is handled at a time, so a large pool would only idle.
  max: 2,
});

pool.on('error', (error) => {
  console.error('Unexpected error on idle database client', error);
});

/** Read-only access: this project never owns the schema, migrations live in the API. */
export const query = (text, params) => pool.query(text, params);

export const closePool = () => pool.end();

export default pool;
