"use client";

import { useEffect, useState } from "react";

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showPosted, setShowPosted] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/feedbacks", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao carregar feedbacks.");
      return;
    }
    setFeedbacks(data.feedbacks || []);
  }

  useEffect(() => { load(); }, []);

  async function markPosted(item) {
    const clientId = item.client_id || item.client?.id;
    if (!clientId) return;
    const res = await fetch(`/api/admin/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_process_steps", stage_feedback_posted: true })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao marcar postado.");
      return;
    }
    await load();
  }

  const visible = feedbacks.filter((item) => showPosted || !item.client?.stage_feedback_posted);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "22px 14px 60px", fontFamily: "Arial, Helvetica, sans-serif", color: "#1f2937" }}>
      <h1 style={{ color: "#1f2a60", fontSize: 32, marginBottom: 8 }}>Feedbacks recebidos</h1>
      <p style={{ color: "#4b5563", marginTop: 0 }}>Use “Gerar postagem” para abrir a arte otimizada para celular.</p>

      <label style={{
        display: "inline-flex",
        gap: 10,
        alignItems: "center",
        marginBottom: 18,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: "10px 12px",
        fontWeight: 700
      }}>
        <input type="checkbox" checked={showPosted} onChange={(e) => setShowPosted(e.target.checked)} />
        Mostrar feedbacks já postados
      </label>

      {visible.map((item) => {
        const canGenerate = item.autorizou_divulgacao !== false;
        const comentario = item.comentario || item.depoimento || "";
        const isLong = comentario.length > 170;
        return (
          <section key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 18, marginBottom: 14, background: "#fff", boxShadow: "0 12px 30px rgba(15,23,42,.06)" }}>
            <h3 style={{ margin: "0 0 10px", color: "#111827", fontSize: 22 }}>{item.client?.name || item.client_name || "Cliente"}</h3>
            <p style={{ margin: "8px 0" }}><strong>Nota:</strong> {item.nota_nps ?? item.nota ?? "-"}/10</p>
            <p style={{ margin: "8px 0" }}><strong>Ponto forte:</strong> {item.ponto_forte || "-"}</p>
            <p style={{ margin: "8px 0 14px" }}><strong>Comentário:</strong> {comentario || "-"}</p>
            {isLong && (
              <p style={{ color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", padding: 10, borderRadius: 12, margin: "8px 0 14px" }}>
                Depoimento longo detectado. Use “Texto longo” para tentar aproveitar o comentário integral na arte.
              </p>
            )}

            {!canGenerate && (
              <p style={{ color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", padding: 10, borderRadius: 12 }}>
                Cliente não autorizou divulgação. O botão abre apenas para conferência interna.
              </p>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <a
                href={`/admin/feedbacks/${item.id}/card`}
                target="_blank"
                style={{
                  background: "#1f2a60",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "11px 15px",
                  fontWeight: 900,
                  textDecoration: "none",
                  display: "inline-block"
                }}
              >
                Gerar postagem
              </a>

              <a
                href={`/admin/feedbacks/${item.id}/card?story=1`}
                target="_blank"
                style={{
                  background: "#ff9800",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "11px 15px",
                  fontWeight: 900,
                  textDecoration: "none",
                  display: "inline-block"
                }}
              >
                Gerar story
              </a>

              {isLong && (
                <a
                  href={`/admin/feedbacks/${item.id}/card?story=1&full=1`}
                  target="_blank"
                  style={{
                    background: "#0f766e",
                    color: "#fff",
                    borderRadius: 12,
                    padding: "11px 15px",
                    fontWeight: 900,
                    textDecoration: "none",
                    display: "inline-block"
                  }}
                >
                  Texto longo
                </a>
              )}

              {item.client?.stage_feedback_posted ? (
                <span style={{ color: "#166534", fontWeight: 700 }}>Postado</span>
              ) : (
                <button
                  onClick={() => markPosted(item)}
                  style={{ border: 0, background: "#eef2f7", color: "#1f2a60", borderRadius: 12, padding: "11px 15px", fontWeight: 800 }}
                >
                  Marcar postado / baixar da lista
                </button>
              )}
            </div>
          </section>
        );
      })}

      {visible.length === 0 && <p>Nenhum feedback nesta visão.</p>}
    </main>
  );
}
