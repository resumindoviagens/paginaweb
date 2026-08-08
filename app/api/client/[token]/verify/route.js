import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { setClientAccess } from "../../../../../lib/clientAuth";

function cleanCPF(value) {
  return (value || "").replace(/\D/g, "");
}

function normalizeDate(value) {
  if (!value) return "";
  const raw = String(value).trim();
  const digits = raw.replace(/\D/g, "");

  // DD/MM/AAAA ou DDMMAAAA
  if (digits.length === 8 && !/^\d{4}/.test(raw)) {
    return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
  }

  // AAAA-MM-DD ou AAAAMMDD
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }

  // Caso venha do banco/API com horário: 1962-10-02T00:00:00...
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  return raw;
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

  const { data: client, error } = await supabaseAdmin
    .from("clients")
    .select("id, name, cpf, birth_date")
    .eq("access_token", token)
    .maybeSingle();

  if (error || !client) {
    return Response.json({ error: "Link inválido ou expirado." }, { status: 404 });
  }

  const storedCPF = cleanCPF(client.cpf);
  const storedBirthDate = normalizeDate(client.birth_date);

  if (storedCPF !== cpf || storedBirthDate !== birthDate) {
    return Response.json({ error: "CPF ou data de nascimento não conferem com este link." }, { status: 403 });
  }

  await setClientAccess(token);

  await supabaseAdmin.from("audit_logs").insert({
    client_id: client.id,
    action: "client_verified_identity",
    details: {}
  });

  return Response.json({ ok: true });
}
