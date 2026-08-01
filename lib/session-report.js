const EMAIL_TO = "contato@resumindoviagens.com.br";
const MAX_MESSAGES = 180;
const MAX_CONTENT = 6000;

export function cleanText(value, max = MAX_CONTENT) {
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

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(value, 160));
}

function normalizePhone(value) {
  let digits = cleanText(value, 30).replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return digits.length >= 12 && digits.length <= 13 && digits.startsWith("55") ? digits : "";
}

function messageLabel(message) {
  if (message.sender_type === "visitor" || message.role === "user") return "Pessoa";
  if (message.sender_type === "human") return "Equipe Resumindo";
  if (message.sender_type === "system") return "Sistema";
  return "Orientação Resumindo";
}

function reasonLabel(value) {
  const reason = cleanText(value, 160).toLowerCase();
  if (reason.includes("whatsapp")) return "Continuação pelo WhatsApp";
  if (reason.includes("inatividade")) return "Inatividade";
  if (reason.includes("visitante")) return "Encerrado pela pessoa";
  return cleanText(value, 160) || "Encerramento não informado";
}

function shortPreview(value, max = 220) {
  const text = cleanText(value, 1200).replace(/\s+/g, " ");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function buildQuestionAnswerPairs(messages) {
  const pairs = [];
  let current = null;
  for (const message of messages) {
    const isVisitor = message.sender_type === "visitor" || message.role === "user";
    const isAnswer = message.sender_type === "bot" || message.sender_type === "human" || message.role === "assistant";
    if (isVisitor) {
      current = { question: message, answers: [] };
      pairs.push(current);
    } else if (isAnswer && current) {
      current.answers.push(message);
    }
  }
  return pairs;
}

function contactHtml(phone, email) {
  const rows = [];
  if (phone) {
    rows.push(`<p style="margin:5px 0"><strong>Telefone/WhatsApp:</strong> +${escapeHtml(phone)} · <a href="https://wa.me/${escapeHtml(phone)}" style="color:#0a3a7c;font-weight:bold">abrir conversa</a></p>`);
  }
  if (email) {
    rows.push(`<p style="margin:5px 0"><strong>E-mail:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#0a3a7c;font-weight:bold">${escapeHtml(email)}</a></p>`);
  }
  return rows.join("") || '<p style="margin:5px 0;color:#6b7890">Nenhum telefone ou e-mail foi informado.</p>';
}

function qaHtml(pairs) {
  if (!pairs.length) {
    return '<div style="padding:18px;border:1px solid #dfe6ef;border-radius:12px;background:#f8fafc;color:#5d6e85">Nenhuma pergunta foi registrada antes do encerramento.</div>';
  }
  return pairs.map((pair, index) => {
    const answers = pair.answers.length
      ? pair.answers.map(answer => `<div style="margin-top:10px;padding:14px 15px;border-left:4px solid ${answer.sender_type === "human" ? "#178245" : "#f0a000"};background:#fbfcfe;border-radius:8px"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;font-weight:bold;color:#65758c;margin-bottom:6px">${escapeHtml(messageLabel(answer))} · ${escapeHtml(formatDate(answer.timestamp || answer.created_at))}</div><div style="white-space:pre-wrap;line-height:1.55;color:#243653">${escapeHtml(answer.content)}</div></div>`).join("")
      : '<div style="margin-top:10px;padding:14px 15px;border-left:4px solid #a5afbd;background:#fbfcfe;border-radius:8px;color:#68778c">Sem resposta registrada antes do encerramento.</div>';
    return `<section style="margin:0 0 18px;padding:18px;border:1px solid #dfe6ef;border-radius:14px;background:white"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#0a3a7c;font-weight:bold">Pergunta ${index + 1} · ${escapeHtml(formatDate(pair.question.timestamp || pair.question.created_at))}</div><div style="margin-top:8px;font-size:15px;line-height:1.55;color:#122b4d;white-space:pre-wrap;font-weight:600">${escapeHtml(pair.question.content)}</div>${answers}</section>`;
  }).join("");
}

function transcriptHtml(messages) {
  if (!messages.length) return '<p style="color:#6b7890">Sem mensagens registradas.</p>';
  const rows = messages.map(message => `<tr><td style="padding:11px;border-bottom:1px solid #e8edf4;vertical-align:top;width:145px;font-weight:700;color:#3e536f">${escapeHtml(messageLabel(message))}<br><span style="font-size:10px;font-weight:400;color:#8793a4">${escapeHtml(formatDate(message.timestamp || message.created_at))}</span></td><td style="padding:11px;border-bottom:1px solid #e8edf4;color:#334863;white-space:pre-wrap;line-height:1.5">${escapeHtml(message.content)}</td></tr>`).join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:12px">${rows}</table>`;
}

export async function loadSessionMessages(db, sessionId) {
  const { data, error } = await db
    .from("chat_messages")
    .select("role,sender_type,content,created_at")
    .eq("session_id", sessionId)
    .order("created_at");
  if (error) throw error;
  return (data || []).slice(-MAX_MESSAGES).map(message => ({
    role: cleanText(message.role, 20),
    sender_type: cleanText(message.sender_type, 30),
    content: cleanText(message.content),
    timestamp: cleanText(message.created_at, 100)
  })).filter(message => message.content);
}

export async function sendSessionReport({ db, session, messages = [], reason, page, endedAt }) {
  if (!session?.id) throw new Error("Sessão inválida para relatório.");
  if (session.report_sent_at) {
    return { ok: true, alreadySent: true, emailSent: true, messageId: session.report_message_id || null };
  }
  if (!process.env.BREVO_API_KEY) {
    return { ok: false, emailSent: false, notConfigured: true, error: "O envio de e-mail ainda não foi configurado." };
  }

  const normalizedMessages = messages.slice(-MAX_MESSAGES).map(message => ({
    role: cleanText(message.role, 20),
    sender_type: cleanText(message.sender_type, 30),
    content: cleanText(message.content),
    timestamp: cleanText(message.timestamp || message.created_at, 100)
  })).filter(message => message.content);
  const pairs = buildQuestionAnswerPairs(normalizedMessages);
  const questions = pairs.map(pair => pair.question.content);
  const visitorName = cleanText(session.visitor_name, 60) || "Visitante não identificado";
  const visitorPhone = normalizePhone(session.visitor_phone);
  const visitorEmail = validEmail(session.visitor_email) ? cleanText(session.visitor_email, 160).toLowerCase() : "";
  const endedAtRaw = endedAt || new Date().toISOString();
  const reasonText = reasonLabel(reason);
  const startedAtText = formatDate(session.started_at);
  const endedAtText = formatDate(endedAtRaw);
  const pageText = cleanText(page || session.page_url, 500);
  const previews = questions.slice(0, 3).map((question, index) => `<li style="margin:6px 0">${index + 1}. ${escapeHtml(shortPreview(question))}</li>`).join("");
  const quickSummary = questions.length
    ? `<p style="margin:5px 0"><strong>Quantidade de perguntas:</strong> ${questions.length}</p><p style="margin:14px 0 5px"><strong>Assuntos apresentados:</strong></p><ol style="margin:0;padding-left:20px;color:#334863">${previews}</ol>${questions.length > 3 ? `<p style="margin:8px 0 0;color:#6b7890">Mais ${questions.length - 3} pergunta(s) constam na revisão completa abaixo.</p>` : ""}`
    : '<p style="margin:5px 0;color:#6b7890">A pessoa iniciou a orientação, mas não registrou uma pergunta antes do encerramento.</p>';

  const htmlContent = `<!doctype html><html><body style="margin:0;background:#f4f6fb;font-family:Arial,sans-serif;color:#06183b"><div style="max-width:860px;margin:24px auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #e2e7ef"><div style="background:#04173d;color:white;padding:24px 28px"><div style="font-size:12px;color:#f0a000;text-transform:uppercase;font-weight:700">Resumindo Viagens</div><h1 style="font-size:24px;margin:8px 0 4px">Orientação inicial recebida</h1><p style="margin:0;color:#dce8f8;font-size:13px">Resumo objetivo e revisão integral das perguntas e respostas.</p></div><div style="padding:20px 28px;background:#fff8e7;font-size:12px;line-height:1.5"><strong>Privacidade:</strong> este relatório contém somente o nome, os contatos voluntariamente informados e o conteúdo digitado na orientação pública. Ele não consulta o cadastro interno de clientes.</div><div style="padding:24px 28px"><h2 style="font-size:18px;margin:0 0 12px">Dados para continuidade</h2><p style="margin:5px 0"><strong>Nome:</strong> ${escapeHtml(visitorName)}</p>${contactHtml(visitorPhone, visitorEmail)}<p style="margin:5px 0"><strong>Motivo do envio:</strong> ${escapeHtml(reasonText)}</p><p style="margin:5px 0"><strong>Início:</strong> ${escapeHtml(startedAtText)}</p><p style="margin:5px 0"><strong>Encerramento:</strong> ${escapeHtml(endedAtText)}</p><p style="margin:5px 0"><strong>Página:</strong> ${escapeHtml(pageText)}</p><p style="margin:5px 0"><strong>Referência técnica:</strong> ${escapeHtml(session.id)}</p></div><div style="padding:0 28px 24px"><div style="padding:18px;border-radius:14px;background:#f6f8fc;border:1px solid #e2e8f0"><h2 style="font-size:18px;margin:0 0 10px">Resumo rápido</h2>${quickSummary}</div></div><div style="padding:0 28px 10px"><h2 style="font-size:20px;margin:0 0 5px">Perguntas e orientações completas</h2><p style="margin:0 0 16px;color:#61728a;font-size:12px">As perguntas aparecem integralmente para permitir a conferência da adequação de cada resposta.</p>${qaHtml(pairs)}</div><div style="padding:8px 28px 28px"><details><summary style="cursor:pointer;font-weight:bold;color:#0a3a7c">Ver registro técnico completo</summary><div style="margin-top:12px;border:1px solid #e2e7ef;border-radius:12px;overflow:hidden">${transcriptHtml(normalizedMessages)}</div></details></div></div></body></html>`;

  const textTranscript = normalizedMessages.map(message =>
    `[${formatDate(message.timestamp)}] ${messageLabel(message).toUpperCase()}:\n${message.content}`
  ).join("\n\n");
  const textQuestions = questions.length
    ? questions.map((question, index) => `${index + 1}. ${question}`).join("\n")
    : "Nenhuma pergunta registrada.";

  const emailPayload = {
    sender: { name: "Resumindo Viagens — Orientação", email: EMAIL_TO },
    to: [{ name: "Resumindo Viagens", email: EMAIL_TO }],
    replyTo: visitorEmail ? { name: visitorName, email: visitorEmail } : { name: "Resumindo Viagens", email: EMAIL_TO },
    subject: `Orientação do site — ${visitorName} — ${reasonText}`,
    htmlContent,
    textContent: `ORIENTAÇÃO INICIAL RECEBIDA\n\nNome: ${visitorName}\nTelefone: ${visitorPhone ? `+${visitorPhone}` : "não informado"}\nE-mail: ${visitorEmail || "não informado"}\nMotivo: ${reasonText}\nInício: ${startedAtText}\nFim: ${endedAtText}\nPágina: ${pageText}\nReferência: ${session.id}\n\nRESUMO DAS PERGUNTAS\n${textQuestions}\n\nREGISTRO COMPLETO\n${textTranscript}`,
    tags: ["orientacao-site"],
    headers: { "X-Guidance-Session": session.id }
  };

  const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify(emailPayload)
  });
  const payload = await brevoResponse.json().catch(() => ({}));
  if (!brevoResponse.ok) {
    console.error("Brevo API error", brevoResponse.status, payload);
    return {
      ok: false,
      emailSent: false,
      status: brevoResponse.status,
      code: payload?.code || null,
      error: "Não foi possível enviar a cópia por e-mail."
    };
  }

  const { error: updateError } = await db.from("chat_sessions").update({
    status: "closed",
    ended_at: endedAtRaw,
    last_activity: endedAtRaw,
    report_sent_at: endedAtRaw,
    report_message_id: payload.messageId || null,
    report_reason: cleanText(reason, 160) || null
  }).eq("id", session.id);
  if (updateError) console.error("Session report update error", updateError);

  return { ok: true, emailSent: true, messageId: payload.messageId || null };
}
