import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../lib/auth";
import { createAccessToken } from "../../../../../lib/tokens";

function cleanCPF(value) {
  return (value || "").replace(/\D/g, "");
}

export async function PATCH(request, context) {
  const params = await context.params;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const updates = {};

  if (body.action === "unlock") {
    updates.is_locked = false;
    updates.status = "in_progress";
    await supabaseAdmin.from("form_responses").update({ submitted_at: null }).eq("client_id", params.id);
  }

  if (body.action === "new_token") updates.access_token = createAccessToken();
  if (body.action === "mark_completed") updates.is_completed = true;
  if (body.action === "reopen") updates.is_completed = false;

  if (body.action === "update_details") {
    if (!body.name || !body.cpf || !body.birth_date) {
      return Response.json({ error: "Nome, CPF e data de nascimento são obrigatórios." }, { status: 400 });
    }
    updates.name = body.name;
    updates.cpf = cleanCPF(body.cpf);
    updates.birth_date = body.birth_date;
    updates.phone = body.phone || "";
    updates.email = body.email || "";
    updates.notes = body.notes || "";
    updates.family_group = body.family_group || "";
    updates.no_form_required = !!body.no_form_required;
    updates.is_renewal = !!body.is_renewal;
  }

  if (body.action === "update_schedule") {
    updates.interview_date = body.interview_date || null;
    updates.casv_date = body.casv_date || null;
    updates.video_call_date = body.video_call_date || null;
    updates.consulate_city = body.consulate_city || "";
    updates.passport_tracking_code = body.passport_tracking_code || "";
    updates.client_sedex_tracking = body.client_sedex_tracking || "";
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("clients")
    .update(updates)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("audit_logs").insert({
    client_id: params.id,
    action: body.action || "client_updated",
    details: updates
  });

  return Response.json({ client: data });
}

export async function DELETE(request, context) {
  const params = await context.params;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { error } = await supabaseAdmin.from("clients").delete().eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
