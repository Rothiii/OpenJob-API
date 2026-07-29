import { query } from '../config/database.js';

export const findByUserId = async (userId) => {
  const result = await query(
    `SELECT b.id, b.user_id, b.created_at,
            b.job_id, j.title AS job_title, j.description AS job_description,
            j.job_type, j.experience_level, j.location_type, j.location_city,
            j.salary_min, j.salary_max, j.is_salary_visible,
            j.status AS job_status,
            j.company_id, c.name AS company_name,
            j.category_id, cat.name AS category_name
     FROM bookmarks b
     JOIN jobs j ON b.job_id = j.id
     JOIN companies c ON j.company_id = c.id
     JOIN categories cat ON j.category_id = cat.id
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
