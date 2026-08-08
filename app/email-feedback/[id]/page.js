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

export default async function EmailFeedbackPage({ params }) {
  const resolvedParams = await params;

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
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || envSiteUrl || currentSiteUrl || "https://app.resumindoviagens.com.br";

  const feedbackLink = await ensureFeedbackLink(client, siteUrl);
  const selectedTemplate = getEmailTemplate("pesquisa_satisfacao", client, {
    feedbackLink,
    formLink: client.access_token ? `${siteUrl}/acesso/${client.access_token}` : "",
    preparationLink: client.access_token ? `${siteUrl}/preparacao/${client.access_token}` : "",
    rastreio: client.passport_tracking_code || ""
  });

  return (
    <main style={{ margin: 0, padding: 24, background: "#ffffff", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div dangerouslySetInnerHTML={{ __html: selectedTemplate.html }} />
    </main>
  );
}
