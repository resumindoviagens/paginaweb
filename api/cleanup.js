import { hasSupabaseConfig, secretSupabaseClient } from "../lib/supabase-server.js";
import { loadSessionMessages, sendSessionReport } from "../lib/session-report.js";

const INACTIVITY_MINUTES = 15;

async function sendPendingReports(db) {
  const inactivityCutoff = new Date(Date.now() - INACTIVITY_MINUTES * 60 * 1000).toISOString();
  const { data: inactive, error: inactiveError } = await db
    .from("chat_sessions")
    .select("*")
    .neq("status", "closed")
    .is("report_sent_at", null)
    .lt("last_activity", inactivityCutoff)
    .order("last_activity", { ascending: true })
    .limit(20);
  if (inactiveError) throw inactiveError;

  const { data: closedUnsent, error: closedError } = await db
    .from("chat_sessions")
    .select("*")
    .eq("status", "closed")
    .is("report_sent_at", null)
    .not("ended_at", "is", null)
    .order("ended_at", { ascending: true })
    .limit(20);
  if (closedError) throw closedError;

  let sent = 0;
  let failed = 0;
  const queue = [
    ...(inactive || []).map(session => ({ session, reason: "inatividade por 15 minutos" })),
    ...(closedUnsent || []).map(session => ({ session, reason: session.report_reason || "encerramento recuperado pelo sistema" }))
  ];
  const unique = new Map(queue.map(item => [item.session.id, item]));

  for (const { session, reason } of [...unique.values()].slice(0, 20)) {
    try {
      const messages = await loadSessionMessages(db, session.id);
      const result = await sendSessionReport({
        db,
        session,
        messages,
        reason,
        page: session.page_url,
        endedAt: session.ended_at || new Date().toISOString()
      });
      if (result.ok) sent += 1;
      else failed += 1;
    } catch (error) {
      failed += 1;
      console.error("Pending guidance report error", session.id, error);
    }
  }

  return { queued: unique.size, sent, failed };
}

export default async function handler(req, res) {
  const expected = process.env.CRON_SECRET;
  const provided = String(req.headers?.authorization || "");
  if (!expected || provided !== `Bearer ${expected}`) return res.status(401).json({ error: "Não autorizado." });
  if (!hasSupabaseConfig()) return res.status(503).json({ error: "Supabase não configurado." });

  const db = secretSupabaseClient();
  let pendingReports = { queued: 0, sent: 0, failed: 0 };
  try {
    pendingReports = await sendPendingReports(db);
  } catch (error) {
    console.error("Pending report cleanup error", error);
    pendingReports = { queued: 0, sent: 0, failed: 1, error: error.message };
  }

  const { data: setting } = await db.from("chat_settings").select("value").eq("key", "retention_days").maybeSingle();
  const days = Math.max(1, Math.min(Number(setting?.value || 90), 3650));
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await db
    .from("chat_sessions")
    .delete()
    .eq("status", "closed")
    .lt("ended_at", cutoff)
    .select("id,visitor_id");
  if (error) return res.status(500).json({ error: error.message, pendingReports });

  let deletedAnonymousUsers = 0;
  const visitorIds = [...new Set((data || []).map(row => row.visitor_id).filter(Boolean))];
  for (const visitorId of visitorIds.slice(0, 200)) {
    const { count: remaining } = await db.from("chat_sessions").select("id", { count: "exact", head: true }).eq("visitor_id", visitorId);
    const { data: admin } = await db.from("admin_profiles").select("user_id").eq("user_id", visitorId).maybeSingle();
    if (!remaining && !admin) {
      const { error: deleteUserError } = await db.auth.admin.deleteUser(visitorId);
      if (!deleteUserError) deletedAnonymousUsers += 1;
    }
  }

  return res.status(200).json({
    ok: true,
    inactivityMinutes: INACTIVITY_MINUTES,
    pendingReports,
    retentionDays: days,
    deletedSessions: data?.length || 0,
    deletedAnonymousUsers
  });
}
