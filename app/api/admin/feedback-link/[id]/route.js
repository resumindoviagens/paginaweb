import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../lib/auth";
import { randomBytes } from "crypto";

function makeFeedbackToken() {
  return randomBytes(24).toString("hex");
}

function siteOrigin(request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
}

export async function POST(request, context) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const params = await context.params;
  const clientId = params.id;

  const { data: client, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (error || !client) {
    return Response.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  const isPassport = client.tipo_processo === "Passaporte" || client.feedback_service === "passaporte";
  const canFeedback = isPassport
    ? (client.stage_passport_picked_up || client.stage_passport_ready || client.is_completed || client.stage_ready_to_archive)
    : (client.stage_passport_returned || client.is_completed || client.stage_ready_to_archive);

  if (!canFeedback) {
    return Response.json({ error: isPassport ? "A pesquisa de passaporte só fica disponível após passaporte disponível/retirado." : "A pesquisa só fica disponível após Visto/passaporte devolvido." }, { status: 400 });
  }

  let token = client.feedback_token;
  if (!token) {
    token = makeFeedbackToken();
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + 60);

  const { error: updateError } = await supabaseAdmin
    .from("clients")
    .update({
      feedback_liberado: true,
      feedback_token: token,
      feedback_token_expires_at: expires.toISOString(),
      stage_feedback_sent: true,
      feedback_service: isPassport ? "passaporte" : (String(client.tipo_processo || "").toLowerCase().includes("canad") ? "canadense" : (client.feedback_service || "visto"))
    })
    .eq("id", client.id);

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 });
  }

  await supabaseAdmin.from("audit_logs").insert({
    client_id: client.id,
    action: "feedback_link_generated",
    details: { source: "admin", expires_at: expires.toISOString() }
  });

  return Response.json({
    ok: true,
    feedbackToken: token,
    feedbackLink: `${siteOrigin(request)}/feedback/${token}`
  });
}
