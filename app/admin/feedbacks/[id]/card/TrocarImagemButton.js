"use client";

import { useState } from "react";

export default function TrocarImagemButton({ feedbackId }) {
  const [loading, setLoading] = useState(false);

  async function trocar() {
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/feedbacks/${feedbackId}/change-background`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Não foi possível trocar a imagem.");
        return;
      }

      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={trocar}
      disabled={loading}
      style={{
        background: "#ff9800",
        color: "#fff",
        border: 0,
        borderRadius: 10,
        padding: "10px 14px",
        fontWeight: 800,
        cursor: loading ? "wait" : "pointer"
      }}
    >
      {loading ? "Trocando..." : "Trocar imagem"}
    </button>
  );
}
