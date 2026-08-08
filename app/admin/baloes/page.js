"use client";

import { useEffect, useState } from "react";

export default function BaloesExplicativosPage() {
  const [fields, setFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    const res = await fetch(`/api/admin/help-texts?t=${Date.now()}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao carregar balões.");
      return;
    }
    setFields(data.fields || []);
  }

  useEffect(() => { load(); }, []);

  function updateField(fieldId, helpText) {
    setFields((current) => current.map((item) =>
      item.field_id === fieldId ? { ...item, help_text: helpText } : item
    ));
  }

  async function save(closeAfter = false) {
    setSaving(true);
    const res = await fetch(`/api/admin/help-texts?t=${Date.now()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: fields.map(({ field_id, help_text }) => ({ field_id, help_text })) })
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      alert(data.error || "Erro ao salvar balões.");
      return;
    }

    alert("Balões explicativos salvos.");
    await load();
    if (closeAfter) window.close();
  }

  const filtered = fields.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${item.question} ${item.section} ${item.label} ${item.field_id}`.toLowerCase().includes(q);
  });

  return (
    <main style={{ maxWidth: 1100, margin: "30px auto", padding: 24, fontFamily: "Arial, Helvetica, sans-serif" }}>
      <h1 style={{ color: "#1f2a60" }}>Balões explicativos do formulário</h1>
      <p>Edite abaixo os textos dos balões informativos. Ao salvar, a alteração passa a valer no formulário do cliente.</p>

      <div style={{ display: "flex", gap: 12, margin: "20px 0", flexWrap: "wrap" }}>
        <input
          placeholder="Buscar por pergunta, seção ou campo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 260, padding: 12, border: "1px solid #d1d5db", borderRadius: 10 }}
        />
        <button onClick={() => save(false)} disabled={saving} style={{ padding: "12px 18px", borderRadius: 10, border: 0, background: "#1f2a60", color: "#fff", fontWeight: 700 }}>
          {saving ? "Salvando..." : "Salvar"}
        </button>
        <button onClick={() => save(true)} disabled={saving} style={{ padding: "12px 18px", borderRadius: 10, border: 0, background: "#ff9800", color: "#fff", fontWeight: 700 }}>
          Salvar e Fechar Painel de Edição
        </button>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {filtered.map((item) => (
          <section key={item.field_id} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, background: "#fff" }}>
            <div style={{ fontWeight: 800, color: "#1f2a60" }}>{item.question} — {item.label}</div>
            <div style={{ fontSize: 13, color: "#64748b", margin: "4px 0 10px" }}>{item.section} • {item.field_id}</div>
            <textarea
              value={item.help_text || ""}
              onChange={(e) => updateField(item.field_id, e.target.value)}
              style={{ width: "100%", minHeight: 90, padding: 12, border: "1px solid #d1d5db", borderRadius: 10, boxSizing: "border-box" }}
            />
          </section>
        ))}
      </div>
    </main>
  );
}
