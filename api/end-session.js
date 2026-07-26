import { authenticatedUser, hasSupabaseConfig, secretSupabaseClient } from "../lib/supabase-server.js";

const MAX_MESSAGES = 160;
const MAX_CONTENT = 5000;

function cleanText(value, max = MAX_CONTENT) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}

function escapeHtml(value) {
  return cleanText(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      dateStyle: "medium",
      timeStyle: "medium"
    }).format(new Date(value));
  } catch {
    return cleanText(value, 100) || "não informado";
  }
}

function messageLabel(message) {
  if (message.sender_type === "visitor" || message.role === "user") return "Cliente";
  if (message.sender_type === "human") return "Atendente";
  if (message.sender_type === "system") return "Sistema";
  return "Assistente";
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido." });
  }

  const sessionId = cleanText(req.body?.sessionId, 80);
  let rawMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  let sessionData = null;
  let db = null;

  if (hasSupabaseConfig() && sessionId) {
    const user = await authenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Sessão não autenticada." });
    db = secretSupabaseClient();
    const { data: session, error: sessionError } = await db.from("chat_sessions").select("*").eq("id", sessionId).maybeSingle();
    if (sessionError) return res.status(500).json({ error: "Não foi possível consultar a conversa." });
    if (!session || session.visitor_id !== user.id) return res.status(403).json({ error: "Conversa não autorizada." });
    sessionData = session;

    if (session.report_sent_at) {
      return res.status(200).json({ ok: true, alreadySent: true, emailSent: true, messageId: session.report_message_id || null });
    }

    const { data: stored, error: messagesError } = await db
      .from("chat_messages")
      .select("role,sender_type,content,created_at")
      .eq("session_id", sessionId)
      .order("created_at");
    if (messagesError) return res.status(500).json({ error: "Não foi possível carregar o histórico da conversa." });
    if (stored?.length) {
      rawMessages = stored.map(message => ({
        role: message.role,
        sender_type: message.sender_type,
        content: message.content,
        timestamp: message.created_at
      }));
    }
  }

  const messages = rawMessages.slice(-MAX_MESSAGES).map(message => ({
    role: cleanText(message.role, 20),
    sender_type: cleanText(message.sender_type, 30),
    content: cleanText(message.content),
    timestamp: cleanText(message.timestamp || message.created_at, 100)
  })).filter(message => message.content);

  const endedAtRaw = req.body?.endedAt || new Date().toISOString();

  // A conversa pode ter somente uma triagem. Nesse caso há uma mensagem de sistema,
  // mas não necessariamente uma pergunta com role=user.
  if (!messages.length) {
    if (db && sessionId) {
      await db.from("chat_sessions").update({
        status: "closed",
        ended_at: endedAtRaw,
        last_activity: endedAtRaw
      }).eq("id", sessionId);
    }
    return res.status(200).json({ ok: true, emailSent: false, reason: "empty-conversation" });
  }

  if (!process.env.BREVO_API_KEY) {
    return res.status(503).json({ error: "O envio de e-mail ainda não foi configurado." });
  }

  const visitorName = cleanText(req.body?.name || sessionData?.visitor_name, 60) || "Visitante não identificado";
  const startedAt = formatDate(req.body?.startedAt || sessionData?.started_at);
  const endedAt = formatDate(endedAtRaw);
  const reason = cleanText(req.body?.reason, 160) || "encerramento não informado";
  const page = cleanText(req.body?.page || sessionData?.page_url, 300);

  const rows = messages.map(message => {
    const label = messageLabel(message);
    const color = label === "Cliente" ? "#0a3a7c" : label === "Atendente" ? "#13713a" : label === "Sistema" ? "#596579" : "#b36f00";
    return `<tr><td style="padding:14px;border-bottom:1px solid #e8edf4;vertical-align:top;width:130px;font-weight:700;color:${color}">${label}<br><span style="font-size:11px;font-weight:400;color:#78869a">${escapeHtml(formatDate(message.timestamp))}</span></td><td style="padding:14px;border-bottom:1px solid #e8edf4;color:#243653;white-space:pre-wrap;line-height:1.55">${escapeHtml(message.content)}</td></tr>`;
  }).join("");

  const textTranscript = messages.map(message =>
    `[${formatDate(message.timestamp)}] ${messageLabel(message).toUpperCase()}:\n${message.content}`
  ).join("\n\n");

  const htmlContent = `<!doctype html><html><body style="margin:0;background:#f4f6fb;font-family:Arial,sans-serif;color:#06183b"><div style="max-width:850px;margin:24px auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #e2e7ef"><div style="background:#04173d;color:white;padding:24px 28px"><div style="font-size:12px;color:#f0a000;text-transform:uppercase;font-weight:700">Resumindo Viagens</div><h1 style="font-size:24px;margin:8px 0 4px">Resumo de atendimento do chatbox</h1></div><div style="padding:22px 28px;background:#fff8e7;font-size:13px"><strong>Privacidade:</strong> este relatório registra somente o conteúdo digitado no chat público e as respostas apresentadas.</div><div style="padding:22px 28px"><p><strong>Sessão:</strong> ${escapeHtml(sessionId)}</p><p><strong>Nome:</strong> ${escapeHtml(visitorName)}</p><p><strong>Início:</strong> ${escapeHtml(startedAt)}</p><p><strong>Encerramento:</strong> ${escapeHtml(endedAt)}</p><p><strong>Motivo:</strong> ${escapeHtml(reason)}</p><p><strong>Página:</strong> ${escapeHtml(page)}</p></div><table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table></div></body></html>`;

  const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: { name: "Chatbox Resumindo Viagens", email: "contato@resumindoviagens.com.br" },
      to: [{ name: "Resumindo Viagens", email: "contato@resumindoviagens.com.br" }],
      replyTo: { name: "Resumindo Viagens", email: "contato@resumindoviagens.com.br" },
      subject: `Chatbox — ${visitorName} — sessão ${sessionId.slice(0, 8)}`,
      htmlContent,
      textContent: `RESUMO DO CHATBOX\n\nSessão: ${sessionId}\nNome: ${visitorName}\nInício: ${startedAt}\nFim: ${endedAt}\nMotivo: ${reason}\nPágina: ${page}\n\n${textTranscript}`,
      tags: ["chatbox-site"],
      headers: { "X-Chat-Session": sessionId }
    })
  });

  const payload = await brevoResponse.json().catch(() => ({}));
  if (!brevoResponse.ok) {
    console.error("Brevo API error", brevoResponse.status, payload);
    return res.status(502).json({
      error: "Não foi possível enviar o resumo por e-mail.",
      providerStatus: brevoResponse.status,
      providerCode: payload?.code || null
    });
  }

  if (db && sessionId) {
    await db.from("chat_sessions").update({
      status: "closed",
      ended_at: endedAtRaw,
      last_activity: endedAtRaw,
      report_sent_at: endedAtRaw,
      report_message_id: payload.messageId || null
    }).eq("id", sessionId);
  }

  return res.status(200).json({ ok: true, emailSent: true, messageId: payload.messageId || null });
}
