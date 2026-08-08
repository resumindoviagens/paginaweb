import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function POST(request, context) {
  const params = await context.params;
  const formData = await request.formData();
  const tracking = String(formData.get("tracking") || "").trim();

  if (!tracking) return Response.redirect(new URL(`/renovacao/${params.token}?erro=1`, request.url), 303);

  const { data: client, error: findError } = await supabaseAdmin
    .from("clients")
    .select("id,is_renewal")
    .eq("access_token", params.token)
    .maybeSingle();

  if (findError || !client || !client.is_renewal) {
    return Response.redirect(new URL(`/renovacao/${params.token}?erro=1`, request.url), 303);
  }

  await supabaseAdmin
    .from("clients")
    .update({ client_sedex_tracking: tracking, updated_at: new Date().toISOString() })
    .eq("id", client.id);

  await supabaseAdmin.from("audit_logs").insert({
    client_id: client.id,
    action: "client_sedex_tracking_sent",
    details: { tracking }
  });

  return Response.redirect(new URL(`/renovacao/${params.token}?ok=1`, request.url), 303);
}
