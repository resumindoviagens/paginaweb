export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../lib/auth";
import { sendWithBrevo } from "../../../../../lib/brevoEmail";
import { getEmailTemplate } from "../../../../../lib/emailTemplates";
import { randomBytes } from "crypto";

function makeFeedbackToken() {
  return randomBytes(24).toString("hex");
}

function siteOrigin(request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
}

function serviceFromClient(client = {}) {
  if (client.tipo_processo === "Passaporte" || client.feedback_service === "passaporte") return "passaporte";
  if (String(client.tipo_processo || "").toLowerCase().includes("canad") || client.feedback_service === "canadense") return "canadense";
  return "visto";
}

function templateForService(service) {
  if (service === "passaporte") return "passaporte_pesquisa";
  if (service === "canadense") return "canada_pesquisa";
  return "pesquisa_satisfacao";
}

function canSendFeedback(client = {}) {
  const service = serviceFromClient(client);
  if (service === "passaporte") {
    return client.stage_passport_picked_up || client.stage_passport_ready || client.is_completed || client.stage_ready_to_archive || client.stage_feedback_sent || client.feedback_liberado;
  }
  return client.stage_passport_returned || client.is_completed || client.stage_ready_to_archive || client.stage_feedback_sent || client.feedback_liberado;
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const clientId = body.client_id;

    if (!clientId) return Response.json({ error: "Cliente obrigatório." }, { status: 400 });

    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .maybeSingle();

    if (error || !client) return Response.json({ error: "Cliente não encontrado." }, { status: 404 });
    if (!client.email) return Response.json({ error: "Cliente sem email cadastrado." }, { status: 400 });
    if (!canSendFeedback(client)) return Response.json({ error: "Pesquisa ainda não disponível para este cliente/processo." }, { status: 400 });

    const service = serviceFromClient(client);
    const templateId = templateForService(service);
    const origin = siteOrigin(request);

    const token = client.feedback_token || makeFeedbackToken();
    const expires = new Date();
    expires.setDate(expires.getDate() + 60);

    const { error: updateError } = await supabaseAdmin
      .from("clients")
      .update({
        feedback_liberado: true,
        feedback_token: token,
        feedback_token_expires_at: expires.toISOString(),
        feedback_service: service,
        stage_feedback_sent: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", client.id);

    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

    const feedbackLink = `${origin}/feedback/${token}`;
    const template = getEmailTemplate(templateId, { ...client, feedback_service: service }, { feedbackLink });

    const result = await sendWithBrevo({
      toEmail: client.email,
      toName: client.name,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: ["resumindo-viagens", "feedback-reenviado", templateId]
    });

    await supabaseAdmin.from("audit_logs").insert({
      client_id: client.id,
      action: "feedback_email_resent",
      details: { template_id: templateId, to: client.email, cc: client.secondary_email || "", service, messageId: result?.messageId || result?.messageIds || null }
    });

    return Response.json({ ok: true, message: "Pesquisa reenviada com sucesso.", feedbackLink });
  } catch (error) {
    return Response.json({ error: error.message || "Erro ao reenviar pesquisa." }, { status: 500 });
  }
}
