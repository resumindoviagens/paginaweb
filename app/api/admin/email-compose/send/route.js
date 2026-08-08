export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../lib/auth";
import { sendWithBrevo } from "../../../../../lib/brevoEmail";
import { readFileSync } from "fs";
import path from "path";
import { agendaAttachmentsForClient } from "../../../../../lib/agendaAutomation";

function isInitialFormTemplate(templateId) {
  return ["formulario", "formulario_pendente", "formulario_recebido"].includes(templateId);
}

function isPassportTemplate(templateId) {
  return String(templateId || "").startsWith("passaporte_");
}

function isPhotoInstructionsTemplate(templateId) {
  return templateId === "foto_instrucoes";
}

function isCanadaTemplate(templateId) {
  return String(templateId || "").startsWith("canada_");
}

function isFeedbackTemplate(templateId) {
  return ["pesquisa_satisfacao", "passaporte_pesquisa", "canada_pesquisa"].includes(templateId);
}

function isPassportReturnedTemplate(templateId) {
  return templateId === "passaporte_recebido" || templateId === "rastreio";
}

function isAgendaTemplate(templateId) {
  return ["agenda_visto", "agenda_videochamada", "passaporte_agenda_pf"].includes(templateId);
}

function isReminderTemplate(templateId) {
  return ["lembrete_visto", "lembrete_videochamada", "passaporte_lembrete_pf"].includes(templateId);
}

function isTemplateAllowedForClient(client, templateId) {
  const isPassportClient = String(client.tipo_processo || "").toLowerCase().includes("passaporte");

  if (isPassportClient && !isPassportTemplate(templateId) && !isPhotoInstructionsTemplate(templateId)) {
    return { ok: false, reason: "Clientes de passaporte exibem apenas modelos de passaporte." };
  }

  if (!isPassportClient && isPassportTemplate(templateId)) {
    return { ok: false, reason: "Modelo disponível apenas para serviço de passaporte." };
  }

  if (isCanadaTemplate(templateId) && !String(client.tipo_processo || "").toLowerCase().includes("canad")) {
    return { ok: false, reason: "Modelo disponível apenas para visto canadense." };
  }

  if ((client.no_form_required || !client.access_token) && isInitialFormTemplate(templateId)) {
    return { ok: false, reason: "Modelo indisponível para cadastro de controle." };
  }

  if (isFeedbackTemplate(templateId) && !(isPassportClient ? (client.stage_passport_picked_up || client.stage_passport_ready || client.is_completed || client.stage_ready_to_archive) : (client.stage_passport_returned || client.is_completed || client.stage_ready_to_archive))) {
    return { ok: false, reason: isPassportClient ? "Pesquisa de passaporte disponível somente após passaporte disponível/retirado." : "Pesquisa de satisfação disponível somente após passaporte devolvido/processo concluído." };
  }

  if (isPassportReturnedTemplate(templateId) && !(client.stage_passport_returned || client.passport_tracking_code || client.is_completed)) {
    return { ok: false, reason: "Modelo disponível somente após rastreio/passaporte devolvido." };
  }

  return { ok: true };
}

function photoAttachmentsForTemplate(templateId) {
  if (templateId !== "foto_instrucoes") return [];
  try {
    const filePath = path.join(process.cwd(), "public", "foto", "infografico_foto_visto.jpg");
    const content = readFileSync(filePath).toString("base64");
    return [{ name: "instrucoes-foto-visto.jpg", content }];
  } catch {
    return [];
  }
}

function isEmail5Template(templateId) {
  return ["instrucoes", "agendamento_confirmado", "agenda_visto", "email_05", "05_agendamento_confirmado"].includes(templateId);
}

function sanitizeTempAttachments(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && item.name && item.content)
    .slice(0, 5)
    .map((item) => {
      const content = String(item.content).includes(",") ? String(item.content).split(",").pop() : String(item.content);
      return {
        name: String(item.name).slice(0, 140),
        content
      };
    })
    .filter((item) => item.content && item.content.length > 20);
}

function htmlToText(html = "") {
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const clientId = body.client_id;
    const toEmail = body.to_email;
    const ccEmail = body.cc_email || "";
    const toName = body.to_name || "";
    const subject = body.subject || "";
    const html = body.html || "";
    const text = body.text || htmlToText(html);
    const templateId = body.template_id || "personalizado";
    const tempAttachments = sanitizeTempAttachments(body.temp_attachments || []);

    if (!clientId) return Response.json({ error: "Cliente obrigatório." }, { status: 400 });

    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .maybeSingle();

    if (clientError || !client) return Response.json({ error: "Cliente não encontrado." }, { status: 404 });

    const allowed = isTemplateAllowedForClient(client, templateId);
    if (!allowed.ok) return Response.json({ error: allowed.reason }, { status: 400 });

    if (!toEmail) return Response.json({ error: "Email de destino obrigatório." }, { status: 400 });
    if (!subject) return Response.json({ error: "Assunto obrigatório." }, { status: 400 });
    if (!html) return Response.json({ error: "Corpo do email obrigatório." }, { status: 400 });

    const result = await sendWithBrevo({
      toEmail,
      toName,
      ccEmail: ccEmail || client.secondary_email || "",
      subject,
      html,
      text,
      tags: ["resumindo-viagens", "editor-email", templateId],
      attachments: [
        ...photoAttachmentsForTemplate(templateId),
        ...(isAgendaTemplate(templateId) ? agendaAttachmentsForClient(client) : []),
        ...tempAttachments
      ]
    });

    const updates = {};
    if (isFeedbackTemplate(templateId)) updates.stage_feedback_sent = true;
    if (isAgendaTemplate(templateId)) updates.agenda_email_pending_at = null;

    if (Object.keys(updates).length > 0) {
      await supabaseAdmin.from("clients").update(updates).eq("id", clientId);
    }

    await supabaseAdmin.from("audit_logs").insert({
      client_id: clientId,
      action: "email_editor_sent",
      details: { template_id: templateId, to: toEmail, cc: ccEmail || client.secondary_email || "", temp_attachment_count: tempAttachments.length, temp_attachments: tempAttachments.map((item) => item.name), messageId: result?.messageId || result?.messageIds || null }
    });

    return Response.json({ ok: true, result });
  } catch (error) {
    return Response.json({ error: error.message || "Erro ao enviar email." }, { status: 500 });
  }
}
