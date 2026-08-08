"use client";

import { useState } from "react";

const pontosPorServico = {
  visto: [
    "organização do processo",
    "formulário inteligente",
    "orientações para entrevista",
    "videochamada individual",
    "suporte e atendimento",
    "agilidade",
    "outro"
  ],
  passaporte: [
    "orientações sobre documentos",
    "preenchimento e conferência do cadastro",
    "emissão e pagamento da taxa",
    "agendamento na Polícia Federal",
    "instruções para comparecimento",
    "acompanhamento até a retirada",
    "suporte e atendimento",
    "agilidade",
    "outro"
  ],
  canadense: [
    "organização do processo",
    "conferência dos documentos",
    "orientações de biometria",
    "suporte e atendimento",
    "agilidade",
    "outro"
  ]
};

function pontosDoServico(service) {
  return pontosPorServico[service] || pontosPorServico.visto;
}

function perguntaPrincipal(service) {
  if (service === "passaporte") return "De 0 a 10, quanto você indicaria a assessoria da Resumindo Viagens para emissão de passaporte?";
  if (service === "canadense") return "De 0 a 10, quanto você indicaria a assessoria da Resumindo Viagens para visto canadense?";
  return "De 0 a 10, quanto você indicaria a Resumindo Viagens?";
}

function perguntaPontoForte(service) {
  if (service === "passaporte") return "Qual etapa da emissão do passaporte mais lhe ajudou?";
  return "Qual parte do processo mais lhe ajudou?";
}

function perguntaComentario(service) {
  if (service === "passaporte") return "Como foi sua experiência com a assessoria para emissão do passaporte?";
  return "Deseja deixar um comentário?";
}

const inputStyle = {
  padding: 13,
  borderRadius: 12,
  border: "1px solid #d1d5db",
  width: "100%",
  boxSizing: "border-box"
};

function serviceLabel(service) {
  if (service === "passaporte") return "assessoria para emissão de passaporte";
  if (service === "canadense") return "assessoria para visto canadense";
  return "assessoria para visto";
}

