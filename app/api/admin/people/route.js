export const dynamic = "force-dynamic";

import { requireAdmin } from "../../../../lib/auth";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

function cleanCPF(value) {
  return String(value || "").replace(/\D/g, "");
}

function payload(body) {
  return {
    name: body.name || "",
    reservation_name: body.reservation_name || "",
    cpf: cleanCPF(body.cpf),
    birth_date: body.birth_date || null,
    email: body.email || "",
    phone: body.phone || "",
    passport_number: body.passport_number || "",
    passport_issue_date: body.passport_issue_date || null,
    passport_expiry_date: body.passport_expiry_date || null,
    passport_issuer: body.passport_issuer || "",
    passport_country: body.passport_country || "Brasil",
    nationality: body.nationality || "Brasileira",
    notes: body.notes || "",
    updated_at: new Date().toISOString()
  };
}

export async function GET(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();

  let query = supabaseAdmin
    .from("people")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(250);

  if (q) {
    const term = `%${q}%`;
    query = query.or(`name.ilike.${term},email.ilike.${term},cpf.ilike.${term},phone.ilike.${term},passport_number.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ people: data || [] });
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  if (!body.name) return Response.json({ error: "Nome é obrigatório." }, { status: 400 });

  const cpf = cleanCPF(body.cpf);
  if (cpf && body.birth_date) {
    const { data: existing } = await supabaseAdmin
      .from("people")
      .select("*")
      .eq("cpf", cpf)
      .eq("birth_date", body.birth_date)
      .limit(1);

    if ((existing || []).length > 0) {
      return Response.json({ person: existing[0], existing: true });
    }
  }

  const { data, error } = await supabaseAdmin
    .from("people")
    .insert(payload(body))
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ person: data });
}

export async function PATCH(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  if (!body.id) return Response.json({ error: "ID é obrigatório." }, { status: 400 });
  if (!body.name) return Response.json({ error: "Nome é obrigatório." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("people")
    .update(payload(body))
    .eq("id", body.id)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ person: data });
}
