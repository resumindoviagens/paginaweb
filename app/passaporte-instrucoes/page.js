export const dynamic = "force-dynamic";

const CONTACTS = {
  whatsapp: "https://wa.me/5511981210932",
  instagram: "https://www.instagram.com/resumindoviagens",
  email: "mailto:contato@resumindoviagens.com.br"
};

function Section({ title, children, accent = false }) {
  return (
    <section style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 22,
      padding: "24px 28px",
      marginTop: 18,
      boxShadow: "0 16px 38px rgba(15,23,42,.08)",
      borderLeft: accent ? "7px solid #f59e0b" : "1px solid #e5e7eb"
    }}>
      <h2 style={{ color: "#1f2a60", margin: "0 0 12px", fontSize: 25, lineHeight: 1.2 }}>{title}</h2>
      <div style={{ color: "#263445", fontSize: 17, lineHeight: 1.65 }}>{children}</div>
    </section>
  );
}

function Pill({ children }) {
  return <span style={{ display: "inline-block", background: "#fff7ed", color: "#b45309", border: "1px solid #fed7aa", borderRadius: 999, padding: "7px 12px", fontWeight: 800, margin: "0 8px 8px 0" }}>{children}</span>;
}

export default function PassaporteInstrucoesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f4f7fb", padding: "22px 14px 44px", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <section style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 50px rgba(15,23,42,.10)" }}>
          <div style={{
            minHeight: 230,
            backgroundImage: "linear-gradient(90deg, rgba(31,42,96,.92), rgba(31,42,96,.28)), url('/email-headers/header-orlando-v38.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            padding: "34px 34px",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end"
          }}>
            <img src="/logo.png" alt="Resumindo Viagens" style={{ width: 210, maxWidth: "60%", marginBottom: 34 }} />
            <div style={{ color: "#ffb233", fontWeight: 900, letterSpacing: 1, fontSize: 15 }}>PASSAPORTE BRASILEIRO</div>
            <h1 style={{ margin: "8px 0 0", fontSize: 42, lineHeight: 1.08, maxWidth: 760 }}>Orientações para o atendimento na Polícia Federal</h1>
            <p style={{ margin: "12px 0 0", fontSize: 19, maxWidth: 760 }}>Leia tudo com atenção antes de comparecer ao agendamento.</p>
          </div>

          <div style={{ padding: "24px 28px 30px" }}>
            <div style={{ marginBottom: 8 }}>
              <Pill>Revise os documentos</Pill>
              <Pill>Imprima o necessário</Pill>
              <Pill>Confira data e local</Pill>
              <Pill>Chegue com antecedência</Pill>
            </div>

            <Section title="Antes de sair de casa" accent>
              <p>Revise todos os documentos com atenção. A Polícia Federal normalmente não imprime documentos no local.</p>
              <p><strong>Se esquecer algum documento essencial, o atendimento poderá não ser realizado.</strong></p>
              <p>O agendamento possui limite de reagendamentos. Se for necessário remarcar mais vezes, isso pode atrasar o planejamento da viagem.</p>
            </Section>

            <Section title="Documentos que normalmente devem ser impressos">
              <ul>
                <li>Protocolo do passaporte.</li>
                <li>Comprovante de agendamento.</li>
                <li>Autorização para menor, quando aplicável. Em muitos casos, deixe para assinar na frente do atendente.</li>
              </ul>
              <p><strong>Não é necessário levar comprovante de pagamento da taxa</strong> quando o agendamento já estiver confirmado.</p>
            </Section>

            <Section title="Documentos pessoais">
              <ul>
                <li>Documento de identificação original do solicitante.</li>
                <li>CPF, se não constar no documento apresentado.</li>
                <li>Comprovante de endereço residencial.</li>
                <li>Passaporte anterior mais recente, se houver.</li>
                <li>Certidão de casamento, divórcio, óbito ou decisão judicial, quando houver alteração de nome ou estado civil aplicável.</li>
              </ul>
            </Section>

            <Section title="Menores de idade">
              <p>Se houver menor de idade no agendamento, em regra ambos os pais devem comparecer.</p>
              <ul>
                <li>Leve documento dos pais, como RG, CNH ou passaporte.</li>
                <li>Leve certidão de nascimento do menor, especialmente se ele não tiver RG.</li>
                <li>Leve certidão de casamento dos pais, quando aplicável.</li>
                <li>Se um dos pais não comparecer, verifique previamente a autorização com assinatura e reconhecimento de firma.</li>
              </ul>
            </Section>

            <Section title="Pendências eleitorais">
              <p>Para adultos, antes do atendimento, consulte se há pendências eleitorais, como multa por ausência de voto sem justificativa.</p>
              <p>Se houver pendência, regularize com antecedência, preferencialmente alguns dias úteis antes do atendimento.</p>
            </Section>

            <Section title="Foto para passaporte">
              <p>As instruções de foto de passaporte brasileiro são diferentes das instruções do visto americano.</p>
              <ul>
                <li>Crianças menores de 5 anos devem levar 1 foto impressa.</li>
                <li>A foto deve ser 5x7, tirada em casa de fotos.</li>
                <li>Evite roupa branca.</li>
                <li>Preferencialmente, cabelo preso ou sem cobrir o rosto e as orelhas.</li>
              </ul>
            </Section>

            <Section title="No atendimento">
              <p>O atendente da Polícia Federal mostrará os dados na tela.</p>
              <p><strong>Confira tudo:</strong> nome, sobrenomes, grafia, nomes dos pais e cidade de nascimento.</p>
              <p>Se perceber qualquer erro, avise no momento do atendimento.</p>
            </Section>

            <Section title="Após o atendimento">
              <p>Depois do comparecimento, o prazo usual para disponibilização do passaporte é de aproximadamente 8 dias, podendo variar conforme a unidade e a situação do sistema.</p>
              <p>A Resumindo Viagens acompanhará o andamento e avisará quando houver informação de disponibilidade para retirada.</p>
            </Section>

            <div style={{ marginTop: 22, background: "#1f2a60", color: "#fff", borderRadius: 22, padding: 26, display: "grid", gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 25 }}>Fale com a Resumindo Viagens</h2>
              <p style={{ margin: 0, opacity: .94 }}>Em caso de dúvida antes do atendimento, entre em contato.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                <a href={CONTACTS.whatsapp} style={{ color: "#1f2a60", background: "#ffb233", padding: "12px 16px", borderRadius: 12, fontWeight: 900, textDecoration: "none" }}>WhatsApp</a>
                <a href={CONTACTS.instagram} style={{ color: "#fff", border: "1px solid rgba(255,255,255,.45)", padding: "12px 16px", borderRadius: 12, fontWeight: 800, textDecoration: "none" }}>Instagram</a>
                <a href={CONTACTS.email} style={{ color: "#fff", border: "1px solid rgba(255,255,255,.45)", padding: "12px 16px", borderRadius: 12, fontWeight: 800, textDecoration: "none" }}>Email</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
