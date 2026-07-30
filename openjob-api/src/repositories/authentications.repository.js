import { query } from '../config/database.js';

export const insertToken = async ({ id, token, userId }) => {
  const result = await query(
    'INSERT INTO authentications (id, token, user_id) VALUES ($1, $2, $3) RETURNING id',
    [id, token, userId]
  );
  return result.rows[0];
};

export const findToken = async (token) => {
  const result = await query(
    'SELECT id, token, user_id FROM authentications WHERE token = $1',
    [token]
  );
  return result.rows[0] ?? null;
};

export const deleteToken = async (token) => {
  const result = await query(
    'DELETE FROM authentications WHERE token = $1 RETURNING id',
    [token]
  );
  return result.rowCount > 0;
};
