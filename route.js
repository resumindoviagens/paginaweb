"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BrandHeader from "../../../components/BrandHeader";
import { sections } from "../../../lib/formSchema";

const HIGHLIGHTED_QUESTIONS = new Set([
  "2.12", "2.13", "2.14", "2.15", "2.16", "2.17", "2.18",
  "3.19", "3.20", "3.21",
  "6.3", "6.7", "6.9", "6.10", "6.11",
  "7.6",
  "8.8", "8.9", "8.10", "8.11"
]);

const PRE_INFO_ITEMS = [
  "Este documento, bem como todo o seu conteúdo digital, é de propriedade intelectual da RESUMINDO VIAGENS e de seus integrantes, sendo vedado seu compartilhamento com terceiros, uma vez que seu fornecimento está condicionado ao pagamento da taxa de serviços previamente acordada entre o solicitante e o prestador.",
  "Preencha todas as informações de forma completa e sem abreviações, especialmente nomes de pessoas, ruas e demais dados, evitando qualquer interpretação equivocada.",
  "As perguntas estão numeradas, sendo o primeiro número a página correspondente e o segundo número a ordem sequencial da pergunta na referida página. Desta forma, caso tenha dúvidas, pode se referir especificamente ao número da pergunta, sem necessitar enviar print da tela ou transcrever a pergunta integralmente.",
  "Fique atento aos campos do formulário destacados em amarelo. Eles estão destacados porque merecem atenção especial, seja por risco de descuido, por serem considerados irrelevantes pelo solicitante ou por serem omitidos de propósito.",
  "Informe sempre o CEP correto. Caso não o possua, realize a consulta no site oficial dos Correios.",
  "Para formulários referentes a membros de uma mesma família que viajarão juntos, é obrigatório o preenchimento individual de cada formulário, ainda que haja repetição de informações.",
  "O formulário poderá ser preenchido em versão digital, por PDF editável ou formulário web, ou em versão impressa, conforme preferência do solicitante.",
  "É imprescindível salvar o formulário após o preenchimento. Para mais de um solicitante, deverá ser utilizado um formulário distinto para cada pessoa.",
  "Caso determinado campo não se aplique: na versão física, trace um risco diagonal no campo; na versão digital, preencha com “Não se aplica” ou “N/A”.",
  "O solicitante declara ciência de que o serviço prestado é de assessoria, obrigação de meio, sem garantia de aprovação, que depende exclusivamente das autoridades consulares dos Estados Unidos.",
  "O solicitante deverá arcar com a taxa consular vigente, aproximadamente USD 185, e comparecer à entrevista em um dos postos consulares: São Paulo, Rio de Janeiro, Recife, Brasília ou Porto Alegre.",
  "Para Porto Alegre e Recife, é necessário providenciar a foto previamente, enviando versão digital e levando versão impressa na entrevista.",
  "A escolha da cidade de entrevista é de responsabilidade do solicitante. Alterações posteriores implicarão custos adicionais.",
  "Nos casos de renovação de visto sem entrevista, será necessário envio da foto, passaporte atual e passaporte anterior com visto.",
  "Mesmo sem entrevista, a embaixada poderá convocar o solicitante.",
  "O processo pode iniciar sem passaporte, mas será concluído apenas após envio do documento.",
  "O serviço refere-se ao visto tipo B, turismo/negócios. Outros tipos devem ser contratados separadamente.",
  "É obrigatório informar parentes de primeiro grau nos EUA.",
  "A RESUMINDO VIAGENS não se responsabiliza por informações incorretas fornecidas pelo solicitante.",
  "Omissões podem resultar na negativa imediata do visto.",
  "O solicitante declara ser responsável pela veracidade das informações."
];

function cleanCPF(value) { return (value || "").replace(/\D/g, ""); }
function formatCPF(value) {
  const digits = cleanCPF(value).slice(0, 11);
  return digits.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function formatDateBR(value) {
  const digits = (value || "").replace(/\D/g, "").slice(0, 8);
  return digits.replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2");
}
function brDateToISO(value) {
  const digits = (value || "").replace(/\D/g, "");
  if (digits.length !== 8) return "";
  return `${digits.slice(4,8)}-${digits.slice(2,4)}-${digits.slice(0,2)}`;
}
function cleanSectionTitle(title) { return title.replace(/^\d+\.\s*/, ""); }
function numberedTitle(index, title) { return `${index + 1}. ${cleanSectionTitle(title)}`; }

function isAnswerFilled(value) {
  if (value === true) return true;
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined) return false;
  return String(value).trim() !== "";
}

