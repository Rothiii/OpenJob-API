import { query } from '../config/database.js';

export const findAll = async () => {
  const result = await query('SELECT * FROM companies ORDER BY created_at DESC');
  return result.rows;
};

export const findById = async (id) => {
  const result = await query('SELECT * FROM companies WHERE id = $1', [id]);
  return result.rows[0] ?? null;
};

export const insert = async ({ id, name, location, description, userId }) => {
  const result = await query(
    `INSERT INTO companies (id, name, location, description, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, name, location, description, userId]
  );
  return result.rows[0];
};

export const update = async (id, { name, location, description }) => {
  const result = await query(
    `UPDATE companies
     SET name = $1, location = $2, description = $3, updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING *`,
    [name, location, description, id]
  );
  return result.rows[0] ?? null;
};

export const remove = async (id) => {
  const result = await query(
    'DELETE FROM companies WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rowCount > 0;
};
