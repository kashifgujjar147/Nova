import { env } from "../config/env";

export type EmailMessage = { to: string; subject: string; text: string; html?: string };

export async function sendEmail(message: EmailMessage): Promise<boolean> {
  if (env.EMAIL_PROVIDER === "none") {
    if (env.NODE_ENV === "production") return false;
    return true;
  }
  if (!env.EMAIL_PROVIDER_URL || !env.EMAIL_PROVIDER_KEY || !env.EMAIL_FROM) return false;
  const response = await fetch(env.EMAIL_PROVIDER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.EMAIL_PROVIDER_KEY}` },
    body: JSON.stringify({ ...message, from: env.EMAIL_FROM }),
  });
  if (!response.ok) throw Object.assign(new Error("Email provider rejected the message"), { status: 502 });
  return true;
}

export function verificationEmail(to: string, token: string, clientUrl: string): EmailMessage {
  const link = `${clientUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(token)}`;
  return { to, subject: "Verify your NovaCart email", text: `Verify your NovaCart email: ${link}`, html: `<p>Verify your NovaCart email:</p><p><a href="${link}">${link}</a></p>` };
}

export function passwordResetEmail(to: string, token: string, clientUrl: string): EmailMessage {
  const link = `${clientUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  return { to, subject: "Reset your NovaCart password", text: `Reset your NovaCart password: ${link}`, html: `<p>Reset your NovaCart password:</p><p><a href="${link}">${link}</a></p>` };
}
