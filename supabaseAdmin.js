import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../lib/auth";
import { getEmailTemplate } from "../../../../lib/emailTemplates";

const DISABLED_TEMPLATES = new Set(["instrucoes", "pre_entrevista"]);

function siteOrigin(request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
}

function brevoConfig() {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.SYSTEM_EMAIL_FROM || "alertas@resumindoviagens.com.br";
  const fromName = process.env.SYSTEM_EMAIL_FROM_NAME || process.env.EMAIL_FROM_NAME || "Resumindo Viagens";
  const replyToEmail = process.env.SYSTEM_EMAIL_REPLY_TO || process.env.EMAIL_REPLY_TO || "contato@resumindoviagens.com.br";

  if (!apiKey) throw new Error("Brevo não configurado. Configure BREVO_API_KEY nas variáveis de ambiente da Vercel.");

  return { apiKey, fromEmail, fromName, replyToEmail };
}

async function sendWithBrevo({ toEmail, toName, subject, html, text }) {
  const { apiKey, fromEmail, fromName, replyToEmail } = brevoConfig();

  const payload = {
    sender: { name: fromName, email: fromEmail },
    to: [{ email: toEmail, name: toName || toEmail }],
    replyTo: { email: replyToEmail, name: fromName },
    subject,
    htmlContent: html,
    textContent: text || subject,
    tags: ["resumindo-viagens", "visto-americano"]
  };

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

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { client_id, template_id } = body;

    if (!client_id || !template_id) return Response.json({ error: "Cliente e modelo de email são obrigatórios." }, { status: 400 });
    if (DISABLED_TEMPLATES.has(template_id)) {
      return Response.json({ error: "Este modelo está marcado como não disponível para envio automático. Use o Gmail manualmente com os anexos necessários." }, { status: 400 });
    }

    const { data: client, error } = await supabaseAdmin.from("clients").select("*").eq("id", client_id).single();
    if (error || !client) return Response.json({ error: "Cliente não encontrado." }, { status: 404 });
    if (!client.email) return Response.json({ error: "Cliente sem email cadastrado." }, { status: 400 });

    const origin = siteOrigin(request);
    const formLink = `${origin}/acesso/${client.access_token}`;
    const template = getEmailTemplate(template_id, client, { formLink, rastreio: body.rastreio || client.passport_tracking_code || "" });

    const result = await sendWithBrevo({ toEmail: client.email, toName: client.name, subject: template.subject, html: template.html, text: template.text });

    await supabaseAdmin.from("audit_logs").insert({
      client_id,
      action: "email_sent",
      details: { provider: "brevo", template_id, subject: template.subject, to: client.email, message_id: result?.messageId || null }
    });

    return Response.json({ ok: true, message: "Email enviado com sucesso pela Brevo." });
  } catch (error) {
    return Response.json({ error: error.message || "Erro ao enviar email." }, { status: 500 });
  }
}
