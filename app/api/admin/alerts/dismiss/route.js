import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../lib/auth";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabaseAdmin
    .from("admin_alert_dismissals")
    .select("alert_key");

  if (error) return Response.json({ dismissed: [] });

  return Response.json({ dismissed: (data || []).map((item) => item.alert_key) });
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const alertKey = body.alert_key;

  if (!alertKey) {
    return Response.json({ error: "alert_key obrigatório." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("admin_alert_dismissals")
    .upsert({
      alert_key: alertKey,
      dismissed_at: new Date().toISOString()
    }, { onConflict: "alert_key" });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
