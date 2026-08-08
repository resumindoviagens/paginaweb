export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../../lib/auth";

export async function GET(_request, { params }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const id = params?.id;

  const { data: campaign, error } = await supabaseAdmin
    .from("newsletter_campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data: recipients } = await supabaseAdmin
    .from("campaign_recipients")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: true });

  return Response.json({ campaign, recipients: recipients || [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(_request, { params }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const id = params?.id;

  const { data: campaign, error: readError } = await supabaseAdmin
    .from("newsletter_campaigns")
    .select("id,status")
    .eq("id", id)
    .single();

  if (readError || !campaign) return Response.json({ error: "Campanha não encontrada." }, { status: 404 });

  if (campaign.status !== "draft") {
    return Response.json({ error: "Somente rascunhos podem ser excluídos." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("newsletter_campaigns").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
