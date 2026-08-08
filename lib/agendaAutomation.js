import { supabaseAdmin } from "./supabaseAdmin";
import { buildICS, sendWithBrevo, simpleHtml } from "./brevoEmail";
import { addHoursBrasilia, brasiliaWallClockNowISO, brasiliaWallClockToInstant, formatBrasiliaDateTime, isValidBrasiliaDateTime } from "./brasiliaDateTime";

const INTERNAL_EMAIL = process.env.ALERT_EMAIL_TO || "contato@resumindoviagens.com.br";

function isPassport(client) {
  return String(client?.tipo_processo || "").toLowerCase().includes("passaporte");
}

function isRenewal(client) {
  return !!client?.is_renewal || String(client?.tipo_processo || "").toLowerCase().includes("renova");
}

function isSingleAppointmentCity(city = "") {
  const value = String(city || "").toLowerCase();
  return value.includes("recife") || value.includes("porto alegre");
}

function validDateTime(value) {
  if (!value || !String(value).includes("T")) return "";
  return isValidBrasiliaDateTime(value) ? value : "";
}

function appointmentDateTime(client, type) {
  if (type === "casv") return validDateTime(client.casv_datetime);
  if (type === "interview") return validDateTime(client.interview_datetime);
  return "";
}

function addHours(value, hours = 1) {
  return addHoursBrasilia(value, hours);
}

function fmt(value) {
  return formatBrasiliaDateTime(value);
}

function eventKey(client, type, start, emailType = "") {
  // Arquivos ICS enviados antes da V122 podem carregar o horário deslocado.
  // A revisão no identificador permite enviar uma única cópia corrigida das
  // agendas futuras, sem repetir os lembretes comuns.
  const timezoneRevision = String(emailType).startsWith("agenda_") ? ":fuso-brasilia-v122" : "";
  return `${client.id}:${type}:${String(start || "").slice(0, 16)}${timezoneRevision}`;
}

export function agendaAttachmentsForClient(client, { reminder = false } = {}) {
  const events = agendaEventsForClient(client).filter((event) => !event.internalOnly);
  if (reminder) return [];
  return events.map(buildAttachment);
}

function buildAttachment(event) {
  const ics = buildICS({
    title: event.title,
    description: event.description,
    location: event.location,
    start: event.start,
    end: event.end || addHours(event.start, event.durationHours || 1),
    uid: event.uid
  });
  return {
    name: `${event.filename || event.type || "compromisso"}.ics`,
    content: Buffer.from(ics, "utf-8").toString("base64")
  };
}

