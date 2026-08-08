import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { hasClientAccess } from "../../../../../lib/clientAuth";
import { sendInternalAlert, simpleHtml } from "../../../../../lib/brevoEmail";

export async function POST(request, context) {
  const params = await context.params;

  const verified = await hasClientAccess(params.token);
  if (!verified) {
    return Response.json({ error: "Confirmação de identidade necessária.", needs_verification: true }, { status: 401 });
  }

  const { data: client, error: clientError } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("access_token", params.token)
    .maybeSingle();

  if (clientError || !client) return Response.json({ error: "Link inválido." }, { status: 404 });
  if (client.is_locked) return Response.json({ error: "Formulário já enviado e bloqueado." }, { status: 403 });

  const body = await request.json();
  const answers = body.answers || {};

  const { error: responseError } = await supabaseAdmin
    .from("form_responses")
    .upsert({
      client_id: client.id,
      answers,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: "client_id" });

  if (responseError) return Response.json({ error: responseError.message }, { status: 500 });

  const { error: updateError } = await supabaseAdmin
    .from("clients")
    .update({ status: "submitted", is_locked: true, updated_at: new Date().toISOString() })
    .eq("id", client.id);

  if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

  await supabaseAdmin.from("audit_logs").insert({ client_id: client.id, action: "client_submitted_form", details: {} });

  // Email interno imediato: avisa a Resumindo Viagens quando o cliente conclui o formulário.
  try {
    await sendInternalAlert({
      subject: `Formulário concluído — ${client.name}`,
      html: simpleHtml(`Formulário concluído — ${client.name}`, [
        `O formulário de <strong>${client.name}</strong> foi enviado como concluído.`,
        `<strong>CPF:</strong> ${client.cpf || "-"}<br /><strong>Data de nascimento:</strong> ${client.birth_date || "-"}<br /><strong>E-mail:</strong> ${client.email || "-"}<br /><strong>Telefone:</strong> ${client.phone || "-"}`,
        `Acesse o admin para revisar as informações e dar sequência ao processo.`
      ]),
      text: `O formulário de ${client.name} foi enviado como concluído.`,
      tags: ["resumindo-viagens", "alerta-formulario-concluido"]
    });
    await supabaseAdmin.from("audit_logs").insert({ client_id: client.id, action: "internal_email_sent", details: { tipo: "formulario_concluido" } });
  } catch (emailError) {
    await supabaseAdmin.from("audit_logs").insert({ client_id: client.id, action: "internal_email_failed", details: { tipo: "formulario_concluido", error: emailError.message } });
  }

  return Response.json({ ok: true });
}
