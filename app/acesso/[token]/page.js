"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BrandHeader from "../../../components/BrandHeader";
import { sections } from "../../../lib/formSchema";

const HIGHLIGHTED_QUESTIONS = new Set([
  "1.6", "1.9",
  "2.12", "2.13", "2.14", "2.15", "2.16", "2.17", "2.18.a", "2.18.b", "2.18.c", "2.18.d", "2.18.e", "2.18.f",
  "3.12", "3.13", "3.14", "3.15", "3.16", "3.17", "3.18",
  "3.20", "3.21", "3.22",
  "6.3", "6.7", "6.9", "6.10", "6.11",
  "7.6",
  "8.8", "8.9", "8.10", "8.11",
  "9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10",
  "9.11", "9.12", "9.13", "9.14", "9.15", "9.16", "9.17", "9.18", "9.19", "9.20", "9.21"
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

const PAGE2_COMPANION_FIELDS = [
  "companheiroA_nome", "companheiroA_relacao",
  "companheiroB_nome", "companheiroB_relacao",
  "companheiroC_nome", "companheiroC_relacao",
  "companheiroD_nome", "companheiroD_relacao",
  "companheiroE_nome", "companheiroE_relacao"
];

const PAGADOR_FIELDS = [
  "pagadorSobrenome", "pagadorNome", "pagadorTelefone", "pagadorEmail", "pagadorRelacao",
  "pagadorEndereco1", "pagadorEndereco2", "pagadorCidade", "pagadorUF", "pagadorCep", "pagadorPais"
];

const USA_TRAVEL_FIELDS = [
  "viagemEUA1Data", "viagemEUA1Dias", "viagemEUA2Data", "viagemEUA2Dias",
  "viagemEUA3Data", "viagemEUA3Dias", "viagemEUA4Data", "viagemEUA4Dias",
  "viagemEUA5Data", "viagemEUA5Dias", "carteiraMotoristaEUA", "dadosCarteira"
];

const USA_VISA_FIELDS = [
  "dataUltimoVisto", "numeroVisto", "mesmoTipoVisto", "digitais", "vistoIssuingPost"
];

const SOCIAL_FIELDS = [
  "redeSocial1","usuarioRedeSocial1","redeSocial2","usuarioRedeSocial2","redeSocial3","usuarioRedeSocial3","redeSocial4","usuarioRedeSocial4",
  "redeSocial5","usuarioRedeSocial5","redeSocial6","usuarioRedeSocial6","redeSocial7","usuarioRedeSocial7","redeSocial8","usuarioRedeSocial8"
];

const PAGE7_FORMACAO_FIELDS = ["formacaoNomeInstituicao", "formacaoEndereco1", "formacaoEndereco2", "formacaoCidade", "formacaoUF", "formacaoCep", "formacaoPais", "formacaoNomeCurso", "formacaoDataInicioCurso", "formacaoDataTerminoCurso"];
const PAGE7_OUTROS_CURSOS_FIELDS = ["outrosCursosNomeInstituicao", "outrosCursosEndereco1", "outrosCursosEndereco2", "outrosCursosCidade", "outrosCursosUF", "outrosCursosCep", "outrosCursosPais", "outrosCursosNomeCurso", "outrosCursosDataInicioCurso", "outrosCursosDataTerminoCurso"];
const PAGE7_AFTER_ESTUDO_FIELDS = [...PAGE7_FORMACAO_FIELDS, "outrosCursosConcluidos", ...PAGE7_OUTROS_CURSOS_FIELDS];
const PAGE7_AFTER_OUTROS_CURSOS_FIELDS = [...PAGE7_OUTROS_CURSOS_FIELDS];

const CONJUGE_FIELDS = [
  "conjugeSobrenome", "conjugeNome", "conjugeNascimento", "conjugeNacionalidade",
  "conjugeCidadeNascimento", "conjugeEstadoNascimento", "conjugePaisNascimento", "conjugeEndereco"
];

const EX_CONJUGE_FIELDS = [
  "exConjugeQuantidade", "exConjugeSobrenome", "exConjugeNome", "exConjugeNascimento",
  "exConjugeNacionalidade", "exConjugeCidadeNascimento", "exConjugeEstadoNascimento", "exConjugePaisNascimento",
  "exConjugeDataCasamento", "exConjugeDataTermino", "exConjugeComoTerminou", "exConjugePaisTermino"
];

const FALECIDO_FIELDS = [
  "falecidoSobrenome", "falecidoNome", "falecidoNascimento", "falecidoNacionalidade",
  "falecidoCidade", "falecidoEstado", "falecidoPais"
];

const ADDITIONAL_INFO_DEPENDENCIES = {
  claTribo: ["nomeClaTribo"],
  viagensOutrosPaises: ["paisesVisitados"],
  organizacoes: ["listaOrganizacoes"],
  treinamentoArmas: ["detalheTreinamento"],
  serviuForcas: ["dadosForcas"]
};

const SECURITY_FIELDS = [
  "paramilitar", "doencaContagiosa", "incapacidadeAmeaca", "drogas", "presoCondenado",
  "substancias", "prostituicao", "lavagem", "traficoHumano", "espionagem", "terrorismo",
  "genocidioTortura", "criancasSoldados", "controlePopulacional", "orgaosCoercao", "fraudeVisto",
  "deportado", "criancaAmericana", "votouEUA", "renunciouCidadania"
];

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function hasAnySecurityYes(answers) {
  return SECURITY_FIELDS.some((fieldId) => normalizeText(answers[fieldId]) === "sim");
}

function applyDefaultAnswers(rawAnswers = {}) {
  const migrated = { ...rawAnswers };
  if (!migrated.pagadorEndereco1 && migrated.pagadorEndereco) migrated.pagadorEndereco1 = migrated.pagadorEndereco;
  if (!migrated.empregadorEndereco1 && migrated.enderecoEmpregador) migrated.empregadorEndereco1 = migrated.enderecoEmpregador;
  if (!migrated.formacaoNomeInstituicao && migrated.formacao) migrated.formacaoNomeInstituicao = migrated.formacao;
  if (!migrated.outrosCursosNomeInstituicao && migrated.dadosOutrosCursos) migrated.outrosCursosNomeInstituicao = migrated.dadosOutrosCursos;
  return {
    estudoConcluido: "Não",
    outrosCursosConcluidos: "Não",
    ...migrated
  };
}

function disabledFieldsForAnswers(answers) {
  const disabled = new Set();

  if (normalizeText(answers.alterouNome) === "não") disabled.add("nomeAnterior");

  if (normalizeText(answers.pagador) === "o próprio solicitante" || normalizeText(answers.pagador) === "o proprio solicitante") {
    PAGADOR_FIELDS.forEach((fieldId) => disabled.add(fieldId));
  }

  if (normalizeText(answers.viajaComAlguem) === "não") {
    PAGE2_COMPANION_FIELDS.forEach((fieldId) => disabled.add(fieldId));
  }

  if (normalizeText(answers.jaViajouEUA) === "não") {
    USA_TRAVEL_FIELDS.forEach((fieldId) => disabled.add(fieldId));
  }

  if (normalizeText(answers.vistoEmitido) === "não") {
    USA_VISA_FIELDS.forEach((fieldId) => disabled.add(fieldId));
  }

  if (normalizeText(answers.temRedeSocial) === "não") {
    SOCIAL_FIELDS.forEach((fieldId) => disabled.add(fieldId));
  }

  if (normalizeText(answers.passaportePerdido) === "não") disabled.add("detalhePassaportePerdido");

  if (normalizeText(answers.empregoAnterior) === "não") disabled.add("dadosEmpregoAnterior");

  if (answers.salarioNaoAplica) disabled.add("salario");

  if (normalizeText(answers.estudoConcluido || "Não") === "não") {
    PAGE7_AFTER_ESTUDO_FIELDS.forEach((fieldId) => disabled.add(fieldId));
  } else if (normalizeText(answers.outrosCursosConcluidos || "Não") === "não") {
    PAGE7_AFTER_OUTROS_CURSOS_FIELDS.forEach((fieldId) => disabled.add(fieldId));
  }

  Object.entries(ADDITIONAL_INFO_DEPENDENCIES).forEach(([controller, targets]) => {
    if (normalizeText(answers[controller]) !== "sim") targets.forEach((fieldId) => disabled.add(fieldId));
  });

  if (!hasAnySecurityYes(answers)) disabled.add("obsSeguranca");

  const civil = normalizeText(answers.estadoCivil);
  const isSolteiro = civil.includes("solteiro");
  const isCasadoOuUniao = civil.includes("casado") || civil.includes("união estável") || civil.includes("uniao estavel") || civil.includes("união doméstica") || civil.includes("uniao domestica");
  const isDivorciado = civil.includes("divorciado");
  const isViuvo = civil.includes("viúvo") || civil.includes("viuvo");

  if (isSolteiro) {
    [...CONJUGE_FIELDS, ...EX_CONJUGE_FIELDS, ...FALECIDO_FIELDS].forEach((fieldId) => disabled.add(fieldId));
  } else if (isCasadoOuUniao) {
    [...EX_CONJUGE_FIELDS, ...FALECIDO_FIELDS].forEach((fieldId) => disabled.add(fieldId));
  } else if (isDivorciado) {
    [...CONJUGE_FIELDS, ...FALECIDO_FIELDS].forEach((fieldId) => disabled.add(fieldId));
  } else if (isViuvo) {
    [...CONJUGE_FIELDS, ...EX_CONJUGE_FIELDS].forEach((fieldId) => disabled.add(fieldId));
  }

  return disabled;
}

function isFieldAutoResolved(fieldId, answers) {
  return disabledFieldsForAnswers(answers).has(fieldId);
}

function isFieldDisabled(fieldId, answers) {
  return disabledFieldsForAnswers(answers).has(fieldId);
}

function cleanDisabledAnswers(nextAnswers) {
  const disabled = disabledFieldsForAnswers(nextAnswers);
  disabled.forEach((fieldId) => {
    if (nextAnswers[fieldId]) {
      if (fieldId === "estudoConcluido" || fieldId === "outrosCursosConcluidos") return;
      nextAnswers[fieldId] = "";
    }
  });
  return nextAnswers;
}

function questionNumberForField(fields, fieldIndex, sectionNumber) {
  const field = fields[fieldIndex];
  if (field?.questionNumber) return field.questionNumber;
  const count = fields.slice(0, fieldIndex + 1).reduce((total, item) => {
    if (item.type === "subtitle") return total;
    return total + (typeof item.numberingWeight === "number" ? item.numberingWeight : 1);
  }, 0);
  return `${sectionNumber}.${count}`;
}

const MONTHS_PT = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];

function formatAnswerForDisplay(value) {
  if (!isAnswerFilled(value)) return "NÃO RESPONDIDO";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value)) return value.join(", ");
  const raw = String(value);
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
  if (iso) {
    const month = MONTHS_PT[Number(iso[2]) - 1] || iso[2];
    return `${iso[3]}/${month}/${iso[1]}`;
  }
  const isoMonth = raw.match(/^(\d{4})-(\d{2})$/);
  if (isoMonth) {
    const month = MONTHS_PT[Number(isoMonth[2]) - 1] || isoMonth[2];
    return `${month}/${isoMonth[1]}`;
  }
  return raw;
}

