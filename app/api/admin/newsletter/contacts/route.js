export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../lib/auth";

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

function validEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export async function GET(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const q = String(searchParams.get("q") || "").trim();
  const status = searchParams.get("status") || "all";
  const origem = searchParams.get("origem") || "all";
  const categoria = searchParams.get("categoria") || "all";

  let query = supabaseAdmin
    .from("newsletter_contacts")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(500);

  if (status !== "all") query = query.eq("status", status);
  if (origem !== "all") query = query.eq("origem", origem);
  if (categoria !== "all") query = query.eq("categoria", categoria);
  if (q) query = query.or(`email.ilike.%${q}%,nome.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ contacts: data || [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const email = String(body.email || "").trim();
  const emailNormalized = normalizeEmail(email);

  if (!validEmail(emailNormalized)) return Response.json({ error: "Email inválido." }, { status: 400 });

  const payload = {
    email,
    email_normalized: emailNormalized,
    nome: body.nome || "",
    telefone: body.telefone || "",
    origem: body.origem || "manual",
    status: body.status || "active",
    aceita_newsletter: body.aceita_newsletter ?? true,
    observacoes: body.observacoes || "",
    categoria: body.categoria || "Cliente",
    atualizado_em: new Date().toISOString()
  };

  const { data, error } = await supabaseAdmin
    .from("newsletter_contacts")
    .upsert(payload, { onConflict: "email_normalized" })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, contact: data });
}
