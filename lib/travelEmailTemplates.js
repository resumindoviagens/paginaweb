import { formatLocalDateTime, formatLocalDate } from "./travelDateUtils";
function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fmtDateTime(value) {
  return formatLocalDateTime(value);
}

function fmtDate(value) {
  return formatLocalDate(value);
}

function layout({ title, customerName, body }) {
  return `<!doctype html>
  <html>
    <body style="margin:0;background:#f4f7fb;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;box-shadow:0 16px 42px rgba(15,23,42,.08);">
        <div style="background:#1f2a60;color:#ffffff;padding:26px 28px;">
          <div style="font-size:14px;font-weight:800;color:#ffb233;letter-spacing:.8px;">RESUMINDO VIAGENS</div>
          <h1 style="margin:8px 0 0;font-size:28px;line-height:1.15;">${escapeHtml(title)}</h1>
        </div>
        <div style="padding:26px 28px;font-size:16px;line-height:1.58;">
          <p style="margin-top:0;">Olá, <strong>${escapeHtml(customerName || "cliente")}</strong>.</p>
          ${body}
          <div style="border-top:1px solid #e5e7eb;margin-top:26px;padding-top:18px;color:#374151;">
            <p style="margin:0 0 8px;"><strong>Resumindo Viagens</strong></p>
            <p style="margin:0 0 6px;">WhatsApp: <a href="https://wa.me/5511981210932" style="color:#1f2a60;">(11) 98121-0932</a></p>
            <p style="margin:0 0 6px;">Email: <a href="mailto:contato@resumindoviagens.com.br" style="color:#1f2a60;">contato@resumindoviagens.com.br</a></p>
            <p style="margin:0;">Instagram: <a href="https://www.instagram.com/resumindoviagens" style="color:#1f2a60;">@resumindoviagens</a></p>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

function passengersBlock(trip) {
  const list = trip.passengers_list || trip.travel_trip_passengers || [];
  if (!list.length) return "";
  return `<p style="margin:0 0 8px;"><strong>Passageiros:</strong> ${list.map((p) => escapeHtml(p.name || "")).filter(Boolean).join(", ")}</p>`;
}

function tripSummary(trip) {
  return `
    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:16px;margin:18px 0;">
      <p style="margin:0 0 8px;"><strong>Viagem:</strong> ${escapeHtml(trip.title || "-")}</p>
      <p style="margin:0 0 8px;"><strong>Destino:</strong> ${escapeHtml(trip.destination || "-")}</p>
      ${passengersBlock(trip)}
      <p style="margin:0 0 8px;"><strong>Ida:</strong> ${escapeHtml(fmtDateTime(trip.outbound_date))}${trip.outbound_airline ? ` — ${escapeHtml(trip.outbound_airline)}` : ""}${trip.outbound_flight ? ` — voo ${escapeHtml(trip.outbound_flight)}` : ""}</p>
      ${trip.booking_locator ? `<p style="margin:0 0 8px;"><strong>Localizador:</strong> ${escapeHtml(trip.booking_locator)}</p>` : ""}
      ${trip.has_return ? `<p style="margin:0 0 8px;"><strong>Volta/outro trecho:</strong> ${escapeHtml(fmtDateTime(trip.return_date))}${trip.return_airline ? ` — ${escapeHtml(trip.return_airline)}` : ""}${trip.return_flight ? ` — voo ${escapeHtml(trip.return_flight)}` : ""}</p>` : ""}
      ${trip.return_booking_locator ? `<p style="margin:0;"><strong>Localizador da volta/outro trecho:</strong> ${escapeHtml(trip.return_booking_locator)}</p>` : ""}
    </div>`;
}

export const TRAVEL_EMAIL_TEMPLATES = [
  { id: "travel_calendar", label: "V01 - Viagem: enviar compromisso/calendário" },
  { id: "travel_confirmation", label: "V02 - Viagem: confirmação da compra/reserva" },
  { id: "travel_missing_services", label: "V03 - Viagem: oferecer seguro/hotel/carro/ingressos" },
  { id: "travel_checkin_outbound", label: "V04 - Check-in 48h antes da ida" },
  { id: "travel_checkin_return", label: "V05 - Check-in 48h antes da volta/outro trecho" },
  { id: "travel_airport_outbound", label: "V06 - Dia do voo de ida" },
  { id: "travel_airport_return", label: "V07 - Dia do voo de volta/outro trecho" },
  { id: "travel_week_before", label: "V08 - Uma semana antes: falta algo?" }
];

export function getTravelEmailTemplate(templateId, customer, trip, options = {}) {
  const name = customer?.name || trip?.travel_customers?.name || "cliente";
  const locator = trip?.booking_locator || "[LOCALIZADOR]";
  const returnLocator = trip?.return_booking_locator || trip?.booking_locator || "[LOCALIZADOR]";
  const isInternational = options.isInternational !== false;
  const airportTime = isInternational ? "4 horas" : "2 horas";

  const templates = {
    travel_calendar: {
      subject: `Agenda da sua viagem — ${trip.title}`,
      html: layout({
        title: "Agenda da sua viagem",
        customerName: name,
        body: `
          <p>Estou encaminhando as principais datas da sua viagem para facilitar sua organização.</p>
          ${tripSummary(trip)}
          <p>Este email pode conter arquivo(s) de calendário (.ics). O alerta se baseia na reserva original; verifique sempre diretamente com a companhia aérea eventuais alterações de horário, portão, terminal ou trecho.</p>
        `
      })
    },

    travel_confirmation: {
      subject: `Confirmação da sua viagem — ${trip.title}`,
      html: layout({
        title: "Confirmação da viagem",
        customerName: name,
        body: `
          <p>Segue o resumo das informações cadastradas da sua viagem.</p>
          ${tripSummary(trip)}
          ${trip.hotel_name ? `<p><strong>Hotel:</strong> ${escapeHtml(trip.hotel_name)} — check-in ${escapeHtml(fmtDate(trip.hotel_checkin))} / check-out ${escapeHtml(fmtDate(trip.hotel_checkout))}</p>` : ""}
          <p>Guarde este email e confira sempre os dados oficiais da reserva junto à companhia aérea, hotel, seguradora ou locadora.</p>
        `
      })
    },

    travel_missing_services: {
      subject: `Falta algo para sua viagem?`,
      html: layout({
        title: "Falta algo para sua viagem?",
        customerName: name,
        body: `
          <p>Sua viagem está cadastrada conosco e quero aproveitar para verificar se ainda falta algum item importante.</p>
          ${tripSummary(trip)}
          <p>Podemos auxiliar com <strong>seguro viagem, hotel, locação de carro, ingressos, passeios e outros serviços</strong>.</p>
          <p>Se já estiver tudo certo, ótimo. Se quiser cotar algum item, responda este email ou fale pelo WhatsApp.</p>
        `
      })
    },

    travel_checkin_outbound: {
      subject: `Check-in da viagem — localizador ${locator}`,
      html: layout({
        title: "Lembrete de check-in",
        customerName: name,
        body: `
          <p>Seu voo de ida se aproxima. Em geral, o check-in online costuma abrir cerca de 48 horas antes do embarque.</p>
          ${tripSummary(trip)}
          <p><strong>Localizador necessário para check-in:</strong> ${escapeHtml(locator)}</p>
          <p>Confira documentos, bagagem, horários e eventuais alterações diretamente com a companhia aérea.</p>
        `
      })
    },

    travel_checkin_return: {
      subject: `Check-in da volta/outro trecho — localizador ${returnLocator}`,
      html: layout({
        title: "Lembrete de check-in da volta/outro trecho",
        customerName: name,
        body: `
          <p>Seu voo de volta/outro trecho se aproxima. Em geral, o check-in online costuma abrir cerca de 48 horas antes do embarque.</p>
          ${tripSummary(trip)}
          <p><strong>Localizador necessário para check-in:</strong> ${escapeHtml(returnLocator)}</p>
          <p>Confira documentos, bagagem, horários e eventuais alterações diretamente com a companhia aérea.</p>
        `
      })
    },

    travel_airport_outbound: {
      subject: `Hoje é dia de viagem — ${trip.destination || trip.title}`,
      html: layout({
        title: "Hoje é dia de viagem",
        customerName: name,
        body: `
          <p>Passando para lembrar do seu voo de ida hoje.</p>
          ${tripSummary(trip)}
          <p>Recomendamos chegar ao aeroporto com antecedência: <strong>${airportTime}</strong> antes do voo, conforme o tipo da viagem.</p>
          <p>Confira documentos, bagagem, terminal, portão e eventuais alterações diretamente com a companhia aérea.</p>
        `
      })
    },

    travel_airport_return: {
      subject: `Hoje é dia de retorno/outro trecho — ${trip.destination || trip.title}`,
      html: layout({
        title: "Hoje é dia de retorno/outro trecho",
        customerName: name,
        body: `
          <p>Passando para lembrar do seu voo de volta/outro trecho hoje.</p>
          ${tripSummary(trip)}
          <p>Recomendamos chegar ao aeroporto com antecedência: <strong>${airportTime}</strong> antes do voo, conforme o tipo da viagem.</p>
          <p>Confira documentos, bagagem, terminal, portão e eventuais alterações diretamente com a companhia aérea.</p>
        `
      })
    },

    travel_week_before: {
      subject: `Sua viagem está chegando — falta alguma coisa?`,
      html: layout({
        title: "Sua viagem está chegando",
        customerName: name,
        body: `
          <p>Falta aproximadamente uma semana para sua viagem e queremos saber se ainda podemos ajudar em algo.</p>
          ${tripSummary(trip)}
          <p>Se precisar de <strong>seguro viagem, locação de carro, hotel, ingressos, passeios ou qualquer outro apoio</strong>, fale conosco.</p>
        `
      })
    }
  };

  const template = templates[templateId] || templates.travel_confirmation;
  return { ...template, text: template.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() };
}


export function plainTextFromHtml(html = "") {
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function htmlFromEditableText(text = "", fallbackTitle = "Mensagem da Resumindo Viagens") {
  const paragraphs = String(text)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
    .join("");

  return layout({
    title: fallbackTitle,
    customerName: "cliente",
    body: paragraphs || "<p></p>"
  });
}
