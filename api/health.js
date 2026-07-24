
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  return res.status(200).json({
    ok: true,
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    brevoConfigured: Boolean(process.env.BREVO_API_KEY),
    emailRecipientConfigured: Boolean(process.env.CHAT_EMAIL_TO)
  });
}
