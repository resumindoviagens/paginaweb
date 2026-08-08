export const dynamic = "force-dynamic";

import { requireAdmin } from "../../../../../lib/auth";
import { loadFutureClientsForAgenda, sendClientAgendaEmail, sendInternalAgendaICS } from "../../../../../lib/agendaAutomation";

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => ({}));
  const sendClient = body.sendClient !== false;
  const sendInternal = body.sendInternal !== false;

  const clients = await loadFutureClientsForAgenda();
  const results = [];

  for (const client of clients) {
    try {
      const item = { client_id: client.id, name: client.name };
      if (sendInternal) item.internal = await sendInternalAgendaICS(client, { mode: "backfill" });
      if (sendClient) item.client = await sendClientAgendaEmail(client, { mode: "backfill", onlyMissing: true });
      results.push(item);
    } catch (error) {
      results.push({ client_id: client.id, name: client.name, error: error?.message || String(error) });
    }
  }

  return Response.json({ ok: true, processed: clients.length, results });
}
