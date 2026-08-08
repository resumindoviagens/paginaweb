export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../lib/auth";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data: contacts, error } = await supabaseAdmin
    .from("newsletter_contacts")
    .select("id,email,email_normalized,nome,status,aceita_newsletter,origem,quantidade_clientes_vinculados")
    .order("criado_em", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const all = contacts || [];
  const active = all.filter((c) => c.status === "active" && c.aceita_newsletter !== false);
  const pending = all.filter((c) => c.status === "pending_review");
  const optOut = all.filter((c) => c.status === "unsubscribed");
  const blocked = all.filter((c) => c.status === "blocked" || c.status === "bounced");
  const duplicateMerged = all.reduce((sum, c) => sum + Math.max(0, Number(c.quantidade_clientes_vinculados || 1) - 1), 0);

  const { data: campaigns } = await supabaseAdmin
    .from("newsletter_campaigns")
    .select("id,subject,status,audience,total_recipients,sent_count,failed_count,created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return Response.json({
    counts: {
      total_contacts: all.length,
      active: active.length,
      eligible: active.length,
      opt_out: optOut.length,
      blocked: blocked.length,
      pending_review: pending.length,
      duplicate_emails_removed: duplicateMerged
    },
    campaigns: campaigns || []
  }, { headers: { "Cache-Control": "no-store" } });
}
