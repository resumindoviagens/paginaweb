export const dynamic = "force-dynamic";

import { requireAdmin } from "../../../../../lib/auth";
import { runTravelAutomation } from "../../../../../lib/travelAutomation";

export async function POST() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const result = await runTravelAutomation();
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
