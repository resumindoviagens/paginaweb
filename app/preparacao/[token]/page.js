"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import BrandHeader from "../../../components/BrandHeader";

const sections = [
  {
    title: "1. Antes de começar",
    text: [
      "Este material é exclusivo para o cliente identificado nesta página e faz parte da preparação para comparecimento ao CASV e/ou Consulado/Embaixada.",
      "O objetivo é reduzir dúvidas antes da videochamada e permitir que nossa conversa seja mais objetiva e focada no seu caso."
    ]
  },
  {
    title: "2. Documentos principais",
    text: [
      "Leve sempre o passaporte, o documento Confirmation e o documento de Agendamento.",
      "O Confirmation é o documento principal do seu DS-160 e deve estar junto ao passaporte durante o comparecimento.",
      "O documento de Agendamento contém datas, horários e endereços. Verifique com atenção a ordem dos compromissos."
    ],
    alert: "Em processos com duas etapas, o documento de agendamento pode apresentar primeiro as informações do Consulado/Embaixada e depois as informações do CASV. Confira cuidadosamente qual é o compromisso do primeiro dia."
  },
  {
    title: "3. CASV",
    text: [
      "O CASV é o local responsável pela coleta de digitais e foto.",
      "Em Brasília, São Paulo e Rio de Janeiro, normalmente o processo ocorre em duas etapas: primeiro CASV, depois Consulado/Embaixada.",
      "No dia do CASV, em regra, leve apenas os documentos essenciais: passaporte, Confirmation e Agendamento."
    ]
  },
  {
    title: "4. Recife e Porto Alegre",
    text: [
      "Em Recife e Porto Alegre, o atendimento costuma ocorrer em uma única etapa, com coleta de digitais, entrega de foto quando necessária e entrevista.",
      "Nesses casos, leve também os documentos comprobatórios que possam ser úteis na entrevista."
    ]
  },
  {
    title: "5. Como agir na entrevista",
    text: [
      "Cumprimente o agente consular com educação e entregue apenas os documentos essenciais quando solicitado.",
      "Mantenha os documentos comprobatórios com você. Só apresente documentos se o agente consular pedir ou se a conversa indicar claramente a necessidade.",
      "Responda apenas o que for perguntado, de forma objetiva e sem tentar explicar além do necessário."
    ],
    goodBad: {
      wrong: "Estou indo porque amo os Estados Unidos e meu sonho de infância é conhecer a Disney.",
      right: "Vou fazer turismo."
    }
  },
  {
    title: "6. Documentos comprobatórios",
    text: [
      "Os documentos variam conforme o perfil do solicitante.",
      "Em geral, os mais relevantes são: imposto de renda, holerites, comprovantes de trabalho, documentos de empresa, comprovante de estudo, comprovante de residência própria e documentos de quem custear a viagem, quando aplicável.",
      "Se já teve visto americano antes, leve o passaporte antigo com o visto. Informe que está com ele e apresente apenas se solicitado."
    ]
  },
  {
    title: "7. Dicas importantes",
    text: [
      "Não leve celular, smartwatch ou objetos desnecessários ao Consulado/Embaixada.",
      "Chegue com antecedência.",
      "Use roupa de passeio ou formal, conforme seu perfil. Evite estampas chamativas ou roupas brancas se houver foto no local.",
      "Se houver insegurança sobre alguma pergunta ou documento, tire a dúvida antes da entrevista."
    ]
  },
  {
    title: "8. Foto",
    text: [
      "As instruções de foto são especialmente importantes para Recife, Porto Alegre, crianças pequenas ou situações em que a foto precisa ser levada impressa.",
      "A foto deve ter fundo branco, papel fotográfico, tamanho adequado, sem óculos, sem sorriso, com testa e orelhas visíveis, e sem roupa branca."
    ]
  },
  {
    title: "9. Após o resultado",
    text: [
      "Se o visto for aprovado, o passaporte ficará retido para emissão do visto e será entregue ou retirado conforme a modalidade escolhida.",
      "Ao compartilhar a boa notícia, não publique dados do visto ou do passaporte.",
      "Se quiser marcar a Resumindo Viagens nas redes sociais, ficaremos felizes em acompanhar esse momento."
    ]
  }
];

