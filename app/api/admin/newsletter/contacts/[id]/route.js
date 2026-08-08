export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../../lib/auth";

export async function PATCH(request, { params }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const id = params?.id;
  const body = await request.json();

  const allowed = ["nome", "telefone", "status", "aceita_newsletter", "observacoes", "motivo_descadastro", "categoria", "origem"];
  const updates = { atualizado_em: new Date().toISOString() };

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) updates[key] = body[key];
  }

  if (updates.status === "unsubscribed" || updates.aceita_newsletter === false) {
    updates.descadastrado_em = new Date().toISOString();
    updates.aceita_newsletter = false;
  }

  if (updates.status === "active" && updates.aceita_newsletter !== false) {
    updates.descadastrado_em = null;
  }

  const { data, error } = await supabaseAdmin
    .from("newsletter_contacts")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, contact: data });
}