function calculateProgress(answers) {
  const total = sections.reduce((sum, section) => sum + section.fields.length, 0);
  const filled = sections.reduce((sum, section) => {
    return sum + section.fields.filter((field) => isAnswerFilled(answers[field.id])).length;
  }, 0);
  const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
  return { total, filled, percent };
}

export default function ClientAccessPage() {
  const params = useParams();
  const token = params?.token;
  const [client, setClient] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submittedAt, setSubmittedAt] = useState(null);
  const [current, setCurrent] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(true);
  const [cpf, setCpf] = useState("");
  const [birthDateBR, setBirthDateBR] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => { if (token) load(); }, [token]);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/client/${token}`, { method:"GET", cache:"no-store" });
    const data = await res.json();
    if (res.status === 401 && data.needs_verification) { setNeedsVerification(true); setLoading(false); return; }
    if (!res.ok) { alert(data.error || "Link inválido."); setLoading(false); return; }
    setNeedsVerification(false); setClient(data.client); setAnswers(data.response?.answers || {}); setSubmittedAt(data.response?.submitted_at || null); setLoading(false);
  }

  async function verifyIdentity() {
    setVerificationError("");
    const cleanedCPF = cleanCPF(cpf);
    const isoDate = brDateToISO(birthDateBR);
    if (cleanedCPF.length !== 11) return setVerificationError("Informe um CPF com 11 números.");
    if (!isoDate) return setVerificationError("Informe a data de nascimento no formato DD/MM/AAAA.");
    setVerifying(true);
    try {
      const res = await fetch(`/api/client/${token}/verify`, { method:"POST", headers:{"Content-Type":"application/json"}, cache:"no-store", body:JSON.stringify({ cpf: cleanedCPF, birth_date: isoDate }) });
      const data = await res.json();
      if (!res.ok) return setVerificationError(data.error || "Não foi possível confirmar seus dados.");
      setNeedsVerification(false); setClient(null); setAnswers({}); await load();
    } catch (error) {
      setVerificationError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally { setVerifying(false); }
  }

  async function save(nextAnswers = answers, showAlert = false) {
    if (client?.is_locked || submittedAt) { setSaveStatus("Formulário já enviado e bloqueado."); return false; }
    setSaveStatus("Salvando...");
    const res = await fetch(`/api/client/${token}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ answers: nextAnswers }) });
    const data = await res.json();
    if (res.status === 401 && data.needs_verification) { setNeedsVerification(true); setSaveStatus(""); return false; }
    if (!res.ok) { setSaveStatus("Erro ao salvar. Tente novamente."); if (showAlert) alert(data.error || "Erro ao salvar."); return false; }
    setSaveStatus("Salvo automaticamente"); if (showAlert) alert("Informações salvas com sucesso."); return true;
  }

  function setValue(fieldId, value) { const nextAnswers = { ...answers, [fieldId]: value }; setAnswers(nextAnswers); save(nextAnswers, false); }

  async function submitForm() {
    if (!confirm("Confirmar envio? Depois disso o formulário ficará bloqueado.")) return;
    const saved = await save(answers, false); if (!saved) return;
    const res = await fetch(`/api/client/${token}/submit`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ answers }) });
    const data = await res.json();
    if (res.status === 401 && data.needs_verification) { setNeedsVerification(true); return; }
    if (!res.ok) return alert(data.error || "Erro ao enviar.");
    setClient((previous) => previous ? { ...previous, is_locked: true, status: "submitted" } : previous);
    setSubmittedAt(new Date().toISOString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) return <main style={{ padding: 30 }}>Carregando...</main>;

  if (needsVerification) {
    return (
      <main className="verify-page">
        <div className="verify-card card">
          <BrandHeader compact />
          <div className="verify-badge">Acesso seguro</div>
          <h2 className="verify-title">Confirme seus dados para continuar</h2>
          <p className="verify-text">Este link é exclusivo do solicitante. Para proteger suas informações, confirme o CPF e a data de nascimento vinculados a este atendimento.</p>
          <div className="verify-grid">
            <div className="field"><label>CPF</label><input value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" autoComplete="off" /></div>
            <div className="field"><label>Data de nascimento</label><input type="text" value={birthDateBR} onChange={(e) => setBirthDateBR(formatDateBR(e.target.value))} placeholder="DD/MM/AAAA" inputMode="numeric" autoComplete="off" maxLength={10} /></div>
          </div>
          {verificationError && <div className="error-alert" style={{ marginBottom: 14 }}>{verificationError}</div>}
          <button className="btn-primary" onClick={verifyIdentity} disabled={verifying} style={{ width:"100%" }}>{verifying ? "Verificando..." : "Confirmar acesso"}</button>
          <p className="verify-footnote">Se os dados não conferirem, solicite um novo link à Resumindo Viagens.</p>
        </div>
      </main>
    );
  }

  if (!client) return <main style={{ padding: 30 }}>Link inválido.</main>;
  if (client?.is_locked || submittedAt) return <PDFView client={client} answers={answers} />;

  const section = current >= 0 ? sections[current] : null;
  const progress = calculateProgress(answers);
  return (
    <main style={{ maxWidth: 1200, margin:"0 auto", padding:24 }}>
      <div className="card" style={{ padding:22, marginBottom:22 }}><BrandHeader clientName={client?.name} /></div>
      <div className="no-print" style={{ display:"flex", justifyContent:"space-between", gap:16, alignItems:"center", marginBottom:20 }}>
        <div><small>{saveStatus}</small></div>
        <div style={{ display:"flex", gap:10 }}><button className="btn-light" onClick={() => save(answers, true)}>Salvar e continuar depois</button><button className="btn-primary" onClick={submitForm}>Enviar definitivamente (encerra preenchimento)</button></div>
      </div>

      <div className="progress-card no-print" aria-label={`Progresso do preenchimento: ${progress.percent}%`}>
        <div className="progress-info">
          <div>
            <strong>Progresso do formulário</strong>
            <span>{progress.filled} de {progress.total} perguntas preenchidas</span>
          </div>
          <div className="progress-percent">{progress.percent}%</div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
        </div>
      </div>

      <div className="form-layout" style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:24 }}>
        <aside className="card no-print" style={{ padding:14 }}>
          <button onClick={() => setCurrent(-1)} className={(current === -1 ? "btn-primary" : "btn-light") + " section-nav-button"}>Informações prévias</button>
          {sections.map((item, index) => <button key={item.title} onClick={() => setCurrent(index)} className={(index === current ? "btn-primary" : "btn-light") + " section-nav-button"}>{numberedTitle(index, item.title)}</button>)}
        </aside>
        <section className="card" style={{ padding:28 }}>
          {current === -1 ? <PreInfoPage client={client} onContinue={() => setCurrent(0)} /> : <>
            <h1 style={{ color:"var(--navy)" }}>{numberedTitle(current, section.title)}</h1>
            <div className="grid">{section.fields.map((field, fieldIndex) => <Field key={field.id} field={field} questionNumber={`${current + 1}.${fieldIndex + 1}`} value={answers[field.id]} onChange={setValue} />)}</div>
            <div className="no-print" style={{ display:"flex", justifyContent:"space-between", marginTop:22 }}><button className="btn-light" onClick={() => setCurrent(current - 1)}>Voltar</button>{current < sections.length - 1 && <button className="btn-dark" onClick={() => setCurrent(current + 1)}>Próxima</button>}</div>
          </>}
        </section>
      </div>
    </main>
  );
}

