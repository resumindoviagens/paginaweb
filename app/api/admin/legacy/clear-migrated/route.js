export const dynamic = "force-dynamic";

import { requireAdmin } from "../../../../../lib/auth";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

const SAFE_FILTER = {
  legacy_import: true,
  is_completed: true,
  visa_result: "approved",
  stage_passport_returned: true,
  stage_ready_to_archive: true
};

async function safeQuery() {
  return supabaseAdmin
    .from("clients")
    .select("id, name, email, cpf, visa_result, is_completed, stage_passport_returned, stage_ready_to_archive, legacy_import")
    .eq("legacy_import", true)
    .eq("is_completed", true)
    .eq("visa_result", "approved")
    .eq("stage_passport_returned", true)
    .eq("stage_ready_to_archive", true);
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data, error } = await safeQuery();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({
    ok: true,
    safeToClear: (data || []).length,
    preview: (data || []).slice(0, 20),
    criteria: SAFE_FILTER,
    message: "Estes registros NÃO serão apagados. Apenas sairão da lista Cadastro Antigo quando confirmado."
  });
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => ({}));
  if (body.confirm !== "LIMPAR_MIGRADOS") {
    const { data, error } = await safeQuery();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({
      ok: false,
      requiresConfirmation: true,
      safeToClear: (data || []).length,
      preview: (data || []).slice(0, 20),
      message: "Confirme enviando confirm=LIMPAR_MIGRADOS. Nenhum cliente foi alterado agora."
    }, { status: 400 });
  }

  const { data: candidates, error: candidateError } = await safeQuery();
  if (candidateError) return Response.json({ error: candidateError.message }, { status: 500 });
  const ids = (candidates || []).map((item) => item.id);

  if (ids.length === 0) {
    return Response.json({ ok: true, updated: 0, message: "Nenhum processo antigo migrado com segurança para limpar." });
  }

  const { data, error } = await supabaseAdmin
    .from("clients")
    .update({
      legacy_import: false,
      updated_at: new Date().toISOString()
    })
    .in("id", ids)
    .select("id");

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("audit_logs").insert({
    action: "legacy_migrated_cleared_from_old_list",
    details: { count: (data || []).length, criteria: SAFE_FILTER }
  });

  return Response.json({
    ok: true,
    updated: (data || []).length,
    message: "Registros retirados da lista Cadastro Antigo. Nenhum cliente foi apagado."
  });
}
