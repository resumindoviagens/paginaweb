export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("form_help_texts")
    .select("field_id, help_text");

  if (error) {
    return Response.json({ helpTexts: {} }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
  }

  const helpTexts = {};
  for (const item of data || []) {
    if (item.field_id) helpTexts[item.field_id] = item.help_text || "";
  }

  return Response.json({ helpTexts }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
}
