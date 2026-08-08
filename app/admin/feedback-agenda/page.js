"use client";

import { useEffect, useMemo, useState } from "react";

function cleanPhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function dateBR(value) {
  if (!value) return "-";
  try { return new Date(value).toLocaleDateString("pt-BR"); } catch { return value; }
}

export default function FeedbackAgendaPage() {
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState("pendentes");
  const [loading, setLoading] = useState(true);
  const [emailComposer, setEmailComposer] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  function escapeHtmlComposer(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function applyPlainTextToEmailLayout(originalHtml = "", plainText = "") {
    const safeParagraphs = String(plainText || "")
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p style="margin:0 0 14px;">${escapeHtmlComposer(paragraph).replace(/\n/g, "<br />")}</p>`)
      .join("");

    const firstParagraph = originalHtml.indexOf("<p");
    const contactsDivider = originalHtml.indexOf("<hr");
    if (firstParagraph !== -1 && contactsDivider !== -1 && contactsDivider > firstParagraph) {
      return originalHtml.slice(0, firstParagraph) + safeParagraphs + originalHtml.slice(contactsDivider);
    }
    return originalHtml + `<div style="padding:24px;">${safeParagraphs}</div>`;
  }

  function generateEmailPreview() {
    setEmailComposer((current) => {
      if (!current) return current;
      return { ...current, html: applyPlainTextToEmailLayout(current.originalHtml || current.html, current.plainText || "") };
    });
  }

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/clients", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao carregar clientes.");
      setLoading(false);
      return;
    }
    setClients(data.clients || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const rows = useMemo(() => {
    return clients
      .filter((client) => client.stage_feedback_sent || client.feedback_token || client.feedback_answered_at)
      .filter((client) => {
        if (filter === "enviadas") return !!client.stage_feedback_sent && !client.feedback_answered_at && !client.stage_feedback_posted;
        if (filter === "respondidas") return !!client.feedback_answered_at && !client.stage_feedback_posted;
        if (filter === "postadas") return !!client.stage_feedback_posted;
        return !!client.stage_feedback_sent && !client.feedback_answered_at && !client.stage_feedback_posted;
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || "", "pt-BR"));
  }, [clients, filter]);

  async function ensureFeedbackLink(client) {
    const res = await fetch(`/api/admin/feedback-link/${client.id}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao gerar pesquisa.");
    await load();
    return data.feedbackLink;
  }

  async function whatsappReminder(client) {
    try {
      const link = await ensureFeedbackLink(client);
      const phone = cleanPhone(client.phone);
      if (!phone) {
        alert("Cliente sem telefone.");
        return;
      }
      const message = encodeURIComponent(`Olá, ${client.name}. Tudo bem?\n\nPassando para lembrar da nossa pesquisa rápida de satisfação da Resumindo Viagens.\n\nVocê pode responder por aqui:\n${link}\n\nMuito obrigado!`);
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener,noreferrer");
    } catch (err) {
      alert(err.message);
    }
  }

  async function emailReminder(client) {
    const res = await fetch(`/api/admin/email-compose/${client.id}?template=pesquisa_satisfacao`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao carregar modelo de email.");
      return;
    }
    setEmailComposer({
      client,
      toEmail: data.toEmail || client.email || "",
      toName: data.toName || client.name || "",
      subject: data.subject || "",
      html: data.html || "",
      originalHtml: data.html || "",
      text: data.text || "",
      plainText: data.plainText || data.text || "",
      templateId: "pesquisa_satisfacao"
    });
  }

  async function sendEmailComposer() {
    if (!emailComposer?.client?.id) return;
    setSendingEmail(true);
    try {
      const res = await fetch("/api/admin/email-compose/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: emailComposer.client.id,
          template_id: emailComposer.templateId,
          to_email: emailComposer.toEmail,
          to_name: emailComposer.toName,
          subject: emailComposer.subject,
          html: emailComposer.html,
          text: emailComposer.plainText || emailComposer.text
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao enviar email.");
        return;
      }
      alert("Email enviado com sucesso.");
      setEmailComposer(null);
      await load();
    } finally {
      setSendingEmail(false);
    }
  }

  async function markPosted(client) {
    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_process_steps", stage_feedback_posted: true })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao marcar como postado.");
      return;
    }
    await load();
  }

  return (
    <main style={{ maxWidth: 1180, margin: "30px auto", padding: 24, fontFamily: "Arial, Helvetica, sans-serif" }}>
      <h1 style={{ color: "#1f2a60" }}>Agenda de pesquisas de satisfação</h1>
      <p>Controle quem recebeu a pesquisa, quem respondeu, quem ainda está pendente e quais avaliações já foram postadas.</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "18px 0" }}>
        <button onClick={() => setFilter("pendentes")} style={{ padding: "10px 14px", borderRadius: 10, border: 0, background: filter === "pendentes" ? "#1f2a60" : "#e5e7eb", color: filter === "pendentes" ? "#fff" : "#111827" }}>Pendentes</button>
        <button onClick={() => setFilter("enviadas")} style={{ padding: "10px 14px", borderRadius: 10, border: 0, background: filter === "enviadas" ? "#1f2a60" : "#e5e7eb", color: filter === "enviadas" ? "#fff" : "#111827" }}>Enviadas não respondidas</button>
        <button onClick={() => setFilter("respondidas")} style={{ padding: "10px 14px", borderRadius: 10, border: 0, background: filter === "respondidas" ? "#1f2a60" : "#e5e7eb", color: filter === "respondidas" ? "#fff" : "#111827" }}>Respondidas</button>
        <button onClick={() => setFilter("postadas")} style={{ padding: "10px 14px", borderRadius: 10, border: 0, background: filter === "postadas" ? "#1f2a60" : "#e5e7eb", color: filter === "postadas" ? "#fff" : "#111827" }}>Postadas</button>
      </div>

      {loading ? <p>Carregando...</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th align="left" style={{ padding: 10 }}>Cliente</th>
              <th align="left" style={{ padding: 10 }}>Email</th>
              <th align="left" style={{ padding: 10 }}>WhatsApp</th>
              <th align="left" style={{ padding: 10 }}>Respondida</th>
              <th align="left" style={{ padding: 10 }}>Nota</th>
              <th align="left" style={{ padding: 10 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((client) => (
              <tr key={client.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ padding: 10 }}><strong>{client.name}</strong></td>
                <td style={{ padding: 10 }}>{client.email || "-"}</td>
                <td style={{ padding: 10 }}>{client.phone || "-"}</td>
                <td style={{ padding: 10 }}>{dateBR(client.feedback_answered_at)}</td>
                <td style={{ padding: 10 }}>{client.feedback_nota_nps ?? "-"}</td>
                <td style={{ padding: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => whatsappReminder(client)}>WhatsApp lembrete</button>
                  <button onClick={() => emailReminder(client)} disabled={!client.email}>Email lembrete</button>
                  {client.feedback_answered_at && !client.stage_feedback_posted && <button onClick={() => markPosted(client)}>Marcar postado</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && rows.length === 0 && <p>Nenhum registro nesta visão.</p>}

      {emailComposer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setEmailComposer(null)}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 1050, width: "96vw", maxHeight: "92vh", overflow: "auto", padding: 22 }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEmailComposer(null)} style={{ float: "right", border: 0, borderRadius: 999, padding: "8px 12px" }}>×</button>
            <h2 style={{ color: "#1f2a60" }}>Email de lembrete da pesquisa</h2>
            <p>Edite apenas o texto. Depois clique em Gerar pré-visualização para aplicar o layout automaticamente.</p>
            <label style={{ display: "block", marginBottom: 10 }}>
              <strong>Para</strong>
              <input value={emailComposer.toEmail || ""} onChange={(e) => setEmailComposer({ ...emailComposer, toEmail: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 10 }} />
            </label>
            <label style={{ display: "block", marginBottom: 10 }}>
              <strong>Assunto</strong>
              <input value={emailComposer.subject || ""} onChange={(e) => setEmailComposer({ ...emailComposer, subject: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 10 }} />
            </label>
            <label style={{ display: "block", marginBottom: 10 }}>
              <strong>Mensagem em texto simples</strong>
              <textarea value={emailComposer.plainText || ""} onChange={(e) => setEmailComposer({ ...emailComposer, plainText: e.target.value })} style={{ width: "100%", minHeight: 220, padding: 10, border: "1px solid #d1d5db", borderRadius: 10, fontSize: 16, lineHeight: 1.5 }} />
            </label>
            <button onClick={generateEmailPreview} style={{ marginBottom: 12 }}>Gerar pré-visualização</button>
            <h3>Pré-visualização</h3>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, maxHeight: 320, overflow: "auto" }} dangerouslySetInnerHTML={{ __html: emailComposer.html || "" }} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setEmailComposer(null)}>Cancelar</button>
              <button onClick={sendEmailComposer} disabled={sendingEmail}>{sendingEmail ? "Enviando..." : "Enviar email"}</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