export default function PreparacaoPage() {
  const params = useParams();
  const token = params.token;
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [client, setClient] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const watermark = useMemo(() => {
    if (!client?.name) return "USO EXCLUSIVO — RESUMINDO VIAGENS";
    return `USO EXCLUSIVO — ${client.name} — RESUMINDO VIAGENS`;
  }, [client]);

  async function verify(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/preparacao/${token}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, birth_date: birthDate })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível validar o acesso.");

      setClient(data.client);
      setVideoUrl(data.videoUrl || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!client) {
    return (
      <main className="page" style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <section className="card">
          <BrandHeader />
          <h1>Acesso às orientações de entrevista</h1>
          <p className="muted">Este material é exclusivo e protegido. Confirme CPF e data de nascimento para continuar.</p>

          <form onSubmit={verify} className="grid two" style={{ marginTop: 22 }}>
            <input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="CPF" required />
            <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} placeholder="Data de nascimento (dd/mm/aaaa)" required />
            <button className="primary" type="submit" disabled={loading}>{loading ? "Validando..." : "Acessar orientações"}</button>
          </form>

          {error ? <div className="alert error" style={{ marginTop: 18 }}>{error}</div> : null}
        </section>
      </main>
    );
  }

  return (
    <main
      className="page protected-page"
      onContextMenu={(e) => e.preventDefault()}
      style={{
        maxWidth: 1050,
        margin: "0 auto",
        padding: 24,
        position: "relative",
        userSelect: "none"
      }}
    >
      <style jsx>{`
        .protected-page::before {
          content: "${watermark}";
          position: fixed;
          inset: -20vh -20vw;
          z-index: 0;
          display: grid;
          place-items: center;
          transform: rotate(-28deg);
          font-size: 42px;
          line-height: 1.4;
          font-weight: 900;
          letter-spacing: 1px;
          color: rgba(31, 42, 96, 0.16);
          pointer-events: none;
          text-align: center;
          padding: 30px;
          white-space: pre-wrap;
        }
        .protected-page::after {
          content: "${watermark}\\A${watermark}\\A${watermark}";
          position: fixed;
          inset: 0;
          z-index: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-28deg);
          font-size: 24px;
          line-height: 3;
          font-weight: 800;
          color: rgba(31, 42, 96, 0.08);
          pointer-events: none;
          text-align: center;
          white-space: pre-wrap;
        }
        .protected-page > * {
          position: relative;
          z-index: 1;
        }
        .notice {
          border: 1px solid #f59e0b;
          background: #fff7ed;
          border-radius: 16px;
          padding: 16px;
          margin: 18px 0;
        }
        .video-box {
          border: 1px solid #dbe3f0;
          border-radius: 18px;
          background: #f8fafc;
          padding: 18px;
          margin: 22px 0;
        }
        .manual-section {
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          background: rgba(255,255,255,0.94);
          padding: 20px;
          margin: 16px 0;
        }
        .manual-section h2 {
          margin: 0 0 12px;
          color: #1f2a60;
          font-size: 22px;
        }
        .manual-section p {
          margin: 0 0 12px;
          line-height: 1.6;
        }
        .comparison {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        .wrong, .right {
          border-radius: 14px;
          padding: 14px;
        }
        .wrong { background: #fef2f2; border: 1px solid #fecaca; }
        .right { background: #ecfdf5; border: 1px solid #bbf7d0; }
        .fixed-footer {
          margin-top: 24px;
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
          color: #475569;
          font-size: 13px;
        }
      `}</style>

      <section className="card">
        <BrandHeader />
        <h1>Guia de preparação para entrevista de visto americano</h1>
        <p className="muted">
          Uso exclusivo de <strong>{client.name}</strong> — CPF {client.cpf_masked}.
        </p>

        <div className="notice">
          <strong>🔒 Material exclusivo e personalizado.</strong><br />
          Este conteúdo faz parte da assessoria contratada junto à Resumindo Viagens. Não compartilhe este link, texto, vídeo ou prints com terceiros. Se alguém precisar de orientação, indique nossos serviços.
        </div>

        <div className="video-box">
          <h2 style={{ marginTop: 0 }}>🎥 Vídeo de preparação</h2>
          {videoUrl ? (
            <video controls controlsList="nodownload" style={{ width: "100%", borderRadius: 14, background: "#111827" }}>
              <source src={videoUrl} />
              Seu navegador não conseguiu carregar o vídeo.
            </video>
          ) : (
            <div className="notice">
              <strong>Vídeo ainda não inserido.</strong><br />
              Esta página já está pronta. Depois basta configurar a variável <code>NEXT_PUBLIC_VIDEO_ENTREVISTA</code> com o link do vídeo final.
            </div>
          )}
          <p className="muted" style={{ marginBottom: 0 }}>
            Assista antes da videochamada. A conversa será usada para ajustar pontos específicos do seu caso.
          </p>
        </div>

        {sections.map((section) => (
          <section className="manual-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.text.map((item, index) => <p key={index}>{item}</p>)}
            {section.alert ? <div className="notice"><strong>⚠️ Atenção:</strong> {section.alert}</div> : null}
            {section.goodBad ? (
              <div className="comparison">
                <div className="wrong"><strong>❌ Evite responder assim:</strong><br />{section.goodBad.wrong}</div>
                <div className="right"><strong>✅ Resposta mais adequada:</strong><br />{section.goodBad.right}</div>
              </div>
            ) : null}
          </section>
        ))}

        <div className="fixed-footer">
          Material exclusivo Resumindo Viagens — {client.name}. Proibido compartilhamento, reprodução ou envio a terceiros.
        </div>
      </section>
    </main>
  );
}
