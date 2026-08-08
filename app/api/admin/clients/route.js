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

  const groupIds = [...new Set((data || []).map((client) => client.group_process_id).filter(Boolean))];
  let groupsById = {};
  if (groupIds.length > 0) {
    const { data: groups } = await supabaseAdmin
      .from("grupos_processo")
      .select("*")
      .in("id", groupIds);
    groupsById = (groups || []).reduce((acc, group) => { acc[group.id] = group; return acc; }, {});
  }

  const clients = (data || []).map((client) => ({
    ...client,
    answers: Array.isArray(client.form_responses)
      ? (client.form_responses[0]?.answers || {})
      : (client.form_responses?.answers || {}),
    email_sent_templates: emailLogsByClient[client.id] || {},
    process_group: groupsById[client.group_process_id] || null
  }));

  return Response.json({ clients });
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const isPassportService = body.tipo_processo === "Passaporte";
  const alsoCreatePassport = !!body.also_create_passport && !isPassportService;

  if (!body.name || !body.cpf || !body.birth_date) {
    return Response.json({ error: "Nome, CPF e data de nascimento são obrigatórios." }, { status: 400 });
  }

  if (alsoCreatePassport && !body.group_process_id) {
    return Response.json({
      error: "Para cadastrar Visto + Passaporte para a família, selecione um Grupo de processo do visto. O grupo de Passaporte será criado automaticamente."
    }, { status: 400 });
  }

  const cpf = cleanCPF(body.cpf);
  const now = new Date().toISOString();

  // V118: todo novo processo criado pelo cadastro principal passa a reutilizar
  // o cadastro único de people. CPF + nascimento identificam a pessoa.
  let person = null;
  const { data: existingPeople, error: existingPeopleError } = await supabaseAdmin
    .from("people")
    .select("*")
    .eq("cpf", cpf)
    .eq("birth_date", body.birth_date)
    .limit(1);

  if (existingPeopleError) {
    return Response.json({ error: existingPeopleError.message }, { status: 500 });
  }

  if ((existingPeople || []).length > 0) {
    person = existingPeople[0];

    // Preenche apenas dados úteis recebidos no cadastro operacional, sem apagar
    // dados mais completos já existentes no cadastro único.
    const personUpdates = { updated_at: now };
    if (body.name && body.name !== person.name) personUpdates.name = body.name;
    if (body.email && !person.email) personUpdates.email = body.email;
    if (body.secondary_email && !person.secondary_email) personUpdates.secondary_email = body.secondary_email;
    if (body.phone && !person.phone) personUpdates.phone = body.phone;
    if (body.passport_expiration_date && !person.passport_expiry_date) {
      personUpdates.passport_expiry_date = body.passport_expiration_date;
    }

    const { data: updatedPerson, error: updatePersonError } = await supabaseAdmin
      .from("people")
      .update(personUpdates)
      .eq("id", person.id)
      .select("*")
      .single();

    if (updatePersonError) {
      return Response.json({ error: updatePersonError.message }, { status: 500 });
    }
    person = updatedPerson;
  } else {
    const { data: createdPerson, error: createPersonError } = await supabaseAdmin
      .from("people")
      .insert({
        name: body.name,
        reservation_name: "",
        cpf,
        birth_date: body.birth_date,
        email: body.email || "",
        secondary_email: body.secondary_email || "",
        phone: body.phone || "",
        passport_number: "",
        passport_issue_date: null,
        passport_expiry_date: body.passport_expiration_date || null,
        passport_issuer: "",
        passport_country: "Brasil",
        nationality: "Brasileira",
        notes: body.notes || "",
        updated_at: now
      })
      .select("*")
      .single();

    if (createPersonError) {
      return Response.json({ error: createPersonError.message }, { status: 500 });
    }
    person = createdPerson;
  }

  async function createProcess({ tipoProcesso, groupProcessId, companion = false }) {
    const passport = tipoProcesso === "Passaporte";

    // Blindagem contra clique duplo/reenvio: a mesma pessoa não recebe duas vezes
    // o mesmo tipo de processo dentro do mesmo grupo.
    let duplicateQuery = supabaseAdmin
      .from("clients")
      .select("*")
      .eq("person_id", person.id)
      .eq("tipo_processo", tipoProcesso);

    if (groupProcessId) duplicateQuery = duplicateQuery.eq("group_process_id", groupProcessId);
    else duplicateQuery = duplicateQuery.is("group_process_id", null);

    const { data: duplicates, error: duplicateError } = await duplicateQuery.limit(1);
    if (duplicateError) throw new Error(duplicateError.message);
    if ((duplicates || []).length > 0) {
      return { client: duplicates[0], existing: true };
    }

    const accessToken = (body.no_form_required || passport) ? null : createAccessToken();
    const insertData = {
      person_id: person.id,
      name: body.name,
      cpf,
      birth_date: body.birth_date,
      phone: body.phone || "",
      email: body.email || "",
      secondary_email: body.secondary_email || "",
      passport_expiration_date: body.passport_expiration_date || null,
      notes: companion
        ? (body.notes || "Criado automaticamente com o processo de visto — V118.")
        : (body.notes || ""),
      access_token: accessToken,
      status: "not_started",
      is_locked: false,
      is_completed: false,
      family_group: body.family_group || "",
      group_process_id: groupProcessId || null,
      no_form_required: passport ? true : !!body.no_form_required,
      is_renewal: passport ? false : !!body.is_renewal,
      tipo_processo: tipoProcesso,
      observacoes_gerais: body.observacoes_gerais || body.notes || "",
      feedback_service: passport ? "passaporte" : (String(tipoProcesso || "").toLowerCase().includes("canad") ? "canadense" : "visto"),
      passport_pf_city: passport ? (body.passport_pf_city || "") : "",
      passport_pf_location: passport ? (body.passport_pf_location || "") : "",
      passport_pf_datetime: passport ? (body.passport_pf_datetime || null) : null,
      passport_gru_paid_at: passport ? (body.passport_gru_paid_at || null) : null,
      legacy_import: !!body.legacy_import,
      legacy_import_batch: body.legacy_import_batch || null
    };

    if (!passport) {
      if (body.interview_datetime) { insertData.interview_datetime = body.interview_datetime; insertData.interview_date = String(body.interview_datetime).slice(0,10); }
      else if (body.interview_date) insertData.interview_date = body.interview_date;
      if (body.casv_datetime) { insertData.casv_datetime = body.casv_datetime; insertData.casv_date = String(body.casv_datetime).slice(0,10); }
      else if (body.casv_date) insertData.casv_date = body.casv_date;
      if (body.video_call_date) insertData.video_call_date = body.video_call_date;
      if (body.consulate_city) insertData.consulate_city = body.consulate_city;
    }

    const { data, error } = await supabaseAdmin
      .from("clients")
      .insert(insertData)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_logs").insert({
      client_id: data.id,
      action: companion ? "companion_passport_process_created" : "client_created",
      details: {
        name: data.name,
        person_id: person.id,
        tipo_processo: tipoProcesso,
        group_process_id: groupProcessId || null
      }
    });

    return { client: data, existing: false };
  }

  try {
    const primaryType = body.tipo_processo || (body.is_renewal ? "Renovação" : "Primeiro visto");
    const primaryResult = await createProcess({
      tipoProcesso: primaryType,
      groupProcessId: body.group_process_id || null
    });

    let passportResult = null;
    let passportGroup = null;

    if (alsoCreatePassport) {
      const { data: visaGroup, error: visaGroupError } = await supabaseAdmin
        .from("grupos_processo")
        .select("*")
        .eq("id", body.group_process_id)
        .single();

      if (visaGroupError || !visaGroup) {
        return Response.json({ error: "Grupo de processo do visto não encontrado." }, { status: 400 });
      }

      const passportGroupName = `${visaGroup.nome} — Passaporte`;
      const { data: existingPassportGroups, error: passportGroupSearchError } = await supabaseAdmin
        .from("grupos_processo")
        .select("*")
        .eq("nome", passportGroupName)
        .limit(1);

      if (passportGroupSearchError) throw new Error(passportGroupSearchError.message);

      if ((existingPassportGroups || []).length > 0) {
        passportGroup = existingPassportGroups[0];
      } else {
        const { data: createdPassportGroup, error: createPassportGroupError } = await supabaseAdmin
          .from("grupos_processo")
          .insert({ nome: passportGroupName })
          .select("*")
          .single();

        if (createPassportGroupError) throw new Error(createPassportGroupError.message);
        passportGroup = createdPassportGroup;
      }

      passportResult = await createProcess({
        tipoProcesso: "Passaporte",
        groupProcessId: passportGroup.id,
        companion: true
      });
    }

    return Response.json({
      client: primaryResult.client,
      existing: primaryResult.existing,
      person,
      passport_client: passportResult?.client || null,
      passport_existing: passportResult?.existing || false,
      passport_group: passportGroup,
      combined_process_created: !!passportResult
    });
  } catch (error) {
    return Response.json({ error: error.message || "Erro ao cadastrar processo." }, { status: 500 });
  }
}