function PreInfoPage({ client, onContinue }) {
  return <div>
    <h1 style={{ color:"var(--navy)", marginBottom:8 }}>Informações prévias</h1>
    <p style={{ color:"var(--muted)", lineHeight:1.6 }}>Olá, <strong>{client?.name}</strong>. Antes de iniciar o preenchimento do formulário, veja o vídeo e leia atentamente as orientações abaixo.</p>
    <div style={{ background:"#fff9ec", border:"1px solid #fed7aa", borderRadius:16, padding:18, margin:"18px 0", color:"#7c2d12", lineHeight:1.55 }}>
      As perguntas estão numeradas para facilitar o atendimento. Em caso de dúvida, informe o número da pergunta, por exemplo: 2.4 ou 5.7.
    </div>

    <div className="intro-video-box no-print">
      <video className="intro-video" controls playsInline preload="metadata">
        <source src="https://i.imgur.com/wCw6196.mp4" type="video/mp4" />
        Seu navegador não suporta a reprodução deste vídeo.
      </video>
    </div>

    <div style={{ display:"grid", gap:12 }}>
      {PRE_INFO_ITEMS.map((item, index) => <div key={index} style={{ border:"1px solid var(--border)", borderRadius:14, padding:14, lineHeight:1.55 }}><strong style={{ color:"var(--navy)" }}>{index + 1}.</strong> {item}</div>)}
    </div>
    <div className="no-print" style={{ marginTop:22, display:"flex", justifyContent:"flex-end" }}><button className="btn-primary" onClick={onContinue}>Continuar para 1. Início e Dados do Solicitante</button></div>
  </div>;
}

