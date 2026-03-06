import type { InsertContactMessage } from "@shared/schema";

const MAILERSEND_API_URL = "https://api.mailersend.com/v1/email";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContactMessageWithMailerSend(data: InsertContactMessage): Promise<void> {
  const apiKey = getRequiredEnv("MAILERSEND_API_KEY");
  const fromEmail = getRequiredEnv("FROM_EMAIL");
  const toEmail = getRequiredEnv("TO_EMAIL");
  const fromName = process.env.FROM_NAME?.trim() || "Website Contact";

  const payload = {
    from: {
      email: fromEmail,
      name: fromName,
    },
    to: [{ email: toEmail }],
    reply_to: {
      email: data.email,
      name: data.name,
    },
    subject: `[Contact Form] ${data.subject}`,
    text: [
      "New message from the contact form:",
      "",
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Subject: ${data.subject}`,
      "",
      "Message:",
      data.message,
    ].join("\n"),
    html: `
      <h2>New message from the contact form</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
    `,
  };

  const response = await fetch(MAILERSEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`MailerSend request failed (${response.status}): ${body}`);
  }
}
