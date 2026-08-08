export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function POST(_request, { params }) {
  const token = params?.token;
  if (!token) return Response.json({ error: "Token obrigatório." }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("clients")
    .update({ newsletter_opt_out: true, newsletter_opt_out_at: new Date().toISOString() })
    .eq("newsletter_unsubscribe_token", token);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
