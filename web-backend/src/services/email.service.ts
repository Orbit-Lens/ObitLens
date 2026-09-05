// web-backend/src/services/email.service.ts
// Email notifications via Nodemailer.
// Only initialised when SMTP_HOST is configured.

import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

function createTransport() {
  if (!env.SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 465,
    secure: (env.SMTP_PORT ?? 465) === 465,
    auth: {
      user: env.SMTP_USER ?? '',
      pass: env.SMTP_PASS ?? '',
    },
  });
}

const transporter = createTransport();

export async function sendJobCompleteEmail(to: string, jobId: string, rmse?: number): Promise<void> {
  if (!transporter || !env.EMAIL_FROM) return;
  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'OrbitLens — Registration Job Complete',
      html: `
        <h2>Registration Job Complete</h2>
        <p>Job <strong>${jobId}</strong> has completed successfully.</p>
        ${rmse !== undefined ? `<p>Achieved RMSE: <strong>${rmse.toFixed(3)} px</strong></p>` : ''}
        <p>Log in to OrbitLens to view your results and download the registered image.</p>
      `,
    });
  } catch (err) {
    logger.error('Failed to send job complete email', { to, jobId, err });
  }
}

export async function sendWelcomeEmail(to: string): Promise<void> {
  if (!transporter || !env.EMAIL_FROM) return;
  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'Welcome to OrbitLens',
      html: `
        <h2>Welcome to OrbitLens 🌑</h2>
        <p>Your account is ready. Upload your first Chandrayaan-2 image pair and start a registration job.</p>
      `,
    });
  } catch (err) {
    logger.error('Failed to send welcome email', { to, err });
  }
}
