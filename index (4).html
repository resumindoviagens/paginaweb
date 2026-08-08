import { headers } from "next/headers";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getEmailTemplate } from "../../../lib/emailTemplates";

export default async function EmailModelPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const token = resolvedParams.token;
  const templateId = resolvedSearchParams?.template || "formulario";

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("access_token", token)
    .maybeSingle();

  if (!client) {
    return <main style={{ fontFamily: "Arial, Helvetica, sans-serif", padding: 30 }}>Link inválido.</main>;
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || "https";
  const currentSiteUrl = host ? `${protocol}://${host}` : "";
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const siteUrl = envSiteUrl || currentSiteUrl;
  const formLink = `${siteUrl}/acesso/${client.access_token}`;

  let selectedTemplate;
  try {
    selectedTemplate = getEmailTemplate(templateId, client, { formLink, rastreio: client.passport_tracking_code || "" });
  } catch (error) {
    selectedTemplate = getEmailTemplate("formulario", client, { formLink, rastreio: client.passport_tracking_code || "" });
  }

  return (
    <main style={{ margin: 0, padding: 24, background: "#ffffff", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div dangerouslySetInnerHTML={{ __html: selectedTemplate.html }} />
    </main>
  );
}
