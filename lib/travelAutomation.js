import { supabaseAdmin } from "./supabaseAdmin";
import { sendWithBrevo } from "./brevoEmail";
import { getTravelEmailTemplate } from "./travelEmailTemplates";
import { travelAgendaAttachments } from "./travelAgenda";
import { isBetweenHours } from "./travelDateUtils";

function uniqueRecipients(list) {
  const seen = new Set();
  return list
    .filter((item) => item?.email && String(item.email).includes("@"))
    .filter((item) => {
      const email = String(item.email).trim().toLowerCase();
      if (seen.has(email)) return false;
      seen.add(email);
      return true;
    });
}

export function travelRecipients(trip) {
  const mode = trip.email_recipient_mode || "all";
  const passengers = (trip.travel_trip_passengers || trip.passengers_list || []).map((p) => ({ email: p.email, name: p.name }));
  const organizer = trip.organizer_email ? [{ email: trip.organizer_email, name: trip.organizer_name || "Organizador da viagem" }] : [];

  if (mode === "organizer") return uniqueRecipients(organizer);
  if (mode === "passengers") return uniqueRecipients(passengers);
  return uniqueRecipients([...passengers, ...organizer]);
}

export function updateFieldForTravelTemplate(templateId) {
  const map = {
    travel_calendar: "calendar_email_sent_at",
    travel_missing_services: "offer_email_sent_at",
    travel_week_before: "offer_email_sent_at",
    travel_checkin_outbound: "checkin_outbound_email_sent_at",
    travel_checkin_return: "checkin_return_email_sent_at",
    travel_airport_outbound: "airport_outbound_email_sent_at",
    travel_airport_return: "airport_return_email_sent_at"
  };
  return map[templateId] || null;
}

export async function loadTrip(tripId) {
  const { data: trip, error } = await supabaseAdmin
    .from("travel_trips")
    .select("*, travel_trip_passengers(*)")
    .eq("id", tripId)
    .maybeSingle();

  if (error) throw error;
  if (!trip) throw new Error("Viagem não encontrada.");

  trip.passengers_list = (trip.travel_trip_passengers || []).sort((a, b) => (a.passenger_order || 0) - (b.passenger_order || 0));
  return trip;
}

async function logTravelEmail({ tripId, templateId, sendMode, recipients, error = "" }) {
  await supabaseAdmin.from("travel_email_logs").insert({
    travel_trip_id: tripId,
    template_id: templateId,
    send_mode: sendMode,
    recipients: recipients || [],
    error: error || null,
    sent_at: new Date().toISOString()
  });
}

export async function sendTravelTemplate(trip, templateId, { sendMode = "manual", subject, html, bodyText, text, options = {} } = {}) {
  const to = travelRecipients(trip);
  if (to.length === 0) throw new Error("Nenhum destinatário conforme regra escolhida na viagem.");

  const baseTemplate = getTravelEmailTemplate(templateId, { name: trip.organizer_name || trip.passengers_list?.[0]?.name || "cliente" }, trip, options);
  const finalTemplate = {
    subject: subject || baseTemplate.subject,
    html: html || baseTemplate.html,
    text: bodyText || text || baseTemplate.text
  };

  if (bodyText && !html) {
    // Mantém visual consistente: bodyText será convertido na rota de envio, quando disponível.
    finalTemplate.html = baseTemplate.html;
  }

  const attachments = templateId === "travel_calendar" ? travelAgendaAttachments(trip) : [];
  const results = [];

  for (const recipient of to) {
    const result = await sendWithBrevo({
      toEmail: recipient.email,
      toName: recipient.name,
      subject: finalTemplate.subject,
      html: finalTemplate.html,
      text: finalTemplate.text,
      tags: ["resumindo-viagens", "viagens", templateId, sendMode],
      attachments
    });
    results.push({ to: recipient.email, messageId: result?.messageId || null });
  }

  const field = updateFieldForTravelTemplate(templateId);
  if (field) {
    await supabaseAdmin
      .from("travel_trips")
      .update({ [field]: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", trip.id);
  }

  await logTravelEmail({
    tripId: trip.id,
    templateId,
    sendMode,
    recipients: results.map((r) => r.to)
  });

  await supabaseAdmin.from("audit_logs").insert({
    action: "travel_email_sent",
    details: { trip_id: trip.id, template_id: templateId, send_mode: sendMode, recipients: results.map((r) => r.to), results }
  });

  return { sent: results.length, results };
}

export async function sendTravelCalendarIfNeeded(tripId) {
  const trip = await loadTrip(tripId);
  if (trip.calendar_email_sent_at) return { skipped: "Agenda já enviada." };
  if (!trip.outbound_date && !trip.return_date && !trip.hotel_checkin && !trip.car_pickup) return { skipped: "Sem datas para agenda." };
  return sendTravelTemplate(trip, "travel_calendar", { sendMode: "auto" });
}

function automationTasksForTrip(trip) {
  const tasks = [];

  // Uma semana antes da ida: oferta/checklist comercial.
  if (trip.outbound_date && !trip.offer_email_sent_at && isBetweenHours(trip.outbound_date, 6 * 24, 8 * 24)) {
    tasks.push("travel_week_before");
  }

  // Check-in 48h antes. Janela larga para cron diário.
  if (trip.outbound_date && !trip.checkin_outbound_email_sent_at && isBetweenHours(trip.outbound_date, 36, 60)) {
    tasks.push("travel_checkin_outbound");
  }

  if (trip.has_return && trip.return_date && !trip.checkin_return_email_sent_at && isBetweenHours(trip.return_date, 36, 60)) {
    tasks.push("travel_checkin_return");
  }

  // Dia do voo. Janela de 0 a 18h antes.
  if (trip.outbound_date && !trip.airport_outbound_email_sent_at && isBetweenHours(trip.outbound_date, 0, 18)) {
    tasks.push("travel_airport_outbound");
  }

  if (trip.has_return && trip.return_date && !trip.airport_return_email_sent_at && isBetweenHours(trip.return_date, 0, 18)) {
    tasks.push("travel_airport_return");
  }

  return tasks;
}

export async function runTravelAutomation() {
  const { data: trips, error } = await supabaseAdmin
    .from("travel_trips")
    .select("*, travel_trip_passengers(*)")
    .eq("automation_enabled", true);

  if (error) throw error;

  const results = [];

  for (const trip of trips || []) {
    trip.passengers_list = (trip.travel_trip_passengers || []).sort((a, b) => (a.passenger_order || 0) - (b.passenger_order || 0));
    const tasks = automationTasksForTrip(trip);

    for (const templateId of tasks) {
      try {
        const result = await sendTravelTemplate(trip, templateId, { sendMode: "auto" });
        results.push({ trip_id: trip.id, title: trip.title, templateId, result });
      } catch (error) {
        await logTravelEmail({
          tripId: trip.id,
          templateId,
          sendMode: "auto",
          recipients: [],
          error: error?.message || String(error)
        });
        results.push({ trip_id: trip.id, title: trip.title, templateId, error: error?.message || String(error) });
      }
    }
  }

  return { processed: (trips || []).length, results };
}