function calculateProgress(answers) {
  const total = sections.reduce((sum, section) => sum + section.fields.filter((field) => field.type !== "subtitle").length, 0);
  const filled = sections.reduce((sum, section) => {
    return sum + section.fields.filter((field) => field.type !== "subtitle" && (isAnswerFilled(answers[field.id]) || isFieldAutoResolved(field.id, answers))).length;
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
  const [helpOverrides, setHelpOverrides] = useState({});
  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState("");
  const [pendingExtraction, setPendingExtraction] = useState(null);

  useEffect(() => { if (token) load(); loadHelpTexts(); }, [token]);

  async function loadHelpTexts() {
    try {
      const res = await fetch("/api/help-texts", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setHelpOverrides(data.helpTexts || {});
    } catch {}
  }

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/client/${token}`, { method:"GET", cache:"no-store" });
    const data = await res.json();
    if (res.status === 401 && data.needs_verification) { setNeedsVerification(true); setLoading(false); return; }
    if (!res.ok) { alert(data.error || "Link inválido."); setLoading(false); return; }
    setNeedsVerification(false); setClient(data.client); setAnswers(applyDefaultAnswers(data.response?.answers || {})); await loadHelpTexts(); setSubmittedAt(data.response?.submitted_at || null); await loadDocuments(); setLoading(false);
  }

  async function loadDocuments() {
    try {
      const res = await fetch(`/api/client/${token}/documents`, { method:"GET", cache:"no-store" });
      const data = await res.json();
      if (res.ok) setDocuments(data.documents || []);
    } catch {}
  }

  async function uploadDocument(documentType, file) {
    if (!file) return;
    setUploadingDoc(documentType);
    try {
      const form = new FormData();
      form.append("document_type", documentType);
      form.append("file", file);
      const res = await fetch(`/api/client/${token}/documents`, { method:"POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao anexar documento.");
        return;
      }
      setDocuments((previous) => [data.document, ...previous.filter((item) => item.id !== data.document.id)]);
      if (data.extracted_data && Object.values(data.extracted_data).some(Boolean)) {
        setPendingExtraction({ documentType, data: data.extracted_data, fileName: data.document?.file_name || file.name });
      }
      alert(data.message || "Documento anexado com sucesso.");
    } catch {
      alert("Não foi possível anexar o documento.");
    } finally {
      setUploadingDoc("");
    }
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

  function setValue(fieldId, value) { const nextAnswers = cleanDisabledAnswers({ ...answers, [fieldId]: value }); setAnswers(nextAnswers); save(nextAnswers, false); }

  function canGoNextFromCurrent() {
    if (current === 8) {
      const missing = SECURITY_FIELDS.filter((fieldId) => !isAnswerFilled(answers[fieldId]));
      if (missing.length > 0) {
        alert("Antes de avançar para a página 10, responda todas as perguntas de segurança da página 9 com Sim ou Não.");
        return false;
      }
    }
    return true;
  }

  function applyExtractedData(extracted = {}) {
    const allowed = [
      "tipoPassaporte", "numeroPassaporte", "paisEmissor", "cidadeEmissao", "estadoEmissao", "dataEmissao", "dataVencimento",
      "vistoEmitido", "dataUltimoVisto", "numeroVisto", "vistoIssuingPost"
    ];

    const next = { ...answers };
    for (const key of allowed) {
      if (extracted[key]) next[key] = extracted[key];
    }
    setAnswers(next);
    save(next, false);
    setPendingExtraction(null);
    alert("Dados aplicados ao formulário. Revise as informações antes do envio definitivo.");
  }

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
          <div className="pwa-install-hint no-print">
            <strong>Dica para celular:</strong> após confirmar seus dados, você pode salvar este formulário na tela inicial como se fosse um app. Em formulários de família, salve cada ícone com o primeiro nome.
          </div>
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
    <main className="client-form-premium" style={{ maxWidth: 1200, margin:"0 auto", padding:"24px 24px 110px" }}>
      <div className="card premium-header-card" style={{ padding:22, marginBottom:22 }}><BrandHeader clientName={client?.name} /></div>
      <div className="no-print" style={{ display:"flex", justifyContent:"space-between", gap:16, alignItems:"center", marginBottom:20 }}>
        <div><small>{saveStatus}</small></div>
        <div className="top-action-buttons" style={{ display:"flex", gap:10, flexWrap:"wrap" }}><button className="btn-light" onClick={() => save(answers, true)}>Salvar e continuar depois</button><button className="btn-primary" onClick={submitForm}>Enviar definitivamente (encerra preenchimento)</button></div>
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
          <button disabled aria-disabled="true" title="Funcionalidade em implementação" className="btn-light section-nav-button" style={{ opacity:.55, cursor:"not-allowed" }}>Upload de documentos (implementação)</button>
          {sections.map((item, index) => <button key={item.title} onClick={() => setCurrent(index)} className={(index === current ? "btn-primary" : "btn-light") + " section-nav-button"}>{numberedTitle(index, item.title)}</button>)}
        </aside>
        <section className="card" style={{ padding:28 }}>
          {current === -1 ? <PreInfoPage client={client} onContinue={() => setCurrent(0)} /> : current === -2 ? <DocumentUploadPage documents={documents} uploadingDoc={uploadingDoc} pendingExtraction={pendingExtraction} onApplyExtraction={applyExtractedData} onDismissExtraction={() => setPendingExtraction(null)} onUpload={uploadDocument} onContinue={() => setCurrent(0)} onBack={() => setCurrent(-1)} /> : <>
            <h1 style={{ color:"var(--navy)" }}>{numberedTitle(current, section.title)}</h1>
            <div className="grid">{section.fields.map((field, fieldIndex) => <Field key={field.id} field={{ ...field, help: helpOverrides[field.id] || field.help }} questionNumber={questionNumberForField(section.fields, fieldIndex, current + 1)} value={answers[field.id]} onChange={setValue} disabled={isFieldDisabled(field.id, answers)} answers={answers} />)}</div>
            <div className="no-print mobile-bottom-nav" style={{ display:"flex", justifyContent:"space-between", gap:12, marginTop:22, position:"sticky", bottom:0, zIndex:20, background:"rgba(255,255,255,.96)", padding:"12px 0", borderTop:"1px solid #e5e7eb" }}>
              <button className="btn-light" onClick={() => setCurrent(current === 0 ? -1 : current - 1)}>Voltar</button>
              {current < sections.length - 1 ? (
                <button className="btn-dark" onClick={() => { if (canGoNextFromCurrent()) setCurrent(current + 1); }}>Próxima</button>
              ) : (
                <button className="btn-primary" onClick={submitForm}>Enviar definitivamente</button>
              )}
            </div>
          </>}
        </section>
      </div>
    </main>
  );
}

function DocumentUploadPage({ documents, uploadingDoc, pendingExtraction, onApplyExtraction, onDismissExtraction, onUpload, onContinue, onBack }) {
  const passportDocs = documents.filter((doc) => doc.document_type === "passport");
  const visaDocs = documents.filter((doc) => doc.document_type === "previous_visa");

  function DocBox({ type, title, description, docs }) {
    const accept = "image/*,.pdf";
    return (
      <div style={{ border:"1px solid var(--border)", borderRadius:18, padding:18, background:"#fff" }}>
        <h2 style={{ color:"var(--navy)", marginTop:0 }}>{title}</h2>
        <p style={{ color:"var(--muted)", lineHeight:1.55 }}>{description}</p>
        <input
          type="file"
          accept={accept}
          capture="environment"
          disabled={!!uploadingDoc}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(type, file);
            event.target.value = "";
          }}
        />
        <div style={{ marginTop:10, fontSize:13, color:"var(--muted)" }}>
          Aceita foto, imagem ou PDF. Este envio é opcional.
        </div>
        {uploadingDoc === type && <p style={{ color:"var(--orange)", fontWeight:800 }}>Enviando documento...</p>}
        {docs.length > 0 && (
          <div style={{ marginTop:14, background:"#f8fafc", border:"1px solid #e5e7eb", borderRadius:12, padding:12 }}>
            <strong>Documento(s) anexado(s):</strong>
            <ul style={{ marginBottom:0 }}>
              {docs.map((doc) => <li key={doc.id}>{doc.file_name} — {doc.extraction_status === "no_ocr" ? "anexado para conferência" : doc.extraction_status}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return <div>
    <h1 style={{ color:"var(--navy)", marginBottom:8 }}>Upload opcional de documentos</h1>
    <p style={{ color:"var(--muted)", lineHeight:1.6 }}>
      Esta etapa é opcional. Se preferir, você pode seguir para as perguntas sem anexar nada. 
      Caso anexe passaporte e/ou visto anterior, a Resumindo Viagens poderá conferir os dados com mais segurança.
    </p>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginTop:18 }}>
      <DocBox
        type="passport"
        title="Passaporte"
        description="Anexe uma foto ou PDF da página de identificação do passaporte."
        docs={passportDocs}
      />
      <DocBox
        type="previous_visa"
        title="Visto anterior"
        description="Se possuir visto anterior, anexe uma foto ou PDF para conferência."
        docs={visaDocs}
      />
    </div>
    <div style={{ marginTop:18, padding:14, borderRadius:14, background:"#fff7ed", border:"1px solid #fed7aa", color:"#9a3412", lineHeight:1.55 }}>
      <strong>Leitura assistida:</strong> quando possível, o sistema tentará extrair dados de imagens do passaporte ou visto e mostrará uma sugestão para conferência antes de aplicar no formulário.
    </div>
    {pendingExtraction && (
      <div style={{ marginTop:18, padding:16, borderRadius:16, background:"#eef2ff", border:"1px solid #c7d2fe" }}>
        <h2 style={{ marginTop:0, color:"var(--navy)" }}>Dados encontrados para conferência</h2>
        <p style={{ color:"var(--muted)" }}>Arquivo: <strong>{pendingExtraction.fileName}</strong></p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:10 }}>
          {Object.entries(pendingExtraction.data).filter(([, value]) => !!value).map(([key, value]) => (
            <div key={key} style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:10 }}>
              <strong>{key}</strong><br />{String(value)}
            </div>
          ))}
        </div>
        <p style={{ color:"#b45309", fontWeight:800 }}>Revise os dados após aplicar. OCR pode confundir letras, números e datas.</p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button className="btn-primary" onClick={() => onApplyExtraction(pendingExtraction.data)}>Aplicar ao formulário</button>
          <button className="btn-light" onClick={onDismissExtraction}>Não aplicar agora</button>
        </div>
      </div>
    )}
    <div className="no-print" style={{ display:"flex", justifyContent:"space-between", gap:12, marginTop:22 }}>
      <button className="btn-light" onClick={onBack}>Voltar</button>
      <button className="btn-primary" onClick={onContinue}>Continuar para as perguntas</button>
    </div>
  </div>;
}

function PreInfoPage({ client, onContinue }) {
  return <div>
    <h1 style={{ color:"var(--navy)", marginBottom:8 }}>Informações prévias</h1>
    <p style={{ color:"var(--muted)", lineHeight:1.6 }}>Olá, <strong>{client?.name}</strong>. Antes de iniciar o preenchimento do formulário, veja o vídeo e leia atentamente as orientações abaixo.</p>
    <div className="pwa-install-hint no-print">
      <strong>Dica para celular:</strong> toque em compartilhar e escolha “Adicionar à Tela de Início” para salvar este formulário como um app. Se estiver preenchendo formulários de familiares, use nomes como <strong>Resumindo - João</strong>.
    </div>
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

function Field({ field, questionNumber, value, onChange, disabled = false, answers = {} }) {
  if (field.type === "subtitle") return <div className="field full" style={{ gridColumn:"1 / -1", marginTop: 12, padding:"12px 14px", borderRadius:12, background:"#eef2ff", color:"var(--navy)", fontWeight:900, fontSize:18 }}>{field.label}</div>;
  const baseClassName = field.full ? "field full" : (field.wide || field.type === "textarea" || field.type === "checkbox" ? "field wide" : "field");
  const highlightedClassName = HIGHLIGHTED_QUESTIONS.has(questionNumber) ? `${baseClassName} highlighted-question` : baseClassName;
  const className = disabled ? `${highlightedClassName} disabled-question` : highlightedClassName;
  const disabledStyle = disabled ? { background: "#f1f5f9", borderColor: "#cbd5e1", color: "#64748b", cursor: "not-allowed" } : {};
  const disabledHint = disabled ? <div style={{ marginTop: 6, fontSize: 12, color: "#64748b", fontStyle: "italic" }}>Campo desabilitado automaticamente conforme resposta anterior.</div> : null;
  const label = <><span style={{ color:"var(--orange)", fontWeight:900 }}>{questionNumber}</span> {field.label}<HelpIcon text={field.help} /></>;
  if (field.type === "select") return <div className={className}><label>{label}</label><select style={disabledStyle} disabled={disabled} value={value || ""} onChange={(e) => onChange(field.id, e.target.value)}><option value="">Selecione</option>{field.options.map((o) => <option key={o}>{o}</option>)}</select>{disabledHint}</div>;
  if (field.type === "radio") return <div className={className} style={disabled ? { background:"#f8fafc", borderRadius:12, padding:10 } : {}}><label>{label}</label><div className="radio">{field.options.map((o) => <label key={o} style={disabled ? { color:"#94a3b8", cursor:"not-allowed" } : {}}><input type="radio" disabled={disabled} checked={value === o} onChange={() => onChange(field.id, o)} /> {o}</label>)}</div>{disabledHint}</div>;
  if (field.type === "textarea") return <div className={className}><label>{label}</label><textarea rows={field.rows || undefined} style={{ ...disabledStyle, ...(field.rows ? { minHeight: field.rows * 24 } : {}) }} disabled={disabled} value={value || ""} onChange={(e) => onChange(field.id, e.target.value)} />{disabledHint}</div>;
  if (field.type === "checkbox") return <div className={className} style={disabled ? { background:"#f8fafc", borderRadius:12, padding:10 } : {}}><label style={disabled ? { color:"#94a3b8", cursor:"not-allowed" } : {}}><input disabled={disabled} style={{ width:"auto" }} type="checkbox" checked={!!value} onChange={(e) => onChange(field.id, e.target.checked)} /><span style={{ color:"var(--orange)", fontWeight:900 }}>{questionNumber}</span> {field.label}<HelpIcon text={field.help} /></label>{disabledHint}</div>;
  if (field.id === "salario") return <div className={className}><label>{label}</label><label style={{ display:"inline-flex", alignItems:"center", gap:8, margin:"0 0 8px", color:"#475569", fontWeight:700 }}><input type="checkbox" style={{ width:"auto" }} checked={!!answers.salarioNaoAplica} onChange={(e) => onChange("salarioNaoAplica", e.target.checked)} /> Não se aplica</label><input style={disabledStyle} disabled={disabled} type={field.type} value={value || ""} onChange={(e) => onChange(field.id, e.target.value)} />{disabledHint}</div>;
  return <div className={className}><label>{label}</label><input style={disabledStyle} disabled={disabled} type={field.type} value={value || ""} onChange={(e) => onChange(field.id, e.target.value)} />{disabledHint}</div>;
}

function PDFView({ client, answers }) {
  return (
    <main style={{ maxWidth:980, margin:"30px auto", padding:24 }}>
      <div className="no-print" style={{ marginBottom:18 }}><button className="btn-primary" onClick={() => window.print()}>Baixar PDF das minhas respostas</button></div>
      <div className="card" style={{ padding:34 }}>
        <BrandHeader clientName={client?.name} />
        <h2 style={{ color:"var(--navy)", marginTop:28 }}>Respostas do formulário</h2>
        {sections.map((section, sectionIndex) => <section key={section.title} style={{ breakInside:"avoid", marginTop:28 }}><h3 style={{ background:"var(--navy)", color:"#fff", padding:12, borderRadius:10 }}>{numberedTitle(sectionIndex, section.title)}</h3><div className="grid">{section.fields.map((field, fieldIndex) => <div key={field.id} className={field.wide || field.full ? "wide" : ""} style={{ border:"1px solid #E4E8F0", borderRadius:12, padding:12 }}><b style={{ color:"var(--navy)" }}><span style={{ color:"var(--orange)" }}>{questionNumberForField(section.fields, fieldIndex, sectionIndex + 1)}</span> {field.label}</b><br/><span style={{ color: isAnswerFilled(answers[field.id]) ? "inherit" : "#b91c1c", fontWeight: isAnswerFilled(answers[field.id]) ? 400 : 700 }}>{formatAnswerForDisplay(answers[field.id])}</span></div>)}</div></section>)}
        <div className="print-footer">Resumindo Viagens • contato@resumindoviagens.com.br • Instagram: @resumindoviagens</div>
      </div>
    </main>
  );
}
