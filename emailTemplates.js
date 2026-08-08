import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../lib/auth";
import { getEmailTemplate } from "../../../../lib/emailTemplates";
import { sendWithBrevo } from "../../../../lib/brevoEmail";


function siteOrigin(request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { client_id, template_id } = body;

    if (!client_id || !template_id) return Response.json({ error: "Cliente e modelo de email são obrigatórios." }, { status: 400 });

    const { data: client, error } = await supabaseAdmin.from("clients").select("*").eq("id", client_id).single();
    if (error || !client) return Response.json({ error: "Cliente não encontrado." }, { status: 404 });
    if (!client.email) return Response.json({ error: "Cliente sem email cadastrado." }, { status: 400 });

    const origin = siteOrigin(request);
    const formLink = `${origin}/acesso/${client.access_token}`;
    const preparationLink = `${origin}/preparacao/${client.id}`;
    const template = getEmailTemplate(template_id, client, { formLink, preparationLink, rastreio: body.rastreio || client.passport_tracking_code || "" });

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
