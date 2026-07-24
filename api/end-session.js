
const MAX_MESSAGES = 80;
const MAX_CONTENT = 4000;

function cleanText(value, max = MAX_CONTENT) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}

function escapeHtml(value) {
  return cleanText(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  })[char]);
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      dateStyle: "medium",
      timeStyle: "medium"
    }).format(new Date(value));
  } catch (_) {
    return cleanText(value, 100) || "não informado";
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({error: "Método não permitido."});
  }

  if (!process.env.BREVO_API_KEY) {
    return res.status(503).json({error: "O envio de e-mail ainda não foi configurado na Vercel."});
  }

  const rawMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = rawMessages
    .filter(m => m && (m.role === "user" || m.role === "assistant"))
    .slice(-MAX_MESSAGES)
    .map(m => ({
      role: m.role,
      content: cleanText(m.content),
      timestamp: cleanText(m.timestamp, 100)
    }))
    .filter(m => m.content);

  if (!messages.some(m => m.role === "user")) {
    return res.status(400).json({error: "A conversa não possui perguntas para enviar."});
  }

  const sessionId = cleanText(req.body?.sessionId, 120) || `sem-id-${Date.now()}`;
  const visitorName = cleanText(req.body?.name, 60) || "Visitante não identificado";
  const startedAt = formatDate(req.body?.startedAt);
  const endedAt = formatDate(req.body?.endedAt || new Date().toISOString());
  const reason = cleanText(req.body?.reason, 160) || "encerramento não informado";
  const page = cleanText(req.body?.page, 300);

  const rows = messages.map((message, index) => {
    const isUser = message.role === "user";
    return `
      <tr>
        <td style="padding:14px;border-bottom:1px solid #e8edf4;vertical-align:top;width:130px;font-weight:700;color:${isUser ? '#0a3a7c' : '#b36f00'}">
          ${isUser ? 'Cliente' : 'Assistente'}<br>
          <span style="font-size:11px;font-weight:400;color:#78869a">${escapeHtml(formatDate(message.timestamp))}</span>
        </td>
        <td style="padding:14px;border-bottom:1px solid #e8edf4;color:#243653;white-space:pre-wrap;line-height:1.55">${escapeHtml(message.content)}</td>
      </tr>`;
  }).join("");

  const textTranscript = messages.map(message => {
    const label = message.role === "user" ? "CLIENTE" : "ASSISTENTE";
    return `[${formatDate(message.timestamp)}] ${label}:\n${message.content}`;
  }).join("\n\n");

  const htmlContent = `<!doctype html><html><body style="margin:0;background:#f4f6fb;font-family:Arial,sans-serif;color:#06183b">
    <div style="max-width:850px;margin:24px auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #e2e7ef">
      <div style="background:#04173d;color:white;padding:24px 28px">
        <div style="font-size:12px;color:#f0a000;text-transform:uppercase;font-weight:700;letter-spacing:1px">Resumindo Viagens</div>
        <h1 style="font-size:24px;margin:8px 0 4px">Resumo de atendimento do chatbox</h1>
        <p style="margin:0;color:#dce8f8">Perguntas e respostas registradas no site institucional.</p>
      </div>
      <div style="padding:22px 28px;background:#fff8e7;border-bottom:1px solid #f0dfad;font-size:13px;line-height:1.55">
        <strong>Observação de privacidade:</strong> o chatbox foi programado sem acesso ao cadastro ou ao sistema de clientes. Este e-mail registra somente o conteúdo digitado no chat público e as respostas automáticas exibidas ao visitante.
      </div>
      <div style="padding:22px 28px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:5px 0;font-weight:700;width:180px">Sessão</td><td>${escapeHtml(sessionId)}</td></tr>
          <tr><td style="padding:5px 0;font-weight:700">Nome informado</td><td>${escapeHtml(visitorName)}</td></tr>
          <tr><td style="padding:5px 0;font-weight:700">Início</td><td>${escapeHtml(startedAt)}</td></tr>
          <tr><td style="padding:5px 0;font-weight:700">Encerramento</td><td>${escapeHtml(endedAt)}</td></tr>
          <tr><td style="padding:5px 0;font-weight:700">Motivo</td><td>${escapeHtml(reason)}</td></tr>
          <tr><td style="padding:5px 0;font-weight:700">Página</td><td>${escapeHtml(page)}</td></tr>
        </table>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <div style="padding:20px 28px;color:#66758a;font-size:12px;background:#f8fafc">Total de mensagens registradas: ${messages.length}</div>
    </div>
  </body></html>`;

  const toEmail = process.env.CHAT_EMAIL_TO || "contato@resumindoviagens.com.br";
  const fromEmail = process.env.CHAT_EMAIL_FROM || "contato@resumindoviagens.com.br";
  const fromName = process.env.CHAT_EMAIL_FROM_NAME || "Chatbox Resumindo Viagens";
  const shortId = sessionId.slice(0, 8);

  const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: {name: fromName, email: fromEmail},
      to: [{name: "Resumindo Viagens", email: toEmail}],
      replyTo: {name: "Resumindo Viagens", email: fromEmail},
      subject: `Chatbox — ${visitorName} — sessão ${shortId}`,
      htmlContent,
      textContent: `RESUMO DE ATENDIMENTO DO CHATBOX\n\nSessão: ${sessionId}\nNome: ${visitorName}\nInício: ${startedAt}\nEncerramento: ${endedAt}\nMotivo: ${reason}\nPágina: ${page}\n\n${textTranscript}`,
      tags: ["chatbox-site"],
      headers: {"X-Chat-Session": sessionId}
    })
  });

  const payload = await brevoResponse.json().catch(() => ({}));
  if (!brevoResponse.ok) {
    console.error("Brevo API error", brevoResponse.status, payload);
    return res.status(502).json({error: "Não foi possível enviar o resumo por e-mail."});
  }

  return res.status(200).json({ok: true, messageId: payload.messageId || null});
}
