export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  return res.status(200).json({
    ok: true,
    version: "chatbox-respostas-melhoradas-v3",
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    openaiModel: (
      process.env.OPENAI_MODEL &&
      process.env.OPENAI_MODEL.trim() &&
      process.env.OPENAI_MODEL.trim() !== "OPENAI_MODEL"
    ) ? process.env.OPENAI_MODEL.trim() : "gpt-5-mini",
    brevoConfigured: Boolean(process.env.BREVO_API_KEY),
    senderEmail: "contato@resumindoviagens.com.br",
    recipientEmail: "contato@resumindoviagens.com.br"
  });
}
