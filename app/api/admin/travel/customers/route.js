export const dynamic = "force-dynamic";

import { requireAdmin } from "../../../../../lib/auth";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

function cleanCPF(value) {
  return String(value || "").replace(/\D/g, "");
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabaseAdmin
    .from("travel_customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ customers: data || [] });
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();

  if (!body.name) return Response.json({ error: "Nome é obrigatório." }, { status: 400 });

  const cpf = cleanCPF(body.cpf);
  let personId = body.person_id || null;

  if (!personId && cpf && body.birth_date) {
    const { data: existingPeople } = await supabaseAdmin
      .from("people")
      .select("id")
      .eq("cpf", cpf)
      .eq("birth_date", body.birth_date)
      .limit(1);

    if ((existingPeople || []).length > 0) {
      personId = existingPeople[0].id;
    } else {
      const { data: createdPerson, error: personError } = await supabaseAdmin
        .from("people")
        .insert({
          name: body.name,
          reservation_name: body.reservation_name || body.name,
          email: body.email || "",
          phone: body.phone || "",
          cpf,
          birth_date: body.birth_date,
          notes: "Criado automaticamente a partir de cliente de viagem.",
          updated_at: new Date().toISOString()
        })
        .select("id")
        .single();

      if (personError) return Response.json({ error: personError.message }, { status: 500 });
      personId = createdPerson.id;
    }
  }

  const payload = {
    person_id: personId,
    client_id: body.client_id || null,
    name: body.name,
    email: body.email || "",
    phone: body.phone || "",
    cpf,
    birth_date: body.birth_date || null,
    alert_email: body.alert_email || "",
    notes: body.notes || "",
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabaseAdmin
    .from("travel_customers")
    .insert(payload)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ customer: data });
}
