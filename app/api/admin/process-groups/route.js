import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../lib/auth";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabaseAdmin
    .from("grupos_processo")
    .select("*")
    .order("nome", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ groups: data || [] });
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const nome = String(body.nome || "").trim();
  if (!nome) return Response.json({ error: "Nome do grupo de processo é obrigatório." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("grupos_processo")
    .insert({ nome })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ group: data });
}
