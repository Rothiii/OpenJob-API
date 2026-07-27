import { query } from '../config/database.js';

export const findByUserId = async (userId) => {
  const result = await query(
    `SELECT b.id, b.job_id, j.title, j.company_id, j.category_id, b.created_at
     FROM bookmarks b
     JOIN jobs j ON b.job_id = j.id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const findByIdForUser = async ({ id, jobId, userId }) => {
  const result = await query(
    `SELECT b.id, b.user_id, b.job_id, j.title
     FROM bookmarks b
     JOIN jobs j ON b.job_id = j.id
     WHERE b.id = $1 AND b.job_id = $2 AND b.user_id = $3`,
    [id, jobId, userId]
  );
  return result.rows[0] ?? null;
};

export const insert = async ({ id, userId, jobId }) => {
  const result = await query(
    'INSERT INTO bookmarks (id, user_id, job_id) VALUES ($1, $2, $3) RETURNING *',
    [id, userId, jobId]
  );
  return result.rows[0];
};

export const removeByUserAndJob = async ({ userId, jobId }) => {
  const result = await query(
    'DELETE FROM bookmarks WHERE user_id = $1 AND job_id = $2 RETURNING id',
    [userId, jobId]
  );
  return result.rowCount > 0;
};
