import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

let _transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (_transporter) return _transporter;
  const s = await prisma.settings.findFirst();
  if (!s?.smtpHost) return null;
  _transporter = nodemailer.createTransport({
    host: s.smtpHost,
    port: s.smtpPort,
    secure: s.smtpSecure,
    auth: s.smtpUser ? { user: s.smtpUser, pass: s.smtpPass } : undefined,
  });
  return _transporter;
}

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = await getTransporter();
  if (!transporter) return false;
  const s = await prisma.settings.findFirst();
  const from = s?.smtpFrom || s?.smtpUser || "LOJ <noreply@loj.com>";
  await transporter.sendMail({ from, to, subject, html });
  return true;
}