export function agendaEventsForClient(client) {
  const events = [];

  if (isPassport(client)) {
    const start = client.passport_pf_datetime;
    if (start) {
      events.push({
        type: "passaporte_pf",
        uid: `resumindo-${client.id}-passaporte_pf@resumindoviagens.com.br`,
        filename: "agendamento-policia-federal",
        title: `Passaporte — Polícia Federal — ${client.name}`,
        description: `Atendimento para emissão de passaporte de ${client.name}. Confira documentos e instruções da Resumindo Viagens antes de comparecer.`,
        location: [client.passport_pf_location, client.passport_pf_city].filter(Boolean).join(" — "),
        start,
        durationHours: 1
      });
    }
  } else {
    const city = client.consulate_city || "";
    const single = isSingleAppointmentCity(city);
    const casvStart = appointmentDateTime(client, "casv");
    const interviewStart = appointmentDateTime(client, "interview");

    if (isRenewal(client)) {
      const start = casvStart || interviewStart;
      if (start) {
        events.push({
          type: "renovacao_casv",
        uid: `resumindo-${client.id}-renovacao_casv@resumindoviagens.com.br`,
          filename: "renovacao-casv",
          internalOnly: true,
          title: `Renovação de visto — CASV — ${client.name}`,
          description: `Compromisso operacional de renovação de visto de ${client.name}. Apenas controle interno da Resumindo Viagens.`,
          location: city || "CASV",
          start,
          durationHours: 1
        });
      }
    } else if (single) {
      const start = interviewStart;
      if (start) {
        events.push({
          type: "agendamento_unico",
        uid: `resumindo-${client.id}-agendamento_unico@resumindoviagens.com.br`,
          filename: "agendamento-unico",
          title: `Agendamento consular — ${client.name}`,
          description: `Compromisso único do processo de visto de ${client.name}. Leia novamente as orientações da Resumindo Viagens antes do comparecimento.`,
          location: city,
          start,
          durationHours: 1
        });
      }
    } else {
      if (casvStart) {
        const start = casvStart;
        events.push({
          type: "casv",
        uid: `resumindo-${client.id}-casv@resumindoviagens.com.br`,
          filename: "agendamento-casv",
          title: `CASV — ${client.name}`,
          description: `Comparecimento ao CASV no processo de visto de ${client.name}. Leia novamente as orientações da Resumindo Viagens antes do comparecimento.`,
          location: `CASV ${city || ""}`.trim(),
          start,
          durationHours: 1
        });
      }

      if (interviewStart) {
        const start = interviewStart;
        events.push({
          type: "consulado",
        uid: `resumindo-${client.id}-consulado@resumindoviagens.com.br`,
          filename: "agendamento-consulado",
          title: `Consulado — ${client.name}`,
          description: `Entrevista consular do processo de visto de ${client.name}. Leia novamente as orientações da Resumindo Viagens antes do comparecimento.`,
          location: city,
          start,
          durationHours: 1
        });
      }
    }
  }

  if (client.video_call_date) {
    events.push({
      type: "videochamada",
        uid: `resumindo-${client.id}-videochamada@resumindoviagens.com.br`,
      filename: "videochamada-resumindo",
      title: `Videochamada Resumindo Viagens — ${client.name}`,
      description: `Videochamada de preparação/orientação com a Resumindo Viagens para ${client.name}.`,
      location: "Online",
      start: client.video_call_date,
      durationHours: 1
    });
  }

  return events.filter((event) => event.start);
}

async function alreadySent(clientId, event, emailType, recipient) {
  const key = eventKey({ id: clientId }, event.type, event.start, emailType);
  const { data } = await supabaseAdmin
    .from("automation_email_logs")
    .select("id")
    .eq("client_id", clientId)
    .eq("event_key", key)
    .eq("email_type", emailType)
    .eq("recipient", recipient)
    .limit(1);
  return (data || []).length > 0;
}

async function logSent(clientId, event, emailType, recipient, mode = "manual") {
  const key = eventKey({ id: clientId }, event.type, event.start, emailType);
  await supabaseAdmin.from("automation_email_logs").upsert({
    client_id: clientId,
    event_key: key,
    event_type: event.type,
    email_type: emailType,
    recipient,
    send_mode: mode,
    sent_at: new Date().toISOString()
  }, { onConflict: "event_key,email_type,recipient" });
}

function clientSubject(client, events, reminder = false) {
  if (events.length === 1) {
    const type = events[0].type;
    if (reminder) return `Lembrete: compromisso amanhã — Resumindo Viagens`;
    if (type === "passaporte_pf") return "Passaporte — compromisso na Polícia Federal";
    if (type === "videochamada") return "Videochamada agendada — Resumindo Viagens";
    return "Agendamento confirmado — Resumindo Viagens";
  }
  return reminder ? "Lembrete: seus compromissos se aproximam" : "Compromissos agendados — Resumindo Viagens";
}

function htmlAgenda(client, events, reminder = false) {
  const lines = events.map((event) =>
    `<li><strong>${event.title}</strong><br />Data: ${fmt(event.start)}<br />Local: ${event.location || "-"}</li>`
  ).join("");

  return simpleHtml(reminder ? "Lembrete de compromisso" : "Compromisso agendado", [
    `Olá, <strong>${client.name}</strong>.`,
    reminder
      ? "Passando para lembrar do compromisso que se aproxima. Recomendamos revisar as orientações enviadas pela Resumindo Viagens."
      : "Segue o(s) compromisso(s) do seu processo. O email possui arquivo(s) .ics para você adicionar à agenda do celular/computador.",
    `<ul>${lines}</ul>`,
    "O alerta na agenda se baseia nas informações cadastradas no momento do envio. Sempre confira eventuais alterações diretamente nos documentos oficiais e mensagens posteriores.",
    `<a href="https://wa.me/5511981210932">Falar com a Resumindo Viagens no WhatsApp</a>`
  ]);
}

