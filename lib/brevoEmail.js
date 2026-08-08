import { addHoursBrasilia, BRASILIA_TIME_ZONE, brasiliaVTimezoneLines, formatBrasiliaDateTime, toICSLocalDateTime, toICSUtcStamp } from "./brasiliaDateTime";

export function brevoConfig() {
  const apiKey = process.env.BREVO_API_KEY;

  // V23: remetente único para TODOS os emails enviados pelo sistema
  // (emails automáticos para clientes e alertas internos).
  // Mantemos contato@ como reply-to para respostas humanas.
  const fromEmail = process.env.SYSTEM_EMAIL_FROM || "alertas@resumindoviagens.com.br";
  const fromName = process.env.SYSTEM_EMAIL_FROM_NAME || process.env.EMAIL_FROM_NAME || "Resumindo Viagens";
  const replyToEmail = process.env.SYSTEM_EMAIL_REPLY_TO || process.env.EMAIL_REPLY_TO || "contato@resumindoviagens.com.br";

  if (!apiKey) throw new Error("Brevo não configurado. Configure BREVO_API_KEY nas variáveis de ambiente da Vercel.");

  return { apiKey, fromEmail, fromName, replyToEmail };
}

export async function sendWithBrevo({ toEmail, toName, ccEmail = "", ccName = "", subject, html, text, tags = ["resumindo-viagens", "visto-americano"], attachments = [], fromEmail: overrideFromEmail, fromName: overrideFromName, replyToEmail: overrideReplyToEmail }) {
  const config = brevoConfig();
  const apiKey = config.apiKey;
  const fromEmail = overrideFromEmail || config.fromEmail;
  const fromName = overrideFromName || config.fromName;
  const replyToEmail = overrideReplyToEmail || config.replyToEmail;

  const payload = {
    sender: { name: fromName, email: fromEmail },
    to: [{ email: toEmail, name: toName || toEmail }],
    replyTo: { email: replyToEmail, name: fromName },
    subject,
    htmlContent: html,
    textContent: text || subject,
    tags
  };



  const ccList = String(ccEmail || "")
    .split(/[;,]/)
    .map((email) => email.trim())
    .filter((email) => email && email.toLowerCase() !== String(toEmail || "").trim().toLowerCase());

  if (ccList.length > 0) {
    payload.cc = ccList.map((email, index) => ({
      email,
      name: index === 0 && ccName ? ccName : email
    }));
  }

  if (attachments && attachments.length > 0) {
    payload.attachment = attachments;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json", "api-key": apiKey },
    body: JSON.stringify(payload)
  });

  const resultText = await response.text();
  let result = {};
  try { result = resultText ? JSON.parse(resultText) : {}; } catch { result = { raw: resultText }; }

  if (!response.ok) {
    const message = result?.message || result?.error || "Erro ao enviar email pela Brevo.";
    throw new Error(`Brevo: ${message}`);
  }
  return result;
}

export function simpleHtml(title, paragraphs = []) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.55;max-width:720px;margin:0 auto;background:#fff;padding:26px;border:1px solid #e5e7eb;border-radius:14px;">
    <h2 style="color:#1f2a60;margin-top:0;">${title}</h2>
    ${paragraphs.map((p) => `<p>${p}</p>`).join("\n")}
    <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;" />
    <p><strong>Resumindo Viagens</strong></p>
  </div>`;
}


export function internalAlertFrom() {
  return {
    fromEmail: process.env.SYSTEM_EMAIL_FROM || process.env.ALERT_EMAIL_FROM || "alertas@resumindoviagens.com.br",
    fromName: process.env.ALERT_EMAIL_FROM_NAME || "Resumindo Viagens - Alertas",
    replyToEmail: process.env.SYSTEM_EMAIL_REPLY_TO || process.env.ALERT_EMAIL_REPLY_TO || "contato@resumindoviagens.com.br"
  };
}

export async function sendInternalAlert({ subject, html, text, tags = ["resumindo-viagens", "alerta-interno"] }) {
  const toEmail = process.env.ALERT_EMAIL_TO || "contato@resumindoviagens.com.br";
  return sendWithBrevo({
    toEmail,
    toName: "Resumindo Viagens",
    subject,
    html,
    text,
    tags,
    ...internalAlertFrom()
  });
}


function escapeICSText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldICSLine(line) {
  const max = 73;
  if (line.length <= max) return line;
  const chunks = [];
  let remaining = line;
  while (remaining.length > max) {
    chunks.push(remaining.slice(0, max));
    remaining = ` ${remaining.slice(max)}`;
  }
  chunks.push(remaining);
  return chunks.join("\r\n");
}

export function buildICS({ title, description = "", location = "", start, end, uid = "" }) {
  const startText = toICSLocalDateTime(start);
  const endText = toICSLocalDateTime(end || addHoursBrasilia(start, 1));
  if (!startText || !endText) throw new Error("Data ou horário inválido para gerar o arquivo de calendário.");

  const eventUid = uid || `${Date.now()}-${Math.random().toString(16).slice(2)}@resumindoviagens.com.br`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Resumindo Viagens//Sistema de Vistos//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-TIMEZONE:${BRASILIA_TIME_ZONE}`,
    ...brasiliaVTimezoneLines(),
    "BEGIN:VEVENT",
    `UID:${eventUid}`,
    `DTSTAMP:${toICSUtcStamp(new Date())}`,
    `DTSTART;TZID=${BRASILIA_TIME_ZONE}:${startText}`,
    `DTEND;TZID=${BRASILIA_TIME_ZONE}:${endText}`,
    `SUMMARY:${escapeICSText(title).replace(/\\n/g, " ")}`,
    `DESCRIPTION:${escapeICSText(description)}`,
    location ? `LOCATION:${escapeICSText(location).replace(/\\n/g, " ")}` : "",
    "END:VEVENT",
    "END:VCALENDAR"
  ].filter(Boolean);

  return lines.map(foldICSLine).join("\r\n");
}

export async function sendCalendarEmail({ toEmail = "contato@resumindoviagens.com.br", subject, title, description, location, start, end }) {
  const ics = buildICS({ title, description, location, start, end });
  const html = `<p>${description || title}</p><p><strong>Data:</strong> ${formatBrasiliaDateTime(start)}</p>`;
  return sendWithBrevo({
    toEmail,
    toName: "Resumindo Viagens",
    subject,
    html,
    text: description || title,
    tags: ["resumindo-viagens", "calendario"]
  });
}
