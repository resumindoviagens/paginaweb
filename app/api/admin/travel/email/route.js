export const dynamic = "force-dynamic";

import { requireAdmin } from "../../../../../lib/auth";
import { htmlFromEditableText, getTravelEmailTemplate } from "../../../../../lib/travelEmailTemplates";
import { loadTrip, sendTravelTemplate } from "../../../../../lib/travelAutomation";

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const { trip_id, template_id } = body;
  if (!trip_id || !template_id) return Response.json({ error: "Viagem e modelo são obrigatórios." }, { status: 400 });

  try {
    const trip = await loadTrip(trip_id);
    const baseTemplate = getTravelEmailTemplate(template_id, { name: trip.organizer_name || trip.passengers_list?.[0]?.name || "cliente" }, trip, body.options || {});
    const html = body.bodyText ? htmlFromEditableText(body.bodyText, body.subject || baseTemplate.subject) : (body.html || baseTemplate.html);

    const result = await sendTravelTemplate(trip, template_id, {
      sendMode: "manual",
      subject: body.subject || baseTemplate.subject,
      html,
      bodyText: body.bodyText || "",
      text: body.text || baseTemplate.text,
      options: body.options || {}
    });

    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
