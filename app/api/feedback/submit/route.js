import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { sendInternalAlert, simpleHtml } from "../../../../lib/brevoEmail";

function cleanCPF(value) {
  return String(value || "").replace(/\D/g, "");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, cpf, birth_date, nota_nps, ponto_forte, comentario, autorizou_divulgacao, instagram_usuario } = body;

    if (!token || !cpf || !birth_date) {
      return Response.json({ error: "Dados de autenticação obrigatórios." }, { status: 400 });
    }

    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("feedback_token", token)
      .maybeSingle();

    if (clientError || !client) {
      return Response.json({ error: "Pesquisa não encontrada." }, { status: 404 });
    }

    if (cleanCPF(client.cpf) !== cleanCPF(cpf) || String(client.birth_date) !== String(birth_date)) {
      return Response.json({ error: "CPF ou data de nascimento não conferem." }, { status: 403 });
    }

    const already = await supabaseAdmin
      .from("feedbacks")
      .select("id")
      .eq("client_id", client.id)
      .limit(1);

    if (already.data && already.data.length > 0) {
      return Response.json({ error: "Esta pesquisa já foi respondida." }, { status: 409 });
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
    const userAgent = request.headers.get("user-agent") || "";

    const service = client.feedback_service === "passaporte" || client.tipo_processo === "Passaporte"
      ? "passaporte"
      : (client.feedback_service === "canadense" || String(client.tipo_processo || "").toLowerCase().includes("canad") ? "canadense" : "visto");
    const tipo_feedback = service === "passaporte" ? "passaporte" : (service === "canadense" ? "canadense" : (client.visa_result === "denied" ? "negado" : "aprovado"));

    const { error: insertError } = await supabaseAdmin.from("feedbacks").insert({
      client_id: client.id,
      tipo_feedback,
      nota_nps,
      ponto_forte,
      comentario,
      autorizou_divulgacao: !!autorizou_divulgacao,
      instagram_usuario: instagram_usuario || "",
      service,
      ip,
      user_agent: userAgent
    });

    if (insertError) {
      const constraintError = String(insertError.message || "").includes("feedbacks_tipo_feedback_check");
      return Response.json({
        error: constraintError
          ? "A pesquisa de passaporte ainda não foi habilitada no banco. Execute o SQL da V120A no Supabase e tente novamente."
          : insertError.message
      }, { status: 500 });
    }

    await supabaseAdmin
      .from("clients")
      .update({
        feedback_answered_at: new Date().toISOString(),
        feedback_nota_nps: nota_nps,
        stage_feedback_answered: true
      })
      .eq("id", client.id);

    await supabaseAdmin.from("audit_logs").insert({
      client_id: client.id,
      action: "feedback_received",
      details: { nota_nps, ponto_forte, autorizou_divulgacao: !!autorizou_divulgacao }
    });

    try {
      await sendInternalAlert({
        subject: `Pesquisa de satisfação respondida — ${client.name}`,
        html: simpleHtml("Pesquisa de satisfação respondida", [
          `Cliente: <strong>${client.name}</strong>`,
          `Nota: <strong>${nota_nps}/10</strong>`,
          `Ponto forte: ${ponto_forte || "-"}`,
          comentario ? `Comentário: ${comentario}` : "",
          autorizou_divulgacao ? "Autorizou divulgação: sim" : "Autorizou divulgação: não",
          instagram_usuario ? `Instagram para marcação: ${instagram_usuario}` : ""
        ].filter(Boolean)),
        text: `Pesquisa respondida por ${client.name}. Nota ${nota_nps}/10. Comentário: ${comentario || "-"}`,
        tags: ["resumindo-viagens", "feedback-recebido"]
      });
    } catch (emailError) {
      await supabaseAdmin.from("audit_logs").insert({
        client_id: client.id,
        action: "feedback_alert_failed",
        details: { error: emailError?.message || String(emailError) }
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message || "Erro ao enviar feedback." }, { status: 500 });
  }
}