export async function sendClientAgendaEmail(client, { mode = "manual", onlyMissing = false } = {}) {
  if (!client?.email) return { skipped: "Cliente sem email." };
  const events = agendaEventsForClient(client).filter((event) => !event.internalOnly);
  if (events.length === 0) return { skipped: "Sem eventos para cliente." };

  const toSend = [];
  for (const event of events) {
    if (!onlyMissing || !(await alreadySent(client.id, event, "agenda_cliente", client.email))) toSend.push(event);
  }
  if (toSend.length === 0) return { skipped: "Já enviado." };

  const attachments = toSend.map(buildAttachment);
  await sendWithBrevo({
    toEmail: client.email,
    toName: client.name,
    ccEmail: client.secondary_email || "",
    subject: clientSubject(client, toSend, false),
    html: htmlAgenda(client, toSend, false),
    text: toSend.map((e) => `${e.title} - ${fmt(e.start)} - ${e.location || ""}`).join("\n"),
    tags: ["resumindo-viagens", "agenda-cliente"],
    attachments
  });

  for (const event of toSend) await logSent(client.id, event, "agenda_cliente", client.email, mode);
  await supabaseAdmin.from("clients").update({ agenda_email_pending_at: null }).eq("id", client.id);
  return { sent: toSend.length };
}

export async function sendInternalAgendaICS(client, { mode = "auto" } = {}) {
  const events = agendaEventsForClient(client);
  if (events.length === 0) return { skipped: "Sem eventos." };

  const toSend = [];
  for (const event of events) {
    if (!(await alreadySent(client.id, event, "agenda_interna", INTERNAL_EMAIL))) toSend.push(event);
  }
  if (toSend.length === 0) return { skipped: "Já enviado internamente." };

  await sendWithBrevo({
    toEmail: INTERNAL_EMAIL,
    toName: "Resumindo Viagens",
    subject: `ICS agenda — ${client.name}`,
    html: simpleHtml("Compromisso para sua agenda", [
      `Cliente: <strong>${client.name}</strong>`,
      `<ul>${toSend.map((event) => `<li>${event.title} — ${fmt(event.start)} — ${event.location || "-"}</li>`).join("")}</ul>`,
      "Este email é apenas para adicionar o(s) compromisso(s) à sua agenda. Os alertas operacionais continuam vindo pelo resumo diário."
    ]),
    text: toSend.map((e) => `${e.title} - ${fmt(e.start)} - ${e.location || ""}`).join("\n"),
    tags: ["resumindo-viagens", "agenda-interna"],
    attachments: toSend.map(buildAttachment)
  });

  for (const event of toSend) await logSent(client.id, event, "agenda_interna", INTERNAL_EMAIL, mode);
  return { sent: toSend.length };
}

function isWithinReminderWindow(start) {
  const now = new Date();
  const eventDate = brasiliaWallClockToInstant(start);
  if (!eventDate) return false;
  const diff = eventDate.getTime() - now.getTime();
  return diff > 0 && diff <= 30 * 60 * 60 * 1000; // até 30h antes, cobrindo execução diária
}

