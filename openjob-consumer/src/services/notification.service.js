import * as applicationsRepository from '../repositories/applications.repository.js';
import { sendMail } from '../utils/mailer.js';

const formatDate = (value) =>
  new Date(value).toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  });

const buildEmail = (details) => {
  const appliedAt = formatDate(details.applied_at);

  return {
    subject: `Lamaran baru untuk lowongan "${details.job_title}"`,
    text: [
      `Halo ${details.owner_name},`,
      '',
      `Ada kandidat baru yang melamar lowongan "${details.job_title}" di ${details.company_name}.`,
      '',
      `Nama pelamar   : ${details.applicant_name}`,
      `Email pelamar  : ${details.applicant_email}`,
      `Tanggal lamaran: ${appliedAt}`,
      '',
      'Silakan masuk ke OpenJob untuk meninjau lamaran tersebut.',
    ].join('\n'),
    html: `
      <p>Halo <strong>${details.owner_name}</strong>,</p>
      <p>Ada kandidat baru yang melamar lowongan
         <strong>${details.job_title}</strong> di ${details.company_name}.</p>
      <ul>
        <li>Nama pelamar: <strong>${details.applicant_name}</strong></li>
        <li>Email pelamar: <strong>${details.applicant_email}</strong></li>
        <li>Tanggal lamaran: <strong>${appliedAt}</strong></li>
      </ul>
      <p>Silakan masuk ke OpenJob untuk meninjau lamaran tersebut.</p>
    `,
  };
};

/**
 * Only the owner of the job is notified — the applicant already knows they
 * applied, and every address comes from the database, never from the message.
 *
 * The message carries just an application_id, so anything else could be stale
 * by the time it is read.
 */
export const notifyJobOwner = async (applicationId) => {
  const details =
    await applicationsRepository.findNotificationDetails(applicationId);

  if (!details) {
    console.warn(`Application ${applicationId} no longer exists, skipping`);
    return;
  }

  if (!details.owner_email) {
    console.warn(
      `Job "${details.job_title}" has no owner with an email address, skipping`
    );
    return;
  }

  const { subject, text, html } = buildEmail(details);

  await sendMail({ to: details.owner_email, subject, text, html });

  console.log(
    `Notification sent to ${details.owner_email} for application ${applicationId}`
  );
};

export default { notifyJobOwner };
