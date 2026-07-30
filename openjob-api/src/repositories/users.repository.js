import { query } from '../config/database.js';

const PUBLIC_COLUMNS = 'id, name, email, role, created_at, updated_at';

export const findById = async (id) => {
  const result = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
};

export const findByEmail = async (email) => {
  const result = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] ?? null;
};

/** Includes the password hash — only for the login flow. */
export const findCredentialsByEmail = async (email) => {
  const result = await query(
    'SELECT id, email, password FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] ?? null;
};

export const insert = async ({ id, name, email, password, role }) => {
  const result = await query(
    `INSERT INTO users (id, name, email, password, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${PUBLIC_COLUMNS}`,
    [id, name, email, password, role]
  );
  return result.rows[0];
};
