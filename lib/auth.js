import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "rv_admin_session";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "troque-este-segredo";
}

export function signSession(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export async function setAdminSession() {
  const createdAt = Date.now().toString();
  const signature = signSession(createdAt);
  const token = `${createdAt}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw || !raw.includes(".")) return false;

  const [createdAt, signature] = raw.split(".");
  if (!createdAt || !signature) return false;

  const expected = signSession(createdAt);
  if (signature !== expected) return false;

  const age = Date.now() - Number(createdAt);
  return age < 1000 * 60 * 60 * 8;
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }
  return null;
}
