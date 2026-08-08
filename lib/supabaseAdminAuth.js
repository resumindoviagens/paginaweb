import { createClient } from "@supabase/supabase-js";

let browserSupabaseClient = null;

export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  };
}

export function createBrowserSupabase() {
  if (browserSupabaseClient) return browserSupabaseClient;

  const { url, anonKey } = getSupabaseConfig();

  browserSupabaseClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return browserSupabaseClient;
}

export function isAllowedAdminEmail(email) {
  const allowed = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!allowed.length) return true;
  return allowed.includes(String(email || "").toLowerCase());
}

export async function getCurrentAdminSession() {
  const supabase = createBrowserSupabase();

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Erro ao buscar sessão Supabase:", error);
    return null;
  }

  const session = data?.session;

  if (!session?.user?.email) return null;

  if (!isAllowedAdminEmail(session.user.email)) return null;

  return session;
}
