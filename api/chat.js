import {
  isRestrictedClientDataRequest,
  restrictedAnswer
} from "../lib/knowledge.js";
import { selectApprovedAnswer } from "../lib/answer-matcher.js";
import {
  authenticatedUser,
  hasSupabaseConfig,
  secretSupabaseClient
} from "../lib/supabase-server.js";

const DEFAULT_NO_ANSWER = "Ainda não tenho uma orientação aprovada e segura para responder a essa dúvida por aqui. Como a resposta pode depender de uma análise individual, a equipe da Resumindo Viagens poderá orientar você pessoalmente. Use a opção “Aprofundar pelo WhatsApp” e não envie documentos ou dados pessoais nesta área.";

function cleanText(value, max = 1800) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}

async function insertMessage(db, message) {
  const { data, error } = await db.from("chat_messages").insert(message).select().single();
  if (error) throw error;
  return data;
}

async function noAnswerMessage(db) {
  const { data, error } = await db
    .from("chat_settings")
    .select("value")
    .eq("key", "no_answer_message")
    .maybeSingle();
  if (error) console.error("No-answer setting query error", error);
  return cleanText(data?.value, 6000) || DEFAULT_NO_ANSWER;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido." });
  }
  if (!hasSupabaseConfig()) {
    return res.status(503).json({ error: "O banco da orientação online ainda não foi configurado." });
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
    const { data: items, error: knowledgeError } = await db
      .from("knowledge_items")
      .select("id,category,question,variations,answer,response_mode,priority,requires_review,valid_until,active")
      .eq("active", true)
      .order("priority", { ascending: false });

    if (knowledgeError) {
      console.error("Knowledge query error", knowledgeError);
      answer = await noAnswerMessage(db);
      source = "approved-fallback";
    } else {
      const match = selectApprovedAnswer(question, items || []);
      if (match) {
        // Entrega literal: nenhuma palavra é acrescentada, removida, resumida ou reformulada.
        answer = cleanText(match.item.answer, 6000);
        source = "knowledge-literal";
        metadata = {
          knowledge_id: match.item.id,
          match_score: Number(match.score.toFixed(3)),
          exact_match: Boolean(match.exact),
          matched_text: cleanText(match.matchedText, 500),
          response_mode: cleanText(match.item.response_mode, 40)
        };
      } else {
        answer = await noAnswerMessage(db);
        source = "approved-fallback";
      }
    }
  }

  const assistantMessage = await insertMessage(db, {
    session_id: sessionId,
    role: "assistant",
    sender_type: "bot",
    content: answer,
    source,
    metadata
  });
  return res.status(200).json({ ok: true, userMessage, assistantMessage, literalApprovedOnly: true });
}
