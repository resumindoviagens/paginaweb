export const dynamic = "force-dynamic";

import { requireAdmin } from "../../../../lib/auth";
import { EMAIL_TEMPLATES, getEmailTemplate } from "../../../../lib/emailTemplates";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const fakeClient = { name: "[NOME DO CLIENTE]", email: "[EMAIL DO CLIENTE]", phone: "[TELEFONE]" };

  const templates = EMAIL_TEMPLATES.map((template) => {
    const generated = getEmailTemplate(template.id, fakeClient, {
      formLink: "[LINK DO FORMULÁRIO]",
      preparationLink: "[LINK DA PREPARAÇÃO]",
      feedbackLink: "[LINK DA PESQUISA]",
      rastreio: "[CÓDIGO DE RASTREIO]",
      videoCallDateTime: "[DATA E HORA DA VIDEOCHAMADA]"
    });
    return {
      id: template.id,
      label: template.label,
      subject: generated.subject,
      text: generated.text
    };
  });

  return Response.json({ templates }, { headers: { "Cache-Control": "no-store" } });
}