export default function FeedbackForm({ token, clientName, service = "visto" }) {
  const [auth, setAuth] = useState({ cpf: "", birth_date: "" });
  const [authenticated, setAuthenticated] = useState(false);
  const [form, setForm] = useState({
    nota_nps: "10",
    ponto_forte: service === "passaporte" ? "orientações sobre documentos" : (service === "canadense" ? "conferência dos documentos" : "videochamada individual"),
    comentario: "",
    autorizou_divulgacao: false,
    instagram_usuario: ""
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function entrar(e) {
    e.preventDefault();

    if (!auth.cpf || !auth.birth_date) {
      alert("Informe CPF e data de nascimento para acessar a pesquisa.");
      return;
    }

    setAuthenticated(true);
  }

  async function submitFeedback(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...auth, ...form, nota_nps: Number(form.nota_nps) })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Não foi possível enviar sua avaliação.");
        return;
      }

      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main style={{ minHeight: "100vh", background: "#f6f8fb", padding: 24, fontFamily: "Arial, Helvetica, sans-serif" }}>
        <section style={{ maxWidth: 680, margin: "30px auto", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 22, padding: 28 }}>
          <h1 style={{ color: "#1f2a60", marginTop: 0 }}>Obrigado pela sua avaliação.</h1>
          <p>Sua resposta foi registrada com segurança.</p>
        </section>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main style={{ minHeight: "100vh", background: "#f6f8fb", padding: 24, fontFamily: "Arial, Helvetica, sans-serif" }}>
        <section style={{ maxWidth: 560, margin: "40px auto", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 22, padding: 28, boxShadow: "0 18px 45px rgba(15,23,42,.08)" }}>
          <h1 style={{ color: "#1f2a60", marginTop: 0 }}>Acesso seguro</h1>
          <p style={{ color: "#4b5563" }}>
            Olá, <strong>{clientName}</strong>. Para acessar sua pesquisa de satisfação, confirme seus dados abaixo.
          </p>

          <form onSubmit={entrar} style={{ display: "grid", gap: 14, marginTop: 22 }}>
            <input
              required
              placeholder="CPF"
              value={auth.cpf}
              onChange={(e) => setAuth({ ...auth, cpf: e.target.value })}
              style={inputStyle}
            />

            <label style={{ color: "#4b5563", fontSize: 14 }}>
              Data de nascimento
              <input
                required
                type="date"
                value={auth.birth_date}
                onChange={(e) => setAuth({ ...auth, birth_date: e.target.value })}
                style={{ ...inputStyle, marginTop: 6 }}
              />
            </label>

            <button style={{ background: "#1f2a60", color: "#fff", border: 0, borderRadius: 12, padding: 14, fontWeight: 800 }}>
              Entrar
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f6f8fb", padding: 24, fontFamily: "Arial, Helvetica, sans-serif" }}>
      <section style={{ maxWidth: 720, margin: "30px auto", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 22, padding: 28 }}>
        <h1 style={{ color: "#1f2a60", marginTop: 0 }}>Pesquisa de satisfação</h1>
        <p style={{ color: "#4b5563" }}>
          Esta avaliação se refere à {serviceLabel(service)} prestada pela Resumindo Viagens. Sua opinião ajuda a aprimorar nosso atendimento e leva menos de 1 minuto.
        </p>

        <form onSubmit={submitFeedback} style={{ display: "grid", gap: 14, marginTop: 22 }}>
          <h3 style={{ color: "#1f2a60", marginBottom: 0 }}>Avaliação</h3>

          <label>
            {perguntaPrincipal(service)}
            <select
              value={form.nota_nps}
              onChange={(e) => setForm({ ...form, nota_nps: e.target.value })}
              style={{ ...inputStyle, marginTop: 6 }}
            >
              {Array.from({ length: 11 }).map((_, i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </label>

          <label>
            {perguntaPontoForte(service)}
            <select
              value={form.ponto_forte}
              onChange={(e) => setForm({ ...form, ponto_forte: e.target.value })}
              style={{ ...inputStyle, marginTop: 6 }}
            >
              {pontosDoServico(service).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>

          <label>
            {perguntaComentario(service)}
            <textarea
              required
              value={form.comentario}
              onChange={(e) => setForm({ ...form, comentario: e.target.value })}
              style={{ ...inputStyle, minHeight: 120, marginTop: 6 }}
            />
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14 }}>
            <input
              type="checkbox"
              checked={form.autorizou_divulgacao}
              onChange={(e) => setForm({ ...form, autorizou_divulgacao: e.target.checked })}
            />
            Autorizo a utilização parcial do meu depoimento, sem exposição de dados sensíveis.
          </label>

          {form.autorizou_divulgacao && (
            <label>
              Gostaria de ser marcado na postagem do comentário? Se positivo, coloque aqui seu usuário do Instagram:
              <input
                placeholder="@seuusuario"
                value={form.instagram_usuario || ""}
                onChange={(e) => setForm({ ...form, instagram_usuario: e.target.value })}
                style={{ ...inputStyle, marginTop: 6 }}
              />
            </label>
          )}

          <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, background: "#f9fafb" }}>
            <strong>Modelo aproximado da postagem:</strong>
            <p style={{ color: "#4b5563", margin: "8px 0 12px" }}>A arte final poderá variar conforme o fundo escolhido, mas seguirá este estilo visual.</p>
            <img
              src="/feedback-preview-modelo.png"
              alt="Modelo de postagem de avaliação no Instagram"
              style={{ width: "100%", maxWidth: 360, display: "block", margin: "0 auto", borderRadius: 18, boxShadow: "0 14px 35px rgba(15,23,42,.18)" }}
            />
          </div>

          <button disabled={loading} style={{ background: "#1f2a60", color: "#fff", border: 0, borderRadius: 12, padding: 14, fontWeight: 700 }}>
            {loading ? "Enviando..." : "Enviar avaliação"}
          </button>
        </form>
      </section>
    </main>
  );
}
