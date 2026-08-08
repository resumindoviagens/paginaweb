import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../lib/auth";
import { createAccessToken } from "../../../../../lib/tokens";
import { buildICS, sendWithBrevo, simpleHtml } from "../../../../../lib/brevoEmail";
import { sendClientAgendaEmail, sendInternalAgendaICS } from "../../../../../lib/agendaAutomation";
import { formatBrasiliaDateTime } from "../../../../../lib/brasiliaDateTime";

function icsAttachment({ title, description, location, start }) {
  const ics = buildICS({ title, description, location, start });
  return {
    name: "videochamada-resumindo.ics",
    content: Buffer.from(ics, "utf-8").toString("base64")
  };
}

function fmtDateTime(value) {
  return formatBrasiliaDateTime(value);
}


function isSingleAppointmentCity(city = "") {
  const value = String(city || "").trim().toLowerCase();
  return value.includes("recife") || value.includes("porto alegre");
}

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

  if (body.action === "new_token" && oldClient?.no_form_required) {
    return Response.json({ error: "Cadastro de controle não possui link de formulário." }, { status: 400 });
  }
  if (body.action === "new_token") updates.access_token = createAccessToken();
  if (body.action === "mark_completed") updates.is_completed = true;
  if (body.action === "reopen") updates.is_completed = false;
  if (body.action === "move_legacy_completed") {
    updates.legacy_import = false;
    updates.is_completed = true;
  }

  if (body.action === "update_details") {
    if (!body.name || !body.cpf || !body.birth_date) {
      return Response.json({ error: "Nome, CPF e data de nascimento são obrigatórios." }, { status: 400 });
    }
    updates.name = body.name;
    updates.cpf = cleanCPF(body.cpf);
    updates.birth_date = body.birth_date;
    updates.phone = body.phone || "";
    updates.email = body.email || "";
    updates.secondary_email = body.secondary_email || "";
    updates.passport_expiration_date = body.passport_expiration_date || null;
    const canSaveVisaExpiration = (oldClient?.visa_result === "approved" && !!oldClient?.stage_passport_returned) || (body.visa_result === "approved" && !!body.stage_passport_returned);
    if (canSaveVisaExpiration || typeof body.visa_expiration_date !== "undefined") updates.visa_expiration_date = body.visa_expiration_date || null;
    updates.notes = body.notes || "";
    updates.family_group = body.family_group || "";
    updates.group_process_id = body.group_process_id || null;
    updates.no_form_required = !!body.no_form_required;
    if (updates.no_form_required) updates.access_token = null;
    if (!updates.no_form_required && !oldClient?.access_token) updates.access_token = createAccessToken();
    updates.is_renewal = !!body.is_renewal;
    updates.client_sedex_tracking = body.client_sedex_tracking || "";
    updates.tipo_processo = body.tipo_processo || (body.is_renewal ? "Renovação" : (body.tipo_processo || ""));
    updates.feedback_service = updates.tipo_processo === "Passaporte" ? "passaporte" : (String(updates.tipo_processo || "").toLowerCase().includes("canad") ? "canadense" : "visto");
    updates.observacoes_gerais = body.observacoes_gerais || "";
    updates.grupo_familiar_master = !!body.grupo_familiar_master;
    updates.sincronizar_com_grupo = body.sincronizar_com_grupo !== false;
    updates.grupo_familiar_master_id = body.grupo_familiar_master ? null : (body.grupo_familiar_master_id || null);
  }

  if (body.action === "update_schedule") {
    const singleAppointment = isSingleAppointmentCity(body.consulate_city || oldClient?.consulate_city || "");
    updates.interview_datetime = body.interview_datetime || null;
    updates.casv_datetime = singleAppointment ? null : (body.casv_datetime || null);
    updates.interview_date = updates.interview_datetime ? String(updates.interview_datetime).slice(0, 10) : (body.interview_date || null);
    updates.casv_date = updates.casv_datetime ? String(updates.casv_datetime).slice(0, 10) : (singleAppointment ? null : (body.casv_date || null));
    updates.video_call_date = body.video_call_date || null;
    updates.consulate_city = body.consulate_city || "";
    updates.passport_tracking_code = body.passport_tracking_code || "";
    if (typeof body.data_inicio_processo !== "undefined") updates.data_inicio_processo = body.data_inicio_processo || null;
    const scheduleComplete = singleAppointment
      ? !!updates.interview_datetime
      : !!updates.casv_datetime && !!updates.interview_datetime;
    updates.stage_dates_scheduled = scheduleComplete;
    if (body.video_call_date) updates.stage_video_call_scheduled = true;
    // O rastreio Sedex do cliente e o checkbox de renovação ficam em Editar dados.
    if (typeof body.client_sedex_tracking !== "undefined") updates.client_sedex_tracking = body.client_sedex_tracking || "";
    if (typeof body.is_renewal !== "undefined") updates.is_renewal = !!body.is_renewal;
    if (typeof body.passport_pf_city !== "undefined") updates.passport_pf_city = body.passport_pf_city || "";
    if (typeof body.passport_pf_location !== "undefined") updates.passport_pf_location = body.passport_pf_location || "";
    if (typeof body.passport_pf_datetime !== "undefined") updates.passport_pf_datetime = body.passport_pf_datetime || null;
    if (typeof body.passport_gru_paid_at !== "undefined") updates.passport_gru_paid_at = body.passport_gru_paid_at || null;
    if (typeof body.passport_protocol !== "undefined") updates.passport_protocol = String(body.passport_protocol || "").trim();
    if (
      body.casv_datetime !== oldClient?.casv_datetime ||
      body.interview_datetime !== oldClient?.interview_datetime ||
      body.casv_date !== oldClient?.casv_date ||
      body.interview_date !== oldClient?.interview_date ||
      body.video_call_date !== oldClient?.video_call_date ||
      body.passport_pf_datetime !== oldClient?.passport_pf_datetime
    ) {
      updates.agenda_email_pending_at = new Date().toISOString();
    }
  }

  if (body.action === "update_operation") {
    updates.ds160_number = body.ds160_number || "";
    updates.passport_display_name = body.passport_display_name || "";
    updates.passport_surname = body.passport_surname || "";
    updates.ds160_individual_notes = body.ds160_individual_notes || "";
  }

  if (body.action === "update_process_steps") {
    updates.status = body.status || oldClient?.status || "not_started";
    updates.stage_ds160_completed = !!body.stage_ds160_completed;
    updates.stage_fee_generated = !!body.stage_fee_generated;
    updates.stage_fee_paid = !!body.stage_fee_paid;
    updates.stage_dates_scheduled = !!body.stage_dates_scheduled;
    updates.stage_video_call_scheduled = !!body.stage_video_call_scheduled;
    updates.stage_video_call_done = !!body.stage_video_call_done;
    updates.stage_interview_done = !!body.stage_interview_done;
    updates.visa_result = body.visa_result || null;
    updates.stage_passport_returned = !!body.stage_passport_returned;
    updates.stage_feedback_sent = !!body.stage_feedback_sent;
    updates.stage_feedback_posted = !!body.stage_feedback_posted;
    updates.stage_ready_to_archive = !!body.stage_ready_to_archive;
    updates.stage_passport_docs_email_sent = !!body.stage_passport_docs_email_sent;
    updates.stage_passport_form_filled = !!body.stage_passport_form_filled;
    updates.stage_passport_instructions_sent = !!body.stage_passport_instructions_sent;
    updates.stage_passport_pf_done = !!body.stage_passport_pf_done;
    updates.stage_passport_ready = !!body.stage_passport_ready;
    updates.stage_passport_picked_up = !!body.stage_passport_picked_up;
    if (typeof body.is_completed !== "undefined") updates.is_completed = !!body.is_completed;
    if ((updates.stage_passport_returned || updates.stage_ready_to_archive || body.visa_result === "denied") && !oldClient?.data_final_processo) {
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

  // V121C: no plano Hobby, o cron só pode executar uma vez ao dia.
  // Por isso, a agenda é enviada imediatamente após o salvamento.
  // Falhas da Brevo não desfazem nem bloqueiam os dados já gravados.
  let agendaAutomation = null;
  if (body.action === "update_schedule" && updates.agenda_email_pending_at) {
    try {
      const agendaCliente = await sendClientAgendaEmail(data, { mode: "immediate_after_save", onlyMissing: true });
      const agendaInterna = await sendInternalAgendaICS(data, { mode: "immediate_after_save" });
      agendaAutomation = { ok: true, agendaCliente, agendaInterna };

      await supabaseAdmin.from("audit_logs").insert({
        client_id: params.id,
        action: "agenda_automation_after_schedule_save",
        details: agendaAutomation
      });
    } catch (agendaError) {
      agendaAutomation = {
        ok: false,
        error: agendaError?.message || String(agendaError),
        recovery: "O cron diário tentará novamente."
      };

      await supabaseAdmin.from("audit_logs").insert({
        client_id: params.id,
        action: "agenda_automation_after_schedule_save_failed",
        details: agendaAutomation
      });
    }
  }

  if (body.action === "update_schedule" && updates.casv_datetime && updates.casv_datetime !== oldClient?.casv_datetime) {
    await supabaseAdmin.from("audit_logs").insert({
      client_id: params.id,
      action: "casv_video_planning_scheduled_for_daily_cron",
      details: {
        casv_datetime: updates.casv_datetime,
        message: "O compromisso interno de marcar videochamada será enviado no cron diário, 20 dias antes do CASV."
      }
    });
  }

  return Response.json({ client: data, agendaAutomation });
}

export async function DELETE(request, context) {
  const params = await context.params;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { error } = await supabaseAdmin.from("clients").delete().eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  
return Response.json({ ok: true });
}
