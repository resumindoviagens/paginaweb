export const dynamic = "force-dynamic";
export const revalidate = 0;

import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getEmailTemplate } from "../../../lib/emailTemplates";

function makeFeedbackToken() {
  return randomBytes(24).toString("hex");
}

async function ensureFeedbackLink(client, siteUrl) {
  let token = client.feedback_token;

  if (!token) {
    token = makeFeedbackToken();
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + 60);

  await supabaseAdmin
    .from("clients")
    .update({
      feedback_liberado: true,
      feedback_token: token,
      feedback_token_expires_at: expires.toISOString(),
      stage_feedback_sent: true
    })
    .eq("id", client.id);

  return `${siteUrl}/feedback/${token}`;
}

export default async function EmailPreviewPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const templateId = resolvedSearch?.template || "envio_formulario";

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("id", resolvedParams.id)
    .maybeSingle();

  if (!client) {
    return <main style={{ fontFamily: "Arial, Helvetica, sans-serif", padding: 30 }}>Cliente não encontrado.</main>;
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || "https";
  const currentSiteUrl = host ? `${protocol}://${host}` : "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || currentSiteUrl || "https://app.resumindoviagens.com.br";

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
  const formLink = client.access_token ? `${siteUrl}/acesso/${client.access_token}` : "";
  const preparationLink = `${siteUrl}/preparacao/${client.access_token || client.id}`;
  const feedbackLink = templateId === "pesquisa_satisfacao"
    ? await ensureFeedbackLink(client, siteUrl)
    : (client.feedback_token ? `${siteUrl}/feedback/${client.feedback_token}` : "");

  const selectedTemplate = getEmailTemplate(templateId, clientWithGroup, {
    formLink,
    preparationLink,
    feedbackLink,
    rastreio: client.passport_tracking_code || processGroup?.passport_tracking_code || "",
    videoCallDateTime: processGroup?.video_call_date || client.video_call_date || ""
  });

  return (
    <main style={{ margin: 0, padding: 24, background: "#ffffff", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div dangerouslySetInnerHTML={{ __html: selectedTemplate.html }} />
    </main>
  );
}
