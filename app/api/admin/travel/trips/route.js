export const dynamic = "force-dynamic";

import { requireAdmin } from "../../../../../lib/auth";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { localDateTimeForDb, localDateForDb } from "../../../../../lib/travelDateUtils";
import { sendTravelCalendarIfNeeded } from "../../../../../lib/travelAutomation";

function arrayServices(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function cleanCPF(value) {
  return String(value || "").replace(/\D/g, "");
}


function missingFieldsForCustomer(passenger) {
  const missing = [];
  if (!String(passenger.name || "").trim()) missing.push("nome");
  if (!cleanCPF(passenger.cpf)) missing.push("cpf");
  if (!passenger.birth_date) missing.push("data_nascimento");
  return missing;
}

async function findOrCreateTravelCustomer(passenger) {
  if (passenger.travel_customer_id) {
    const { data: tc } = await supabaseAdmin
      .from("travel_customers")
      .select("id, person_id")
      .eq("id", passenger.travel_customer_id)
      .maybeSingle();
    return { customerId: passenger.travel_customer_id, personId: tc?.person_id || passenger.person_id || null, status: "linked", missing: [] };
  }

  const missing = missingFieldsForCustomer(passenger);
  if (missing.length > 0) {
    return { customerId: null, personId: null, status: "temporary", missing };
  }

  const cpf = cleanCPF(passenger.cpf);
  let personId = passenger.person_id || null;

  if (!personId) {
    const { data: existingPeople, error: peopleError } = await supabaseAdmin
      .from("people")
      .select("id")
      .eq("cpf", cpf)
      .eq("birth_date", passenger.birth_date)
      .limit(1);

    if (peopleError) throw peopleError;

    if ((existingPeople || []).length > 0) {
      personId = existingPeople[0].id;
    } else {
      const { data: createdPerson, error: createPersonError } = await supabaseAdmin
        .from("people")
        .insert({
          name: passenger.name,
          reservation_name: passenger.reservation_name || passenger.name,
          email: passenger.email || "",
          phone: passenger.phone || "",
          cpf,
          birth_date: passenger.birth_date,
          notes: "Criado automaticamente a partir de passageiro cadastrado em viagem.",
          updated_at: new Date().toISOString()
        })
        .select("id")
        .single();

      if (createPersonError) throw createPersonError;
      personId = createdPerson.id;
    }
  }

  const { data: existingByCpf, error: cpfError } = await supabaseAdmin
    .from("travel_customers")
    .select("id")
    .eq("cpf", cpf)
    .limit(1);

  if (cpfError) throw cpfError;
  if ((existingByCpf || []).length > 0) {
    await supabaseAdmin.from("travel_customers").update({ person_id: personId }).eq("id", existingByCpf[0].id);
    return { customerId: existingByCpf[0].id, personId, status: "linked", missing: [] };
  }

  const { data: created, error: createError } = await supabaseAdmin
    .from("travel_customers")
    .insert({
      person_id: personId,
      name: passenger.name,
      email: passenger.email || "",
      phone: passenger.phone || "",
      cpf,
      birth_date: passenger.birth_date,
      notes: "Criado automaticamente a partir de passageiro cadastrado em viagem.",
      updated_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (createError) throw createError;
  return { customerId: created.id, personId, status: "created", missing: [] };
}

function cleanPayload(body) {
  return {
    title: body.title,
    destination: body.destination || "",
    status: body.status || "planejada",
    passengers: body.passengers || "",
    passenger_count: Number(body.passenger_count || 1),
    services: arrayServices(body.services),
    organizer_name: body.organizer_name || "",
    organizer_email: body.organizer_email || "",
    organizer_phone: body.organizer_phone || "",
    organizer_is_passenger: !!body.organizer_is_passenger,
    email_recipient_mode: body.email_recipient_mode || "all",
    buyer_name: body.organizer_name || body.buyer_name || "",
    buyer_email: body.organizer_email || body.buyer_email || "",
    buyer_phone: body.organizer_phone || body.buyer_phone || "",
    outbound_date: localDateTimeForDb(body.outbound_date),
    outbound_airline: body.outbound_airline || "",
    outbound_flight: body.outbound_flight || "",
    booking_locator: body.booking_locator || "",
    has_return: !!body.has_return,
    return_date: localDateTimeForDb(body.return_date),
    return_airline: body.return_airline || "",
    return_flight: body.return_flight || "",
    return_booking_locator: body.return_booking_locator || "",
    hotel_name: body.hotel_name || "",
    hotel_address: body.hotel_address || "",
    hotel_checkin: localDateForDb(body.hotel_checkin),
    hotel_checkout: localDateForDb(body.hotel_checkout),
    hotel_confirmation: body.hotel_confirmation || "",
    car_company: body.car_company || "",
    car_pickup: localDateTimeForDb(body.car_pickup),
    car_return: localDateTimeForDb(body.car_return),
    car_confirmation: body.car_confirmation || "",
    insurance_company: body.insurance_company || "",
    insurance_policy: body.insurance_policy || "",
    insurance_valid_until: localDateForDb(body.insurance_valid_until),
    tickets_notes: body.tickets_notes || "",
    notes: body.notes || "",
    stage_created: true,
    stage_air_issued: !!body.stage_air_issued,
    stage_hotel_confirmed: !!body.stage_hotel_confirmed,
    stage_insurance_issued: !!body.stage_insurance_issued,
    stage_car_confirmed: !!body.stage_car_confirmed,
    stage_docs_sent: !!body.stage_docs_sent,
    stage_checkin_available: !!body.stage_checkin_available,
    stage_trip_started: !!body.stage_trip_started,
    stage_trip_finished: !!body.stage_trip_finished,
    automation_enabled: body.automation_enabled !== false,
    updated_at: new Date().toISOString()
  };
}

async function cleanPassenger(passenger, index, tripId) {
  const link = await findOrCreateTravelCustomer(passenger);
  const missing = link.missing || [];
  const reservationName = passenger.reservation_name || passenger.name || `Passageiro ${index + 1}`;

  return {
    travel_trip_id: tripId,
    travel_customer_id: link.customerId,
    person_id: link.personId || null,
    passenger_order: Number(passenger.passenger_order || index + 1),
    name: passenger.name || reservationName,
    reservation_name: reservationName,
    email: passenger.email || "",
    phone: passenger.phone || "",
    cpf: cleanCPF(passenger.cpf),
    birth_date: passenger.birth_date || null,
    customer_link_status: link.status,
    missing_customer_fields: missing,
    is_primary: index === 0,
    updated_at: new Date().toISOString()
  };
}

async function replacePassengers(tripId, passengers = []) {
  await supabaseAdmin.from("travel_trip_passengers").delete().eq("travel_trip_id", tripId);
  const filtered = passengers.filter((p) => p && (p.name || p.reservation_name || p.travel_customer_id));
  const clean = await Promise.all(filtered.map((p, index) => cleanPassenger(p, index, tripId)));

  if (clean.length > 0) {
    const { error } = await supabaseAdmin.from("travel_trip_passengers").insert(clean);
    if (error) throw error;
  }
}

export async function GET(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabaseAdmin
    .from("travel_trips")
    .select("*, travel_trip_passengers(*)")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const trips = (data || []).map((trip) => ({
    ...trip,
    passengers_list: (trip.travel_trip_passengers || []).sort((a, b) => (a.passenger_order || 0) - (b.passenger_order || 0))
  }));

  return Response.json({ trips });
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  if (!body.title) return Response.json({ error: "Título da viagem é obrigatório." }, { status: 400 });

  const passengers = body.passengers_list || [];
  const primary = passengers.find((p) => p.travel_customer_id) || passengers[0] || null;

  const payload = {
    ...cleanPayload(body),
    travel_customer_id: primary?.travel_customer_id || null
  };

  const { data, error } = await supabaseAdmin
    .from("travel_trips")
    .insert(payload)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  try {
    await replacePassengers(data.id, passengers);
    const { data: firstPassenger } = await supabaseAdmin
      .from("travel_trip_passengers")
      .select("travel_customer_id")
      .eq("travel_trip_id", data.id)
      .not("travel_customer_id", "is", null)
      .order("passenger_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (firstPassenger?.travel_customer_id) {
      await supabaseAdmin.from("travel_trips").update({ travel_customer_id: firstPassenger.travel_customer_id }).eq("id", data.id);
    }
  } catch (passengerError) {
    return Response.json({ error: passengerError.message }, { status: 500 });
  }

  try {
    await sendTravelCalendarIfNeeded(data.id);
  } catch (calendarError) {
    await supabaseAdmin.from("audit_logs").insert({
      action: "travel_calendar_auto_failed",
      details: { trip_id: data.id, error: calendarError?.message || String(calendarError) }
    });
  }

  return Response.json({ trip: data });
}

export async function PATCH(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  if (!body.id) return Response.json({ error: "ID da viagem é obrigatório." }, { status: 400 });
  if (!body.title) return Response.json({ error: "Título da viagem é obrigatório." }, { status: 400 });

  const passengers = body.passengers_list || [];
  const primary = passengers.find((p) => p.travel_customer_id) || passengers[0] || null;

  const payload = {
    ...cleanPayload(body),
    travel_customer_id: primary?.travel_customer_id || body.travel_customer_id || null
  };

  const { data, error } = await supabaseAdmin
    .from("travel_trips")
    .update(payload)
    .eq("id", body.id)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  try {
    await replacePassengers(data.id, passengers);
    const { data: firstPassenger } = await supabaseAdmin
      .from("travel_trip_passengers")
      .select("travel_customer_id")
      .eq("travel_trip_id", data.id)
      .not("travel_customer_id", "is", null)
      .order("passenger_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (firstPassenger?.travel_customer_id) {
      await supabaseAdmin.from("travel_trips").update({ travel_customer_id: firstPassenger.travel_customer_id }).eq("id", data.id);
    }
  } catch (passengerError) {
    return Response.json({ error: passengerError.message }, { status: 500 });
  }

  try {
    await sendTravelCalendarIfNeeded(data.id);
  } catch (calendarError) {
    await supabaseAdmin.from("audit_logs").insert({
      action: "travel_calendar_auto_failed",
      details: { trip_id: data.id, error: calendarError?.message || String(calendarError) }
    });
  }

  return Response.json({ trip: data });
}

export async function DELETE(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "ID da viagem é obrigatório." }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("travel_trips")
    .delete()
    .eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
