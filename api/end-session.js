import { authenticatedUser, hasSupabaseConfig, secretSupabaseClient } from "../lib/supabase-server.js";
import { cleanText, loadSessionMessages, sendSessionReport } from "../lib/session-report.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido." });
  }
  if (!hasSupabaseConfig()) {
    return res.status(503).json({ error: "O atendimento online ainda não foi configurado." });
  }

  const user = await authenticatedUser(req);
  if (!user) return res.status(401).json({ error: "Sessão não autenticada." });

  const sessionId = cleanText(req.body?.sessionId, 80);
  if (!sessionId) return res.status(400).json({ error: "A sessão é obrigatória." });

  const db = secretSupabaseClient();
  const { data: storedSession, error: sessionError } = await db
    .from("chat_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();
  if (sessionError) return res.status(500).json({ error: "Não foi possível consultar a orientação." });
  if (!storedSession || storedSession.visitor_id !== user.id) {
    return res.status(403).json({ error: "Orientação não autorizada." });
  }

  if (storedSession.report_sent_at) {
    return res.status(200).json({
      ok: true,
      alreadySent: true,
      emailSent: true,
      messageId: storedSession.report_message_id || null
    });
  }

  const endedAt = cleanText(req.body?.endedAt, 100) || new Date().toISOString();
  const session = {
    ...storedSession,
    visitor_name: cleanText(storedSession.visitor_name || req.body?.name, 60),
    visitor_phone: cleanText(storedSession.visitor_phone || req.body?.phone, 30),
    visitor_email: cleanText(storedSession.visitor_email || req.body?.email, 160),
    page_url: cleanText(storedSession.page_url || req.body?.page, 500)
  };

  try {
    const messages = await loadSessionMessages(db, sessionId);
    const result = await sendSessionReport({
      db,
      session,
      messages,
      reason: cleanText(req.body?.reason, 160),
      page: cleanText(req.body?.page, 500),
      endedAt
    });

    if (!result.ok) {
      await db.from("chat_sessions").update({
        status: "closed",
        ended_at: endedAt,
        last_activity: endedAt,
        report_reason: cleanText(req.body?.reason, 160) || null
      }).eq("id", sessionId);
      return res.status(result.notConfigured ? 503 : 502).json({
        error: result.error || "A orientação foi encerrada, mas a cópia não pôde ser enviada agora.",
        emailSent: false,
        closed: true,
        providerStatus: result.status || null,
        providerCode: result.code || null
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("End guidance error", error);
    await db.from("chat_sessions").update({
      status: "closed",
      ended_at: endedAt,
      last_activity: endedAt,
      report_reason: cleanText(req.body?.reason, 160) || null
    }).eq("id", sessionId);
    return res.status(500).json({
      error: "A orientação foi encerrada, mas a cópia será tentada novamente pelo sistema.",
      emailSent: false,
      closed: true
    });
  }
}
