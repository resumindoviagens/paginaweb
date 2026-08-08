"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabase, getCurrentAdminSession } from "../../lib/supabaseAdminAuth";
import BrandHeader from "../../components/BrandHeader";
import { EMAIL_TEMPLATES } from "../../lib/emailTemplates";
import FamilyGroupSyncButton from "./components/FamilyGroupSyncButton";

function cleanCPF(value) {
  return (value || "").replace(/\D/g, "");
}

function formatDateBR(value) {
  if (!value) return "";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function formatDateTimeBR(value) {
  if (!value) return "";
  const [datePart, timePartRaw] = String(value).split("T");
  const date = formatDateBR(datePart);
  if (!timePartRaw) return date;
  const [hour, minute] = timePartRaw.split(":");
  if (!hour || !minute) return date;
  return `${date} às ${hour}:${minute}`;
}

function toDatetimeLocal(value) {
  if (!value) return "";
  return String(value).slice(0, 16);
}

function statusLabel(status) {
  const labels = {
    not_started: "Não iniciado",
    in_progress: "Em preenchimento",
    submitted: "Enviado"
  };
  return labels[status] || status;
}

const PROCESS_STEPS = [
  ["status_not_started", "Não iniciado"],
  ["status_in_progress", "Em preenchimento"],
  ["status_submitted", "Preencher DS-160"],
  ["stage_ds160_completed", "PREENCHER DS-160 no consulado"],
  ["stage_fee_generated", "Taxa gerada"],
  ["stage_fee_paid", "Taxa paga"],
  ["stage_dates_scheduled", "Datas agendadas"],
  ["stage_video_call_scheduled", "Videochamada agendada"],
  ["stage_video_call_done", "Videochamada realizada"],
  ["stage_interview_done", "Entrevista realizada"],
  ["visa_result", "Visto aprovado ou negado"],
  ["stage_passport_returned", "Visto/passaporte devolvido"],
  ["stage_feedback_sent", "Pesquisa de satisfação enviada"],
  ["stage_feedback_answered", "Pesquisa de satisfação respondida"],
  ["stage_feedback_posted", "Pesquisa de satisfação postada"],
  ["stage_ready_to_archive", "Pronto para arquivar"]
];

const PASSPORT_PROCESS_STEPS = [
  ["stage_passport_docs_email_sent", "Documentos solicitados"],
  ["stage_passport_form_filled", "Cadastro realizado"],
  ["stage_fee_paid", "Taxa/GRU paga"],
  ["stage_dates_scheduled", "Atendimento PF agendado"],
  ["stage_passport_instructions_sent", "Instruções enviadas"],
  ["stage_passport_pf_done", "Comparecimento à PF"],
  ["stage_passport_ready", "Passaporte disponível"],
  ["stage_passport_picked_up", "Passaporte retirado"],
  ["stage_feedback_sent", "Pesquisa enviada"],
  ["stage_feedback_answered", "Pesquisa respondida"],
  ["stage_feedback_posted", "Pesquisa postada"],
  ["stage_ready_to_archive", "Pronto para arquivar"]
];

function isPassportProcess(client) {
  const value = String(client?.tipo_processo || client?.feedback_service || "").toLowerCase();
  return value.includes("passaporte") || value.includes("passport");
}

function processStepsForClient(client) {
  return isPassportProcess(client) ? PASSPORT_PROCESS_STEPS : PROCESS_STEPS;
}

function stepDone(client, key) {
  if (key === "status_not_started") return true;
  if (key === "status_in_progress") return ["in_progress", "submitted"].includes(client.status) || !!client.stage_ds160_completed || !!client.stage_fee_generated || !!client.stage_fee_paid || !!client.stage_dates_scheduled || !!client.stage_video_call_scheduled || !!client.stage_video_call_done || !!client.stage_interview_done || !!client.visa_result || !!client.stage_passport_returned;
  if (key === "status_submitted") return client.status === "submitted" || !!client.stage_ds160_completed || !!client.stage_fee_generated || !!client.stage_fee_paid || !!client.stage_dates_scheduled || !!client.stage_video_call_scheduled || !!client.stage_video_call_done || !!client.stage_interview_done || !!client.visa_result || !!client.stage_passport_returned;
  if (key === "visa_result") return !!client.visa_result;
  return !!client[key];
}

function processStepCount(client) {
  return processStepsForClient(client).reduce((total, [key]) => total + (stepDone(client, key) ? 1 : 0), 0);
}

function currentStepKey(client) {
  let current = "status_not_started";
  for (const [key] of processStepsForClient(client)) {
    if (stepDone(client, key)) current = key;
  }
  return current;
}

function currentStepLabel(client) {
  const key = currentStepKey(client);
  const item = processStepsForClient(client).find(([stepKey]) => stepKey === key);
  return item?.[1] || "Não iniciado";
}


const CRITICAL_ALERT_QUESTIONS = ["1.6", "3.20", "3.21", "3.22", "6.9", "6.11", "8.8"];

const SECURITY_ALERT_FIELDS = [
  "paramilitar", "doencaContagiosa", "incapacidadeAmeaca", "drogas", "presoCondenado",
  "substancias", "prostituicao", "lavagem", "traficoHumano", "espionagem", "terrorismo",
  "genocidioTortura", "criancasSoldados", "controlePopulacional", "orgaosCoercao", "fraudeVisto",
  "deportado", "criancaAmericana", "votouEUA", "renunciouCidadania"
];

function hasSecurityYesAlert(client) {
  const answers = client?.answers || {};
  return SECURITY_ALERT_FIELDS.some((fieldId) => normalizeAnswer(answers[fieldId]) === "sim");
}

function hasObservationsAlert(client) {
  const answers = client?.answers || {};
  return String(answers.observacoes || "").trim().length > 0;
}

const GROUP_CARD_COLORS = [
  "#fff1b8",
  "#c7f9cc",
  "#cde7ff",
  "#ffd6e7",
  "#e0d4ff",
  "#c6f6f1",
  "#ffd8a8",
  "#d9f99d",
  "#fecaca",
  "#bae6fd",
  "#fde68a",
  "#ddd6fe"
];

function groupColorFor(client) {
  const groupKey = String(
    client.group_process_id ||
    client.family_group ||
    client.process_group?.nome ||
    client.group_process_name ||
    ""
  );
  if (!groupKey) return "";
  let sum = 0;
  for (const ch of groupKey) sum += ch.charCodeAt(0);
  return GROUP_CARD_COLORS[sum % GROUP_CARD_COLORS.length];
}

function groupRowStyle(client) {
  const color = groupColorFor(client);
  return color ? { backgroundColor: color } : {};
}

function shouldDisableRenewalField(clientOrForm, field) {
  const isRenewal = !!clientOrForm?.is_renewal || clientOrForm?.tipo_processo === "Renovação";
  if (!isRenewal) return false;
  return field === "video_call_date" || field === "interview_date" || field === "consulate_city";
}



function canFillVisaExpiration(clientOrForm) {
  return clientOrForm?.visa_result === "approved" && !!clientOrForm?.stage_passport_returned;
}

function normalizeAnswer(value) {
  return String(value || "").trim().toLowerCase();
}

function buildQuestionNumberMap() {
  // Mantém o alerta correto mesmo que o ID interno dos campos seja diferente do número exibido.
  const map = {
    "1.6": "alterouNome",
    "3.20": "vistoCancelado",
    "3.21": "vistoNegado",
    "3.22": "pedidoImigracao",
    "6.9": "parenteEUA",
    "6.11": "familiaresEUA",
    "8.8": "organizacaoBeneficente"
  };
  return map;
}

const QUESTION_ID_BY_NUMBER = buildQuestionNumberMap();
const DISABLED_AUTO_EMAILS = new Set([]);
const CONSULATE_CITIES = ["Brasília", "São Paulo", "Rio de Janeiro", "Porto Alegre", "Recife"];

function correiosUrl(code) {
  const clean = String(code || "").trim();
  if (!clean) return "https://rastreamento.correios.com.br/app/index.php";
  return `https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(clean)}`;
}

function getCriticalAlerts(client) {
  const answers = client?.answers || {};
  return CRITICAL_ALERT_QUESTIONS.filter((number) => {
    const fieldId = QUESTION_ID_BY_NUMBER[number];
    return normalizeAnswer(answers[fieldId]) === "sim" || normalizeAnswer(answers[number]) === "sim";
  });
}

function isFilled(value) {
  if (value === true) return true;
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined) return false;
  return String(value).trim() !== "";
}

function salaryMissingAlert(client) {
  const answers = client?.answers || {};
  const page7Started = ["ocupacao", "empregador", "enderecoEmpregador", "telefoneEmpregador", "dataInicioAtual", "atividades", "empregoAnterior", "dadosEmpregoAnterior", "estudoConcluido", "formacao"]
    .some((fieldId) => isFilled(answers[fieldId]));
  return page7Started && !isFilled(answers.salario);
}

function formatAlertDate(value) {
  if (!value) return new Date().toLocaleDateString("pt-BR");
  try {
    return new Date(value).toLocaleDateString("pt-BR");
  } catch {
    return String(value);
  }
}

function actionLabel(action) {
  const labels = {
    client_created: "Cliente cadastrado",
    client_opened_form: "Abriu o formulário",
    client_verified_identity: "Confirmou CPF e data",
    client_saved_form: "Salvou respostas",
    client_submitted_form: "Enviou o formulário",
    unlock: "Formulário desbloqueado",
    new_token: "Novo link gerado",
    client_updated: "Cliente atualizado",
    email_sent: "Email enviado",
    mark_completed: "Processo concluído",
    reopen: "Processo reaberto",
    update_tracking: "Rastreio atualizado",
    update_process: "Processo atualizado",
    client_sedex_tracking_sent: "Rastreio Sedex informado pelo cliente",
    internal_email_sent: "Alerta interno enviado",
    internal_email_failed: "Falha no alerta interno",
    update_process_steps: "Etapas do processo atualizadas",
    feedback_received: "Pesquisa de satisfação respondida"
  };
  return labels[action] || action;
}

const WHATSAPP_TEMPLATES = [
  {
    id: "triagem",
    label: "01 - Triagem inicial",
    text: `Olá! Tudo bem? 😊

Para te orientar da melhor forma sobre o visto americano, preciso entender rapidamente o seu caso.

Pode me informar, por favor:

1️⃣ O visto é para você ou mais pessoas da família?
2️⃣ Todos já possuem passaporte válido?
3️⃣ Já teve visto americano antes? Se sim, quando venceu?
4️⃣ Já teve algum visto negado?
5️⃣ Em qual cidade pretende fazer o processo?

Com essas informações consigo te orientar corretamente e te passar os valores 👍

Fico no aguardo!`
  },
  {
    id: "proposta",
    label: "02 - Proposta / valores",
    text: `Perfeito, entendi seu caso 👍

Eu realizo toda a assessoria do visto americano, cuidando do preenchimento completo do formulário, organização das informações, orientações e agendamento, instruções para documentação e entrevista e uma videochamada para tratarmos de eventuais dúvidas.

Todo o processo é feito diretamente por mim, com total cuidado e sigilo das suas informações.

💰 Valores por pessoa:
• Assessoria: R$ 400,00
• Taxa consular: USD 185
• Entrega do passaporte em casa (opcional): R$ 66,00

🔹 Serviços adicionais (se necessário):
• Renovação sem entrevista (por família): R$ 300,00, além do valor da assessoria.
• Alteração de cidade após formulário: R$ 150,00
• Tentativa de antecipação de agendamento: R$ 300,00

Caso ainda não possua passaporte válido, também posso te orientar ou cuidar dessa etapa para você, facilitando todo o processo.

Após o pagamento da taxa consular, realizo o agendamento conforme disponibilidade, e te acompanho até o final do processo.

Se quiser, posso dar andamento no seu caso 😊`
  },
  {
    id: "fechamento",
    label: "03 - Fechamento / confirmação",
    text: `Perfeito 😊

Posso dar andamento no seu processo sim.

O próximo passo é iniciarmos oficialmente a assessoria, para que eu possa cuidar de todo o seu processo com segurança e organização.

Assim que confirmarmos, eu te envio o acesso ao formulário completo, onde você poderá preencher com calma todas as informações necessárias.

A partir daí, sigo com o preenchimento, revisão e agendamento para você.

Me confirma se podemos prosseguir?`
  },
  {
    id: "pagamento_assessoria",
    label: "04 - Pagamento da assessoria",
    text: `Perfeito 😊

Para iniciarmos oficialmente a assessoria, o próximo passo é o pagamento do valor do serviço.

💰 Valor da assessoria: R$ 400,00 por pessoa.

Após a confirmação do pagamento, eu envio o link exclusivo do formulário para preenchimento, onde você poderá informar os dados necessários com calma e segurança.

Essas informações serão analisadas, organizadas e inseridas por mim no formulário oficial do consulado.

Depois que o formulário estiver completo e revisado, eu gero a taxa consular, que atualmente é de USD 185 por pessoa, paga diretamente por boleto ou QR Code.

Assim que realizar o pagamento da assessoria, pode me enviar o comprovante por aqui para que eu libere o próximo passo.`
  },
  {
    id: "coleta_dados",
    label: "05 - Comprovante recebido / coleta de dados",
    text: `Perfeito, recebi o comprovante 😊

Já vou dar andamento no seu processo.

Em breve vou te enviar o acesso ao formulário completo para preenchimento.

Para adiantar essa etapa, me envie por favor:

📄 Foto do passaporte válido (página de identificação)
📄 Foto do RG ou CNH

E também preciso dos seguintes dados de cada solicitante maior de idade:

• Nome completo
• CPF
• Data de nascimento
• Email
• Telefone

Essas informações são necessárias para gerar o acesso individual de cada solicitante ao formulário.

Caso uma única pessoa vá preencher para todos, não tem problema — eu envio os links separados para cada integrante da família, identificando corretamente cada um.

Assim que me enviar tudo, já deixo preparado para te encaminhar os acessos 👍`
  },
  {
    id: "taxa_consular",
    label: "06 - Taxa consular / forma de pagamento",
    text: `Perfeito 😊

Seu formulário já foi finalizado e podemos seguir para a próxima etapa.

Agora é necessário realizar o pagamento da taxa consular para que eu consiga acessar as datas disponíveis e realizar o agendamento.

Como você prefere fazer esse pagamento:

• Boleto bancário
ou
• Pix (QR Code)?

Me informa a opção que você prefere que eu já te envio na sequência 👍`
  },
  {
    id: "taxa_boleto",
    label: "06A - Resposta: boleto",
    text: `Perfeito, já vou gerar o boleto e te envio na sequência.

Assim que realizar o pagamento, me envie o comprovante por aqui para que eu acompanhe a liberação e já possamos seguir com o agendamento.`
  },
  {
    id: "taxa_pix",
    label: "06B - Resposta: Pix / QR Code",
    text: `Perfeito, vou gerar o QR Code e te envio agora.

⚠️ Lembrando que ele tem validade curta, então o ideal é realizar o pagamento logo após o envio.

Assim que realizar o pagamento, me envie o comprovante por aqui para que eu acompanhe a liberação e já possamos seguir com o agendamento.`
  },
  {
    id: "entrega_passaporte",
    label: "07 - Oferta entrega do passaporte",
    text: `Perfeito, já vou realizar o agendamento 👍

Antes de concluir, você deseja que o passaporte seja entregue na sua residência após a aprovação?

Essa opção costuma ser mais prática, evitando deslocamento posterior.

Se quiser, já posso incluir essa modalidade para você.`
  },
  {
    id: "entrega_sim",
    label: "07A - Cliente aceitou entrega",
    text: `Perfeito 😊

Vou incluir essa opção no seu processo.

Assim que finalizar o agendamento, te passo as orientações para pagamento dessa taxa junto com os demais documentos.`
  },
  {
    id: "agendar_videochamada",
    label: "08 - Agendar videochamada",
    text: `Perfeito 😊

Como sua entrevista está se aproximando, vamos fazer uma videochamada rápida para alinharmos os pontos finais e tirar eventuais dúvidas.

Qual desses horários funciona melhor para você?

[INSERIR 2 OU 3 OPÇÕES DE HORÁRIO]

Se nenhum desses horários for bom, pode me sugerir outro 👍`
  },
  {
    id: "confirmar_videochamada",
    label: "08A - Confirmar videochamada",
    text: `Perfeito, então fechamos para [DIA] às [HORÁRIO] 👍

Se possível, entre já com o vídeo assistido e com os documentos separados para aproveitarmos melhor o tempo da chamada.`
  },
  {
    id: "pos_videochamada",
    label: "09 - Pós-videochamada",
    text: `Perfeito 😊

Foi um prazer falar com você.

Fica tranquilo(a), seu caso está bem alinhado e você está preparado(a) para a entrevista.

Agora é seguir o combinado e manter a calma no dia.

Qualquer dúvida até lá, me chama por aqui 👍

Estarei torcendo por você!`
  },
  {
    id: "boa_sorte",
    label: "10 - Boa sorte amanhã",
    text: `Boa sorte amanhã 😊

Vai com calma, responda com objetividade e siga exatamente o que alinhamos.

Depois me conta como foi 👍`
  }
];

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const supabase = createBrowserSupabase();

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        const session = await getCurrentAdminSession();

        if (!active) return;

        if (!session) {
          window.location.replace("/admin/login");
          return;
        }

        const bridge = await fetch("/api/admin/supabase-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: session.access_token })
        });

        if (!bridge.ok) {
          window.location.replace("/admin/login");
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error("Falha na autenticação do admin:", error);
        window.location.replace("/admin/login");
      } finally {
        if (active) setChecking(false);
      }
    }

    checkAuth();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user?.email) {
        window.location.replace("/admin/login");
        return;
      }

      setAuthorized(true);
      setChecking(false);
    });

    return () => {
      active = false;
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/admin/login");
  }

  if (checking) {
    return (
      <main style={{ padding: 30, fontFamily: "Arial, Helvetica, sans-serif" }}>
        Verificando acesso...
      </main>
    );
  }

  if (!authorized) {
    return (
      <main style={{ padding: 30, fontFamily: "Arial, Helvetica, sans-serif" }}>
        Redirecionando para o login...
      </main>
    );
  }

  return <Dashboard logout={logout} />;
}

