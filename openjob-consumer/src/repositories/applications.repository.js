import { query } from '../config/database.js';

/**
 * Everything the notification needs, in one round trip: the applicant, the job,
 * and — through the company — the user who owns that job.
 *
 * The owner is joined with LEFT JOIN on purpose: companies created before
 * ownership was recorded have no owner, and that must read as "nobody to
 * notify" rather than "application not found".
 */
export const findNotificationDetails = async (id) => {
  const result = await query(
    `SELECT a.id AS application_id, a.status, a.created_at AS applied_at,
            applicant.id AS applicant_id, applicant.name AS applicant_name,
            applicant.email AS applicant_email,
            j.id AS job_id, j.title AS job_title,
            c.id AS company_id, c.name AS company_name,
            owner.id AS owner_id, owner.name AS owner_name,
            owner.email AS owner_email
     FROM applications a
     JOIN users applicant ON a.user_id = applicant.id
     JOIN jobs j ON a.job_id = j.id
     JOIN companies c ON j.company_id = c.id
     LEFT JOIN users owner ON c.user_id = owner.id
     WHERE a.id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
};
