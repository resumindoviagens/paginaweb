import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../lib/auth";

export async function GET(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client_id");

  let query = supabaseAdmin
    .from("audit_logs")
    .select("id, client_id, action, details, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (clientId) query = query.eq("client_id", clientId);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ logs: data || [] });
}
