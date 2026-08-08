export const NEWSLETTER_CONTACTS = {
  whatsapp: "https://wa.me/5511981210932",
  whatsappLabel: "(11) 98121-0932",
  instagram: "https://instagram.com/resumindoviagens",
  instagramLabel: "@resumindoviagens",
  email: "mailto:contato@resumindoviagens.com.br",
  emailLabel: "contato@resumindoviagens.com.br"
};

function escapeHtml(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function headerUrl(origin) {
  const base = origin || process.env.NEXT_PUBLIC_SITE_URL || "https://app.resumindoviagens.com.br";
  return `${String(base).replace(/\/$/, "")}/email-headers/header-orlando-v38.png`;
}

export function renderNewsletterHtml({ subject = "Newsletter Resumindo Viagens", message = "", clientName = "", unsubscribeUrl = "", origin = "" }) {
  const paragraphs = String(message || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 14px;">${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
    .join("");

  const greeting = clientName ? `<p style="margin:0 0 18px;font-size:18px;">Olá, <strong>${escapeHtml(clientName)}</strong>.</p>` : "";

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.62;max-width:720px;margin:0 auto;background:#f6f8fb;padding:0;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
    <div style="background:#1f2a60;"><img src="${headerUrl(origin)}" alt="Resumindo Viagens - Orlando" width="720" style="width:100%;max-width:720px;height:auto;display:block;border:0;outline:none;text-decoration:none;" /></div>
    <div style="background:#ffffff;padding:28px;">
      <p style="margin:0 0 4px;color:#f59e0b;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:.4px;">Resumindo Viagens</p>
      <h2 style="color:#1f2a60;margin:0 0 20px;font-size:24px;line-height:1.25;">${escapeHtml(subject)}</h2>
      ${greeting}
      ${paragraphs}
      <p style="margin:22px 0;text-align:left;">
        <a href="${NEWSLETTER_CONTACTS.whatsapp}" style="background:#1f2a60;color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:8px;display:inline-block;font-weight:700;">Falar com a Resumindo Viagens</a>
      </p>
      <div style="border-top:1px solid #e5e7eb;margin-top:26px;padding-top:18px;">
        <p style="margin:0 0 8px;color:#374151;">Canais oficiais:</p>
        <p style="margin:0 0 6px;">📧 <a href="${NEWSLETTER_CONTACTS.email}" style="color:#1f2a60;text-decoration:underline;">${NEWSLETTER_CONTACTS.emailLabel}</a></p>
        <p style="margin:0 0 6px;">📱 <a href="${NEWSLETTER_CONTACTS.whatsapp}" style="color:#1f2a60;text-decoration:underline;">WhatsApp: ${NEWSLETTER_CONTACTS.whatsappLabel}</a></p>
        <p style="margin:0 0 14px;">📸 <a href="${NEWSLETTER_CONTACTS.instagram}" style="color:#1f2a60;text-decoration:underline;">Instagram: ${NEWSLETTER_CONTACTS.instagramLabel}</a></p>
        ${unsubscribeUrl ? `<p style="margin:20px 0 0;font-size:12px;color:#6b7280;">Você está recebendo este email por já ter sido atendido pela Resumindo Viagens. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#6b7280;text-decoration:underline;">Clique aqui para não receber futuras newsletters.</a></p>` : ""}
      </div>
    </div>
  </div>`;
}

export function defaultNewsletterText() {
  return `Passando para manter contato e compartilhar uma orientação útil da Resumindo Viagens.

Se você pretende viajar, renovar documentação, revisar validade de passaporte ou planejar um novo visto, conte conosco para organizar essa etapa com tranquilidade.

Atendimento personalizado, orientação cuidadosa e suporte em cada detalhe.`;
}
