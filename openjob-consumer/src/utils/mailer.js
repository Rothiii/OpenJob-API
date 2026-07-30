import nodemailer from 'nodemailer';
import env from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  // 465 is implicit TLS; every other port negotiates STARTTLS.
  secure: env.MAIL_PORT === 465,
  auth: env.MAIL_USER
    ? { user: env.MAIL_USER, pass: env.MAIL_PASSWORD }
    : undefined,
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
});

export const sendMail = ({ to, subject, text, html }) =>
  transporter.sendMail({
    from: env.MAIL_FROM || env.MAIL_USER || 'no-reply@openjob.local',
    to,
    subject,
    text,
    html,
  });

export default { sendMail };
