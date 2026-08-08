import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { hasClientAccess } from "../../../../lib/clientAuth";

async function getClientByToken(token) {
  const { data: client, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("access_token", token)
    .maybeSingle();

  if (error || !client) return { error: "Link inválido ou expirado." };
  return { client };
}

export async function GET(request, context) {
  const params = await context.params;

  const verified = await hasClientAccess(params.token);
  if (!verified) {
    return Response.json({ error: "Confirme CPF e data de nascimento para continuar.", needs_verification: true }, { status: 401 });
  }

  const { client, error } = await getClientByToken(params.token);
  if (error) return Response.json({ error }, { status: 404 });

  let { data: response } = await supabaseAdmin
    .from("form_responses")
    .select("*")
    .eq("client_id", client.id)
    .maybeSingle();

  if (!response) {
    const inserted = await supabaseAdmin
      .from("form_responses")
      .insert({ client_id: client.id, answers: {} })
      .select("*")
      .single();
    response = inserted.data;
  }

  await supabaseAdmin.from("audit_logs").insert({
    client_id: client.id,
    action: "client_opened_form",
    details: {}
  });

  return Response.json({
    client: { id: client.id, name: client.name, status: client.status, is_locked: client.is_locked },
    response: { answers: response?.answers || {}, submitted_at: response?.submitted_at || null }
  });
}

export async function PUT(request, context) {
  const params = await context.params;

  const verified = await hasClientAccess(params.token);
  if (!verified) {
    return Response.json({ error: "Confirmação de identidade necessária.", needs_verification: true }, { status: 401 });
  }

  const { client, error } = await getClientByToken(params.token);
  if (error) return Response.json({ error }, { status: 404 });

  const body = await request.json();
  const answers = body.answers || {};

  const existing = await supabaseAdmin
    .from("form_responses")
    .select("id, submitted_at")
    .eq("client_id", client.id)
    .maybeSingle();

  if (client.is_locked || existing.data?.submitted_at) {
    return Response.json({ error: "Formulário já enviado e bloqueado." }, { status: 403 });
  }

  if (!existing.data) {
    const { error: insertError } = await supabaseAdmin
      .from("form_responses")
      .insert({ client_id: client.id, answers });
    if (insertError) return Response.json({ error: insertError.message }, { status: 500 });
  } else {
    const { error: updateError } = await supabaseAdmin
      .from("form_responses")
      .update({ answers, updated_at: new Date().toISOString() })
      .eq("client_id", client.id);
    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
  }

  await supabaseAdmin.from("clients").update({ status: "in_progress", updated_at: new Date().toISOString() }).eq("id", client.id);
  await supabaseAdmin.from("audit_logs").insert({ client_id: client.id, action: "client_saved_form", details: {} });

  return Response.json({ ok: true });
}
