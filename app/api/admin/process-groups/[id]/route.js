import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../lib/auth";
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

export async function PATCH(request, context) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const params = await context.params;
  const body = await request.json();

  const { data: oldGroup } = await supabaseAdmin
    .from("grupos_processo")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  const city = body.consulate_city || oldGroup?.consulate_city || "";
  const singleAppointment = isSingleAppointmentCity(city);
  const updates = {
    nome: body.nome,
    consulate_city: city,
    casv_datetime: singleAppointment ? null : (body.casv_datetime || null),
    interview_datetime: body.interview_datetime || null,
    casv_date: singleAppointment ? null : ((body.casv_datetime || body.casv_date) ? String(body.casv_datetime || body.casv_date).slice(0,10) : null),
    interview_date: (body.interview_datetime || body.interview_date) ? String(body.interview_datetime || body.interview_date).slice(0,10) : null,
    video_call_date: body.video_call_date || null,
    passport_tracking_code: body.passport_tracking_code || "",
    data_inicio_processo: body.data_inicio_processo || null,
    ds160_travel_date: body.ds160_travel_date || null,
    ds160_trip_duration_days: body.ds160_trip_duration_days ? Number(body.ds160_trip_duration_days) : null,
    ds160_destination_city: body.ds160_destination_city || "",
    ds160_selected_hotel_name: body.ds160_selected_hotel_name || "",
    ds160_selected_hotel_address: body.ds160_selected_hotel_address || "",
    ds160_selected_hotel_phone: body.ds160_selected_hotel_phone || "",
    ds160_common_notes: body.ds160_common_notes || "",
    ds160_common_security_answers: body.ds160_common_security_answers || "",
    updated_at: new Date().toISOString()
  };
  Object.keys(updates).forEach((key) => typeof updates[key] === "undefined" && delete updates[key]);

  const { data, error } = await supabaseAdmin
    .from("grupos_processo")
    .update(updates)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const scheduleComplete = singleAppointment
    ? !!updates.interview_datetime
    : !!updates.casv_datetime && !!updates.interview_datetime;

  const sharedClientUpdates = {
    consulate_city: updates.consulate_city,
    casv_datetime: updates.casv_datetime,
    interview_datetime: updates.interview_datetime,
    casv_date: updates.casv_date,
    interview_date: updates.interview_date,
    video_call_date: updates.video_call_date,
    passport_tracking_code: updates.passport_tracking_code,
    data_inicio_processo: updates.data_inicio_processo,
    stage_dates_scheduled: scheduleComplete,
    updated_at: new Date().toISOString()
  };

  const { error: membersUpdateError } = await supabaseAdmin
    .from("clients")
    .update(sharedClientUpdates)
    .eq("group_process_id", params.id);

  if (membersUpdateError) {
    return Response.json({ error: `Grupo salvo, mas houve falha ao sincronizar os clientes: ${membersUpdateError.message}` }, { status: 500 });
  }

  const scheduleChanged =
    updates.casv_datetime !== oldGroup?.casv_datetime ||
    updates.interview_datetime !== oldGroup?.interview_datetime ||
    updates.video_call_date !== oldGroup?.video_call_date;

  if (scheduleChanged) {
    const { data: master } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("group_process_id", params.id)
      .eq("grupo_familiar_master", true)
      .limit(1)
      .maybeSingle();

    if (master?.id) {
      await supabaseAdmin.from("clients").update({ agenda_email_pending_at: new Date().toISOString() }).eq("id", master.id);
    }
  }

  // V121C: envio imediato pelo contato principal do grupo.
  // O cron diário fica apenas como recuperação de falhas e para lembretes.
  let agendaAutomation = null;
  if (scheduleChanged) {
    try {
      const { data: masterClient } = await supabaseAdmin
        .from("clients")
        .select("*")
        .eq("group_process_id", params.id)
        .eq("grupo_familiar_master", true)
        .limit(1)
        .maybeSingle();

      if (masterClient) {
        const agendaCliente = await sendClientAgendaEmail(masterClient, { mode: "immediate_after_group_save", onlyMissing: true });
        const agendaInterna = await sendInternalAgendaICS(masterClient, { mode: "immediate_after_group_save" });
        agendaAutomation = { ok: true, agendaCliente, agendaInterna };

        await supabaseAdmin.from("audit_logs").insert({
          client_id: masterClient.id,
          action: "agenda_automation_after_group_schedule_save",
          details: { group_process_id: params.id, ...agendaAutomation }
        });
      } else {
        agendaAutomation = {
          ok: false,
          error: "Grupo sem contato principal definido.",
          recovery: "O cron diário tentará novamente quando houver contato principal."
        };
      }
    } catch (agendaError) {
      agendaAutomation = {
        ok: false,
        error: agendaError?.message || String(agendaError),
        recovery: "O cron diário tentará novamente."
      };
    }
  }

  return Response.json({ group: data, agendaAutomation });
}

export async function DELETE(request, context) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const params = await context.params;

  await supabaseAdmin.from("clients").update({ group_process_id: null }).eq("group_process_id", params.id);
  const { error } = await supabaseAdmin.from("grupos_processo").delete().eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
