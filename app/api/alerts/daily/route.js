import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { sendInternalAlert, simpleHtml } from "../../../../lib/brevoEmail";
import { sendCasvVideoPlanningICS } from "../../../../lib/agendaAutomation";

function daysUntil(dateValue) {
  if (!dateValue) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateValue}T00:00:00`);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function fmtDays(days) {
  if (days === 0) return "hoje";
  if (days === 1) return "amanhã";
  return `em ${days} dias`;
}

function isPassportProcess(client) {
  return String(client?.tipo_processo || "").toLowerCase().includes("passaporte");
}

function addAlert(alerts, dismissed, key, text) {
  if (!dismissed.has(key)) alerts.push({ key, text });
}

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("x-cron-secret") || new URL(request.url).searchParams.get("secret");
  const vercelCron = request.headers.get("x-vercel-cron");
  if (secret && provided !== secret && !vercelCron) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { data: dismissedRows } = await supabaseAdmin
    .from("admin_alert_dismissals")
    .select("alert_key");

  const dismissed = new Set((dismissedRows || []).map((item) => item.alert_key));

  const { data: clients, error: clientsError } = await supabaseAdmin.from("clients").select("*");
  if (clientsError) return Response.json({ error: clientsError.message }, { status: 500 });

  const { data: groups } = await supabaseAdmin.from("grupos_processo").select("*");
  const groupsById = (groups || []).reduce((acc, group) => { acc[group.id] = group; return acc; }, {});

  const alerts = [];
  const usedGroups = new Set();
  const agendaResults = [];

  for (const client of clients || []) {
    const group = client.group_process_id ? groupsById[client.group_process_id] : null;
    const label = group ? `Grupo de processo: ${group.nome}` : `Cliente: ${client.name}`;

    // Agenda interna para marcar videochamada 20 dias antes do CASV.
    // Enviada no mesmo horário do alerta diário, nunca imediatamente ao salvar datas.
    if (client.casv_date && !client.group_process_id) {
      try {
        const result = await sendCasvVideoPlanningICS(client, { mode: "daily_alert_cron" });
        if (result?.sent) agendaResults.push({ client_id: client.id, name: client.name, type: "casv_video_planning", result });
      } catch (error) {
        agendaResults.push({ client_id: client.id, name: client.name, type: "casv_video_planning", error: error?.message || String(error) });
      }

      const casvForVideo = daysUntil(client.casv_date);
      if (casvForVideo !== null && casvForVideo >= 0 && casvForVideo <= 20 && !client.video_call_date) {
        addAlert(alerts, dismissed, `marcar-videochamada-${client.id}-${client.casv_date}`, `${label} — MARCAR DATA VIDEOCHAMADA com cliente — CASV ${fmtDays(casvForVideo)}`);
      }
    }

    if (group) {
      if (!usedGroups.has(group.id)) {
        usedGroups.add(group.id);
        const interview = daysUntil(group.interview_date);
        const casv = daysUntil(group.casv_date);
        const video = daysUntil(group.video_call_date);

        if (interview !== null && interview >= 0 && interview <= 7) {
          addAlert(alerts, dismissed, `interview-${group.id}-${group.interview_date}`, `${label} — entrevista ${fmtDays(interview)}${group.consulate_city ? ` — ${group.consulate_city}` : ""}`);
        }
        if (casv !== null && casv >= 0 && casv <= 3) {
          addAlert(alerts, dismissed, `casv-${group.id}-${group.casv_date}`, `${label} — CASV ${fmtDays(casv)}`);
        }
        if (video !== null && video >= 0 && video <= 2) {
          addAlert(alerts, dismissed, `video-${group.id}-${group.video_call_date}`, `${label} — videochamada ${fmtDays(video)}`);
        }
        if (casv !== null && casv >= 0 && casv <= 20 && !group.video_call_date) {
          addAlert(alerts, dismissed, `marcar-videochamada-grupo-${group.id}-${group.casv_date}`, `${label} — MARCAR DATA VIDEOCHAMADA com cliente — CASV ${fmtDays(casv)}`);
        }
      }
    } else {
      const interview = daysUntil(client.interview_date);
      const casv = daysUntil(client.casv_date);
      const video = daysUntil(client.video_call_date);

      if (interview !== null && interview >= 0 && interview <= 7) {
        addAlert(alerts, dismissed, `interview-${client.id}-${client.interview_date}`, `${label} — entrevista ${fmtDays(interview)}${client.consulate_city ? ` — ${client.consulate_city}` : ""}`);
      }
      if (casv !== null && casv >= 0 && casv <= 3) {
        addAlert(alerts, dismissed, `casv-${client.id}-${client.casv_date}`, `${label} — CASV ${fmtDays(casv)}`);
      }
      if (video !== null && video >= 0 && video <= 2) {
        addAlert(alerts, dismissed, `video-${client.id}-${client.video_call_date}`, `${label} — videochamada ${fmtDays(video)}`);
      }
    }

    if (client.status === "in_progress") {
      addAlert(alerts, dismissed, `form-started-${client.id}`, `Cliente: ${client.name} — formulário iniciado`);
    }
    if (client.status === "submitted" && !isPassportProcess(client)) {
      addAlert(alerts, dismissed, `form-submitted-${client.id}`, `Cliente: ${client.name} — formulário concluído`);
    }
    if (client.is_renewal && !client.client_sedex_tracking) {
      addAlert(alerts, dismissed, `renewal-sedex-${client.id}`, `Cliente: ${client.name} — renovação sem rastreio Sedex informado`);
    }
  }

  if (alerts.length > 0) {
    await sendInternalAlert({
      subject: "Alertas do dia — Resumindo Viagens",
      html: simpleHtml("Alertas do dia — Resumindo Viagens", alerts.map((item) => `• ${item.text}`)),
      text: alerts.map((item) => item.text).join("\n"),
      tags: ["resumindo-viagens", "alertas-diarios"]
    });
  }

  return Response.json({ ok: true, alerts, agendaResults });
}
