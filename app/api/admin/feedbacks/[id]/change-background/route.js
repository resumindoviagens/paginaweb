import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";

function nextIndex(current) {
  const n = Number(current || 0);
  return (n % 30) + 1;
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const feedbackId = resolvedParams.id;

    const body = await request.json().catch(() => ({}));
    const requestedIndex = body.background_index;

    const { data: feedback, error: findError } = await supabaseAdmin
      .from("feedbacks")
      .select("id, background_index")
      .eq("id", feedbackId)
      .maybeSingle();

    if (findError || !feedback) {
      return Response.json({ error: "Feedback não encontrado." }, { status: 404 });
    }

    let newIndex;

    if (requestedIndex) {
      newIndex = Math.max(1, Math.min(30, Number(requestedIndex)));
    } else {
      newIndex = nextIndex(feedback.background_index);
    }

    const { error: updateError } = await supabaseAdmin
      .from("feedbacks")
      .update({ background_index: newIndex })
      .eq("id", feedbackId);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({ ok: true, background_index: newIndex });
  } catch (error) {
    return Response.json({ error: error.message || "Erro ao trocar imagem." }, { status: 500 });
  }
}
