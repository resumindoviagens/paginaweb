export const dynamic = "force-dynamic";
export const revalidate = 0;

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import FeedbackForm from "./FeedbackForm";

export default async function FeedbackPage({ params }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("id, name, feedback_token, feedback_token_expires_at, feedback_service, tipo_processo")
    .eq("feedback_token", token)
    .maybeSingle();

  if (!client) {
    return <main style={{ fontFamily: "Arial, Helvetica, sans-serif", padding: 30 }}>Pesquisa não encontrada ou não liberada.</main>;
  }

  if (client.feedback_token_expires_at && new Date(client.feedback_token_expires_at) < new Date()) {
    return <main style={{ fontFamily: "Arial, Helvetica, sans-serif", padding: 30 }}>Este link de pesquisa expirou.</main>;
  }

  return <FeedbackForm token={token} clientName={client.name || "cliente"} service={client.feedback_service || (client.tipo_processo === "Passaporte" ? "passaporte" : "visto")} />;
}
