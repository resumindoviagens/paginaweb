import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireAdmin } from "../../../../lib/auth";
import { createAccessToken } from "../../../../lib/tokens";

function cleanCPF(value) {
  return (value || "").replace(/\D/g, "");
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("*, form_responses(answers, submitted_at)")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const clientIds = (data || []).map((client) => client.id);
  let emailLogsByClient = {};

  if (clientIds.length > 0) {
    const { data: emailLogs } = await supabaseAdmin
      .from("audit_logs")
      .select("client_id, action, details, created_at")
      .in("client_id", clientIds)
      .eq("action", "email_sent");

    emailLogsByClient = (emailLogs || []).reduce((acc, log) => {
      const templateId = log?.details?.template_id;
      if (!templateId) return acc;
      if (!acc[log.client_id]) acc[log.client_id] = {};
      acc[log.client_id][templateId] = log.created_at;
      return acc;
    }, {});
  }

  const clients = (data || []).map((client) => ({
    ...client,
    answers: Array.isArray(client.form_responses)
      ? (client.form_responses[0]?.answers || {})
      : (client.form_responses?.answers || {}),
    email_sent_templates: emailLogsByClient[client.id] || {}
  }));

  return Response.json({ clients });
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();

  if (!body.name || !body.cpf || !body.birth_date) {
    return Response.json({ error: "Nome, CPF e data de nascimento são obrigatórios." }, { status: 400 });
  }

  const accessToken = createAccessToken();

  const insertData = {
    name: body.name,
    cpf: cleanCPF(body.cpf),
    birth_date: body.birth_date,
    phone: body.phone || "",
    email: body.email || "",
    notes: body.notes || "",
    access_token: accessToken,
    status: "not_started",
    is_locked: false,
    is_completed: false,
    family_group: "",
    no_form_required: false,
    is_renewal: false
  };

  // Estes campos dependem das colunas opcionais da V11. Se você ainda não executou o SQL,
  // deixe-os vazios no cadastro inicial e preencha depois de criar as colunas no Supabase.
  if (body.interview_date) insertData.interview_date = body.interview_date;
  if (body.casv_date) insertData.casv_date = body.casv_date;
  if (body.video_call_date) insertData.video_call_date = body.video_call_date;
  if (body.consulate_city) insertData.consulate_city = body.consulate_city;

  const { data, error } = await supabaseAdmin
    .from("clients")
    .insert(insertData)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("audit_logs").insert({
    client_id: data.id,
    action: "client_created",
    details: { name: data.name }
  });

  return Response.json({ client: data });
}
