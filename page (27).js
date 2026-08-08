import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../lib/auth";
import { createAccessToken } from "../../../../../lib/tokens";
import { sendInternalAlert, simpleHtml } from "../../../../../lib/brevoEmail";

function cleanCPF(value) {
  return (value || "").replace(/\D/g, "");
}

export async function PATCH(request, context) {
  const params = await context.params;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const updates = {};

  const { data: oldClient } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

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
    updates.group_process_id = body.group_process_id || null;
    updates.no_form_required = !!body.no_form_required;
    updates.is_renewal = !!body.is_renewal;
    updates.client_sedex_tracking = body.client_sedex_tracking || "";
    updates.tipo_processo = body.tipo_processo || (body.is_renewal ? "Renovação" : (body.tipo_processo || ""));
    updates.data_inicio_processo = body.data_inicio_processo || null;
    updates.data_final_processo = body.data_final_processo || null;
    updates.observacoes_gerais = body.observacoes_gerais || "";
  }

  if (body.action === "update_schedule") {
    updates.interview_date = body.interview_date || null;
    updates.casv_date = body.casv_date || null;
    updates.video_call_date = body.video_call_date || null;
    updates.consulate_city = body.consulate_city || "";
    updates.passport_tracking_code = body.passport_tracking_code || "";
    // O rastreio Sedex do cliente e o checkbox de renovação ficam em Editar dados.
    if (typeof body.client_sedex_tracking !== "undefined") updates.client_sedex_tracking = body.client_sedex_tracking || "";
    if (typeof body.is_renewal !== "undefined") updates.is_renewal = !!body.is_renewal;
  }

  if (body.action === "update_process_steps") {
    updates.stage_ds160_completed = !!body.stage_ds160_completed;
    updates.stage_fee_generated = !!body.stage_fee_generated;
    updates.stage_fee_paid = !!body.stage_fee_paid;
    updates.stage_dates_scheduled = !!body.stage_dates_scheduled;
    updates.stage_interview_done = !!body.stage_interview_done;
    updates.visa_result = body.visa_result || null;
    updates.stage_passport_returned = !!body.stage_passport_returned;
    if (updates.stage_passport_returned && !oldClient?.data_final_processo) {
      updates.data_final_processo = new Date().toISOString().slice(0, 10);
    }
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

  if (body.action === "update_schedule" && updates.video_call_date && updates.video_call_date !== oldClient?.video_call_date) {
    try {
      await sendInternalAlert({
        subject: `Videochamada agendada — ${data.name}`,
        html: simpleHtml(`Videochamada agendada — ${data.name}`, [
          `Foi informada/alterada a data de videochamada do cliente <strong>${data.name}</strong>.`,
          `<strong>Data da videochamada:</strong> ${updates.video_call_date}`,
          `<strong>CPF:</strong> ${data.cpf || "-"}<br /><strong>E-mail:</strong> ${data.email || "-"}<br /><strong>Telefone:</strong> ${data.phone || "-"}`
        ]),
        text: `Videochamada agendada para ${data.name}: ${updates.video_call_date}`,
        tags: ["resumindo-viagens", "alerta-videochamada"]
      });
      await supabaseAdmin.from("audit_logs").insert({ client_id: params.id, action: "internal_email_sent", details: { tipo: "videochamada", video_call_date: updates.video_call_date } });
    } catch (emailError) {
      await supabaseAdmin.from("audit_logs").insert({ client_id: params.id, action: "internal_email_failed", details: { tipo: "videochamada", error: emailError.message } });
    }
  }

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
