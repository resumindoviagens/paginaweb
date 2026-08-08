export const dynamic = "force-dynamic";

import { requireAdmin } from "../../../../../lib/auth";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function POST() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data: clients, error: listError } = await supabaseAdmin
    .from("clients")
    .select("id, name, email, legacy_import")
    .eq("legacy_import", true);

  if (listError) return Response.json({ error: listError.message }, { status: 500 });

  const ids = (clients || []).map((client) => client.id);
  if (ids.length === 0) {
    return Response.json({ ok: true, updated: 0, message: "Nenhum cadastro antigo encontrado." });
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabaseAdmin
    .from("clients")
    .update({
      status: "submitted",
      is_completed: true,
      visa_result: "approved",
      stage_ds160_completed: true,
      stage_fee_generated: true,
      stage_fee_paid: true,
      stage_dates_scheduled: true,
      stage_interview_done: true,
      stage_passport_returned: true,
      stage_ready_to_archive: true,
      data_final_processo: today,
      feedback_service: "visto",
      updated_at: new Date().toISOString()
    })
    .in("id", ids)
    .select("id");

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("audit_logs").insert({
    action: "legacy_bulk_migrated_approved",
    details: { count: (data || []).length, legacy_import_only: true }
  });

  return Response.json({ ok: true, updated: (data || []).length });
}
