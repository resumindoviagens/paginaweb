export const dynamic = "force-dynamic";

import { requireAdmin } from "../../../../../lib/auth";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { getTravelEmailTemplate, plainTextFromHtml } from "../../../../../lib/travelEmailTemplates";

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

function recipients(trip) {
  const mode = trip.email_recipient_mode || "all";
  const passengers = (trip.travel_trip_passengers || []).map((p) => ({ email: p.email, name: p.name }));
  const organizer = trip.organizer_email ? [{ email: trip.organizer_email, name: trip.organizer_name || "Organizador da viagem" }] : [];

  if (mode === "organizer") return uniqueRecipients(organizer);
  if (mode === "passengers") return uniqueRecipients(passengers);
  return uniqueRecipients([...passengers, ...organizer]);
}

export async function GET(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const tripId = url.searchParams.get("trip_id");
  const templateId = url.searchParams.get("template_id");
  if (!tripId || !templateId) return Response.json({ error: "Viagem e modelo são obrigatórios." }, { status: 400 });

  const { data: trip, error } = await supabaseAdmin
    .from("travel_trips")
    .select("*, travel_trip_passengers(*)")
    .eq("id", tripId)
    .maybeSingle();

  if (error || !trip) return Response.json({ error: "Viagem não encontrada." }, { status: 404 });

  trip.passengers_list = (trip.travel_trip_passengers || []).sort((a, b) => (a.passenger_order || 0) - (b.passenger_order || 0));
  const to = recipients(trip);
  const template = getTravelEmailTemplate(templateId, { name: trip.organizer_name || trip.passengers_list?.[0]?.name || "cliente" }, trip, {});
  return Response.json({
    subject: template.subject,
    html: template.html,
    bodyText: plainTextFromHtml(template.html),
    text: template.text,
    to: to.map((r) => r.email),
    recipientMode: trip.email_recipient_mode || "all"
  });
}
