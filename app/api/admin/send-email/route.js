import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../lib/auth";
import { getEmailTemplate } from "../../../../lib/emailTemplates";
import { sendWithBrevo } from "../../../../lib/brevoEmail";
import { randomBytes } from "crypto";
import { agendaAttachmentsForClient } from "../../../../lib/agendaAutomation";



function isPassportTemplate(templateId) { return String(templateId || "").startsWith("passaporte_"); }
function isPhotoInstructionsTemplate(templateId) { return templateId === "foto_instrucoes"; }
function isAgendaTemplate(templateId) { return ["agenda_visto", "agenda_videochamada", "passaporte_agenda_pf"].includes(templateId); }

function makeFeedbackToken() {
  return randomBytes(24).toString("hex");
}

async function ensureFeedbackLink(client, origin) {
  let token = client.feedback_token;
  if (!token) {
    token = makeFeedbackToken();
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    const { error } = await supabaseAdmin
      .from("clients")
      .update({
        feedback_liberado: true,
        feedback_token: token,
        feedback_token_expires_at: expires.toISOString(),
        stage_feedback_sent: true,
        feedback_service: client.tipo_processo === "Passaporte" ? "passaporte" : (String(client.tipo_processo || "").toLowerCase().includes("canad") ? "canadense" : (client.feedback_service || "visto"))
      })
      .eq("id", client.id);

    if (error) throw error;
  }

  return `${origin}/feedback/${token}`;
}

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
    if (client.tipo_processo === "Passaporte" && !isPassportTemplate(template_id)) {
      return Response.json({ error: "Clientes de passaporte exibem apenas modelos de passaporte." }, { status: 400 });
    }

    let processGroup = null;
    if (client.group_process_id) {
      const { data: group } = await supabaseAdmin
        .from("grupos_processo")
        .select("*")
        .eq("id", client.group_process_id)
        .maybeSingle();
      processGroup = group || null;
    }

    const clientWithGroup = { ...client, process_group: processGroup };
    const origin = siteOrigin(request);
    const formLink = client.access_token ? `${origin}/acesso/${client.access_token}` : "";
    const preparationLink = `${origin}/preparacao/${client.id}`;
    const feedbackLink = ["pesquisa_satisfacao", "passaporte_pesquisa", "canada_pesquisa"].includes(template_id) ? await ensureFeedbackLink(client, origin) : "";
    const template = getEmailTemplate(template_id, clientWithGroup, {
      formLink,
      preparationLink,
      feedbackLink,
      rastreio: body.rastreio || client.passport_tracking_code || processGroup?.passport_tracking_code || "",
      videoCallDateTime: processGroup?.video_call_date || client.video_call_date || "",
      origin,
      passaporteInstrucoesUrl: `${origin}/passaporte-instrucoes`
    });

    const attachments = isAgendaTemplate(template_id) ? agendaAttachmentsForClient(clientWithGroup) : [];
    const result = await sendWithBrevo({ toEmail: client.email, toName: client.name, ccEmail: client.secondary_email || "", subject: template.subject, html: template.html, text: template.text, attachments });

    if (isAgendaTemplate(template_id)) {
      await supabaseAdmin.from("clients").update({ agenda_email_pending_at: null }).eq("id", client_id);
    }

    if (["pesquisa_satisfacao", "passaporte_pesquisa", "canada_pesquisa"].includes(template_id)) {
      await supabaseAdmin
        .from("clients")
        .update({ stage_feedback_sent: true })
        .eq("id", client_id);
    }

    await supabaseAdmin.from("audit_logs").insert({
      client_id,
      action: "email_sent",
      details: { provider: "brevo", template_id, subject: template.subject, to: client.email, cc: client.secondary_email || "", message_id: result?.messageId || null }
    });

    return Response.json({ ok: true, message: "Email enviado com sucesso pela Brevo." });
  } catch (error) {
    return Response.json({ error: error.message || "Erro ao enviar email." }, { status: 500 });
  }
}