function HelpIcon({ text }) {
  const message = text || "Balão explicativo editável futuramente.";
  return <span className="help" data-tip={message} title={message} tabIndex="0" aria-label={message} onClick={(event) => event.currentTarget.focus()}>?</span>;
}

function Field({ field, questionNumber, value, onChange }) {
  const baseClassName = field.full ? "field full" : (field.wide || field.type === "textarea" || field.type === "checkbox" ? "field wide" : "field");
  const className = HIGHLIGHTED_QUESTIONS.has(questionNumber) ? `${baseClassName} highlighted-question` : baseClassName;
  const label = <><span style={{ color:"var(--orange)", fontWeight:900 }}>{questionNumber}</span> {field.label}<HelpIcon text={field.help} /></>;
  if (field.type === "select") return <div className={className}><label>{label}</label><select value={value || ""} onChange={(e) => onChange(field.id, e.target.value)}><option value="">Selecione</option>{field.options.map((o) => <option key={o}>{o}</option>)}</select></div>;
  if (field.type === "radio") return <div className={className}><label>{label}</label><div className="radio">{field.options.map((o) => <label key={o}><input type="radio" checked={value === o} onChange={() => onChange(field.id, o)} /> {o}</label>)}</div></div>;
  if (field.type === "textarea") return <div className={className}><label>{label}</label><textarea rows={field.rows || undefined} style={field.rows ? { minHeight: field.rows * 24 } : undefined} value={value || ""} onChange={(e) => onChange(field.id, e.target.value)} /></div>;
  if (field.type === "checkbox") return <div className={className}><label><input style={{ width:"auto" }} type="checkbox" checked={!!value} onChange={(e) => onChange(field.id, e.target.checked)} /><span style={{ color:"var(--orange)", fontWeight:900 }}>{questionNumber}</span> {field.label}<HelpIcon text={field.help} /></label></div>;
  return <div className={className}><label>{label}</label><input type={field.type} value={value || ""} onChange={(e) => onChange(field.id, e.target.value)} /></div>;
}

function PDFView({ client, answers }) {
  return (
    <main style={{ maxWidth:980, margin:"30px auto", padding:24 }}>
      <div className="no-print" style={{ marginBottom:18 }}><button className="btn-primary" onClick={() => window.print()}>Baixar PDF das minhas respostas</button></div>
      <div className="card" style={{ padding:34 }}>
        <BrandHeader clientName={client?.name} />
        <h2 style={{ color:"var(--navy)", marginTop:28 }}>Respostas do formulário</h2>
        {sections.map((section, sectionIndex) => <section key={section.title} style={{ breakInside:"avoid", marginTop:28 }}><h3 style={{ background:"var(--navy)", color:"#fff", padding:12, borderRadius:10 }}>{numberedTitle(sectionIndex, section.title)}</h3><div className="grid">{section.fields.filter((field) => answers[field.id]).map((field, fieldIndex) => <div key={field.id} className={field.wide || field.full ? "wide" : ""} style={{ border:"1px solid #E4E8F0", borderRadius:12, padding:12 }}><b style={{ color:"var(--navy)" }}><span style={{ color:"var(--orange)" }}>{sectionIndex + 1}.{fieldIndex + 1}</span> {field.label}</b><br/><span>{String(answers[field.id])}</span></div>)}</div></section>)}
        <div className="print-footer">Resumindo Viagens • contato@resumindoviagens.com.br • Instagram: @resumindoviagens</div>
      </div>
    </main>
  );
}
