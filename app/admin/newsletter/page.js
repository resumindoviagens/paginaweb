"use client";

import { useEffect, useState } from "react";
import { defaultNewsletterText, renderNewsletterHtml } from "../../../lib/newsletterEmail";

export default function NewsletterPage() {
  const [summary, setSummary] = useState(null);
  const [subject, setSubject] = useState("Novidades e lembretes úteis da Resumindo Viagens");
  const [message, setMessage] = useState(defaultNewsletterText());
  const [audience, setAudience] = useState("eligible_all");
  const [testEmail, setTestEmail] = useState("contato@resumindoviagens.com.br");
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  async function load() {
    const res = await fetch("/api/admin/newsletter/summary", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao carregar newsletter.");
      return;
    }
    setSummary(data);
  }

  useEffect(() => { load(); }, []);

  function generatePreview() {
    setPreviewHtml(renderNewsletterHtml({
      subject,
      message,
      clientName: "[NOME DO CLIENTE]",
      unsubscribeUrl: "https://app.resumindoviagens.com.br/unsubscribe/exemplo",
      origin: window.location.origin
    }));
  }

  async function sendTest() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_email: testEmail, subject, message, origin: window.location.origin })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao enviar teste.");
        return;
      }
      alert("Email de teste enviado.");
    } finally {
      setLoading(false);
    }
  }

  async function createCampaign() {
    if (!confirm("Criar campanha em rascunho? Nesta versão ela NÃO será disparada automaticamente.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, audience })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao criar campanha.");
        return;
      }
      alert(`Campanha criada em rascunho com ${data.total_recipients} destinatário(s).`);
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function deleteDraftCampaign(id) {
    if (!confirm("Excluir este rascunho? Campanhas enviadas não podem ser excluídas.")) return;
    const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Erro ao excluir rascunho.");
    await load();
  }

  async function viewCampaign(id) {
    const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Erro ao abrir campanha.");
    alert(`Campanha: ${data.campaign.subject}\nStatus: ${data.campaign.status}\nDestinatários congelados: ${(data.recipients || []).length}`);
  }

  const counts = summary?.counts || {};

  return (
    <main style={{ maxWidth: 1180, margin: "30px auto", padding: 24, fontFamily: "Arial, Helvetica, sans-serif" }}>
      <h1 style={{ color: "#1f2a60" }}>Newsletter</h1>
      <p>Base segura: preparar campanha, visualizar, enviar teste e criar rascunho. Agora a base de campanhas é independente da tabela de clientes.</p>
      <p><a href="/admin/newsletter/contatos" target="_blank">Abrir Newsletter / Contatos</a></p>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, margin: "18px 0" }}>
        {[
          ["Contatos", counts.total_contacts],
          ["Ativos", counts.active],
          ["Elegíveis", counts.eligible],
          ["Pendentes revisão", counts.pending_review],
          ["Descadastrados reais", counts.opt_out],
          ["Bloqueados/bounce", counts.blocked]
        ].map(([label, value]) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 14 }}>
            <strong style={{ color: "#1f2a60", fontSize: 22 }}>{value ?? "-"}</strong>
            <div style={{ color: "#64748b", fontSize: 13 }}>{label}</div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 18 }}>
          <h2>Campanha</h2>
          <label style={{ display: "block", marginBottom: 12 }}>
            <strong>Público</strong>
            <select value={audience} onChange={(e) => setAudience(e.target.value)} style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 10, marginTop: 6 }}>
              <option value="eligible_all">Todos contatos ativos/elegíveis</option>
              <option value="clientes_visto">Origem clientes do visto</option>
              <option value="manual_csv">Manual + CSV</option>
            </select>
          </label>
          <label style={{ display: "block", marginBottom: 12 }}>
            <strong>Assunto</strong>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 10, marginTop: 6 }} />
          </label>
          <label style={{ display: "block", marginBottom: 12 }}>
            <strong>Texto</strong>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} style={{ width: "100%", minHeight: 260, padding: 10, border: "1px solid #d1d5db", borderRadius: 10, marginTop: 6, fontSize: 15, lineHeight: 1.5 }} />
          </label>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={generatePreview} disabled={loading}>Gerar pré-visualização</button>
            <button onClick={createCampaign} disabled={loading}>Criar rascunho</button>
          </div>

          <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 18, paddingTop: 14 }}>
            <label style={{ display: "block", marginBottom: 10 }}>
              <strong>Email de teste</strong>
              <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 10, marginTop: 6 }} />
            </label>
            <button onClick={sendTest} disabled={loading}>Enviar teste</button>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 18 }}>
          <h2>Pré-visualização</h2>
          {previewHtml ? (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, maxHeight: 640, overflow: "auto" }} dangerouslySetInnerHTML={{ __html: previewHtml }} />
          ) : (
            <p style={{ color: "#64748b" }}>Clique em gerar pré-visualização.</p>
          )}
        </div>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 18, marginTop: 20 }}>
        <h2>Campanhas recentes</h2>
        {(summary?.campaigns || []).length === 0 ? <p>Nenhuma campanha criada.</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th align="left">Assunto</th><th>Status</th><th>Público</th><th>Total</th><th>Enviados</th><th>Falhas</th><th>Criada em</th><th>Ações</th></tr></thead>
            <tbody>
              {summary.campaigns.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td>{c.subject}</td><td>{c.status}</td><td>{c.audience}</td><td>{c.total_recipients}</td><td>{c.sent_count}</td><td>{c.failed_count}</td><td>{new Date(c.created_at).toLocaleString("pt-BR")}</td><td><button onClick={() => viewCampaign(c.id)}>Visualizar</button>{c.status === "draft" && <button onClick={() => deleteDraftCampaign(c.id)}>Excluir rascunho</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
