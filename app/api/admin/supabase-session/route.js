import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { setAdminSession } from "../../../../lib/auth";

function isAllowedAdminEmail(email) {
  const allowed = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!allowed.length) return true;
  return allowed.includes(String(email || "").toLowerCase());
}

export async function POST(request) {
  try {
    const body = await request.json();
    const accessToken = body?.access_token;

    if (!accessToken) {
      return Response.json({ error: "Token ausente." }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !data?.user?.email) {
      return Response.json({ error: "Sessão inválida." }, { status: 401 });
    }

    if (!isAllowedAdminEmail(data.user.email)) {
      return Response.json({ error: "E-mail não autorizado." }, { status: 403 });
    }

    await setAdminSession();

    return Response.json({ authenticated: true, email: data.user.email });
  } catch (error) {
    return Response.json({ error: error.message || "Erro ao validar sessão." }, { status: 500 });
  }
}
