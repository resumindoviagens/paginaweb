import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { setClientAccess } from "../../../../../lib/clientAuth";

function cleanCPF(value) {
  return (value || "").replace(/\D/g, "");
}

function normalizeDate(value) {
  if (!value) return "";
  const raw = String(value).trim();
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 8 && !/^\d{4}/.test(raw)) {
    return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
  }

  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  return raw;
}

function maskCPF(cpf) {
  const digits = cleanCPF(cpf);
  if (digits.length < 4) return "***";
  return `***.***.${digits.slice(-5, -2)}-${digits.slice(-2)}`;
}

export async function POST(request, context) {
  const params = await context.params;
  const token = params.token;
  const body = await request.json();

  const cpf = cleanCPF(body.cpf);
  const birthDate = normalizeDate(body.birth_date);

  if (!cpf || !birthDate) {
    return Response.json({ error: "Informe CPF e data de nascimento." }, { status: 400 });
  }

  let { data: client, error } = await supabaseAdmin
    .from("clients")
    .select("id, name, cpf, birth_date, email, phone, access_token")
    .or(`access_token.eq.${token},id.eq.${token}`)
    .maybeSingle();

  // Fallback seguro: se o link antigo/token não existir mais, valida pelo CPF + nascimento.
  // Isso evita “link expirado” em links de preparação enviados antes de troca/regeneração de token.
  if (error || !client) {
    const { data: candidates, error: fallbackError } = await supabaseAdmin
      .from("clients")
      .select("id, name, cpf, birth_date, email, phone, access_token")
      .eq("cpf", cpf)
      .eq("birth_date", birthDate)
      .limit(2);

    if (fallbackError || !candidates || candidates.length === 0) {
      return Response.json({ error: "Link inválido ou expirado." }, { status: 404 });
    }

    if (candidates.length > 1) {
      return Response.json({ error: "Encontramos mais de um processo com estes dados. Solicite novo link à Resumindo Viagens." }, { status: 409 });
    }

    client = candidates[0];
  }

  const storedCPF = cleanCPF(client.cpf);
  const storedBirthDate = normalizeDate(client.birth_date);

  if (storedCPF !== cpf || storedBirthDate !== birthDate) {
    return Response.json({ error: "CPF ou data de nascimento não conferem com este link." }, { status: 403 });
  }

  await setClientAccess(token);

  await supabaseAdmin.from("audit_logs").insert({
    client_id: client.id,
    action: "protected_guidance_opened",
    details: { page: "preparacao_entrevista" }
  });

  return Response.json({
    ok: true,
    client: {
      id: client.id,
      name: client.name,
      cpf_masked: maskCPF(client.cpf)
    },
    videoUrl: process.env.NEXT_PUBLIC_VIDEO_ENTREVISTA || ""
  });
}
