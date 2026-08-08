export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../lib/auth";
import { EMAIL_TEMPLATES, getEmailTemplate } from "../../../../../lib/emailTemplates";
import { randomBytes } from "crypto";

function makeFeedbackToken() {
  return randomBytes(24).toString("hex");
}

function htmlToPlainText(html = "") {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function siteOriginFromHeaders(headerStore) {
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || "https";
  return process.env.NEXT_PUBLIC_SITE_URL || (host ? `${protocol}://${host}` : "https://app.resumindoviagens.com.br");
}

function isInitialFormTemplate(templateId) {
  return ["formulario", "formulario_pendente", "formulario_recebido"].includes(templateId);
}

function isFeedbackTemplate(templateId) {
  return ["pesquisa_satisfacao", "passaporte_pesquisa", "canada_pesquisa"].includes(templateId);
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

function isPassportReturnedTemplate(templateId) {
  return templateId === "passaporte_recebido" || templateId === "rastreio";
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

async function ensureFeedbackLink(client, origin) {
  let token = client.feedback_token;
  if (!token) token = makeFeedbackToken();

  const expires = new Date();
  expires.setDate(expires.getDate() + 60);

  await supabaseAdmin
    .from("clients")
    .update({
      feedback_liberado: true,
      feedback_token: token,
      feedback_token_expires_at: expires.toISOString(),
      stage_feedback_sent: true,
      feedback_service: client.tipo_processo === "Passaporte" ? "passaporte" : (String(client.tipo_processo || "").toLowerCase().includes("canad") ? "canadense" : (client.feedback_service || "visto"))
    })
    .eq("id", client.id);

  return `${origin}/feedback/${token}`;
}

export async function GET(request, context) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const params = await context.params;
  const url = new URL(request.url);
  const templateId = url.searchParams.get("template") || "formulario";

  const { data: client, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !client) {
    return Response.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  const allowed = isTemplateAllowedForClient(client, templateId);
  if (!allowed.ok) {
    return Response.json({ error: allowed.reason }, { status: 400 });
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

  const headerStore = await headers();
  const origin = siteOriginFromHeaders(headerStore);
  const clientWithGroup = { ...client, process_group: processGroup };

  const formLink = client.access_token ? `${origin}/acesso/${client.access_token}` : "";
  const preparationLink = `${origin}/preparacao/${client.id}`;
  const feedbackLink = isFeedbackTemplate(templateId)
    ? await ensureFeedbackLink(client, origin)
    : (client.feedback_token ? `${origin}/feedback/${client.feedback_token}` : "");

  const template = getEmailTemplate(templateId, clientWithGroup, {
    formLink,
    preparationLink,
    feedbackLink,
    rastreio: client.passport_tracking_code || processGroup?.passport_tracking_code || "",
    videoCallDateTime: processGroup?.video_call_date || client.video_call_date || "",
      origin,
      passaporteInstrucoesUrl: `${origin}/passaporte-instrucoes`
  });

  return Response.json({
    templates: EMAIL_TEMPLATES,
    templateId,
    toEmail: client.email || "",
    ccEmail: client.secondary_email || "",
    toName: client.name || "",
    subject: template.subject,
    html: template.html,
    text: template.text,
    plainText: template.text || htmlToPlainText(template.html)
  }, { headers: { "Cache-Control": "no-store" } });
}
