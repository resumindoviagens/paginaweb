export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não permitido." });
  }
  const configured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
  return res.status(200).json({
    configured,
    supabaseUrl: configured ? process.env.SUPABASE_URL : "",
    supabasePublishableKey: configured ? process.env.SUPABASE_PUBLISHABLE_KEY : "",
    version: "painel-chat-v4.5-recuperacao-sessao"
  });
}
