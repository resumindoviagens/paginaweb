import { setAdminSession } from "../../../../lib/auth";

export async function POST(request) {
  const { password } = await request.json();

  if (!process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "ADMIN_PASSWORD não configurado." }, { status: 500 });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Senha incorreta." }, { status: 401 });
  }

  await setAdminSession();
  return Response.json({ ok: true });
}
