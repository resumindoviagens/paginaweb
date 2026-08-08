export const dynamic = "force-dynamic";

import crypto from "crypto";
import { requireAdmin } from "../../../../../lib/auth";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const personId = body.person_id;
  const tipo = body.tipo_processo || "Primeiro visto";

  if (!personId) return Response.json({ error: "Cliente único obrigatório." }, { status: 400 });

  const { data: person, error: personError } = await supabaseAdmin
    .from("people")
    .select("*")
    .eq("id", personId)
    .maybeSingle();

  if (personError || !person) return Response.json({ error: "Cliente único não encontrado." }, { status: 404 });

  if (!person.cpf || !person.birth_date) {
    return Response.json({ error: "Para criar processo de visto, informe CPF e data de nascimento no cadastro único." }, { status: 400 });
  }

  const token = crypto.randomBytes(24).toString("hex");

  const { data, error } = await supabaseAdmin
    .from("clients")
    .insert({
      person_id: person.id,
      name: person.name,
      cpf: person.cpf,
      birth_date: person.birth_date,
      email: person.email || "",
      phone: person.phone || "",
      access_token: token,
      status: "not_started",
      tipo_processo: tipo,
      no_form_required: false,
      notes: body.notes || "Criado a partir do cadastro único.",
      updated_at: new Date().toISOString()
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("audit_logs").insert({
    client_id: data.id,
    action: "visa_client_created_from_person",
    details: { person_id: person.id, tipo_processo: tipo }
  });

  return Response.json({ client: data });
}
