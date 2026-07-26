import { hasSupabaseConfig, secretSupabaseClient } from "../lib/supabase-server.js";

export default async function handler(req, res) {
  const expected = process.env.CRON_SECRET;
  const provided = String(req.headers?.authorization || "");
  if (!expected || provided !== `Bearer ${expected}`) return res.status(401).json({ error: "Não autorizado." });
  if (!hasSupabaseConfig()) return res.status(503).json({ error: "Supabase não configurado." });
  const db = secretSupabaseClient();
  const { data: setting } = await db.from("chat_settings").select("value").eq("key", "retention_days").maybeSingle();
  const days = Math.max(1, Math.min(Number(setting?.value || 90), 3650));
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await db.from("chat_sessions").delete().eq("status", "closed").lt("ended_at", cutoff).select("id,visitor_id");
  if (error) return res.status(500).json({ error: error.message });

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

  return res.status(200).json({ ok: true, retentionDays: days, deletedSessions: data?.length || 0, deletedAnonymousUsers });
}
