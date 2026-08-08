export const dynamic = "force-dynamic";

import { requireAdmin } from "../../../../../lib/auth";
import { sendWithBrevo } from "../../../../../lib/brevoEmail";
import { renderNewsletterHtml } from "../../../../../lib/newsletterEmail";

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const toEmail = body.to_email || "contato@resumindoviagens.com.br";
  const subject = body.subject || "Teste de newsletter Resumindo Viagens";
  const message = body.message || "";
  const origin = body.origin || process.env.NEXT_PUBLIC_SITE_URL || "";

  if (!message.trim()) return Response.json({ error: "Mensagem obrigatória." }, { status: 400 });

  const html = renderNewsletterHtml({
    subject,
    message,
    clientName: "Leopoldino",
    unsubscribeUrl: "",
    origin
  });

  const result = await sendWithBrevo({
    toEmail,
    toName: "Resumindo Viagens",
    subject: `[TESTE] ${subject}`,
    html,
    text: message,
    tags: ["resumindo-viagens", "newsletter", "teste"]
  });

  return Response.json({ ok: true, result });
}
