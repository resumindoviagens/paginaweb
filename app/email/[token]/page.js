export const dynamic = "force-dynamic";
export const revalidate = 0;

import { headers } from "next/headers";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getEmailTemplate } from "../../../lib/emailTemplates";
import { randomBytes } from "crypto";


function makeFeedbackToken() {
  return randomBytes(24).toString("hex");
}

async function ensureFeedbackLink(client, siteUrl) {
  let token = client.feedback_token;
  if (!token) {
    token = makeFeedbackToken();
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    await supabaseAdmin
      .from("clients")
      .update({
        feedback_liberado: true,
        feedback_token: token,
        feedback_token_expires_at: expires.toISOString()
      })
      .eq("id", client.id);
  }
  return `${siteUrl}/feedback/${token}`;
}

export default async function EmailModelPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const token = resolvedParams.token;
  const templateId = resolvedSearchParams?.template || "formulario";

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("*")
    .or(`access_token.eq.${token},id.eq.${token}`)
    .maybeSingle();

  if (!client) {
    return <main style={{ fontFamily: "Arial, Helvetica, sans-serif", padding: 30 }}>Link inválido.</main>;
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || "https";
  const currentSiteUrl = host ? `${protocol}://${host}` : "";
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || envSiteUrl || currentSiteUrl || "https://app.resumindoviagens.com.br";
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
  const feedbackLink = templateId === "pesquisa_satisfacao" ? await ensureFeedbackLink(client, siteUrl) : "";

  let selectedTemplate;
  try {
    selectedTemplate = getEmailTemplate(templateId, clientWithGroup, { formLink, preparationLink, feedbackLink, rastreio: client.passport_tracking_code || processGroup?.passport_tracking_code || "", videoCallDateTime: processGroup?.video_call_date || client.video_call_date || "" });
  } catch (error) {
    selectedTemplate = getEmailTemplate("formulario", clientWithGroup, { formLink, preparationLink, rastreio: client.passport_tracking_code || processGroup?.passport_tracking_code || "", videoCallDateTime: processGroup?.video_call_date || client.video_call_date || "" });
  }

  return (
    <main style={{ margin: 0, padding: 24, background: "#ffffff", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div dangerouslySetInnerHTML={{ __html: selectedTemplate.html }} />
    </main>
  );
}
