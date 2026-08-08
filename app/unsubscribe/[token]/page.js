"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function UnsubscribePage() {
  const params = useParams();
  const token = params?.token;
  const [status, setStatus] = useState("");

  async function confirmUnsubscribe() {
    const res = await fetch(`/api/newsletter/unsubscribe/${token}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "Não foi possível concluir.");
      return;
    }
    setStatus("Seu email foi removido da lista de newsletter da Resumindo Viagens.");
  }

  return (
    <main style={{ maxWidth: 760, margin: "50px auto", padding: 24, fontFamily: "Arial, Helvetica, sans-serif" }}>
      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 28 }}>
        <h1 style={{ color: "#1f2a60" }}>Cancelar recebimento de newsletters</h1>
        <p>Você pode deixar de receber newsletters comerciais da Resumindo Viagens. Mensagens diretamente relacionadas a processos contratados ou em andamento não fazem parte desta lista.</p>
        <button onClick={confirmUnsubscribe}>Confirmar cancelamento</button>
        {status && <p style={{ marginTop: 18, color: "#1f2a60", fontWeight: 700 }}>{status}</p>}
      </section>
    </main>
  );
}