export async function sendClientReminders(client, { mode = "auto" } = {}) {
  if (!client?.email) return { skipped: "Cliente sem email." };
  if (isRenewal(client)) return { skipped: "Renovação sem lembrete ao cliente." };

  const events = agendaEventsForClient(client)
    .filter((event) => !event.internalOnly)
    .filter((event) => isWithinReminderWindow(event.start));

  if (events.length === 0) return { skipped: "Sem eventos próximos." };

  const toSend = [];
  for (const event of events) {
    if (!(await alreadySent(client.id, event, "lembrete_cliente", client.email))) toSend.push(event);
  }
  if (toSend.length === 0) return { skipped: "Lembrete já enviado." };

  await sendWithBrevo({
    toEmail: client.email,
    toName: client.name,
    ccEmail: client.secondary_email || "",
    subject: clientSubject(client, toSend, true),
    html: htmlAgenda(client, toSend, true),
    text: toSend.map((e) => `${e.title} - ${fmt(e.start)} - ${e.location || ""}`).join("\n"),
    tags: ["resumindo-viagens", "lembrete-cliente"]
  });

  for (const event of toSend) await logSent(client.id, event, "lembrete_cliente", client.email, mode);
  return { sent: toSend.length };
}


function subtractDaysLocal(dateValue, days) {
  if (!dateValue) return "";
  const [y, m, d] = String(dateValue).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return "";
  const date = new Date(y, (m || 1) - 1, d || 1, 9, 0, 0);
  date.setDate(date.getDate() - days);
  const yy = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const da = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mo}-${da}T09:00:00-03:00`;
}

export function casvVideoPlanningEvent(client) {
  if (!client?.casv_date) return null;
  const start = subtractDaysLocal(client.casv_date, 20);
  if (!start) return null;
  return {
    type: "marcar_videochamada_20dias_casv",
        uid: `resumindo-${client.id}-marcar_videochamada_20dias_casv@resumindoviagens.com.br`,
    filename: "marcar-videochamada",
    title: `MARCAR DATA VIDEOCHAMADA — ${client.name}`,
    description: `Alerta operacional da Resumindo Viagens: faltam 20 dias para o CASV de ${client.name}. Verificar disponibilidade e marcar videochamada de preparação/orientação com o cliente.`,
    location: "Controle interno Resumindo Viagens",
    start,
    durationHours: 1
  };
}

export async function sendCasvVideoPlanningICS(client, { mode = "auto" } = {}) {
  if (!client?.casv_date) return { skipped: "Sem CASV." };
  if (client.casv_video_planning_email_sent_at && client.casv_video_planning_for_date === client.casv_date) return { skipped: "Já enviado para esta data de CASV." };

  const event = casvVideoPlanningEvent(client);
  if (!event) return { skipped: "Sem evento." };

  await sendWithBrevo({
    toEmail: INTERNAL_EMAIL,
    toName: "Resumindo Viagens",
    subject: `Agenda interna — marcar videochamada — ${client.name}`,
    html: simpleHtml("Marcar data de videochamada", [
      `Cliente: <strong>${client.name}</strong>`,
      `<strong>CASV:</strong> ${fmt(client.casv_datetime || client.casv_date)}`,
      `<strong>Compromisso sugerido:</strong> ${fmt(event.start)}`,
      "Este email possui arquivo .ics para inserir o compromisso operacional na agenda da Resumindo Viagens.",
      "O envio é feito pelo cron diário, não imediatamente ao salvar datas, para reduzir risco de agenda incorreta."
    ]),
    text: `Marcar videochamada de ${client.name}. CASV: ${client.casv_date}. Compromisso sugerido: ${event.start}`,
    tags: ["resumindo-viagens", "agenda-interna", "marcar-videochamada"],
    attachments: [buildAttachment(event)]
  });

  await supabaseAdmin.from("clients").update({
    casv_video_planning_email_sent_at: new Date().toISOString(),
    casv_video_planning_for_date: client.casv_date
  }).eq("id", client.id);

  await logSent(client.id, event, "agenda_interna_videochamada_20dias", INTERNAL_EMAIL, mode);
  return { sent: 1 };
}


export async function loadFutureClientsForAgenda() {
  const now = brasiliaWallClockNowISO();
  const today = now.slice(0, 10);
  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .or(`casv_datetime.gte.${now},interview_datetime.gte.${now},casv_date.gte.${today},interview_date.gte.${today},video_call_date.gte.${now},passport_pf_datetime.gte.${now},agenda_email_pending_at.not.is.null`);
  if (error) throw error;
  return data || [];
}
