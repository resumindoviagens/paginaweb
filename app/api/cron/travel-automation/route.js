export const dynamic = "force-dynamic";

import { runTravelAutomation } from "../../../../lib/travelAutomation";

function authorized(request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("x-cron-secret") || new URL(request.url).searchParams.get("secret");
  const vercelCron = request.headers.get("x-vercel-cron");
  return !secret || provided === secret || !!vercelCron;
}

export async function GET(request) {
  if (!authorized(request)) return Response.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const result = await runTravelAutomation();
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
