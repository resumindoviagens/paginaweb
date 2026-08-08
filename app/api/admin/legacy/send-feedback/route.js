export const dynamic = "force-dynamic";

import { randomBytes } from "crypto";
import { requireAdmin } from "../../../../../lib/auth";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { getEmailTemplate } from "../../../../../lib/emailTemplates";
import { sendWithBrevo } from "../../../../../lib/brevoEmail";

function makeFeedbackToken() {
  return randomBytes(24).toString("hex");
}

function siteOrigin(request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
}

async function ensureFeedbackLink(client, origin) {
  const token = client.feedback_token || makeFeedbackToken();
  const expires = new Date();
  expires.setDate(expires.getDate() + 60);

  const { error } = await supabaseAdmin
    .from("clients")
    .update({
      feedback_liberado: true,
      feedback_token: token,
      feedback_token_expires_at: expires.toISOString(),
      stage_feedback_sent: true,
      feedback_service: "visto",
      updated_at: new Date().toISOString()
    })
    .eq("id", client.id);

  if (error) throw error;
  return `${origin}/feedback/${token}`;
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const origin = siteOrigin(request);

  const { data: clients, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("legacy_import", true)
    .neq("stage_feedback_answered", true)
    .or("stage_feedback_sent.is.null,stage_feedback_sent.eq.false")
    .not("email", "is", null);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results = [];
  for (const client of clients || []) {
    try {
      if (!client.email || !String(client.email).includes("@")) {
        results.push({ id: client.id, name: client.name, skipped: "sem email válido" });
        continue;
      }

      const feedbackLink = await ensureFeedbackLink(client, origin);
      const template = getEmailTemplate("pesquisa_satisfacao", { ...client, feedback_service: "visto" }, {
        feedbackLink,
        origin
      });

      const result = await sendWithBrevo({
        toEmail: client.email,
        toName: client.name,
        subject: template.subject,
        html: template.html,
        text: template.text,
        tags: ["resumindo-viagens", "feedback-legado"]
      });

      await supabaseAdmin.from("audit_logs").insert({
        client_id: client.id,
        action: "legacy_feedback_email_sent",
        details: { to: client.email, cc: client.secondary_email || "", message_id: result?.messageId || null }
      });

      results.push({ id: client.id, name: client.name, sent: true });
    } catch (sendError) {
      await supabaseAdmin.from("audit_logs").insert({
        client_id: client.id,
        action: "legacy_feedback_email_failed",
        details: { error: sendError?.message || String(sendError) }
      });
      results.push({ id: client.id, name: client.name, error: sendError?.message || String(sendError) });
    }
  }

  const sent = results.filter((item) => item.sent).length;
  const failed = results.filter((item) => item.error).length;
  const skipped = results.filter((item) => item.skipped).length;

  return Response.json({ ok: true, found: (clients || []).length, sent, failed, skipped, results });
}
