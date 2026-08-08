"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase, getSupabaseConfig, isAllowedAdminEmail } from "../../../lib/supabaseAdminAuth";

export default function DebugAuthPage() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    async function run() {
      const config = getSupabaseConfig();
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase.auth.getSession();

      const status = await fetch("/api/admin/status").then((r) => r.json()).catch(() => null);

      setInfo({
        apiCookieAuthenticated: status?.authenticated || false,
        hasUrl: !!config.url,
        hasAnonKey: !!config.anonKey,
        userEmail: data?.session?.user?.email || null,
        allowed: isAllowedAdminEmail(data?.session?.user?.email),
        error: error?.message || null
      });
    }

    run();
  }, []);

  return (
    <main style={{ padding: 30, fontFamily: "Arial, Helvetica, sans-serif" }}>
      <h1>Debug Auth</h1>
      <pre>{JSON.stringify(info, null, 2)}</pre>
      <p>Depois de testar, esta página pode ser removida em versão futura.</p>
    </main>
  );
}
