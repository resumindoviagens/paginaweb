export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../../lib/auth";

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  const audience = body.audience || "eligible_all";

  if (!subject) return Response.json({ error: "Assunto obrigatório." }, { status: 400 });
  if (!message) return Response.json({ error: "Mensagem obrigatória." }, { status: 400 });

  let query = supabaseAdmin
    .from("newsletter_contacts")
    .select("*")
    .eq("status", "active")
    .eq("aceita_newsletter", true)
    .not("email_normalized", "is", null);

  if (audience === "clientes_visto") query = query.eq("origem", "clientes_visto");
  if (audience === "manual_csv") query = query.in("origem", ["manual", "csv_import"]);

  const { data: contacts, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const recipients = contacts || [];

  const { data: campaign, error: campaignError } = await supabaseAdmin
    .from("newsletter_campaigns")
    .insert({
      subject,
      message,
      audience,
      status: "draft",
      total_recipients: recipients.length,
      sent_count: 0,
      failed_count: 0
    })
    .select("id")
    .single();

  if (campaignError) return Response.json({ error: campaignError.message }, { status: 500 });

  if (recipients.length > 0) {
    const rows = recipients.map((contact) => ({
      campaign_id: campaign.id,
      newsletter_contact_id: contact.id,
      client_id: contact.cliente_origem_id || null,
      email: contact.email,
      email_normalized: contact.email_normalized,
      name: contact.nome,
      status: "pending"
    }));

    const { error: recError } = await supabaseAdmin
      .from("campaign_recipients")
      .upsert(rows, { onConflict: "campaign_id,email_normalized" });

    if (recError) return Response.json({ error: recError.message }, { status: 500 });
  }

  return Response.json({ ok: true, campaign_id: campaign.id, total_recipients: recipients.length });
}
