import { query } from '../config/database.js';

export const findAll = async () => {
  const result = await query('SELECT * FROM categories ORDER BY name ASC');
  return result.rows;
};

export const findById = async (id) => {
  const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
  return result.rows[0] ?? null;
};

export const findByName = async (name) => {
  const result = await query('SELECT * FROM categories WHERE name = $1', [name]);
  return result.rows[0] ?? null;
};

export const insert = async ({ id, name }) => {
  const result = await query(
    'INSERT INTO categories (id, name) VALUES ($1, $2) RETURNING *',
    [id, name]
  );
  return result.rows[0];
};

export const update = async (id, { name }) => {
  const result = await query(
    `UPDATE categories
     SET name = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [name, id]
  );
  return result.rows[0] ?? null;
};

export const remove = async (id) => {
  const result = await query(
    'DELETE FROM categories WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rowCount > 0;
};
