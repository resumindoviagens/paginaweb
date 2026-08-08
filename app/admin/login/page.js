"use client";

import { useState } from "react";
import BrandHeader from "../../../components/BrandHeader";
import { createBrowserSupabase } from "../../../lib/supabaseAdminAuth";

export default function AdminLoginPage() {
  const supabase = createBrowserSupabase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    // Aguarda o navegador gravar a sessão local do Supabase e cria o cookie seguro usado pelas APIs administrativas.
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token || data?.session?.access_token;

    const bridge = await fetch("/api/admin/supabase-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: accessToken })
    });

    if (!bridge.ok) {
      const details = await bridge.json().catch(() => ({}));
      setLoading(false);
      alert(details.error || "Não foi possível validar o acesso administrativo.");
      return;
    }

    window.location.assign("/admin");
  }

  async function forgotPassword() {
    if (!email) {
      alert("Informe primeiro o e-mail administrativo.");
      return;
    }

    const redirectTo = `${window.location.origin}/admin/redefinir-senha`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Enviamos um link de redefinição de senha para seu e-mail.");
  }

  return (
    <main className="rv-login-page">
      <style jsx>{`
        .rv-login-page {
          min-height: 100vh;
          padding: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at top left, rgba(245,158,11,.22), transparent 34%),
            radial-gradient(circle at bottom right, rgba(31,42,96,.22), transparent 34%),
            linear-gradient(135deg, #f8fafc, #eef2ff);
        }

        .shell {
          width: 100%;
          max-width: 1180px;
          min-height: 680px;
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          border-radius: 34px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 28px 90px rgba(15,23,42,.16);
          border: 1px solid #e5e7eb;
        }

        .visual {
          position: relative;
          background-image:
            linear-gradient(90deg, rgba(9,16,45,.78), rgba(9,16,45,.35)),
            url("/branding/login-nova-york-bg.png");
          background-size: cover;
          background-position: center;
          color: #fff;
          padding: 38px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .visual :global(.brand-header) {
          background: rgba(255,255,255,.93);
          border-radius: 22px;
          padding: 14px;
          width: fit-content;
          max-width: 360px;
        }

        .visual-copy {
          max-width: 540px;
          margin-top: auto;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 13px;
          border-radius: 999px;
          background: rgba(245,158,11,.18);
          border: 1px solid rgba(245,158,11,.55);
          color: #fff;
          font-weight: 900;
          font-size: 13px;
          margin-bottom: 16px;
        }

        h1 {
          margin: 0 0 14px;
          font-size: clamp(36px, 5vw, 58px);
          line-height: 1.02;
          letter-spacing: -1.2px;
        }

        .subtitle {
          margin: 0;
          font-size: 20px;
          line-height: 1.45;
          color: rgba(255,255,255,.92);
        }

        .version {
          position: absolute;
          right: 24px;
          bottom: 20px;
          padding: 8px 13px;
          border-radius: 999px;
          background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.25);
          font-weight: 800;
          font-size: 13px;
        }

        .login {
          padding: 44px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .login h2 {
          color: #1f2a60;
          font-size: 34px;
          margin: 0 0 8px;
        }

        .note {
          color: #64748b;
          line-height: 1.45;
          margin: 0 0 24px;
        }

        .warning {
          background: #fffbeb;
          border: 1px solid #f59e0b;
          color: #92400e;
          border-radius: 18px;
          padding: 15px;
          font-weight: 800;
          line-height: 1.4;
          margin-bottom: 22px;
        }

        form {
          display: grid;
          gap: 14px;
        }

        input {
          width: 100%;
          border: 1px solid #dbe3f0;
          background: #fff;
          border-radius: 16px;
          padding: 16px;
          font-size: 16px;
          outline: none;
        }

        input:focus {
          border-color: #1f2a60;
          box-shadow: 0 0 0 4px rgba(31,42,96,.08);
        }

        .login-button {
          border: 0;
          border-radius: 16px;
          padding: 16px 18px;
          background: #ff9f00;
          color: #fff;
          font-weight: 900;
          font-size: 17px;
          cursor: pointer;
        }

        .login-button:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .forgot {
          margin-top: 16px;
          border: 0;
          background: transparent;
          color: #1f2a60;
          font-weight: 900;
          cursor: pointer;
          text-align: left;
          padding: 0;
          font-size: 15px;
        }

        .client-note {
          margin-top: 28px;
          padding-top: 22px;
          border-top: 1px solid #e5e7eb;
          color: #64748b;
          line-height: 1.45;
          font-size: 14px;
        }

        @media (max-width: 920px) {
          .rv-login-page {
            padding: 14px;
            align-items: flex-start;
          }

          .shell {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .visual {
            min-height: 320px;
            padding: 24px;
          }

          .login {
            padding: 26px;
          }

          .version {
            position: static;
            width: fit-content;
            margin-top: 22px;
          }
        }
      `}</style>

      <div className="shell">
        <section className="visual">
          <BrandHeader compact />

          <div className="visual-copy">
            <div className="badge">Portal interno seguro</div>
            <h1>Resumindo Viagens</h1>
            <p className="subtitle">
              Sistema interno para gestão de processos de visto americano, formulários, alertas,
              relatórios e páginas protegidas.
            </p>
          </div>

          <div className="version">v119 — protocolo de Passaporte + WhatsApp direto</div>
        </section>

        <section className="login">
          <h2>Login administrativo</h2>
          <p className="note">
            Entre com o e-mail e senha cadastrados para acessar o painel interno.
          </p>

          <div className="warning">
            Este endereço é de uso exclusivo da Resumindo Viagens. O acesso é restrito a usuários autorizados.
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="E-mail administrativo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar no painel"}
            </button>
          </form>

          <button type="button" className="forgot" onClick={forgotPassword}>
            Esqueci minha senha
          </button>

          <div className="client-note">
            Clientes acessam formulários e páginas protegidas apenas por links individuais enviados pela Resumindo Viagens.
          </div>
        </section>
      </div>
    </main>
  );
}
