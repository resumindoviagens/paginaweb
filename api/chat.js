import {
  WHATSAPP_URL,
  isRestrictedClientDataRequest,
  restrictedAnswer
} from "../lib/knowledge.js";
import {
  authenticatedUser,
  hasSupabaseConfig,
  secretSupabaseClient
} from "../lib/supabase-server.js";

function cleanText(value, max = 1800) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}

function normalize(value) {
  return cleanText(value, 5000)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set("a o os as de da do das dos e em no na nos nas um uma para por com que qual quais como meu minha seus suas voce voces eu ele ela isso este esta ao ou ja mais muito sobre se tem ter foi ser sao".split(" "));

function tokens(value) {
  return normalize(value).split(" ").filter(t => t.length > 2 && !STOP.has(t));
}

function asksForHandoff(question) {
  return /\b(?:preço|preco|precos|valor|valores|quanto custa|orçamento|orcamento|cotação|cotacao|contratar|iniciar|dar andamento|disponibilidade|meu caso|meu perfil|sou elegível|sou elegivel|falar com atendente|falar com uma pessoa)\b/i.test(normalize(question));
}

function knowledgeScore(question, item) {
  const q = normalize(question);
  const sources = [item.question, ...(item.variations || []), ...(item.keywords || [])]
    .filter(Boolean).map(normalize);
  let best = 0;
  const qTokens = new Set(tokens(q));
  for (const source of sources) {
    if (!source) continue;
    if (q === source) best = Math.max(best, 1);
    if (q.includes(source) || source.includes(q)) best = Math.max(best, .90);
    const sTokens = new Set(tokens(source));
    if (!qTokens.size || !sTokens.size) continue;
    const common = [...qTokens].filter(t => sTokens.has(t)).length;
    const precision = common / Math.max(qTokens.size, 1);
    const recall = common / Math.max(sTokens.size, 1);
    const f1 = common ? (2 * precision * recall) / (precision + recall) : 0;
    best = Math.max(best, f1);
  }
  return best + Math.min(Number(item.priority || 0), 100) / 10000;
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string") return payload.output_text.trim();
  const parts = [];
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if ((content?.type === "output_text" || content?.type === "text") && typeof content?.text === "string") {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n").trim();
}

function conversationText(messages, question) {
  const lines = (messages || []).slice(-12).map(item => {
    const label = item.sender_type === "human" ? "Atendente" : item.role === "assistant" ? "Assistente" : "Visitante";
    return `${label}: ${cleanText(item.content, 1600)}`;
  });
  lines.push(`Visitante: ${question}`);
  return lines.join("\n");
}

async function insertMessage(db, message) {
  const { data, error } = await db.from("chat_messages").insert(message).select().single();
  if (error) throw error;
  return data;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido." });
  }
  if (!hasSupabaseConfig()) {
    return res.status(503).json({ error: "O banco do chatbot ainda não foi configurado." });
  }

  const user = await authenticatedUser(req);
  if (!user) return res.status(401).json({ error: "Sessão do visitante não autenticada." });

  const sessionId = cleanText(req.body?.sessionId, 80);
  const question = cleanText(req.body?.question, 1200);
  if (!sessionId || !question) return res.status(400).json({ error: "Sessão e pergunta são obrigatórias." });

  const db = secretSupabaseClient();
  const { data: session, error: sessionError } = await db
    .from("chat_sessions")
    .select("id,visitor_id,status,human_requested")
    .eq("id", sessionId)
    .maybeSingle();
  if (sessionError || !session || session.visitor_id !== user.id) {
    return res.status(403).json({ error: "Esta conversa não pertence ao visitante autenticado." });
  }
  if (session.status === "closed") return res.status(409).json({ error: "Este atendimento já foi encerrado." });

  const userMessage = await insertMessage(db, {
    session_id: sessionId,
    author_id: user.id,
    role: "user",
    sender_type: "visitor",
    content: question,
    source: "visitor"
  });
  await db.from("chat_sessions").update({ last_activity: new Date().toISOString() }).eq("id", sessionId);

  if (session.status === "human" || session.status === "waiting_human") {
    return res.status(200).json({ ok: true, humanMode: true, userMessage });
  }

  let answer = "";
  let source = "";
  let metadata = {};

  if (isRestrictedClientDataRequest(question)) {
    answer = restrictedAnswer();
    source = "privacy-rule";
  } else {
    const { data: items, error: kbError } = await db
      .from("knowledge_items")
      .select("id,category,question,variations,answer,keywords,response_mode,whatsapp_on,priority,requires_review,valid_until")
      .eq("active", true)
      .order("priority", { ascending: false });
    if (kbError) console.error("Knowledge query error", kbError);

    const ranked = (items || [])
      .map(item => ({ item, score: knowledgeScore(question, item) }))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];

    if (best && best.score >= 0.73 && best.item.response_mode === "human_only") {
      answer = `Essa solicitação precisa ser tratada diretamente pela equipe da Resumindo Viagens. Continue pelo WhatsApp: ${WHATSAPP_URL}`;
      source = "human-only";
      metadata = { knowledge_id: best.item.id, match_score: Number(best.score.toFixed(3)) };
    } else if (best && best.score >= 0.73) {
      answer = best.item.answer;
      if (best.item.whatsapp_on && best.item.response_mode === "direct_and_handoff" && asksForHandoff(question) && !answer.includes("wa.me/")) {
        answer += `\n\nPara análise individual, valores ou contratação, continue com a equipe: ${WHATSAPP_URL}`;
      }
      source = "knowledge-direct";
      metadata = { knowledge_id: best.item.id, match_score: Number(best.score.toFixed(3)) };
    } else if (!process.env.OPENAI_API_KEY) {
      answer = best?.item?.answer || `Não consegui responder essa dúvida com segurança. Fale com a equipe da Resumindo Viagens: ${WHATSAPP_URL}`;
      source = best ? "knowledge-fallback" : "human-fallback";
    } else {
      const relatedMatches = ranked.slice(0, 4).filter(match => match.score > .08);
      const related = relatedMatches.map(({item}) => ({
        category: item.category,
        question: item.question,
        answer: item.answer,
        response_mode: item.response_mode,
        requires_review: item.requires_review,
        valid_until: item.valid_until
      }));
      const { data: recent } = await db
        .from("chat_messages")
        .select("id,role,sender_type,content,created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(14);
      const history = (recent || []).reverse().filter(message => message.id !== userMessage.id);

      const instructions = `
Você é o Chatbox Resumindo Viagens. Responda em português do Brasil, com clareza, acolhimento e objetividade.

REGRAS:
- Responda primeiro. Não encaminhe automaticamente ao WhatsApp.
- Use somente as respostas aprovadas fornecidas abaixo e o contexto da conversa.
- Quando faltar contexto, faça uma pergunta curta de esclarecimento.
- Encaminhe ao WhatsApp somente para preço, cotação, disponibilidade, contratação, análise individual, regra oficial variável ou atendimento humano.
- Nunca invente valores, prazos, requisitos, disponibilidade ou garantia de aprovação.
- Nunca confirme ou negue quem é cliente e nunca acesse, consulte ou altere dados privados.
- Não solicite CPF, passaporte, visto, DS-160, protocolo, senha, documentos ou comprovantes.
- Se houver conteúdo marcado para revisão ou com validade, não o trate como regra oficial definitiva.
- Responda normalmente em 3 a 8 frases.
- Link de atendimento, somente quando necessário: ${WHATSAPP_URL}

RESPOSTAS APROVADAS RELACIONADAS:
${JSON.stringify(related, null, 2)}
`;

      try {
        const apiResponse = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: (!process.env.OPENAI_MODEL?.trim() || process.env.OPENAI_MODEL.trim() === "OPENAI_MODEL") ? "gpt-5-mini" : process.env.OPENAI_MODEL.trim(),
            instructions,
            input: conversationText(history, question),
            max_output_tokens: 700,
            store: false
          })
        });
        const payload = await apiResponse.json().catch(() => ({}));
        if (!apiResponse.ok) {
          console.error("OpenAI API error", apiResponse.status, payload?.error?.message || payload);
          throw new Error("Falha na resposta automática.");
        }
        answer = extractOutputText(payload);
        if (!answer) throw new Error("Resposta vazia.");
        source = "openai-assisted";
        metadata = {
          input_tokens: payload?.usage?.input_tokens || null,
          output_tokens: payload?.usage?.output_tokens || null,
          related_knowledge_ids: relatedMatches.map(match => match.item.id)
        };
      } catch (error) {
        console.error("Chat handler error", error);
        answer = best?.item?.answer || `Não consegui responder essa dúvida com segurança neste momento. Fale com a equipe da Resumindo Viagens: ${WHATSAPP_URL}`;
        source = best ? "knowledge-safe-fallback" : "safe-fallback";
      }
    }
  }

  if (/\b(?:acessei|consultei|verifiquei|alterei|atualizei)\b.{0,50}\b(?:cadastro|processo|cliente|sistema|dados)\b/i.test(answer)) {
    answer = restrictedAnswer();
    source = "privacy-defense";
  }

  const assistantMessage = await insertMessage(db, {
    session_id: sessionId,
    role: "assistant",
    sender_type: "bot",
    content: answer,
    source,
    metadata
  });
  return res.status(200).json({ ok: true, userMessage, assistantMessage });
}
