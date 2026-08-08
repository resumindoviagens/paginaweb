export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../../lib/auth";

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => ({}));
  const origem = body.origem || "all";
  const categoria = body.categoria || "all";

  let query = supabaseAdmin
    .from("newsletter_contacts")
    .update({
      status: "active",
      aceita_newsletter: true,
      atualizado_em: new Date().toISOString()
    })
    .eq("status", "pending_review");

  if (origem !== "all") query = query.eq("origem", origem);
  if (categoria !== "all") query = query.eq("categoria", categoria);

  const { data, error } = await query.select("id");

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true, approved: (data || []).length });
}
