import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  pool: true,
  maxConnections: 5,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

/** True when the mail settings are filled in, so sending can work. */
export const mailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);

export function sendMail(opts: { to: string; subject: string; html: string; text?: string; replyTo?: string; headers?: Record<string, string> }) {
  return transporter.sendMail({ from: process.env.MAIL_FROM, ...opts });
}
