"use client";

import { useEffect, useState } from "react";

export default function BibliotecaEmailsPage() {
  const [templates, setTemplates] = useState([]);
  const [active, setActive] = useState(null);

  async function load() {
    const res = await fetch("/api/admin/email-library", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao carregar biblioteca.");
      return;
    }
    setTemplates(data.templates || []);
    setActive((data.templates || [])[0] || null);
  }

  useEffect(() => { load(); }, []);

  async function copyText(value) {
    await navigator.clipboard.writeText(value || "");
    alert("Texto copiado.");
  }

  return (
    <main style={{ maxWidth: 1180, margin: "30px auto", padding: 24, fontFamily: "Arial, Helvetica, sans-serif" }}>
      <h1 style={{ color: "#1f2a60" }}>Biblioteca de emails</h1>
      <p>Modelos gerais, sem personalização automática por cliente. Use para consulta e cópia.</p>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
        <aside style={{ display: "grid", gap: 8 }}>
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setActive(template)}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: active?.id === template.id ? "#1f2a60" : "#fff",
                color: active?.id === template.id ? "#fff" : "#111827"
              }}
            >
              {template.label}
            </button>
          ))}
        </aside>

        <section style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 18, background: "#fff" }}>
          {active ? (
            <>
              <h2 style={{ marginTop: 0 }}>{active.label}</h2>
              <label style={{ display: "block", marginBottom: 12 }}>
                <strong>Assunto</strong>
                <input readOnly value={active.subject || ""} style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 10, marginTop: 6 }} />
              </label>
              <label style={{ display: "block" }}>
                <strong>Texto base</strong>
                <textarea readOnly value={active.text || ""} style={{ width: "100%", minHeight: 420, padding: 12, border: "1px solid #d1d5db", borderRadius: 10, marginTop: 6, fontSize: 15, lineHeight: 1.5 }} />
              </label>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
                <button onClick={() => copyText(active.subject)}>Copiar assunto</button>
                <button onClick={() => copyText(active.text)}>Copiar texto</button>
              </div>
            </>
          ) : (
            <p>Carregando...</p>
          )}
        </section>
      </div>
    </main>
  );
}
