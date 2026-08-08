export const dynamic = "force-dynamic";

import { requireAdmin } from "../../../../../lib/auth";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { diffHoursFromNowLocal } from "../../../../../lib/travelDateUtils";

function needs(value) {
  return !value;
}

function serviceMissing(trip, serviceName, field) {
  const services = trip.services || [];
  return services.includes(serviceName) && needs(trip[field]);
}

function isToday(value) {
  const diff = diffHoursFromNowLocal(value);
  return diff !== null && diff >= 0 && diff <= 24;
}

function isWithin(value, min, max) {
  const diff = diffHoursFromNowLocal(value);
  return diff !== null && diff >= min && diff <= max;
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data: trips, error } = await supabaseAdmin
    .from("travel_trips")
    .select("*, travel_trip_passengers(*)")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const list = trips || [];
  const active = list.filter((trip) => !trip.stage_trip_finished);
  const todayFlights = active.filter((trip) => isToday(trip.outbound_date) || (trip.has_return && isToday(trip.return_date)));
  const checkinWindow = active.filter((trip) => isWithin(trip.outbound_date, 36, 60) || (trip.has_return && isWithin(trip.return_date, 36, 60)));

  const missingHotel = active.filter((trip) => serviceMissing(trip, "Hotel", "hotel_name"));
  const missingInsurance = active.filter((trip) => serviceMissing(trip, "Seguro viagem", "insurance_company"));
  const missingCar = active.filter((trip) => serviceMissing(trip, "Locação de carro", "car_company"));
  const missingLocator = active.filter((trip) => trip.outbound_date && !trip.booking_locator);

  const emailStats = {
    calendar: list.filter((trip) => trip.calendar_email_sent_at).length,
    offer: list.filter((trip) => trip.offer_email_sent_at).length,
    checkinOutbound: list.filter((trip) => trip.checkin_outbound_email_sent_at).length,
    checkinReturn: list.filter((trip) => trip.checkin_return_email_sent_at).length,
    airportOutbound: list.filter((trip) => trip.airport_outbound_email_sent_at).length,
    airportReturn: list.filter((trip) => trip.airport_return_email_sent_at).length
  };

  const { data: logs } = await supabaseAdmin
    .from("travel_email_logs")
    .select("*")
    .gte("sent_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("sent_at", { ascending: false });

  return Response.json({
    ok: true,
    totals: {
      trips: list.length,
      active: active.length,
      finished: list.filter((trip) => trip.stage_trip_finished).length,
      automationEnabled: list.filter((trip) => trip.automation_enabled !== false).length,
      todayFlights: todayFlights.length,
      checkinWindow: checkinWindow.length,
      missingHotel: missingHotel.length,
      missingInsurance: missingInsurance.length,
      missingCar: missingCar.length,
      missingLocator: missingLocator.length,
      emailsLast24h: (logs || []).filter((log) => !log.error).length,
      emailErrorsLast24h: (logs || []).filter((log) => !!log.error).length
    },
    emailStats,
    lists: {
      todayFlights: todayFlights.slice(0, 8),
      checkinWindow: checkinWindow.slice(0, 8),
      missingHotel: missingHotel.slice(0, 8),
      missingInsurance: missingInsurance.slice(0, 8),
      missingCar: missingCar.slice(0, 8),
      missingLocator: missingLocator.slice(0, 8),
      recentEmails: (logs || []).slice(0, 12)
    }
  });
}
