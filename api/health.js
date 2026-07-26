export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  return res.status(200).json({
    ok: true,
    version: "painel-chat-v4.1-imagens-preservadas",
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    openaiModel: (!process.env.OPENAI_MODEL?.trim() || process.env.OPENAI_MODEL.trim() === "OPENAI_MODEL") ? "gpt-5-mini" : process.env.OPENAI_MODEL.trim(),
    brevoConfigured: Boolean(process.env.BREVO_API_KEY),
    supabaseUrlConfigured: Boolean(process.env.SUPABASE_URL),
    supabasePublishableConfigured: Boolean(process.env.SUPABASE_PUBLISHABLE_KEY),
    supabaseSecretConfigured: Boolean(process.env.SUPABASE_SECRET_KEY),
    senderEmail: "contato@resumindoviagens.com.br",
    recipientEmail: "contato@resumindoviagens.com.br"
  });
}
