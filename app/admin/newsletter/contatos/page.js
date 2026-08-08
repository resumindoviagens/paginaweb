"use client";

import { useEffect, useState } from "react";

export default function NewsletterContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [origem, setOrigem] = useState("all");
  const [categoria, setCategoria] = useState("all");
  const [importText, setImportText] = useState("");
  const [importOrigem, setImportOrigem] = useState("csv_import");
  const [importCategoria, setImportCategoria] = useState("Outros");
  const [importReport, setImportReport] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", origem: "manual", status: "active", aceita_newsletter: true, observacoes: "", categoria: "Cliente" });

  async function load() {
    const params = new URLSearchParams({ q, status, origem, categoria });
    const res = await fetch(`/api/admin/newsletter/contacts?${params.toString()}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Erro ao carregar contatos.");
    setContacts(data.contacts || []);
  }

  useEffect(() => { load(); }, []);

  function startEdit(contact) {
    setEditing(contact);
    setForm({
      nome: contact.nome || "",
      email: contact.email || "",
      telefone: contact.telefone || "",
      origem: contact.origem || "manual",
      status: contact.status || "active",
      aceita_newsletter: contact.aceita_newsletter !== false,
      observacoes: contact.observacoes || "",
      categoria: contact.categoria || "Cliente"
    });
  }

  async function save() {
    const body = { ...form };
    const url = editing ? `/api/admin/newsletter/contacts/${editing.id}` : "/api/admin/newsletter/contacts";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Erro ao salvar.");
    setEditing(null);
    setForm({ nome: "", email: "", telefone: "", origem: "manual", status: "active", aceita_newsletter: true, observacoes: "", categoria: "Cliente" });
    await load();
  }

  async function approvePendingFiltered() {
    if (!confirm("Aprovar todos os contatos pendentes dentro do filtro atual? Eles passarão para active e poderão entrar nas próximas campanhas.")) return;
    const res = await fetch("/api/admin/newsletter/contacts/approve-pending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origem, categoria })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Erro ao aprovar pendentes.");
    alert(`${data.approved || 0} contato(s) pendente(s) aprovado(s).`);
    await load();
  }

  async function quickPatch(contact, patch) {
    const res = await fetch(`/api/admin/newsletter/contacts/${contact.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Erro ao atualizar.");
    await load();
  }

  async function importContacts() {
    if (!importText.trim()) return alert("Cole o conteúdo CSV/lista de emails antes de importar.");
    const res = await fetch("/api/admin/newsletter/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: importText, origem: importOrigem, categoria: importCategoria, auto_classificar: true })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Erro ao importar.");
    setImportReport(data.report);
    await load();
  }

  function handleImportFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportText(String(reader.result || ""));
    reader.readAsText(file, "utf-8");
  }

  function exportCsv() {
    const headers = ["nome","email","telefone","origem","status","aceita_newsletter","quantidade_clientes_vinculados","nomes_clientes_vinculados","observacoes"];
    const rows = contacts.map((c) => headers.map((h) => `"${String(c[h] ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "newsletter-contatos.csv";
    a.click();
  }

  return (
    <main style={{ maxWidth: 1280, margin: "30px auto", padding: 24, fontFamily: "Arial, Helvetica, sans-serif" }}>
      <h1 style={{ color: "#1f2a60" }}>Newsletter / Contatos</h1>
      <p>Base independente de contatos para campanhas. O Brevo é usado apenas para envio, não como fonte de contatos.</p>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 18, marginBottom: 18 }}>
        <h2>{editing ? "Editar contato" : "Adicionar contato"}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <input placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <input placeholder="Email" value={form.email} disabled={!!editing} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          <select value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })}>
            <option value="manual">manual</option>
            <option value="clientes_visto">clientes_visto</option>
            <option value="csv_import">csv_import</option>
            <option value="gmail_import">gmail_import</option>
          </select>
          <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
            <option value="Cliente">Cliente</option>
            <option value="Fornecedor">Fornecedor</option>
            <option value="Parceiro">Parceiro</option>
            <option value="Governo">Governo</option>
            <option value="Outros">Outros</option>
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value, aceita_newsletter: e.target.value === "active" })}>
            <option value="active">active</option>
            <option value="pending_review">pending_review</option>
            <option value="unsubscribed">unsubscribed</option>
            <option value="blocked">blocked</option>
            <option value="bounced">bounced</option>
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={form.aceita_newsletter} onChange={(e) => setForm({ ...form, aceita_newsletter: e.target.checked })} />
            Aceita newsletter
          </label>
        </div>
        <textarea placeholder="Observações" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} style={{ width: "100%", minHeight: 70, marginTop: 12 }} />
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={save}>{editing ? "Salvar alterações" : "Adicionar contato"}</button>
          {editing && <button onClick={() => setEditing(null)}>Cancelar edição</button>}
        </div>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 18, marginBottom: 18 }}>
        <h2>Importar contatos</h2>
        <p style={{ color: "#64748b" }}>Aceita CSV ou texto colado com colunas: nome, email, telefone, categoria, observacoes. Para Gmail/caixa de email, importe como <strong>gmail_import</strong> para entrar em revisão manual.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 180px", gap: 12, marginBottom: 12 }}>
          <input type="file" accept=".csv,.txt" onChange={handleImportFile} />
          <select value={importOrigem} onChange={(e) => setImportOrigem(e.target.value)}>
            <option value="csv_import">csv_import</option>
            <option value="gmail_import">gmail_import</option>
            <option value="manual">manual</option>
          </select>
          <select value={importCategoria} onChange={(e) => setImportCategoria(e.target.value)}>
            <option value="Cliente">Cliente</option>
            <option value="Fornecedor">Fornecedor</option>
            <option value="Parceiro">Parceiro</option>
            <option value="Governo">Governo</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
        <textarea placeholder={"Cole aqui o CSV ou lista de contatos\nExemplo:\nnome,email,telefone,categoria,observacoes\nJoão,joao@email.com,,Cliente,importado"} value={importText} onChange={(e) => setImportText(e.target.value)} style={{ width: "100%", minHeight: 140, marginBottom: 12 }} />
        <button onClick={importContacts}>Importar contatos</button>
        {importReport && (
          <div style={{ marginTop: 12, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <strong>Relatório:</strong>
            <p>Total linhas: {importReport.total_linhas} • Novos: {importReport.novos} • Atualizados: {importReport.atualizados} • Existentes ignorados: {importReport.existentes_ignorados} • Protegidos ignorados: {importReport.protegidos_ignorados} • Inválidos: {importReport.invalidos}</p>
            {importReport.erros?.length > 0 && <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(importReport.erros.slice(0, 20), null, 2)}</pre>}
          </div>
        )}
      </section>

      <section style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <input placeholder="Buscar nome/email" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Todos status</option>
          <option value="active">active</option>
          <option value="pending_review">pending_review</option>
          <option value="unsubscribed">unsubscribed</option>
          <option value="blocked">blocked</option>
          <option value="bounced">bounced</option>
        </select>
        <select value={origem} onChange={(e) => setOrigem(e.target.value)}>
          <option value="all">Todas origens</option>
          <option value="clientes_visto">clientes_visto</option>
          <option value="manual">manual</option>
          <option value="csv_import">csv_import</option>
          <option value="gmail_import">gmail_import</option>
        </select>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="all">Todas categorias</option>
          <option value="Cliente">Cliente</option>
          <option value="Fornecedor">Fornecedor</option>
          <option value="Parceiro">Parceiro</option>
          <option value="Governo">Governo</option>
          <option value="Outros">Outros</option>
        </select>
        <button onClick={load}>Filtrar</button>
        <button onClick={approvePendingFiltered}>Aprovar pendentes filtrados</button>
        <button onClick={exportCsv}>Exportar CSV</button>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 18 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              <th align="left">Nome</th><th align="left">Email</th><th>Categoria</th><th>Origem</th><th>Status</th><th>Aceite</th><th>Vinculados</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{c.nome || "-"}</td>
                <td>{c.email}</td>
                <td align="center">{c.categoria || "-"}</td>
                <td align="center">{c.origem}</td>
                <td align="center">{c.status}</td>
                <td align="center">{c.aceita_newsletter ? "Sim" : "Não"}</td>
                <td align="center" title={c.nomes_clientes_vinculados || ""}>{c.quantidade_clientes_vinculados || 1}</td>
                <td>
                  <button onClick={() => startEdit(c)}>Editar</button>{" "}
                  <button onClick={() => quickPatch(c, { status: "active", aceita_newsletter: true })}>Ativar</button>{" "}
                  <button onClick={() => quickPatch(c, { status: "unsubscribed", aceita_newsletter: false })}>Descadastrar</button>{" "}
                  <button onClick={() => quickPatch(c, { status: "blocked", aceita_newsletter: false })}>Bloquear</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
