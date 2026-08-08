import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "rv_client_access";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "troque-este-segredo";
}

export function tokenHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signHash(hash) {
  return crypto.createHmac("sha256", secret()).update(hash).digest("hex");
}

export async function setClientAccess(token) {
  const hash = tokenHash(token);
  const signature = signHash(hash);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, `${hash}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function hasClientAccess(token) {
  const hash = tokenHash(token);
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;

  if (!raw || !raw.includes(".")) return false;

  const [storedHash, signature] = raw.split(".");
  if (storedHash !== hash) return false;

  const expected = signHash(hash);
  return signature === expected;
}
