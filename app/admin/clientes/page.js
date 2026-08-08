"use client";

import { useEffect, useMemo, useState } from "react";

function emptyPerson() {
  return {
    id: "",
    name: "",
    reservation_name: "",
    cpf: "",
    birth_date: "",
    email: "",
    phone: "",
    passport_number: "",
    passport_issue_date: "",
    passport_expiry_date: "",
    passport_issuer: "",
    passport_country: "Brasil",
    nationality: "Brasileira",
    notes: ""
  };
}

function inputStyle() {
  return { width: "100%", padding: 11, border: "1px solid #d1d5db", borderRadius: 11, boxSizing: "border-box" };
}

export default function ClientesPage() {
  const [people, setPeople] = useState([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(emptyPerson());
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/people?q=${encodeURIComponent(q)}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Erro ao carregar clientes.");
    setPeople(data.people || []);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => people, [people]);

  function edit(person) {
    setForm({
      ...emptyPerson(),
      ...person,
      birth_date: person.birth_date || "",
      passport_issue_date: person.passport_issue_date || "",
      passport_expiry_date: person.passport_expiry_date || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!form.name) return alert("Nome é obrigatório.");
    setLoading(true);
    try {
      const method = form.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/people", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Erro ao salvar cliente.");
      setForm(emptyPerson());
      await load();
      alert(data.existing ? "Cliente já existente localizado por CPF/nascimento." : "Cliente salvo.");
    } finally {
      setLoading(false);
    }
  }

  async function createVisaClient(person) {
    const ok = confirm(`Criar processo de visto para ${person.name}?`);
    if (!ok) return;

    const res = await fetch("/api/admin/people/create-visa-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ person_id: person.id, tipo_processo: "Primeiro visto" })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Erro ao criar processo de visto.");
    alert("Processo de visto criado no cadastro principal.");
  }

  return (
    <main style={{ maxWidth: 1240, margin: "0 auto", padding: 24, fontFamily: "Arial, Helvetica, sans-serif", color: "#1f2937" }}>
      <div style={{ background: "#1f2a60", color: "#fff", borderRadius: 24, padding: 26, marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 34 }}>Clientes</h1>
        <p style={{ margin: "8px 0 0", opacity: .95 }}>Cadastro único para vistos, passaportes e viagens.</p>
      </div>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 18, marginBottom: 18 }}>
        <h2 style={{ color: "#1f2a60", marginTop: 0 }}>{form.id ? "Editar cliente" : "Novo cliente"}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 10 }}>
          <input style={inputStyle()} placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input style={inputStyle()} placeholder="Nome como consta na reserva" value={form.reservation_name || ""} onChange={(e) => setForm({ ...form, reservation_name: e.target.value })} />
          <input style={inputStyle()} placeholder="CPF" value={form.cpf || ""} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
          <label>Nascimento<input style={inputStyle()} type="date" value={form.birth_date || ""} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></label>
          <input style={inputStyle()} placeholder="Email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input style={inputStyle()} placeholder="Telefone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input style={inputStyle()} placeholder="Passaporte" value={form.passport_number || ""} onChange={(e) => setForm({ ...form, passport_number: e.target.value })} />
          <label>Emissão passaporte<input style={inputStyle()} type="date" value={form.passport_issue_date || ""} onChange={(e) => setForm({ ...form, passport_issue_date: e.target.value })} /></label>
          <label>Validade passaporte<input style={inputStyle()} type="date" value={form.passport_expiry_date || ""} onChange={(e) => setForm({ ...form, passport_expiry_date: e.target.value })} /></label>
          <input style={inputStyle()} placeholder="Órgão/local emissão" value={form.passport_issuer || ""} onChange={(e) => setForm({ ...form, passport_issuer: e.target.value })} />
          <input style={inputStyle()} placeholder="País passaporte" value={form.passport_country || ""} onChange={(e) => setForm({ ...form, passport_country: e.target.value })} />
          <input style={inputStyle()} placeholder="Nacionalidade" value={form.nationality || ""} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
        </div>
        <textarea style={{ ...inputStyle(), minHeight: 90, marginTop: 10 }} placeholder="Observações" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={save} disabled={loading} style={{ background: "#1f2a60", color: "#fff", border: 0, borderRadius: 12, padding: "12px 16px", fontWeight: 900 }}>{form.id ? "Salvar alterações" : "Cadastrar cliente"}</button>
          {form.id && <button onClick={() => setForm(emptyPerson())} style={{ background: "#eef2f7", border: 0, borderRadius: 12, padding: "12px 16px", fontWeight: 800 }}>Cancelar</button>}
        </div>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 18 }}>
        <h2 style={{ color: "#1f2a60", marginTop: 0 }}>Clientes cadastrados</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input style={inputStyle()} placeholder="Buscar nome, CPF, email, telefone ou passaporte..." value={q} onChange={(e) => setQ(e.target.value)} />
          <button onClick={load} style={{ background: "#ff9800", color: "#fff", border: 0, borderRadius: 12, padding: "0 18px", fontWeight: 900 }}>Buscar</button>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((person) => (
            <article key={person.id} style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 14 }}>
              <strong>{person.name}</strong>
              <div style={{ color: "#64748b", marginTop: 4 }}>{person.email || "sem email"} · {person.phone || "sem telefone"} · CPF {person.cpf || "-"}</div>
              <div style={{ color: "#64748b", marginTop: 4 }}>Passaporte: {person.passport_number || "-"} · Validade: {person.passport_expiry_date || "-"}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <button onClick={() => edit(person)} style={{ background: "#1f2a60", color: "#fff", border: 0, borderRadius: 10, padding: "9px 12px", fontWeight: 800 }}>Editar cliente</button>
                <button onClick={() => createVisaClient(person)} style={{ background: "#ff9800", color: "#fff", border: 0, borderRadius: 10, padding: "9px 12px", fontWeight: 800 }}>Criar processo de visto</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