function Dashboard({ logout }) {
  const supabase = createBrowserSupabase();
  const [clients, setClients] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logClient, setLogClient] = useState(null);
  const [logLoading, setLogLoading] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeMenu, setActiveMenu] = useState(null);
  const [groups, setGroups] = useState([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [processTab, setProcessTab] = useState("andamento");
  const [sortBy, setSortBy] = useState("created_desc");
  const [emailComposer, setEmailComposer] = useState(null);
  const [emailComposerLoading, setEmailComposerLoading] = useState(false);
  const [operationClient, setOperationClient] = useState(null);
  const [operationGroupForm, setOperationGroupForm] = useState({});
  const [operationMembers, setOperationMembers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    birth_date: "",
    phone: "",
    email: "",
    secondary_email: "",
    notes: "",
    group_process_id: "",
    no_form_required: false,
    is_renewal: false,
    tipo_processo: "Primeiro visto",
    passport_expiration_date: "",
    observacoes_gerais: "",
    also_create_passport: false
  });

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://visto-seguro.vercel.app";

  function friendlyRequestError(value, fallback = "O sistema encontrou uma indisponibilidade temporária. Tente novamente em alguns segundos.") {
    const text = String(value || "").trim();
    if (!text) return fallback;
    if (/<(!doctype|html|head|body|title|meta|div|span|h1)/i.test(text) || /SSL handshake failed|Error code 525|cloudflare/i.test(text)) {
      return "O Supabase apresentou uma indisponibilidade temporária de conexão (erro 525). Os dados permaneceram no formulário. Aguarde alguns segundos e tente salvar novamente.";
    }
    return text.length > 500 ? fallback : text;
  }

  async function requestJsonWithRetry(url, options = {}, attempts = 2) {
    let lastError = null;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await fetch(url, options);
        const raw = await response.text();
        let data = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          data = { error: friendlyRequestError(raw) };
        }
        if (response.ok) return { response, data };
        const transient = response.status >= 500 || /525|handshake|temporária|supabase/i.test(String(data?.error || raw));
        lastError = new Error(friendlyRequestError(data?.error || raw));
        if (!transient || attempt === attempts) return { response, data: { ...data, error: lastError.message } };
      } catch (error) {
        lastError = error;
        if (attempt === attempts) throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
    }
    throw lastError || new Error("Erro temporário de comunicação.");
  }

  async function loadClients() {
    const res = await fetch("/api/admin/clients");
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao carregar clientes.");
      return;
    }
    setClients(data.clients || []);
  }


  async function loadDismissedAlerts() {
    try {
      const res = await fetch("/api/admin/alerts/dismiss", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setDismissedAlerts(new Set(data.dismissed || []));
    } catch {}
  }

  async function dismissAlert(alertKey) {
    const res = await fetch("/api/admin/alerts/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alert_key: alertKey })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao baixar alerta.");
      return;
    }
    setDismissedAlerts((current) => new Set([...current, alertKey]));
  }

  async function clearCurrentAlerts() {
    const currentAlerts = buildGlobalAlerts();
    if (currentAlerts.length === 0) return;
    if (!confirm(`Dar baixa em ${currentAlerts.length} alerta(s) atualmente exibidos?`)) return;
    for (const item of currentAlerts) {
      if (item.key) await dismissAlert(item.key);
    }
  }

  async function openEmailComposer(client, forcedTemplateId = null) {
    const initialTemplate = forcedTemplateId
      ? EMAIL_TEMPLATES.find((template) => template.id === forcedTemplateId)
      : firstAvailableEmailTemplate(client);
    if (!initialTemplate) {
      alert("Não há modelos de email disponíveis para esta etapa/cadastro.");
      return;
    }
    if (isTemplateDisabledForClient(client, initialTemplate)) {
      alert(templateDisabledReason(client, initialTemplate) || "Modelo indisponível para esta etapa.");
      return;
    }

    setEmailComposerLoading(true);
    try {
      const templateId = initialTemplate.id;
      const res = await fetch(`/api/admin/email-compose/${client.id}?template=${templateId}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao abrir editor de email.");
        setEmailComposerLoading(false);
        return;
      }
      setEmailComposer({
        client,
        templateId,
        templates: (data.templates || []).filter((template) => !isTemplateDisabledForClient(client, template)),
        toEmail: data.toEmail || client.email || "",
        ccEmail: data.ccEmail || client.secondary_email || "",
        toName: data.toName || client.name || "",
        subject: data.subject || "",
        html: data.html || "",
        originalHtml: data.html || "",
        text: data.text || "",
        plainText: data.plainText || data.text || ""
      });
    } catch (err) {
      alert(err.message || "Erro ao abrir editor de email.");
    } finally {
      setEmailComposerLoading(false);
    }
  }

  async function changeEmailComposerTemplate(templateId) {
    if (!emailComposer?.client?.id) return;
    const selectedTemplate = EMAIL_TEMPLATES.find((template) => template.id === templateId);
    if (selectedTemplate && isTemplateDisabledForClient(emailComposer.client, selectedTemplate)) {
      alert(templateDisabledReason(emailComposer.client, selectedTemplate) || "Modelo indisponível para esta etapa.");
      return;
    }
    setEmailComposerLoading(true);
    try {
      const res = await fetch(`/api/admin/email-compose/${emailComposer.client.id}?template=${templateId}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao carregar modelo.");
        return;
      }
      setEmailComposer((current) => ({
        ...current,
        templateId,
        toEmail: data.toEmail || current.toEmail,
        ccEmail: data.ccEmail || current.client?.secondary_email || current.ccEmail || "",
        toName: data.toName || current.toName,
        subject: data.subject || "",
        html: data.html || "",
        originalHtml: data.html || "",
        text: data.text || "",
        plainText: data.plainText || data.text || ""
      }));
    } finally {
      setEmailComposerLoading(false);
    }
  }


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

    if (!originalHtml) return safeParagraphs;

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
      return {
        ...current,
        html: applyPlainTextToEmailLayout(current.originalHtml || current.html, current.plainText || "")
      };
    });
  }

  async function handleTempEmailAttachments(files) {
    const selected = Array.from(files || []).slice(0, 5);
    const attachments = await Promise.all(selected.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, content: String(reader.result || "").split(",").pop() });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    })));
    setEmailComposer((current) => current ? { ...current, tempAttachments: attachments } : current);
  }

  async function sendEmailComposer() {
    if (!emailComposer?.client?.id) return;
    if (!emailComposer.toEmail) {
      alert("Informe o email de destino.");
      return;
    }
    if (!emailComposer.subject) {
      alert("Informe o assunto.");
      return;
    }
    setEmailComposerLoading(true);
    try {
      const res = await fetch("/api/admin/email-compose/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: emailComposer.client.id,
          template_id: emailComposer.templateId,
          to_email: emailComposer.toEmail,
          cc_email: emailComposer.ccEmail || "",
          to_name: emailComposer.toName,
          subject: emailComposer.subject,
          html: emailComposer.html,
          text: emailComposer.plainText || emailComposer.text,
          temp_attachments: emailComposer.tempAttachments || []
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao enviar email.");
        return;
      }
      alert("Email enviado com sucesso.");
      setEmailComposer(null);
      await loadClients();
    } finally {
      setEmailComposerLoading(false);
    }
  }

  async function openFeedbackWhatsApp(client) {
    if (!client.phone) {
      alert("Cliente sem telefone cadastrado.");
      return;
    }
    const res = await fetch(`/api/admin/feedback-link/${client.id}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao gerar link da pesquisa.");
      return;
    }
    const digits = String(client.phone || "").replace(/\D/g, "");
    const passport = isPassportProcess(client);
    const message = encodeURIComponent(passport
      ? `Olá, ${client.name}. Tudo bem?\n\nA assessoria para emissão do seu passaporte foi concluída e gostaríamos muito de conhecer sua experiência.\n\nA pesquisa é rápida e contém perguntas específicas sobre documentação, taxa, agendamento na Polícia Federal, orientações e acompanhamento:\n${data.feedbackLink}\n\nSua resposta nos ajuda a aprimorar o serviço. Muito obrigado pela confiança!`
      : `Olá, ${client.name}. Tudo bem?\n\nSeu processo com a Resumindo Viagens foi concluído e gostaríamos muito de ouvir sua opinião.\n\nA pesquisa é rápida e leva menos de 1 minuto:\n${data.feedbackLink}\n\nMuito obrigado pela confiança!`);
    window.open(`https://wa.me/${digits}?text=${message}`, "_blank", "noopener,noreferrer");
    await loadClients();
  }

  async function loadGroups() {
    const res = await fetch("/api/admin/process-groups");
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao carregar grupos de processo.");
      return;
    }
    setGroups(data.groups || []);
  }

  async function createProcessGroup() {
    const nome = prompt("Nome do grupo de processo (ex.: Família Silva — entrevista filhos):");
    if (!nome) return;
    const res = await fetch("/api/admin/process-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao criar grupo de processo.");
      return;
    }
    await loadGroups();
    setForm((current) => ({ ...current, group_process_id: data.group?.id || "" }));
  }

  function groupById(id) {
    return groups.find((group) => group.id === id) || null;
  }

  function processInfo(client) {
    const group = client.process_group || groupById(client.group_process_id);
    return {
      group,
      groupName: group?.nome || client.family_group || "",
      consulate_city: group?.consulate_city || client.consulate_city || "",
      casv_date: group?.casv_date || client.casv_date || "",
      interview_date: group?.interview_date || client.interview_date || "",
      casv_datetime: group?.casv_datetime || client.casv_datetime || "",
      interview_datetime: group?.interview_datetime || client.interview_datetime || "",
      video_call_date: group?.video_call_date || client.video_call_date || "",
      passport_tracking_code: group?.passport_tracking_code || client.passport_tracking_code || "",
      data_inicio_processo: group?.data_inicio_processo || client.data_inicio_processo || "",
      passport_pf_city: client.passport_pf_city || "",
      passport_pf_location: client.passport_pf_location || "",
      passport_pf_datetime: client.passport_pf_datetime || "",
      passport_gru_paid_at: client.passport_gru_paid_at || "",
      passport_protocol: client.passport_protocol || "",
      ds160_travel_date: group?.ds160_travel_date || "",
      ds160_trip_duration_days: group?.ds160_trip_duration_days || "",
      ds160_destination_city: group?.ds160_destination_city || "",
      ds160_selected_hotel_name: group?.ds160_selected_hotel_name || "",
      ds160_selected_hotel_address: group?.ds160_selected_hotel_address || "",
      ds160_selected_hotel_phone: group?.ds160_selected_hotel_phone || "",
      ds160_common_notes: group?.ds160_common_notes || "",
      ds160_common_security_answers: group?.ds160_common_security_answers || ""
    };
  }

  function groupMasterName(client) {
    if (!client?.group_process_id) return "";
    const master = clients.find((item) =>
      item.group_process_id === client.group_process_id &&
      item.grupo_familiar_master
    );
    return master?.name || "solicitante principal";
  }

  function groupMasterAlert(client, area = "esta alteração") {
    const masterName = groupMasterName(client);
    return `Este cliente faz parte de um grupo familiar, mas não é o Contato principal. Para ${area}, altere pelo solicitante principal: ${masterName}.`;
  }

  async function syncFamilyGroup(masterClient, silent = true) {
    if (!masterClient?.grupo_familiar_master || !masterClient?.group_process_id) return true;
    try {
      const { response, data } = await requestJsonWithRetry("/api/admin/sync-family-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterId: masterClient.id })
      }, 3);
      if (!response.ok) {
        alert(friendlyRequestError(data.error, "Alteração salva no líder, mas a sincronização do grupo não foi concluída."));
        return false;
      }
      if (!silent) alert(`Grupo sincronizado. ${data.updated || 0} membro(s) atualizado(s).`);
      return true;
    } catch (error) {
      alert(friendlyRequestError(error?.message, "Alteração salva no líder, mas houve falha temporária ao sincronizar o grupo."));
      return false;
    }
  }

  async function updateProcessSchedule(client, fields) {
    const info = processInfo(client);

    if (client.group_process_id && !client.grupo_familiar_master) {
      alert(groupMasterAlert(client, "vincular datas/rastreios a todos"));
      return;
    }

    if (isPassportProcess(client) && client.group_process_id && client.grupo_familiar_master) {
      await updateClientSchedule(client, fields);
      await syncFamilyGroup(client, true);
      await loadClients();
      return;
    }

    if (client.group_process_id && client.grupo_familiar_master) {
      const res = await fetch(`/api/admin/process-groups/${client.group_process_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consulate_city: fields.consulate_city ?? info.consulate_city ?? "",
          casv_date: fields.casv_date ?? info.casv_date ?? "",
          interview_date: fields.interview_date ?? info.interview_date ?? "",
          casv_datetime: fields.casv_datetime ?? info.casv_datetime ?? "",
          interview_datetime: fields.interview_datetime ?? info.interview_datetime ?? "",
          video_call_date: fields.video_call_date ?? info.video_call_date ?? "",
          passport_tracking_code: fields.passport_tracking_code ?? info.passport_tracking_code ?? "",
          data_inicio_processo: fields.data_inicio_processo ?? info.data_inicio_processo ?? "",
          stage_dates_scheduled: ["recife", "porto alegre"].some((city) => String(fields.consulate_city ?? info.consulate_city ?? "").toLowerCase().includes(city))
            ? !!(fields.interview_datetime ?? info.interview_datetime ?? "")
            : !!(fields.casv_datetime ?? info.casv_datetime ?? "") && !!(fields.interview_datetime ?? info.interview_datetime ?? "")
        })
      });
      const data = await res.json();
      if (!res.ok) {
        const fallbackClientSchedule = await fetch(`/api/admin/clients/${client.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_schedule",
            consulate_city: fields.consulate_city ?? info.consulate_city ?? "",
            casv_date: fields.casv_date ?? info.casv_date ?? "",
            interview_date: fields.interview_date ?? info.interview_date ?? "",
            casv_datetime: fields.casv_datetime ?? info.casv_datetime ?? "",
            interview_datetime: fields.interview_datetime ?? info.interview_datetime ?? "",
            video_call_date: fields.video_call_date ?? info.video_call_date ?? "",
            passport_tracking_code: fields.passport_tracking_code ?? info.passport_tracking_code ?? "",
            data_inicio_processo: fields.data_inicio_processo ?? info.data_inicio_processo ?? ""
          })
        });
        const fallbackData = await fallbackClientSchedule.json();
        if (!fallbackClientSchedule.ok) { alert(fallbackData.error || data.error || "Erro ao salvar grupo de processo."); return; }
      }
      await loadGroups();
      await loadClients();
      return;
    }

    await updateClientSchedule(client, fields);
  }

  function operationMembersFor(client) {
    if (!client?.group_process_id) return [client];
    return clients
      .filter((item) => item.group_process_id === client.group_process_id)
      .sort((a, b) => (a.name || "").localeCompare(b.name || "", "pt-BR"));
  }

  function openOperationPanel(client) {
    const info = processInfo(client);
    setOperationClient(client);
    setOperationGroupForm({
      consulate_city: info.consulate_city || "",
      ds160_travel_date: info.ds160_travel_date || "",
      ds160_trip_duration_days: info.ds160_trip_duration_days || "",
      ds160_destination_city: info.ds160_destination_city || "",
      ds160_selected_hotel_name: info.ds160_selected_hotel_name || "",
      ds160_selected_hotel_address: info.ds160_selected_hotel_address || "",
      ds160_selected_hotel_phone: info.ds160_selected_hotel_phone || "",
      ds160_common_notes: info.ds160_common_notes || "",
      ds160_common_security_answers: info.ds160_common_security_answers || ""
    });
    setOperationMembers(operationMembersFor(client).map((item) => ({
      id: item.id,
      name: item.name || "",
      ds160_number: item.ds160_number || "",
      passport_display_name: item.passport_display_name || "",
      passport_surname: item.passport_surname || "",
      ds160_individual_notes: item.ds160_individual_notes || ""
    })));
  }

  async function saveOperationPanel() {
    if (!operationClient) return;

    const groupId = operationClient.group_process_id;
    if (groupId) {
      const res = await fetch(`/api/admin/process-groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...operationGroupForm,
          nome: processInfo(operationClient).groupName || operationClient.family_group || operationClient.name || "Grupo",
          consulate_city: operationGroupForm.consulate_city || processInfo(operationClient).consulate_city || "",
          casv_date: processInfo(operationClient).casv_date || "",
          interview_date: processInfo(operationClient).interview_date || "",
          video_call_date: processInfo(operationClient).video_call_date || "",
          passport_tracking_code: processInfo(operationClient).passport_tracking_code || "",
          data_inicio_processo: processInfo(operationClient).data_inicio_processo || ""
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao salvar dados comuns da ficha rápida.");
        return;
      }
    }

    for (const member of operationMembers) {
      const res = await fetch(`/api/admin/clients/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_operation",
          ds160_number: member.ds160_number || "",
          passport_display_name: member.passport_display_name || "",
          passport_surname: member.passport_surname || "",
          ds160_individual_notes: member.ds160_individual_notes || ""
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || `Erro ao salvar ficha de ${member.name}.`);
        return;
      }
    }

    alert("Ficha rápida DS-160 salva.");
    setOperationClient(null);
    await loadGroups();
    await loadClients();
  }

  function ds160Summary(client) {
    const members = operationMembersFor(client);
    const total = members.length;
    const filled = members.filter((item) => item.ds160_number).length;
    const info = processInfo(client);
    const hotel = info.ds160_selected_hotel_name ? "Hotel definido" : "Hotel pendente";
    return `${filled}/${total} DS-160 • ${hotel}`;
  }

  function preparationLinkFor(client) {
    return `${origin}/preparacao/${client.id}`;
  }

  function buildGlobalAlerts() {
    const alerts = [];
    const addedGroups = new Set();
    clients.forEach((client) => {
      const info = processInfo(client);
      const label = info.group ? info.groupName : client.name;
      const target = info.group ? `Grupo: ${label}` : `Cliente: ${label}`;
      if (info.group && addedGroups.has(info.group.id)) return;
      if (info.group) addedGroups.add(info.group.id);
      const base = { label: target, clientName: client.name, groupName: info.groupName, alertDate: client.updated_at || client.created_at || new Date().toISOString() };
      const interviewDays = daysUntil(info.interview_date);
      const videoDays = daysUntil(info.video_call_date);
      const casvDays = daysUntil(info.casv_date);
      if (interviewDays !== null && interviewDays >= 0 && interviewDays <= 7) alerts.push({ ...base, key: `interview-${info.group?.id || client.id}-${info.interview_date}`, alertDate: info.interview_date, text: `Entrevista em ${interviewDays === 0 ? "hoje" : `${interviewDays} dia(s)`}${info.consulate_city ? ` — ${info.consulate_city}` : ""}` });
      if (casvDays !== null && casvDays >= 0 && casvDays <= 3) alerts.push({ ...base, key: `casv-${info.group?.id || client.id}-${info.casv_date}`, alertDate: info.casv_date, text: `CASV em ${casvDays === 0 ? "hoje" : `${casvDays} dia(s)`}` });
      if (casvDays !== null && casvDays >= 0 && casvDays <= 20 && !info.video_call_date) alerts.push({ ...base, key: `marcar-videochamada-${info.group?.id || client.id}-${info.casv_date}`, alertDate: info.casv_date, text: `MARCAR DATA VIDEOCHAMADA com cliente — CASV em ${casvDays === 0 ? "hoje" : `${casvDays} dia(s)`}` });
      if (videoDays !== null && videoDays >= 0 && videoDays <= 2) alerts.push({ ...base, key: `video-${info.group?.id || client.id}-${info.video_call_date}`, alertDate: info.video_call_date, text: `Videochamada em ${videoDays === 0 ? "hoje" : `${videoDays} dia(s)`}` });
    });
    clients.forEach((client) => {
      const formStarted = client.status === "in_progress";
      const formSubmitted = client.status === "submitted";
      if (formStarted) alerts.push({ key: `form-started-${client.id}`, label: `Cliente: ${client.name}`, alertDate: client.updated_at || client.created_at, text: "Formulário iniciado" });
      if (formSubmitted && !isPassportProcess(client)) alerts.push({ key: `form-submitted-${client.id}`, label: `Cliente: ${client.name}`, alertDate: client.updated_at || client.created_at, text: "Formulário concluído" });
      if (client.is_renewal && !client.client_sedex_tracking) alerts.push({ key: `renewal-sedex-${client.id}`, label: `Cliente: ${client.name}`, alertDate: client.updated_at || client.created_at, text: "Renovação sem rastreio Sedex informado" });
      if (salaryMissingAlert(client)) alerts.push({ key: `salary-missing-${client.id}`, label: `Cliente: ${client.name}`, alertDate: client.updated_at || client.created_at, text: "Deixou informação de salário em branco" });
      const critical = getCriticalAlerts(client);
      if (critical.length > 0) alerts.push({ key: `critical-${client.id}-${critical.join("-")}`, label: `Cliente: ${client.name}`, alertDate: client.updated_at || client.created_at, text: `Respondeu Sim na pergunta ${critical.join(", ")}` });
      if (hasSecurityYesAlert(client)) alerts.push({ key: `security-page9-${client.id}`, label: `Cliente: ${client.name}`, alertDate: client.updated_at || client.created_at, text: "Respondeu Sim em pergunta de segurança da página 9" });
      if (hasObservationsAlert(client)) alerts.push({ key: `observacoes-page10-${client.id}`, label: `Cliente: ${client.name}`, alertDate: client.updated_at || client.created_at, text: "Preencheu observações gerais na página 10" });
    });
    return alerts.filter((item) => !dismissedAlerts.has(item.key));
  }

  async function loadLogs(client) {
    setLogClient(client);
    setLogLoading(true);
    setLogs([]);

    const res = await fetch(`/api/admin/logs?client_id=${client.id}`);
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao carregar log.");
      setLogLoading(false);
      return;
    }

    setLogs(data.logs || []);
    setLogLoading(false);
  }

  useEffect(() => {
    loadClients();
    loadGroups();
    loadDismissedAlerts();
  }, []);

  async function createClient() {
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao cadastrar cliente.");
      return;
    }

    setForm((current) => ({
      name: "",
      cpf: "",
      birth_date: "",
      phone: "",
      email: "",
      secondary_email: "",
      notes: "",
      group_process_id: current.group_process_id || "",
      no_form_required: current.tipo_processo === "Passaporte" ? true : false,
      is_renewal: current.is_renewal,
      tipo_processo: current.tipo_processo || "Primeiro visto",
      data_inicio_processo: "",
      observacoes_gerais: "",
      also_create_passport: !!current.also_create_passport
    }));
    if (data.combined_process_created) {
      const passportMessage = data.passport_existing
        ? "O processo de visto foi cadastrado e o processo de passaporte desta pessoa já existia no grupo correspondente."
        : `Visto + Passaporte cadastrados. O passaporte foi criado no grupo “${data.passport_group?.nome || "Passaporte"}”.`;
      alert(passportMessage);
    } else if (data.existing) {
      alert("Este processo já existia para a pessoa dentro do grupo selecionado. Nenhum processo duplicado foi criado.");
    }
    await loadClients();
    await loadGroups();
  }

  async function actionClient(id, action) {
    const res = await fetch(`/api/admin/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro na ação.");
      return;
    }

    await loadClients();
  }

  function openEditClient(client) {
    setEditingClient(client);
    setEditForm({
      name: client.name || "",
      cpf: client.cpf || "",
      birth_date: client.birth_date || "",
      phone: client.phone || "",
      email: client.email || "",
      secondary_email: client.secondary_email || "",
      notes: client.notes || "",
      group_process_id: client.group_process_id || "",
      no_form_required: !!client.no_form_required,
      is_renewal: !!client.is_renewal,
      client_sedex_tracking: client.client_sedex_tracking || "",
      tipo_processo: client.tipo_processo || (client.is_renewal ? "Renovação" : "Primeiro visto"),
      passport_expiration_date: client.passport_expiration_date || "",
      visa_expiration_date: client.visa_expiration_date || "",
      visa_result: client.visa_result || "",
      stage_passport_returned: !!client.stage_passport_returned,
      observacoes_gerais: client.observacoes_gerais || "",
      passport_pf_city: client.passport_pf_city || "",
      passport_pf_location: client.passport_pf_location || "",
      passport_pf_datetime: client.passport_pf_datetime || "",
      passport_gru_paid_at: client.passport_gru_paid_at || "",
      passport_protocol: client.passport_protocol || "",
      grupo_familiar_master: !!client.grupo_familiar_master,
      sincronizar_com_grupo: client.sincronizar_com_grupo !== false
    });
  }

  async function saveClientDetails() {
    if (!editingClient) return;

    const res = await fetch(`/api/admin/clients/${editingClient.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_details", ...editForm })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao editar cliente.");
      return;
    }

    setEditingClient(null);
    setEditForm({});
    await loadClients();
  }

  async function sendEmail(client, templateId) {
    if (DISABLED_AUTO_EMAILS.has(templateId)) {
      alert("Este modelo está marcado como não disponível para envio automático. Use o Gmail manualmente com os anexos necessários.");
      return;
    }

    if (!client.email) {
      alert("Este cliente não possui e-mail cadastrado.");
      return;
    }

    if (templateId === "rastreio" && !processInfo(client).passport_tracking_code) {
      alert("Informe o código de rastreio em Processo, datas e rastreios antes de enviar o Email 09.");
      return;
    }

    const template = EMAIL_TEMPLATES.find((item) => item.id === templateId);
    const recipients = client.secondary_email ? `${client.email} (cópia para ${client.secondary_email})` : client.email;
    const ok = confirm(`Enviar o email "${template?.label || templateId}" para ${client.name} (${recipients})?`);
    if (!ok) return;

    const res = await fetch("/api/admin/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: client.id, template_id: templateId })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao enviar email.");
      return;
    }

    alert(data.message || "Email aceito pela Brevo. Confira a entrega nos logs da Brevo, se necessário.");
    await loadClients();
  }

  async function updateClientSchedule(client, fields, options = {}) {
    const payload = {
      action: "update_schedule",
      interview_date: fields.interview_date ?? client.interview_date ?? "",
      casv_date: fields.casv_date ?? client.casv_date ?? "",
      interview_datetime: fields.interview_datetime ?? client.interview_datetime ?? "",
      casv_datetime: fields.casv_datetime ?? client.casv_datetime ?? "",
      video_call_date: fields.video_call_date ?? client.video_call_date ?? "",
      consulate_city: fields.consulate_city ?? client.consulate_city ?? "",
      passport_tracking_code: fields.passport_tracking_code ?? client.passport_tracking_code ?? "",
      data_inicio_processo: fields.data_inicio_processo ?? client.data_inicio_processo ?? "",
      stage_dates_scheduled: !!((fields.casv_datetime ?? client.casv_datetime ?? "") || (fields.interview_datetime ?? client.interview_datetime ?? "")),
      client_sedex_tracking: fields.client_sedex_tracking ?? client.client_sedex_tracking ?? "",
      is_renewal: fields.is_renewal ?? client.is_renewal ?? false,
      passport_pf_city: fields.passport_pf_city ?? client.passport_pf_city ?? "",
      passport_pf_location: fields.passport_pf_location ?? client.passport_pf_location ?? "",
      passport_pf_datetime: fields.passport_pf_datetime ?? client.passport_pf_datetime ?? "",
      passport_gru_paid_at: fields.passport_gru_paid_at ?? client.passport_gru_paid_at ?? "",
      passport_protocol: fields.passport_protocol ?? client.passport_protocol ?? ""
    };

    try {
      const { response, data } = await requestJsonWithRetry(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }, 3);

      if (!response.ok) {
        alert(friendlyRequestError(data.error, "Não foi possível salvar os dados. Os valores permanecem na tela para nova tentativa."));
        return false;
      }

      if (options.syncGroup !== false && client.grupo_familiar_master && client.group_process_id) {
        await syncFamilyGroup({ ...client, ...payload }, true);
      }
      await loadClients();
      return true;
    } catch (error) {
      alert(friendlyRequestError(error?.message, "Falha temporária de conexão. Os valores permanecem na tela; tente salvar novamente."));
      return false;
    }
  }

  function daysUntil(dateValue) {
    if (!dateValue) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${dateValue}T00:00:00`);
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }

  function scheduleAlerts(client) {
    const alerts = [];
    const info = processInfo(client);

    if (isPassportProcess(client)) {
      const pfDate = info.passport_pf_datetime ? String(info.passport_pf_datetime).slice(0, 10) : "";
      const pfDays = daysUntil(pfDate);
      if (pfDays !== null && pfDays >= 0 && pfDays <= 2) alerts.push({ level: "danger", text: `Agendamento passaporte em ${pfDays === 0 ? "hoje" : `${pfDays} dia(s)`}${info.passport_pf_city ? ` — ${info.passport_pf_city}` : ""}` });
      else if (pfDays !== null && pfDays > 2 && pfDays <= 7) alerts.push({ level: "warning", text: `Agendamento passaporte em ${pfDays} dias${info.passport_pf_city ? ` — ${info.passport_pf_city}` : ""}` });
      return alerts;
    }

    const interviewDays = daysUntil(info.interview_date);
    const videoDays = daysUntil(info.video_call_date);
    const casvDays = daysUntil(info.casv_date);

    if (interviewDays !== null && interviewDays >= 0 && interviewDays <= 2) alerts.push({ level: "danger", text: `Entrevista em ${interviewDays === 0 ? "hoje" : `${interviewDays} dia(s)`}${info.consulate_city ? ` — ${info.consulate_city}` : ""}` });
    else if (interviewDays !== null && interviewDays > 2 && interviewDays <= 7) alerts.push({ level: "warning", text: `Entrevista em ${interviewDays} dias${info.consulate_city ? ` — ${info.consulate_city}` : ""}` });

    if (casvDays !== null && casvDays >= 0 && casvDays <= 3) alerts.push({ level: "info", text: `CASV em ${casvDays === 0 ? "hoje" : `${casvDays} dia(s)`}` });
    if (videoDays !== null && videoDays >= 0 && videoDays <= 2) alerts.push({ level: "info", text: `Videochamada em ${videoDays === 0 ? "hoje" : `${videoDays} dia(s)`}` });

    return alerts;
  }

  function Thermometer({ client }) {
    const count = processStepCount(client);
    return (
      <div className="process-thermometer" title={`${count}/${processStepsForClient(client).length} etapas concluídas`}>
        <div className="thermo-label">Etapa: {count}/{processStepsForClient(client).length} — {currentStepLabel(client)}</div>
        <div className="thermo-bars">
          {processStepsForClient(client).map(([key], index) => (
            <span key={key} className={index < count ? "filled" : ""}></span>
          ))}
        </div>
      </div>
    );
  }

  function buildStepUpdate(client, clickedKey, clickedValue, visaResultValue) {
    const update = {
      status: client.status || "not_started",
      stage_ds160_completed: !!client.stage_ds160_completed,
      stage_fee_generated: !!client.stage_fee_generated,
      stage_fee_paid: !!client.stage_fee_paid,
      stage_dates_scheduled: !!client.stage_dates_scheduled,
      stage_video_call_scheduled: !!client.stage_video_call_scheduled,
      stage_video_call_done: !!client.stage_video_call_done,
      stage_interview_done: !!client.stage_interview_done,
      visa_result: client.visa_result || "",
      stage_passport_returned: !!client.stage_passport_returned,
      stage_feedback_sent: !!client.stage_feedback_sent,
      stage_feedback_answered: !!client.stage_feedback_answered,
      stage_feedback_posted: !!client.stage_feedback_posted,
      stage_ready_to_archive: !!client.stage_ready_to_archive,
      stage_passport_docs_email_sent: !!client.stage_passport_docs_email_sent,
      stage_passport_form_filled: !!client.stage_passport_form_filled,
      stage_passport_instructions_sent: !!client.stage_passport_instructions_sent,
      stage_passport_pf_done: !!client.stage_passport_pf_done,
      stage_passport_ready: !!client.stage_passport_ready,
      stage_passport_picked_up: !!client.stage_passport_picked_up
    };

    const steps = processStepsForClient(client);
    const index = steps.findIndex(([key]) => key === clickedKey);

    if (clickedValue && index >= 0) {
      for (let i = 0; i <= index; i++) {
        const key = steps[i][0];
        if (key === "status_not_started") update.status = "not_started";
        else if (key === "status_in_progress") update.status = "in_progress";
        else if (key === "status_submitted") update.status = "submitted";
        else if (key === "visa_result") update.visa_result = visaResultValue || update.visa_result || "approved";
        else update[key] = true;
      }
    } else {
      if (clickedKey === "status_not_started") {
        update.status = "not_started";
      } else if (clickedKey === "status_in_progress") {
        update.status = clickedValue ? "in_progress" : "not_started";
      } else if (clickedKey === "status_submitted") {
        update.status = clickedValue ? "submitted" : "in_progress";
      } else if (clickedKey === "visa_result") {
        update.visa_result = visaResultValue || "";
      } else {
        update[clickedKey] = !!clickedValue;
      }
    }

    if (update.stage_ds160_completed || update.stage_fee_generated || update.stage_fee_paid || update.stage_dates_scheduled || update.stage_video_call_scheduled || update.stage_video_call_done || update.stage_interview_done || update.visa_result || update.stage_passport_returned || update.stage_feedback_sent || update.stage_feedback_answered || update.stage_feedback_posted || update.stage_ready_to_archive) {
      update.status = "submitted";
    }

    if (update.stage_ready_to_archive) {
      update.is_completed = true;
    }

    return update;
  }

  async function updateProcessSteps(client, clickedKey, clickedValue, visaResultValue = "") {
    const isIndividualVisaResult = clickedKey === "visa_result";

    if (client.group_process_id && !client.grupo_familiar_master && !isIndividualVisaResult) {
      alert(groupMasterAlert(client, "vincular etapas a todos"));
      return;
    }

    const fields = buildStepUpdate(client, clickedKey, clickedValue, visaResultValue);

    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_process_steps",
        ...fields
      })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao atualizar etapas do processo.");
      return;
    }

    if (client.grupo_familiar_master && client.group_process_id && clickedKey !== "visa_result") {
      await syncFamilyGroup(client, true);
    }

    await loadClients();
  }

  async function backfillAgendaEmails() {
    const ok = confirm("Enviar emails de agenda ICS para todos os clientes com datas futuras que ainda não receberam? Esta ação também envia ICS interno para contato@resumindoviagens.com.br.");
    if (!ok) return;

    const res = await fetch("/api/admin/agenda/backfill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sendClient: true, sendInternal: true })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao enviar agendas.");
      return;
    }
    alert(`Processados: ${data.processed || 0}. Confira os logs/caixa de email.`);
  }


  async function migrateLegacyApproved() {
    const ok = confirm("Migrar TODOS os cadastros antigos para: visto aprovado, passaporte devolvido e processo concluído?");
    if (!ok) return;

    const res = await fetch("/api/admin/legacy/migrate-approved", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao migrar cadastros antigos.");
      return;
    }
    alert(`Cadastros antigos migrados como aprovados/concluídos: ${data.updated || 0}. Eles só sairão da lista antiga após usar o botão de conferência/limpeza.`);
    await loadClients();
  }

  async function clearMigratedLegacy() {
    const previewRes = await fetch("/api/admin/legacy/clear-migrated", { method: "GET" });
    const preview = await previewRes.json();
    if (!previewRes.ok) {
      alert(preview.error || "Erro ao conferir cadastros antigos migrados.");
      return;
    }

    const nomes = (preview.preview || [])
      .map((item) => `• ${item.name || "Sem nome"} (${item.email || "sem email"})`)
      .join("\n");

    const mensagem =
      `Registros seguros para retirar da lista Cadastro Antigo: ${preview.safeToClear || 0}\n\n` +
      `Critério obrigatório:\n` +
      `- Cadastro antigo\n- Visto aprovado\n- Passaporte devolvido\n- Processo concluído\n- Pronto para arquivar\n\n` +
      `Nenhum cliente será apagado. Apenas sairá da lista Cadastro Antigo.\n\n` +
      `Prévia dos primeiros registros:\n${nomes || "Nenhum"}\n\n` +
      `Confirmar limpeza?`;

    const ok = confirm(mensagem);
    if (!ok) return;

    const res = await fetch("/api/admin/legacy/clear-migrated", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "LIMPAR_MIGRADOS" })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || data.error || "Erro ao retirar cadastros antigos migrados da lista.");
      return;
    }
    alert(`Retirados da lista Cadastro Antigo: ${data.updated || 0}. Nenhum cliente foi apagado.`);
    await loadClients();
  }

  async function sendLegacyFeedbackEmails() {
    const ok = confirm("Enviar email de pesquisa de satisfação para cadastros antigos ainda sem pesquisa enviada/respondida?");
    if (!ok) return;

    const res = await fetch("/api/admin/legacy/send-feedback", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao enviar pesquisas.");
      return;
    }
    alert(`Pesquisas processadas. Enviadas: ${data.sent || 0}. Falhas: ${data.failed || 0}. Ignoradas: ${data.skipped || 0}.`);
    await loadClients();
  }


  async function deleteClient(client) {
    const confirmation = prompt(`Para excluir definitivamente o cadastro de ${client.name}, digite EXCLUIR:`);

    if (confirmation !== "EXCLUIR") {
      alert("Exclusão cancelada.");
      return;
    }

    const res = await fetch(`/api/admin/clients/${client.id}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erro ao excluir.");
      return;
    }

    alert("Cadastro excluído.");
    await loadClients();
  }

  function cleanPhoneForWhatsApp(value) {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("55")) return digits;
    return `55${digits}`;
  }

  function openClientWhatsAppConversation(client) {
    const phone = cleanPhoneForWhatsApp(client.phone);
    if (!phone) {
      alert("Este cliente não possui celular cadastrado.");
      return;
    }

    window.open(`https://wa.me/${phone}`, "_blank", "noopener,noreferrer");
  }

  function openClientWhatsApp(client, templateId = "formulario") {
    const phone = cleanPhoneForWhatsApp(client.phone);
    if (!phone) {
      alert("Este cliente não possui celular cadastrado.");
      return;
    }

    const link = clientLink(client);
    const messages = {
      formulario: `Olá, ${client.name}! Tudo bem? Aqui é da Resumindo Viagens. Segue seu link seguro para preenchimento do formulário de visto americano: ${link}`,
      pendente: `Olá, ${client.name}! Passando para lembrar que seu formulário da Resumindo Viagens ainda está pendente. Você pode continuar pelo mesmo link: ${link}`,
      videochamada: `Olá, ${client.name}! Segue o link das orientações para preparação da videochamada: ${origin}/preparacao/${client.id}`
    };

    const text = encodeURIComponent(messages[templateId] || messages.formulario);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank", "noopener,noreferrer");
  }

  const filteredClients = useMemo(() => {
    const query = (search || "").trim().toLowerCase();
    const queryCpf = cleanCPF(search);

    function dateValue(value) {
      if (!value) return 9999999999999;
      const time = new Date(`${value}T00:00:00`).getTime();
      return Number.isFinite(time) ? time : 9999999999999;
    }

    function createdValue(client) {
      const time = new Date(client.created_at || 0).getTime();
      return Number.isFinite(time) ? time : 0;
    }

    return clients
      .filter((client) => {
        const haystack = [
          client.name,
          client.cpf,
          client.email,
          client.phone,
          processInfo(client).groupName,
          processInfo(client).consulate_city,
          processInfo(client).passport_tracking_code,
          client.client_sedex_tracking
        ].filter(Boolean).join(" ").toLowerCase();

        const matchesSearch = !query || haystack.includes(query) || (!!queryCpf && (client.cpf || "").includes(queryCpf));
        const matchesStatus = statusFilter === "all" || currentStepKey(client) === statusFilter;
        const matchesTab =
          processTab === "concluidos"
            ? !!client.is_completed
            : !client.is_completed;
        return matchesSearch && matchesStatus && matchesTab;
      })
      .sort((a, b) => {
        if (sortBy === "name") return (a.name || "").localeCompare(b.name || "", "pt-BR");
        if (sortBy === "created_asc") return createdValue(a) - createdValue(b);
        if (sortBy === "created_desc") return createdValue(b) - createdValue(a);
        if (sortBy === "interview_date") return dateValue(processInfo(a).interview_date) - dateValue(processInfo(b).interview_date) || (a.name || "").localeCompare(b.name || "", "pt-BR");
        if (sortBy === "casv_date") return dateValue(processInfo(a).casv_date) - dateValue(processInfo(b).casv_date) || (a.name || "").localeCompare(b.name || "", "pt-BR");
        if (sortBy === "video_call_date") return dateValue(processInfo(a).video_call_date) - dateValue(processInfo(b).video_call_date) || (a.name || "").localeCompare(b.name || "", "pt-BR");
        if (sortBy === "family_group") {
          const groupA = (processInfo(a).groupName || "zzzz").toLowerCase();
          const groupB = (processInfo(b).groupName || "zzzz").toLowerCase();
          if (groupA !== groupB) return groupA.localeCompare(groupB, "pt-BR");
        }
        return (a.name || "").localeCompare(b.name || "", "pt-BR");
      });
  }, [clients, groups, search, statusFilter, processTab, sortBy]);

  const pendingClients = useMemo(() => clients.filter((client) => !client.is_completed), [clients]);

  function dateOnly(value) {
    if (!value) return "";
    return String(value).slice(0, 10);
  }

  function daysFromToday(dateValue) {
    if (!dateValue) return null;
    const raw = dateOnly(dateValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${raw}T00:00:00`);
    if (!Number.isFinite(target.getTime())) return null;
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }

  function ageInDays(value) {
    if (!value) return null;
    const time = new Date(value).getTime();
    if (!Number.isFinite(time)) return null;
    return Math.max(0, Math.floor((Date.now() - time) / (1000 * 60 * 60 * 24)));
  }

  function actionSeverityStyle(severity) {
    if (severity === "critical") return { background:"#fee2e2", color:"#991b1b", border:"1px solid #fecaca" };
    if (severity === "warning") return { background:"#fef3c7", color:"#92400e", border:"1px solid #fde68a" };
    if (severity === "info") return { background:"#dbeafe", color:"#1e3a8a", border:"1px solid #bfdbfe" };
    return { background:"#dcfce7", color:"#166534", border:"1px solid #bbf7d0" };
  }

  function formatActionDays(days) {
    if (days === null || typeof days === "undefined") return "";
    if (days < 0) return `${Math.abs(days)} dia(s) em atraso`;
    if (days === 0) return "hoje";
    if (days === 1) return "amanhã";
    return `em ${days} dia(s)`;
  }

  function nextActionForClient(client) {
    const info = processInfo(client);
    const passport = isPassportProcess(client);

    if (passport) {
      const pfDays = daysFromToday(info.passport_pf_datetime);
      if (pfDays !== null && pfDays < 0 && !client.stage_passport_ready && !client.stage_passport_picked_up) {
        return { severity:"critical", category:"Passaportes pendentes", text:`Verificar passaporte após atendimento PF (${formatActionDays(pfDays)})`, date: dateOnly(info.passport_pf_datetime), sort: 10 + pfDays };
      }
      if (!info.passport_pf_datetime && !client.stage_dates_scheduled) {
        return { severity:"warning", category:"Agendamento PF", text:"Agendar atendimento da Polícia Federal", date:"", sort: 35 };
      }
      if (pfDays !== null && pfDays >= 0 && pfDays <= 7 && !client.stage_passport_instructions_sent) {
        return { severity:"warning", category:"Próximos 7 dias", text:`Enviar/confirmar instruções da PF (${formatActionDays(pfDays)})`, date: dateOnly(info.passport_pf_datetime), sort: 30 + pfDays };
      }
      if (pfDays !== null && pfDays >= 0 && pfDays <= 7) {
        return { severity:"info", category:"Próximos 7 dias", text:`Atendimento PF ${formatActionDays(pfDays)}`, date: dateOnly(info.passport_pf_datetime), sort: 50 + pfDays };
      }
      if (!client.stage_passport_docs_email_sent) return { severity:"warning", category:"Aguardando ação interna", text:"Solicitar documentos do passaporte", date:"", sort: 60 };
      return { severity:"ok", category:"Sem ação imediata", text:"Acompanhar processo de passaporte", date:"", sort: 90 };
    }

    if (client.status === "not_started") {
      const days = ageInDays(client.created_at);
      return { severity: days >= 3 ? "warning" : "info", category:"Aguardando cliente", text: days >= 3 ? `Cobrar início do formulário (${days} dia(s) sem iniciar)` : "Aguardar início do formulário", date:"", sort: days >= 3 ? 25 : 80 };
    }

    if (client.status === "in_progress") {
      const days = ageInDays(client.updated_at || client.created_at);
      return { severity: days >= 3 ? "warning" : "info", category:"Aguardando cliente", text: days >= 3 ? `Cobrar conclusão do formulário (${days} dia(s) desde atualização)` : "Aguardar conclusão do formulário", date:"", sort: days >= 3 ? 24 : 79 };
    }

    if (client.status === "submitted" && !client.stage_ds160_completed) {
      const missingDs160 = !client.ds160_number;
      return { severity:"warning", category:"Ação interna", text: missingDs160 ? "Preencher DS-160 e salvar número na Ficha Rápida" : "Preencher DS-160 no consulado", date:"", sort: 28 };
    }

    if (!client.stage_fee_paid && client.stage_fee_generated) {
      return { severity:"warning", category:"Aguardando cliente", text:"Cobrar pagamento da taxa consular", date:"", sort: 32 };
    }

    const videoDays = daysFromToday(info.video_call_date);
    if (info.video_call_date && !client.stage_video_call_done && videoDays !== null && videoDays < 0) {
      return { severity:"critical", category:"Videochamadas pendentes", text:`Videochamada pendente (${formatActionDays(videoDays)})`, date: dateOnly(info.video_call_date), sort: 12 + videoDays };
    }
    if (info.video_call_date && !client.stage_video_call_done && videoDays !== null && videoDays <= 7) {
      return { severity:"warning", category:"Videochamadas pendentes", text:`Realizar videochamada ${formatActionDays(videoDays)}`, date: dateOnly(info.video_call_date), sort: 22 + Math.max(videoDays, 0) };
    }

    const interviewDays = daysFromToday(info.interview_date);
    if (info.interview_date && !info.video_call_date && interviewDays !== null && interviewDays <= 20 && interviewDays >= 0) {
      return { severity:"warning", category:"Videochamadas a marcar", text:`Marcar videochamada antes da entrevista (${formatActionDays(interviewDays)})`, date: dateOnly(info.interview_date), sort: 26 + interviewDays };
    }
    if (interviewDays !== null && interviewDays >= 0 && interviewDays <= 7) {
      return { severity:"info", category:"Entrevistas próximas", text:`Entrevista ${formatActionDays(interviewDays)}`, date: dateOnly(info.interview_date), sort: 45 + interviewDays };
    }

    const casvDays = daysFromToday(info.casv_date);
    if (casvDays !== null && casvDays >= 0 && casvDays <= 3) {
      return { severity:"info", category:"Próximos 7 dias", text:`CASV ${formatActionDays(casvDays)}`, date: dateOnly(info.casv_date), sort: 48 + casvDays };
    }

    if (client.stage_passport_returned && !client.stage_feedback_sent) {
      return { severity:"warning", category:"Ação interna", text:"Enviar pesquisa de satisfação", date:"", sort: 36 };
    }

    return { severity:"ok", category:"Sem ação imediata", text:"Acompanhar andamento", date:"", sort: 95 };
  }

  function actionRows() {
    return pendingClients
      .map((client) => ({ client, action: nextActionForClient(client) }))
      .filter((item) => item.action.severity !== "ok")
      .sort((a, b) => a.action.sort - b.action.sort || (a.client.name || "").localeCompare(b.client.name || "", "pt-BR"));
  }

  function actionGroups() {
    const groups = {
      "Passaportes pendentes": [],
      "Videochamadas pendentes": [],
      "Videochamadas a marcar": [],
      "Aguardando cliente": [],
      "Ação interna": [],
      "Próximos 7 dias": [],
      "Entrevistas próximas": [],
      "Agendamento PF": [],
      "Aguardando ação interna": []
    };
    for (const item of actionRows()) {
      const key = groups[item.action.category] ? item.action.category : "Ação interna";
      groups[key].push(item);
    }
    return groups;
  }

  function focusClient(client) {
    setProcessTab("andamento");
    setSearch(client.name || client.cpf || "");
    setStatusFilter("all");
  }

  function OperationalActionCenter() {
    if (processTab !== "andamento") return null;
    const rows = actionRows();
    const grouped = actionGroups();
    const critical = rows.filter((item) => item.action.severity === "critical").length;
    const warning = rows.filter((item) => item.action.severity === "warning").length;
    const info = rows.filter((item) => item.action.severity === "info").length;
    const order = ["Passaportes pendentes", "Videochamadas pendentes", "Videochamadas a marcar", "Aguardando cliente", "Ação interna", "Agendamento PF", "Aguardando ação interna", "Próximos 7 dias", "Entrevistas próximas"];

    return (
      <div className="card" style={{ padding:22, marginBottom:22, border:"2px solid #e5e7eb" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:14, flexWrap:"wrap" }}>
          <div>
            <h2 style={{ margin:"0 0 6px", color:"var(--navy)" }}>Centro de Ações</h2>
            <p style={{ margin:"0 0 12px", color:"var(--muted)" }}>Visão operacional apenas dos processos pendentes. Mostra o que exige ação agora, sem envolver processos concluídos.</p>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <span style={{ ...actionSeverityStyle("critical"), borderRadius:999, padding:"8px 12px", fontWeight:900 }}>🔴 {critical} críticas</span>
            <span style={{ ...actionSeverityStyle("warning"), borderRadius:999, padding:"8px 12px", fontWeight:900 }}>🟡 {warning} atenção</span>
            <span style={{ ...actionSeverityStyle("info"), borderRadius:999, padding:"8px 12px", fontWeight:900 }}>🔵 {info} próximas</span>
          </div>
        </div>

        {rows.length === 0 ? (
          <div style={{ background:"#dcfce7", color:"#166534", border:"1px solid #bbf7d0", borderRadius:14, padding:14, fontWeight:800 }}>
            Nenhuma pendência operacional relevante nos processos em andamento.
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:12 }}>
            {order.filter((category) => grouped[category]?.length).map((category) => (
              <div key={category} style={{ border:"1px solid #e5e7eb", borderRadius:16, background:"#fff", overflow:"hidden" }}>
                <div style={{ background:"#f8fafc", padding:"12px 14px", borderBottom:"1px solid #e5e7eb", fontWeight:900, color:"var(--navy)" }}>
                  {category} ({grouped[category].length})
                </div>
                <div style={{ padding:12, display:"grid", gap:10 }}>
                  {grouped[category].slice(0, 8).map(({ client, action }) => (
                    <div key={`${category}-${client.id}`} style={{ ...actionSeverityStyle(action.severity), borderRadius:12, padding:10 }}>
                      <div style={{ fontWeight:900 }}>{client.name}</div>
                      <div style={{ fontSize:13, marginTop:3 }}>{action.text}</div>
                      {processInfo(client).groupName && <div style={{ fontSize:12, marginTop:3 }}>Grupo: {processInfo(client).groupName}</div>}
                      {action.date && <div style={{ fontSize:12, marginTop:3 }}>Data: {formatDateBR(action.date)}</div>}
                      <button className="btn-light" style={{ marginTop:8, padding:"7px 10px" }} onClick={() => focusClient(client)}>Ver cliente</button>
                    </div>
                  ))}
                  {grouped[category].length > 8 && <small style={{ color:"var(--muted)" }}>+ {grouped[category].length - 8} item(ns) nesta categoria.</small>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function clientLink(client) {
    if (client.no_form_required || !client.access_token) return "";
    return `${origin}/acesso/${client.access_token}`;
  }

  function isControlClient(client) {
    return !!client.no_form_required || client.tipo_processo === "Passaporte" || !client.access_token;
  }

  function templateNumber(template) {
    const match = String(template?.label || "").match(/^(\d+)/);
    return match ? Number(match[1]) : null;
  }

  function isInitialFormTemplate(template) {
    return ["formulario", "formulario_pendente", "formulario_recebido"].includes(template?.id);
  }

  function isFeedbackTemplate(template) {
    return ["pesquisa_satisfacao", "passaporte_pesquisa", "canada_pesquisa"].includes(template?.id);
  }

  function isPassportTemplate(template) {
    return String(template?.id || "").startsWith("passaporte_");
  }

  function isPhotoInstructionsTemplate(template) {
    return template?.id === "foto_instrucoes";
  }

  function isCanadaTemplate(template) {
    return String(template?.id || "").startsWith("canada_");
  }

  function isPassportReturnedTemplate(template) {
    return template?.id === "passaporte_recebido" || template?.id === "rastreio";
  }

  function isTemplateDisabledForClient(client, template) {
    const passport = isPassportProcess(client);
    const passportTemplate = isPassportTemplate(template);
    const canadaTemplate = isCanadaTemplate(template);

    if (passport && !passportTemplate && !isPhotoInstructionsTemplate(template)) return true;
    if (!passport && passportTemplate) return true;
    if (canadaTemplate && !String(client.tipo_processo || "").toLowerCase().includes("canad")) return true;
    if (isControlClient(client) && isInitialFormTemplate(template)) return true;

    // Pesquisa de satisfação somente depois de processo encerrado/passaporte devolvido.
    if (isFeedbackTemplate(template) && !(passport ? (client.stage_passport_picked_up || client.stage_passport_ready || client.is_completed || client.stage_ready_to_archive) : (client.stage_passport_returned || client.is_completed || client.stage_ready_to_archive))) return true;

    // Emails de encerramento/rastreio somente quando fizer sentido operacional.
    if (isPassportReturnedTemplate(template) && !(client.stage_passport_returned || client.passport_tracking_code || client.is_completed)) return true;

    return false;
  }

  function templateDisabledReason(client, template) {
    const passport = isPassportProcess(client);
    const passportTemplate = isPassportTemplate(template);
    const canadaTemplate = isCanadaTemplate(template);

    if (passport && !passportTemplate && !isPhotoInstructionsTemplate(template)) return "clientes de passaporte exibem apenas modelos de passaporte e instruções de foto";
    if (!passport && passportTemplate) return "disponível apenas para serviço de passaporte";
    if (canadaTemplate && !String(client.tipo_processo || "").toLowerCase().includes("canad")) return "disponível apenas para visto canadense";
    if (isControlClient(client) && isInitialFormTemplate(template)) return "indisponível para cadastro de controle";
    if (isFeedbackTemplate(template) && !(passport ? (client.stage_passport_picked_up || client.stage_passport_ready || client.is_completed || client.stage_ready_to_archive) : (client.stage_passport_returned || client.is_completed || client.stage_ready_to_archive))) return passport ? "disponível apenas após passaporte disponível/retirado" : "disponível apenas após passaporte devolvido/processo concluído";
    if (isPassportReturnedTemplate(template) && !(client.stage_passport_returned || client.passport_tracking_code || client.is_completed)) return "disponível apenas após rastreio/passaporte devolvido";
    return "";
  }

  function availableEmailTemplates(client) {
    return EMAIL_TEMPLATES.filter((template) => !isTemplateDisabledForClient(client, template));
  }

  function firstAvailableEmailTemplate(client) {
    return availableEmailTemplates(client)[0] || null;
  }

  async function copyText(text, message = "Copiado.") {
    await navigator.clipboard.writeText(text);
    alert(message);
  }

  async function ensureFeedbackLinkForClient(client) {
    const res = await fetch(`/api/admin/feedback-link/${client.id}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Não foi possível gerar o link da pesquisa.");
      return "";
    }
    await loadClients();
    return data.feedbackLink || "";
  }

  async function openFeedbackSurveyWhatsApp(client) {
    if (!client.stage_passport_returned) {
      alert("Disponível somente após marcar Visto/passaporte devolvido.");
      return;
    }

    const link = await ensureFeedbackLinkForClient(client);
    if (!link) return;

    const digits = cleanPhoneForWhatsApp(client.phone);
    if (!digits) {
      alert("Cliente sem celular cadastrado.");
      return;
    }

    const message = encodeURIComponent(`Olá, ${client.name}. Tudo bem?\n\nSeu processo com a Resumindo Viagens foi concluído e gostaríamos muito de ouvir sua opinião.\n\nA pesquisa é rápida e leva menos de 1 minuto:\n${link}\n\nSua resposta nos ajuda a aprimorar nosso atendimento. Muito obrigado pela confiança!`);
    window.open(`https://wa.me/${digits}?text=${message}`, "_blank");
  }

  function feedbackSurveyWhatsAppMessage(client, link = "") {
    return `Olá, ${client.name}. Tudo bem?

Seu processo com a Resumindo Viagens foi concluído e gostaríamos muito de ouvir sua opinião.

A pesquisa é rápida e leva menos de 1 minuto:
${link || "[link da pesquisa]"}

Sua resposta nos ajuda a aprimorar nosso atendimento. Muito obrigado pela confiança!`;
  }

  function feedbackSurveyWhatsAppUrl(client) {
    const digits = cleanPhoneForWhatsApp(client.phone);
    const message = encodeURIComponent(feedbackSurveyWhatsAppMessage(client));
    return digits ? `https://wa.me/${digits}?text=${message}` : "";
  }


  function whatsappMessage(client) {
    return `Olá, ${client.name}! Seu formulário da Resumindo Viagens já está pronto para preenchimento.\n\nAcesse seu link único e exclusivo:\n${clientLink(client)}\n\nPor segurança, o acesso será validado com CPF e data de nascimento.\n\nSe outros membros da família também estiverem preenchendo formulário, cada pessoa deverá acessar o próprio link individual.`;
  }


  function automaticProcessStatus(client) {
    if (client.stage_passport_returned) return "Concluído";
    if (client.visa_result === "approved") return "Visto aprovado";
    if (client.visa_result === "denied") return "Visto negado";
    if (client.stage_interview_done) return "Aguardando resultado";
    if (client.stage_dates_scheduled) return "Agendado";
    if (client.stage_fee_paid) return "Aguardando agendamento";
    if (client.stage_fee_generated) return "Taxa gerada";
    if (client.stage_ds160_completed || client.status === "submitted") return "PREENCHER DS-160 no consulado";
    if (client.status === "in_progress") return "Formulário em preenchimento";
    return "Iniciado";
  }

  function currentStepLabel(client) {
    if (client.stage_passport_returned) return "Visto/passaporte devolvido";
    if (client.visa_result) return client.visa_result === "approved" ? "Visto aprovado" : "Visto negado";
    if (client.stage_interview_done) return "Entrevista realizada";
    if (client.stage_dates_scheduled) return "Datas agendadas";
    if (client.stage_fee_paid) return "Taxa paga";
    if (client.stage_fee_generated) return "Taxa gerada";
    if (client.stage_ds160_completed || client.status === "submitted") return "PREENCHER DS-160 no consulado";
    if (client.status === "in_progress") return "Formulário iniciado";
    return "Cadastro iniciado";
  }

  function processDurationDays(client) {
    const start = client.data_inicio_processo || client.created_at?.slice(0, 10);
    if (!start) return "";
    const end = client.data_final_processo || new Date().toISOString().slice(0, 10);
    const startTime = new Date(`${start}T00:00:00`).getTime();
    const endTime = new Date(`${end}T00:00:00`).getTime();
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return "";
    return Math.max(0, Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)));
  }

  function reportRows() {
    return filteredClients.map((client) => {
      const info = processInfo(client);
      return {
        nome: client.name || "",
        cpf: client.cpf || "",
        grupo: info.groupName || "",
        tipo: client.tipo_processo || (client.is_renewal ? "Renovação" : "Primeiro visto"),
        status: automaticProcessStatus(client),
        etapa: currentStepLabel(client),
        inicio: formatDateBR(client.data_inicio_processo || client.created_at?.slice(0, 10)) || "",
        casv: isPassportProcess(client) ? (info.passport_pf_city || "") : (formatDateBR(info.casv_date) || ""),
        entrevista: isPassportProcess(client) ? (formatDateTimeBR(info.passport_pf_datetime) || "") : (formatDateBR(info.interview_date) || ""),
        video: isPassportProcess(client) ? "" : (formatDateBR(info.video_call_date) || ""),
        consulado: isPassportProcess(client) ? (info.passport_pf_location || "") : (info.consulate_city || ""),
        rastreio: info.passport_tracking_code || "",
        dias: processDurationDays(client),
        progresso: `${processStepCount(client)}/7`,
        resultado: client.visa_result === "approved" ? "Aprovado" : client.visa_result === "denied" ? "Negado" : "",
        observacoes: client.observacoes_gerais || client.notes || ""
      };
    });
  }

  function reportKpis() {
    const rows = reportRows();
    return {
      total: rows.length,
      andamento: rows.filter((row) => !["Concluído", "Visto aprovado", "Visto negado"].includes(row.status)).length,
      concluidos: rows.filter((row) => row.status === "Concluído" || row.status === "Visto aprovado" || row.status === "Visto negado").length,
      aprovados: rows.filter((row) => row.resultado === "Aprovado").length,
      negados: rows.filter((row) => row.resultado === "Negado").length
    };
  }

  function csvEscape(value) {
    const text = String(value ?? "");
    return `"${text.replaceAll('"', '""')}"`;
  }

  function exportReportCsv() {
    const headers = [
      "NOME", "CPF", "GRUPO DE PROCESSO", "TIPO", "STATUS ATUAL", "ETAPA ATUAL", "DATA INÍCIO", "DATA CASV / CIDADE PF", "DATA ENTREVISTA / AGENDAMENTO PASSAPORTE", "DATA VIDEOCHAMADA", "CONSULADO / LOCAL PF", "RASTREIO PASSAPORTE", "DIAS DE PROCESSO", "PROGRESSO", "RESULTADO", "OBSERVAÇÕES",
      "COM ENTREVISTA?", "PGTO SERVIÇO", "ENVIO DE DOCS", "PASSAPORTE VÁLIDO EMITIDO", "DATA VALIDADE PASSAPORTE", "DS160 PREENCHIDO", "TAXA PAGA", "ENTREVISTA / ENTREGA PASSAPORTES AGENDADA", "ENTREGA / VISITA CASV AGENDADO", "CHAMADA DE VÍDEO", "ENTREVISTA REALIZADA", "APROVADO", "MODO RETIRADA OU CORREIOS", "SERVIÇO RETIRADA PAGO?", "ENVIO / RETIRADA PASSAPORTES", "ENTREGA DEFINITIVA", "VALIDADE VISTO", "VISTO CANADENSE OFERECIDO", "VISTO CANADENSE CONTRATADO E PAGO", "VISTO CANADENSE EMITIDO", "VALIDADE VISTO CANADENSE"
    ];
    const rows = filteredClients.map((client) => {
      const info = processInfo(client);
      const base = reportRows().find((row) => row.cpf === (client.cpf || "") && row.nome === (client.name || "")) || {};
      return [
        base.nome, base.cpf, base.grupo, base.tipo, base.status, base.etapa, base.inicio, base.casv, base.entrevista, base.video, base.consulado, base.rastreio, base.dias, base.progresso, base.resultado, base.observacoes,
        client.is_renewal ? "NÃO" : "SIM", "", "", "", "", (client.stage_ds160_completed || client.status === "submitted") ? "X" : "", client.stage_fee_paid ? "X" : "", info.interview_date ? "X" : "", info.casv_date ? "X" : "", info.video_call_date ? "X" : "", client.stage_interview_done ? "X" : "", client.visa_result === "approved" ? "X" : client.visa_result === "denied" ? "NEGADO" : "", "", "", info.passport_tracking_code ? "X" : "", client.stage_passport_returned ? "X" : "", "", "", "", "", ""
      ];
    });
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-resumindo-viagens-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="admin-premium-page" style={{ maxWidth: 1280, margin: "0 auto", padding: 24 }}>
      <div className="card premium-header-card" style={{ padding: 22, marginBottom: 22 }}>
        <BrandHeader />
        <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div className="version-badge">v123 — novos campos de formação</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><a className="btn-primary" href="/admin/clientes" target="_blank">Clientes</a><a className="btn-primary" href="/admin/viagens" target="_blank">Administração de Viagens</a><button className="btn-secondary" onClick={logout}>Sair</button></div></div>
      </div>

      <div className="card premium-header-card" style={{ padding: 22, marginBottom: 22 }}>
        <h2>Cadastrar cliente</h2>

        <div className="grid">
          <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
          <label className="admin-field-label"><span>Data de nascimento</span><input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></label>
        <label className="admin-field-label"><span>Validade do passaporte</span><input type="date" value={form.passport_expiration_date || ""} onChange={(e) => setForm({ ...form, passport_expiration_date: e.target.value })} /></label>
          <input placeholder="Celular" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="E-mail principal" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="E-mail secundário (opcional)" type="email" value={form.secondary_email || ""} onChange={(e) => setForm({ ...form, secondary_email: e.target.value })} />
          <label className="admin-field-label"><span>Tipo de processo</span><select value={form.tipo_processo} onChange={(e) => setForm({ ...form, tipo_processo: e.target.value, no_form_required: e.target.value === "Passaporte" ? true : form.no_form_required })}><option value="Primeiro visto">Primeiro visto</option><option value="Renovação">Renovação</option><option value="Passaporte">Passaporte</option><option value="Canadá">Canadá</option><option value="Outro">Outro</option></select><small>Mesmo CPF e nascimento podem ter mais de um processo: ex. Passaporte agora e Visto depois. Passaporte não gera link de formulário.</small></label>
          <label className="admin-field-label"><span>Grupo de processo</span><select value={form.group_process_id} onChange={(e) => setForm({ ...form, group_process_id: e.target.value })}><option value="">Sem grupo</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.nome}</option>)}</select></label>
          <button type="button" className="btn-light" onClick={createProcessGroup}>+ Criar grupo de processo</button>
          <textarea className="wide" placeholder="Observações internas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <label className="admin-checkbox"><input type="checkbox" disabled={form.tipo_processo === "Passaporte"} checked={form.tipo_processo === "Passaporte" || !!form.no_form_required} onChange={(e) => setForm({ ...form, no_form_required: e.target.checked })} /> Cadastro de controle — não enviar formulário{form.tipo_processo === "Passaporte" ? " (obrigatório para passaporte)" : ""}</label>
          <label className="admin-checkbox" style={{ alignItems: "flex-start" }}>
            <input
              type="checkbox"
              disabled={form.tipo_processo === "Passaporte"}
              checked={!!form.also_create_passport}
              onChange={(e) => setForm({ ...form, also_create_passport: e.target.checked })}
            />
            <span><strong>Esta família também contratou Passaporte</strong><br/><small>Ao cadastrar cada membro no grupo do visto, o sistema cria automaticamente um segundo processo de Passaporte, vinculado ao mesmo cliente único, em um grupo separado “— Passaporte”. A opção e o grupo permanecem selecionados para cadastrar os próximos membros da família.</small></span>
          </label>
          {form.also_create_passport && !form.group_process_id && <div className="wide" style={{ background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 12, padding: 12, color: "#9a3412", fontWeight: 700 }}>Selecione ou crie o Grupo de processo do visto. O grupo familiar de Passaporte será criado automaticamente e ficará totalmente separado.</div>}
          <label className="admin-checkbox"><input type="checkbox" checked={!!form.is_renewal} onChange={(e) => setForm({ ...form, is_renewal: e.target.checked })} /> Processo de renovação sem entrevista</label>
        </div>

        <button className="btn-primary" onClick={createClient} disabled={form.also_create_passport && !form.group_process_id}>
          {form.also_create_passport
            ? "Cadastrar Visto + Passaporte"
            : (form.no_form_required ? "Cadastrar controle sem link" : "Cadastrar cliente e gerar link seguro")}
        </button>
      </div>

      <div className="card" style={{ padding: 22 }}>
        <div className="admin-tabs" style={{ marginBottom: 16 }}>
          <button className={processTab === "andamento" ? "btn-primary" : "btn-light"} onClick={() => setProcessTab("andamento")}>Processos em andamento</button>
          <button className={processTab === "concluidos" ? "btn-primary" : "btn-light"} onClick={() => setProcessTab("concluidos")}>Processos concluídos</button>
        </div>

        <OperationalActionCenter />

        <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={() => setAlertsOpen(true)}>Ver alertas</button>
          <a className="btn-light" href="/admin/feedbacks" target="_blank">Feedbacks</a>
          <a className="btn-light" href="/admin/feedback-agenda" target="_blank">Agenda pesquisas</a>
          <a className="btn-light" href="/admin/biblioteca-emails" target="_blank">Biblioteca de emails</a>
          <a className="btn-light" href="/admin/newsletter" target="_blank">Newsletter</a>
          <a className="btn-light" href="/admin/newsletter/contatos" target="_blank">Contatos Newsletter</a>
          <a className="btn-light" href="/admin/eventos" target="_blank">Central de Eventos</a>
          <button className="btn-light" onClick={() => setReportOpen(true)}>Relatórios</button>
          <a className="btn-light" href="/admin/baloes" target="_blank">Balões explicativos</a>
          <input placeholder="Buscar por nome, CPF, e-mail ou grupo de processo" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todas as etapas</option>
            {PROCESS_STEPS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_desc">Ordenar: cadastro mais recente</option>
            <option value="created_asc">Ordenar: cadastro mais antigo</option>
            <option value="name">Ordenar: ordem alfabética</option>
            <option value="family_group">Ordenar: grupo de processo</option>
            <option value="interview_date">Ordenar: data entrevista</option>
            <option value="casv_date">Ordenar: data CASV</option>
            <option value="video_call_date">Ordenar: data videochamada</option>
          </select>
        </div>

        <table width="100%" cellPadding="10" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th align="left">Cliente</th>
              <th align="left">Etapa</th>
              <th align="left">Link seguro</th>
              <th align="left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id} className={processInfo(client).groupName ? "family-row" : ""} style={{ borderTop: "1px solid #e5e7eb", ...groupRowStyle(client) }}>
                <td style={{ backgroundColor: groupColorFor(client) || undefined }}>
                  <b style={{ textDecoration: client.grupo_familiar_master ? "underline" : "none", textDecorationThickness: client.grupo_familiar_master ? 2 : undefined }}>{client.name}</b><br />
                  <small>CPF: {client.cpf}</small><br />
                  <small>Nascimento: {formatDateBR(client.birth_date)}</small><br />
                  <small>Celular: {client.phone || "-"}</small><br />
                  <small>E-mail principal: {client.email || "-"}</small><br />
                  {client.secondary_email && <><small>E-mail secundário: {client.secondary_email}</small><br /></>}
                  {isPassportProcess(client) ? (
                    <>
                      <small><b>Cidade do agendamento:</b> {processInfo(client).passport_pf_city || "-"}</small><br />
                      <small><b>Local do agendamento:</b> {processInfo(client).passport_pf_location || "-"}</small><br />
                      <small><b>Data agendamento passaporte:</b> {formatDateTimeBR(processInfo(client).passport_pf_datetime) || "-"}</small><br />
                      <small>Grupo de processo: {processInfo(client).groupName || "-"}</small><br />
                      {client.grupo_familiar_master && <><small style={{ color: "#166534", fontWeight: 700 }}>Contato principal</small><br /></>}
                      <small><b>Rastreio passaporte:</b> {processInfo(client).passport_tracking_code || "-"}</small>
                    </>
                  ) : (
                    <>
                      <small><b>Consulado:</b> {processInfo(client).consulate_city || "-"}</small><br />
                      <small>CASV: {processInfo(client).casv_datetime ? formatDateTimeBR(processInfo(client).casv_datetime) : (formatDateBR(processInfo(client).casv_date) || "-")}</small><br />
                      <small>Entrevista: {processInfo(client).interview_datetime ? formatDateTimeBR(processInfo(client).interview_datetime) : (formatDateBR(processInfo(client).interview_date) || "-")}</small><br />
                      <small>Videochamada: {formatDateTimeBR(processInfo(client).video_call_date) || "-"}</small><br />
                      <small>Grupo de processo: {processInfo(client).groupName || "-"}</small><br />
                      {client.grupo_familiar_master && <><small style={{ color: "#166534", fontWeight: 700 }}>Contato principal</small><br /></>}
                      <small><b>Rastreio passaporte:</b> {processInfo(client).passport_tracking_code || "-"}</small>
                    </>
                  )}
                  {!isPassportProcess(client) && <><br /><small><b>Ficha DS-160:</b> {ds160Summary(client)}</small><br /><small><b>Link preparação:</b> <button className="btn-light" style={{ padding:"4px 8px", fontSize:11 }} onClick={() => copyText(preparationLinkFor(client), "Link de preparação copiado.")}>Copiar</button></small></>}
                  <Thermometer client={client} />
                  {client.client_sedex_tracking && <><br /><small>Sedex cliente: {client.client_sedex_tracking}</small></>}
                  {client.is_renewal && <div className="admin-renewal-alert">Renovação sem entrevista</div>}
                  {client.no_form_required && <div className="admin-renewal-alert muted">Cadastro de controle — sem formulário ao cliente</div>}
                  {client.legacy_import && <div className="admin-renewal-alert info">Cadastro antigo — revisar antes de concluir</div>}
                  {scheduleAlerts(client).map((alert, index) => (
                    <div key={index} className={`admin-date-alert ${alert.level}`}>{alert.text}</div>
                  ))}
                  {getCriticalAlerts(client).length > 0 && (
                    <div className="admin-critical-alert">
                      Atenção: cliente respondeu <strong>Sim</strong> na pergunta {getCriticalAlerts(client).join(", ")}
                    </div>
                  )}
                  {salaryMissingAlert(client) && (
                    <div className="admin-date-alert warning">
                      Deixou informação de salário em branco
                    </div>
                  )}
                  {hasSecurityYesAlert(client) && (
                    <div className="admin-critical-alert">
                      Alerta: cliente respondeu Sim em pergunta de segurança da página 9
                    </div>
                  )}
                  {hasObservationsAlert(client) && (
                    <div className="admin-date-alert warning">
                      Alerta: cliente preencheu observações gerais na página 10
                    </div>
                  )}
                  {!client.passport_expiration_date && (
                    <div className="admin-date-alert warning">
                      Falta data de validade do passaporte
                    </div>
                  )}
                  {client.visa_result === "approved" && client.stage_passport_returned && !client.visa_expiration_date && (
                    <div className="admin-date-alert warning">
                      Falta data da validade do visto
                    </div>
                  )}
                  {client.feedback_answered_at && (
                    <div className="admin-date-alert info">
                      Avaliação recebida: nota {client.feedback_nota_nps ?? "-"} / 10
                    </div>
                  )}
                </td>

                <td>
                  <span className="status-pill" style={{ background: client.status === "submitted" ? "#dcfce7" : "#fff7e8", color: client.status === "submitted" ? "#166534" : "#92400e" }}>
                    {currentStepLabel(client)} {client.is_locked ? "🔒" : ""}
                  </span>
                  {processTab === "andamento" && (
                    <div style={{ ...actionSeverityStyle(nextActionForClient(client).severity), marginTop:8, borderRadius:12, padding:"8px 10px", fontSize:12, fontWeight:800 }}>
                      Próxima ação: {nextActionForClient(client).text}
                    </div>
                  )}
                </td>

                <td>
                  {isControlClient(client) ? (
                    <div className="copy-link muted">Cadastro de controle — sem link de formulário</div>
                  ) : (
                    <>
                      <div className="copy-link">{clientLink(client)}</div>
                      <button className="btn-light" disabled={!clientLink(client)} onClick={() => copyText(clientLink(client), "Link copiado.")} style={{ marginTop: 6 }}>
                        Copiar link
                      </button>
                    </>
                  )}
                </td>

                <td>
                  <div className="admin-actions">
                    {isControlClient(client) ? <button className="btn-light" disabled>Abrir</button> : <a className="btn-light" href={`/acesso/${client.access_token}`} target="_blank">Abrir</a>}
                    <button className="btn-light" onClick={() => openEditClient(client)}>Editar dados</button>
                    <button className="btn-light" disabled={!client.phone} onClick={() => openClientWhatsAppConversation(client)}>Conversar no WhatsApp</button>
                    <button className="btn-light" onClick={() => setActiveMenu(activeMenu === `whatsapp-${client.id}` ? null : `whatsapp-${client.id}`)}>Mensagens prontas</button>

                    {activeMenu === `whatsapp-${client.id}` && (
                      <div className="admin-email-options whatsapp-panel" style={{ minWidth: 300 }}>
                        <button className="popup-close" onClick={() => setActiveMenu(null)}>×</button>
                        <h3 style={{ margin: "0 0 8px", color: "var(--navy)" }}>Enviar WhatsApp</h3>
                        <p style={{ margin: "0 0 12px", color: "var(--muted)", fontSize: 13 }}>Abre WhatsApp Web/App com mensagem pronta para o celular cadastrado.</p>
                        <button className="btn-light" onClick={() => openClientWhatsApp(client, "formulario")}>Formulário</button>
                        <button className="btn-light" onClick={() => openClientWhatsApp(client, "pendente")}>Lembrete de formulário</button>
                        <button className="btn-light" onClick={() => openClientWhatsApp(client, "videochamada")}>Videochamada</button>
                        <button className="btn-light" disabled={!client.phone} onClick={() => openFeedbackWhatsApp(client)}>{isPassportProcess(client) ? "WhatsApp — avaliação passaporte" : "Avaliação / pesquisa de satisfação"}</button>
                      </div>
                    )}

                    <button className="btn-light" onClick={() => setActiveMenu(activeMenu === `process-${client.id}` ? null : `process-${client.id}`)}>Processo, datas e rastreios</button>
                    {!isPassportProcess(client) && <button className="btn-light" onClick={() => openOperationPanel(client)}>🗂 Operação / DS-160</button>}
                    {activeMenu === `process-${client.id}` && (
                      <div className="admin-email-options process-panel" style={{ minWidth: 380 }}>
                        <button className="popup-close" onClick={() => setActiveMenu(null)}>×</button>
                        <h3 style={{ margin: "0 0 8px", color: "var(--navy)" }}>Processo, datas e rastreios</h3>
                        <p style={{ margin: "0 0 12px", color: "var(--muted)", fontSize: 13 }}>Preencha ao longo do processo. Estes dados não fazem parte do cadastro inicial.</p>

                        <label><small>Data de início do processo</small><input type="date" defaultValue={processInfo(client).data_inicio_processo || ""} onBlur={(e) => updateProcessSchedule(client, { data_inicio_processo: e.target.value })} /></label>
                        {isPassportProcess(client) && (
                          <>
                            <label><small>Cidade da Polícia Federal</small><input defaultValue={processInfo(client).passport_pf_city || ""} placeholder="Ex.: São Paulo" onBlur={(e) => updateProcessSchedule(client, { passport_pf_city: e.target.value })} /></label>
                            <label><small>Local / unidade da Polícia Federal</small><input defaultValue={processInfo(client).passport_pf_location || ""} placeholder="Ex.: Shopping Eldorado / PF" onBlur={(e) => updateProcessSchedule(client, { passport_pf_location: e.target.value })} /></label>
                            <label><small>Data e hora do atendimento na PF</small><input type="datetime-local" defaultValue={toDatetimeLocal(processInfo(client).passport_pf_datetime)} onBlur={(e) => updateProcessSchedule(client, { passport_pf_datetime: e.target.value, interview_date: e.target.value ? String(e.target.value).slice(0,10) : "" })} /></label>
                            <label><small>Data de pagamento da GRU</small><input type="date" defaultValue={processInfo(client).passport_gru_paid_at || ""} onBlur={(e) => updateProcessSchedule(client, { passport_gru_paid_at: e.target.value, stage_fee_paid: !!e.target.value })} /></label>
                            <label><small>Protocolo do passaporte</small><input defaultValue={processInfo(client).passport_protocol || ""} placeholder="Ex.: 1.234.567.890" onBlur={(e) => updateClientSchedule(client, { passport_protocol: e.target.value }, { syncGroup: false })} /></label>
                            <p style={{ margin: "-4px 0 4px", color: "var(--muted)", fontSize: 11 }}>Campo individual: não será copiado para os demais membros da família.</p>
                          </>
                        )}
                        {!isPassportProcess(client) && (
                          <>
                            <label><small>Cidade do consulado</small><select defaultValue={processInfo(client).consulate_city || ""} onChange={(e) => updateProcessSchedule(client, { consulate_city: e.target.value })}><option value="">Selecionar cidade</option>{CONSULATE_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
                            {!["recife", "porto alegre"].some((city) => String(processInfo(client).consulate_city || "").toLowerCase().includes(city)) ? (
                              <label><small>Data e horário do compromisso no CASV</small><input type="datetime-local" defaultValue={toDatetimeLocal(processInfo(client).casv_datetime)} onBlur={(e) => updateProcessSchedule(client, { casv_datetime: e.target.value, casv_date: e.target.value ? String(e.target.value).slice(0,10) : "" })} /></label>
                            ) : (
                              <div style={{ padding:10, borderRadius:10, background:"#eef2ff", color:"#334155", fontSize:12 }}><strong>Compromisso único:</strong> Recife e Porto Alegre não possuem agendamento separado no CASV.</div>
                            )}
                            <label><small>{["recife", "porto alegre"].some((city) => String(processInfo(client).consulate_city || "").toLowerCase().includes(city)) ? "Data e horário do compromisso único no consulado" : "Data e horário da entrevista no consulado"}</small><input disabled={shouldDisableRenewalField(client, "interview_date")} type="datetime-local" defaultValue={toDatetimeLocal(processInfo(client).interview_datetime)} onBlur={(e) => updateProcessSchedule(client, { interview_datetime: e.target.value, interview_date: e.target.value ? String(e.target.value).slice(0,10) : "" })} /></label>
                            <label><small>Data da videochamada</small><input disabled={shouldDisableRenewalField(client, "video_call_date")} type="datetime-local" defaultValue={toDatetimeLocal(processInfo(client).video_call_date)} onBlur={(e) => updateProcessSchedule(client, { video_call_date: e.target.value })} /></label>
                          </>
                        )}

                        <hr style={{ width: "100%", border: 0, borderTop: "1px solid #e5e7eb", margin: "8px 0" }} />
                        <label><small>Rastreio do passaporte enviado ao cliente</small><input defaultValue={processInfo(client).passport_tracking_code || ""} placeholder="Ex.: AA123456789BR" onBlur={(e) => updateProcessSchedule(client, { passport_tracking_code: e.target.value })} /></label>
                        {processInfo(client).passport_tracking_code && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><a className="btn-light" href={correiosUrl(processInfo(client).passport_tracking_code)} target="_blank">Abrir rastreio nos Correios</a><button className="btn-light" onClick={() => copyText(processInfo(client).passport_tracking_code, "Código de rastreio copiado.")}>Copiar código</button></div>}

                        <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 12 }}>Renovação sem entrevista e rastreio Sedex enviado pelo cliente ficam em <strong>Editar dados</strong>.</p>
                      </div>
                    )}

                    <button className="btn-light" onClick={() => setActiveMenu(activeMenu === `steps-${client.id}` ? null : `steps-${client.id}`)}>Etapas do processo</button>
                    {!isPassportProcess(client) && <button className={client.visa_result === "approved" ? "btn-primary" : "btn-light"} title="Marcar/desmarcar visto aprovado rapidamente" onClick={() => updateProcessSteps(client, "visa_result", client.visa_result !== "approved", client.visa_result === "approved" ? "" : "approved")}>☑ Visto aprovado rápido</button>}
                    {activeMenu === `steps-${client.id}` && (
                      <div className="admin-email-options process-panel" style={{ minWidth: 420 }}>
                        <button className="popup-close" onClick={() => setActiveMenu(null)}>×</button>
                        <h3 style={{ margin: "0 0 8px", color: "var(--navy)" }}>Etapas do processo</h3>
                        <p style={{ margin: "0 0 12px", color: "var(--muted)", fontSize: 13 }}>Marque cada etapa concluída para acompanhar o andamento.</p>
                        {processStepsForClient(client).map(([key, label]) => {
                          if (key === "visa_result") {
                            return (
                              <label key={key}>
                                <small>{label}</small>
                                <select value={client.visa_result || ""} onChange={(e) => updateProcessSteps(client, "visa_result", !!e.target.value, e.target.value)}>
                                  <option value="">Ainda sem resultado</option>
                                  <option value="approved">Visto aprovado</option>
                                  <option value="denied">Visto negado</option>
                                </select>
                              </label>
                            );
                          }
                          return (
                            <label key={key} className="admin-checkbox">
                              <input type="checkbox" checked={stepDone(client, key)} onChange={(e) => updateProcessSteps(client, key, e.target.checked)} />
                              {label}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    <button className="btn-primary" disabled={!client.email || emailComposerLoading || availableEmailTemplates(client).length === 0} title={availableEmailTemplates(client).length === 0 ? "Nenhum modelo disponível para esta etapa/cadastro" : ""} onClick={() => openEmailComposer(client)}>Email</button>

                    {isControlClient(client) ? <button className="btn-light" disabled>Gerar PDF</button> : <a className="btn-light" href={`/admin/pdf/${client.access_token}`} target="_blank">Gerar PDF</a>}
                    {isControlClient(client) ? <button className="btn-light" disabled>PDF para preencher à mão</button> : <a className="btn-light" href={`/admin/pdf-manual/${client.access_token}`} target="_blank">PDF para preencher à mão</a>}
                    <button className="btn-light" disabled={!client.email || emailComposerLoading} onClick={() => openEmailComposer(client, "foto_instrucoes")}>Instruções Foto</button>
                    <button className="btn-light" onClick={() => loadLogs(client)}>Ver log</button>
                    <button className="btn-light" disabled={isControlClient(client)} title={isControlClient(client) ? "Cadastro de controle não possui formulário para desbloquear" : ""} onClick={() => actionClient(client.id, "unlock")}>Desbloquear</button>
                    <button className="btn-light" disabled={isControlClient(client)} title={isControlClient(client) ? "Cadastro de controle não possui link de formulário" : ""} onClick={() => actionClient(client.id, "new_token")}>Novo link</button>
                    {client.legacy_import ? (
                      <button className="btn-primary" onClick={() => actionClient(client.id, "move_legacy_completed")}>Remeter para concluídos</button>
                    ) : (
                      <button className="btn-light" onClick={() => actionClient(client.id, client.is_completed ? "reopen" : "mark_completed")}>{client.is_completed ? "Reabrir processo" : "Marcar concluído"}</button>
                    )}
                    <button className="btn-light" onClick={() => deleteClient(client)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {editingClient && (
        <div className="modal-backdrop" onClick={() => setEditingClient(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Editar dados do cliente</h2>
              <button className="btn-light" onClick={() => setEditingClient(null)}>Fechar</button>
            </div>
            <p style={{ color: "var(--muted)" }}>Corrija dados básicos, inclusive CPF, data de nascimento, e-mail e telefone.</p>
            <div className="grid" style={{ marginTop: 16 }}>
              <input placeholder="Nome" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <input placeholder="CPF" value={editForm.cpf || ""} onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })} />
              <label className="admin-field-label"><span>Data de nascimento</span><input type="date" value={editForm.birth_date || ""} onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })} /></label>
              <label className="admin-field-label"><span>Validade do passaporte</span><input type="date" value={editForm.passport_expiration_date || ""} onChange={(e) => setEditForm({ ...editForm, passport_expiration_date: e.target.value })} /></label>
              <label className="admin-field-label"><span>Validade do visto</span><input type="date" disabled={!canFillVisaExpiration(editForm)} value={editForm.visa_expiration_date || ""} onChange={(e) => setEditForm({ ...editForm, visa_expiration_date: e.target.value })} /></label>
              {!canFillVisaExpiration(editForm) && <small className="wide" style={{ color: "#64748b" }}>A validade do visto fica disponível somente após marcar Visto aprovado e Visto/passaporte devolvido.</small>}
              <input placeholder="Celular" value={editForm.phone || ""} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              <input placeholder="E-mail principal" type="email" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              <input placeholder="E-mail secundário (opcional)" type="email" value={editForm.secondary_email || ""} onChange={(e) => setEditForm({ ...editForm, secondary_email: e.target.value })} />
              <label className="admin-field-label"><span>Tipo de processo</span><select value={editForm.tipo_processo || "Primeiro visto"} onChange={(e) => setEditForm({ ...editForm, tipo_processo: e.target.value })}><option value="Primeiro visto">Primeiro visto</option><option value="Renovação">Renovação</option><option value="Passaporte">Passaporte</option><option value="Canadá">Canadá</option><option value="Outro">Outro</option></select></label>
              <label className="admin-field-label"><span>Grupo de processo</span><select value={editForm.group_process_id || ""} onChange={(e) => setEditForm({ ...editForm, group_process_id: e.target.value })}><option value="">Sem grupo</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.nome}</option>)}</select></label>
              <label className="admin-checkbox"><input type="checkbox" checked={!!editForm.grupo_familiar_master} onChange={(e) => setEditForm({ ...editForm, grupo_familiar_master: e.target.checked })} /> Contato principal do grupo familiar</label>
              <label className="admin-checkbox"><input type="checkbox" checked={editForm.sincronizar_com_grupo !== false} onChange={(e) => setEditForm({ ...editForm, sincronizar_com_grupo: e.target.checked })} /> Sincronizar este membro com o grupo</label>
              <button type="button" className="btn-light" onClick={createProcessGroup}>+ Criar grupo de processo</button>
              <label className="admin-checkbox"><input type="checkbox" checked={!!editForm.no_form_required} onChange={(e) => setEditForm({ ...editForm, no_form_required: e.target.checked })} /> Cadastro de controle — não enviar formulário</label>
              <label className="admin-checkbox"><input type="checkbox" checked={!!editForm.is_renewal} onChange={(e) => setEditForm({ ...editForm, is_renewal: e.target.checked })} /> Processo de renovação sem entrevista</label>
              {editForm.is_renewal && <input className="wide" placeholder="Rastreio Sedex enviado pelo cliente para a Resumindo" value={editForm.client_sedex_tracking || ""} onChange={(e) => setEditForm({ ...editForm, client_sedex_tracking: e.target.value })} />}
              <textarea className="wide" placeholder="Observações gerais para relatórios" value={editForm.observacoes_gerais || ""} onChange={(e) => setEditForm({ ...editForm, observacoes_gerais: e.target.value })} />
              <textarea className="wide" placeholder="Observações internas" value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
            </div>
            <button className="btn-primary" onClick={saveClientDetails} style={{ marginTop: 14 }}>Salvar alterações</button>
          </div>
        </div>
      )}






      {operationClient && (
        <div className="modal-backdrop" onClick={() => setOperationClient(null)}>
          <div className="modal-card" style={{ maxWidth: 1120, width: "96vw" }} onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setOperationClient(null)}>×</button>
            <h2 style={{ marginTop:0 }}>🗂 Ficha Rápida DS-160 / Operação</h2>
            <p style={{ color:"var(--muted)" }}>
              Área interna da Resumindo Viagens para substituir as fichas rápidas em Word. Os dados comuns valem para o grupo/família; os dados individuais ficam em cada solicitante.
            </p>

            <div className="admin-email-options" style={{ marginTop:14 }}>
              <h3 style={{ margin:"0 0 10px", color:"var(--navy)" }}>Dados comuns do grupo/família</h3>
              {!operationClient.group_process_id && (
                <div className="admin-date-alert warning">Cliente sem grupo familiar. Os dados comuns serão apenas referência visual nesta tela; para compartilhar dados entre familiares, vincule a um grupo de processo.</div>
              )}
              <div className="grid">
                <label><small>Consulado escolhido</small><select value={operationGroupForm.consulate_city || ""} onChange={(e) => setOperationGroupForm({ ...operationGroupForm, consulate_city: e.target.value })}><option value="">Selecionar cidade</option>{CONSULATE_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
                <label><small>Data prevista de ida</small><input type="date" value={operationGroupForm.ds160_travel_date || ""} onChange={(e) => setOperationGroupForm({ ...operationGroupForm, ds160_travel_date: e.target.value })} /></label>
                <label><small>Quantidade de dias</small><input type="number" min="1" value={operationGroupForm.ds160_trip_duration_days || ""} onChange={(e) => setOperationGroupForm({ ...operationGroupForm, ds160_trip_duration_days: e.target.value })} /></label>
                <label><small>Cidade/destino principal</small><input value={operationGroupForm.ds160_destination_city || ""} onChange={(e) => setOperationGroupForm({ ...operationGroupForm, ds160_destination_city: e.target.value })} placeholder="Ex.: Orlando, Nova York..." /></label>
                <label><small>Hotel escolhido</small><input value={operationGroupForm.ds160_selected_hotel_name || ""} onChange={(e) => setOperationGroupForm({ ...operationGroupForm, ds160_selected_hotel_name: e.target.value })} /></label>
                <label><small>Telefone do hotel</small><input value={operationGroupForm.ds160_selected_hotel_phone || ""} onChange={(e) => setOperationGroupForm({ ...operationGroupForm, ds160_selected_hotel_phone: e.target.value })} /></label>
                <label className="wide"><small>Endereço do hotel</small><input value={operationGroupForm.ds160_selected_hotel_address || ""} onChange={(e) => setOperationGroupForm({ ...operationGroupForm, ds160_selected_hotel_address: e.target.value })} /></label>
                <label className="wide"><small>Observações gerais DS-160</small><textarea value={operationGroupForm.ds160_common_notes || ""} onChange={(e) => setOperationGroupForm({ ...operationGroupForm, ds160_common_notes: e.target.value })} placeholder="Ex.: todos viajam juntos; hotel usado no DS-160; observações de preenchimento..." /></label>
                <label className="wide"><small>Perguntas/respostas comuns</small><textarea value={operationGroupForm.ds160_common_security_answers || ""} onChange={(e) => setOperationGroupForm({ ...operationGroupForm, ds160_common_security_answers: e.target.value })} placeholder="Ex.: pergunta de recuperação, respostas comuns, anotações de acesso..." /></label>
              </div>
            </div>

            <div className="admin-email-options" style={{ marginTop:14 }}>
              <h3 style={{ margin:"0 0 10px", color:"var(--navy)" }}>Dados individuais</h3>
              <div style={{ overflowX:"auto" }}>
                <table width="100%" cellPadding="8" style={{ borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ background:"#f8fafc" }}>
                      <th align="left">Solicitante</th>
                      <th align="left">Nome no passaporte</th>
                      <th align="left">Sobrenome DS-160</th>
                      <th align="left">Número DS-160</th>
                      <th align="left">Obs. individual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operationMembers.map((member, index) => (
                      <tr key={member.id} style={{ borderTop:"1px solid #e5e7eb" }}>
                        <td style={{ minWidth:180, fontWeight:800 }}>{member.name}</td>
                        <td><input value={member.passport_display_name || ""} onChange={(e) => setOperationMembers((list) => list.map((item, i) => i === index ? { ...item, passport_display_name: e.target.value } : item))} placeholder="Ex.: SILVA / JOAO" /></td>
                        <td><input value={member.passport_surname || ""} onChange={(e) => setOperationMembers((list) => list.map((item, i) => i === index ? { ...item, passport_surname: e.target.value } : item))} placeholder="Sobrenome usado no CEAC" /></td>
                        <td><input value={member.ds160_number || ""} onChange={(e) => setOperationMembers((list) => list.map((item, i) => i === index ? { ...item, ds160_number: e.target.value.toUpperCase() } : item))} placeholder="AA00..." /></td>
                        <td><input value={member.ds160_individual_notes || ""} onChange={(e) => setOperationMembers((list) => list.map((item, i) => i === index ? { ...item, ds160_individual_notes: e.target.value } : item))} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:16 }}>
              <button className="btn-primary" onClick={saveOperationPanel}>Salvar ficha rápida</button>
              <button className="btn-light" onClick={() => copyText(preparationLinkFor(operationClient), "Link de preparação copiado.")}>Copiar link de preparação</button>
              <a className="btn-light" href="https://ceac.state.gov/genniv/" target="_blank">Abrir CEAC</a>
              <button className="btn-light" onClick={() => setOperationClient(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {reportOpen && (
        <div className="modal-backdrop" onClick={() => setReportOpen(false)}>
          <div className="modal-card report-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1180 }}>
            <button className="popup-close" onClick={() => setReportOpen(false)}>×</button>
            <h2 style={{ marginTop: 0 }}>Relatório geral</h2>
            <p style={{ color: "var(--muted)" }}>Relatório operacional baseado nos clientes atualmente exibidos pelos filtros e pela aba selecionada.</p>
            <div className="report-kpis">
              <div><strong>{reportKpis().total}</strong><span>Total</span></div>
              <div><strong>{reportKpis().andamento}</strong><span>Em andamento</span></div>
              <div><strong>{reportKpis().concluidos}</strong><span>Concluídos</span></div>
              <div><strong>{reportKpis().aprovados}</strong><span>Aprovados</span></div>
              <div><strong>{reportKpis().negados}</strong><span>Negados</span></div>
            </div>
            <button className="btn-primary" onClick={exportReportCsv} style={{ margin: "12px 0" }}>Exportar relatório CSV/Excel</button>
            <div style={{ overflowX: "auto", maxHeight: "65vh" }}>
              <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: "#f1f5f9" }}><th align="left">Nome</th><th align="left">Grupo</th><th align="left">Tipo</th><th align="left">Status</th><th align="left">Etapa</th><th align="left">Início</th><th align="left">CASV / Cidade PF</th><th align="left">Entrevista / Agendamento passaporte</th><th align="left">Progresso</th><th align="left">Dias</th></tr></thead>
                <tbody>
                  {reportRows().map((row, index) => (
                    <tr key={`${row.cpf}-${index}`} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td>{row.nome}</td><td>{row.grupo || "-"}</td><td>{row.tipo}</td><td>{row.status}</td><td>{row.etapa}</td><td>{row.inicio || "-"}</td><td>{row.casv || "-"}</td><td>{row.entrevista || "-"}</td><td>{row.progresso}</td><td>{row.dias}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {alertsOpen && (
        <div className="modal-backdrop" onClick={() => setAlertsOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setAlertsOpen(false)}>×</button>
            <h2 style={{ marginTop: 0 }}>Alertas do dia</h2>
            <button className="btn-primary" onClick={clearCurrentAlerts}>Baixar todos os alertas em aberto</button>
            {buildGlobalAlerts().length === 0 && <p style={{ color: "var(--muted)" }}>Nenhum alerta no momento.</p>}
            {buildGlobalAlerts().map((alert, index) => (
              <div key={alert.key || index} style={{ borderTop: "1px solid #e5e7eb", padding: "12px 0", display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <b style={{ color: "var(--navy)" }}>{alert.label}</b><br />
                  <small style={{ color: "var(--muted)" }}>Data do alerta: {formatAlertDate(alert.alertDate)}</small><br />
                  <span>{alert.text}</span>
                </div>
                <button className="btn-light" onClick={() => dismissAlert(alert.key)}>Dar baixa</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {emailComposer && (
        <div className="modal-backdrop" onClick={() => setEmailComposer(null)}>
          <div className="modal-card" style={{ maxWidth: 1100, width: "94vw" }} onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setEmailComposer(null)}>×</button>
            <h2 style={{ marginTop: 0 }}>Editor de email</h2>
            <p style={{ color: "var(--muted)" }}>Edite somente o texto da mensagem. Depois clique em Gerar pré-visualização para o sistema aplicar o visual do email automaticamente.</p>

            <div className="grid" style={{ marginTop: 12 }}>
              <label className="admin-field-label">
                <span>Modelo</span>
                <select value={emailComposer.templateId} onChange={(e) => changeEmailComposerTemplate(e.target.value)}>
                  {(emailComposer.templates || []).map((template) => (
                    <option key={template.id} value={template.id}>{template.label}</option>
                  ))}
                </select>
              </label>
              <label className="admin-field-label">
                <span>Para</span>
                <input value={emailComposer.toEmail || ""} onChange={(e) => setEmailComposer({ ...emailComposer, toEmail: e.target.value })} />
              </label>
              <label className="admin-field-label">
                <span>CC — e-mail secundário</span>
                <input value={emailComposer.ccEmail || ""} onChange={(e) => setEmailComposer({ ...emailComposer, ccEmail: e.target.value })} placeholder="Opcional" />
              </label>
              <label className="admin-field-label wide">
                <span>Assunto</span>
                <input value={emailComposer.subject || ""} onChange={(e) => setEmailComposer({ ...emailComposer, subject: e.target.value })} />
              </label>
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="admin-field-label">
                <span>Mensagem em texto simples</span>
                <textarea
                  value={emailComposer.plainText || ""}
                  onChange={(e) => setEmailComposer({ ...emailComposer, plainText: e.target.value })}
                  style={{ minHeight: 220, width: "100%", fontSize: 16, lineHeight: 1.5 }}
                  placeholder="Edite aqui apenas o texto da mensagem, sem código HTML."
                />
              </label>
              <button className="btn-light" style={{ marginTop: 10 }} onClick={generateEmailPreview}>
                Gerar pré-visualização
              </button>
            </div>

            <div style={{ marginTop: 16, padding: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#f8fafc" }}>
              <strong style={{ color: "var(--navy)" }}>Anexos temporários para este email</strong>
              <p style={{ color: "var(--muted)", margin: "6px 0 10px" }}>
                Use para anexar CONFIRMATION, APPLICATION, AGENDAMENTO ou outros PDFs/imagens. Os arquivos são enviados junto com este email e não ficam salvos permanentemente no sistema.
              </p>
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => handleTempEmailAttachments(event.target.files)} />
              {(emailComposer.tempAttachments || []).length > 0 && (
                <ul style={{ marginBottom: 0 }}>
                  {(emailComposer.tempAttachments || []).map((item) => <li key={item.name}>{item.name}</li>)}
                </ul>
              )}
            </div>

            <h3>Pré-visualização</h3>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, maxHeight: 420, overflow: "auto", background: "#fff" }} dangerouslySetInnerHTML={{ __html: emailComposer.html || "" }} />

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 18, flexWrap: "wrap" }}>
              <button className="btn-light" onClick={() => setEmailComposer(null)}>Cancelar</button>
              <button className="btn-primary" disabled={emailComposerLoading} onClick={sendEmailComposer}>
                {emailComposerLoading ? "Enviando..." : "Enviar email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {logClient && (
        <div className="modal-backdrop" onClick={() => setLogClient(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Log de atividade</h2>
              <button className="btn-light" onClick={() => setLogClient(null)}>Fechar</button>
            </div>

            <p style={{ color: "var(--muted)" }}>{logClient.name}</p>

            {logLoading && <p>Carregando log...</p>}

            {!logLoading && logs.length === 0 && (
              <p style={{ color: "var(--muted)" }}>Nenhuma atividade registrada.</p>
            )}

            {!logLoading && logs.map((log) => (
              <div key={log.id} style={{ borderTop: "1px solid #e5e7eb", padding: "12px 0" }}>
                <b style={{ color: "var(--navy)" }}>{actionLabel(log.action)}</b><br />
                <small>{new Date(log.created_at).toLocaleString("pt-BR")}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}


