"use client";

import { useState } from "react";
import { createBrowserSupabase } from "../../../lib/supabaseAdminAuth";

export default function ResetPasswordPage() {
  const supabase = createBrowserSupabase();
  const [password, setPassword] = useState("");

  async function updatePassword(e) {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Senha alterada com sucesso.");
    window.location.href = "/admin";
  }

  return (
    <main style={{ maxWidth: 420, margin: "60px auto", padding: 24 }}>
      <div className="card">
        <h1>Redefinir senha</h1>

        <form onSubmit={updatePassword} style={{ display: "grid", gap: 14 }}>
          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="primary" type="submit">
            Salvar nova senha
          </button>
        </form>
      </div>
    </main>
  );
}
