import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { hasClientAccess } from "../../../../../lib/clientAuth";

export async function POST(request, context) {
  const params = await context.params;

  const verified = await hasClientAccess(params.token);
  if (!verified) {
    return Response.json({ error: "Confirmação de identidade necessária.", needs_verification: true }, { status: 401 });
  }

  const { data: client, error: clientError } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("access_token", params.token)
    .maybeSingle();

  if (clientError || !client) return Response.json({ error: "Link inválido." }, { status: 404 });
  if (client.is_locked) return Response.json({ error: "Formulário já enviado e bloqueado." }, { status: 403 });

  const body = await request.json();
  const answers = body.answers || {};

  const { error: responseError } = await supabaseAdmin
    .from("form_responses")
    .upsert({
      client_id: client.id,
      answers,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: "client_id" });

  if (responseError) return Response.json({ error: responseError.message }, { status: 500 });

  const { error: updateError } = await supabaseAdmin
    .from("clients")
    .update({ status: "submitted", is_locked: true, updated_at: new Date().toISOString() })
    .eq("id", client.id);

  if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

  await supabaseAdmin.from("audit_logs").insert({ client_id: client.id, action: "client_submitted_form", details: {} });

  return Response.json({ ok: true });
}
