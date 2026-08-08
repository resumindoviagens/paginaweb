export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../lib/auth";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabaseAdmin
    .from("feedbacks")
    .select("*, client:clients(id,name,email,phone,stage_feedback_posted)")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ feedbacks: data || [] }, { headers: { "Cache-Control": "no-store" } });
}
