"use client";

import { useEffect, useMemo, useState } from "react";
import BrandHeader from "../../components/BrandHeader";
import { EMAIL_TEMPLATES } from "../../lib/emailTemplates";

function cleanCPF(value) {
  return (value || "").replace(/\D/g, "");
}

function formatDateBR(value) {
  if (!value) return "";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function statusLabel(status) {
  const labels = {
    not_started: "Não iniciado",
    in_progress: "Em preenchimento",
    submitted: "Enviado"
  };
  return labels[status] || status;
}


const CRITICAL_ALERT_QUESTIONS = ["3.19", "3.20", "3.21", "6.9", "6.11", "8.8"];

function normalizeAnswer(value) {
  return String(value || "").trim().toLowerCase();
}

function buildQuestionNumberMap() {
  // Mantém o alerta correto mesmo que o ID interno dos campos seja diferente do número exibido.
  const map = {
    "3.19": "vistoCancelado",
    "3.20": "vistoNegado",
    "3.21": "pedidoImigracao",
    "6.9": "parenteEUA",
    "6.11": "familiaresEUA",
    "8.8": "organizacaoBeneficente"
  };
  return map;
}

const QUESTION_ID_BY_NUMBER = buildQuestionNumberMap();
const DISABLED_AUTO_EMAILS = new Set(["instrucoes", "pre_entrevista"]);
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
    client_sedex_tracking_sent: "Rastreio Sedex informado pelo cliente"
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
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch("/api/admin/status")
      .then((r) => r.json())
      .then((data) => setAuthorized(!!data.authenticated))
      .finally(() => setChecking(false));
  }, []);

  async function loginWithPassword(pass) {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Senha incorreta.");
    return true;
  }

  async function login() {
    try {
      await loginWithPassword(password);
      setAuthorized(true);
    } catch (error) {
      alert(error.message || "Erro ao entrar.");
    }
  }

  if (checking) return <main style={{ padding: 30 }}>Carregando...</main>;

  if (!authorized) {
    return (
      <main style={{ maxWidth: 480, margin: "60px auto", padding: 20 }}>
        <div className="card" style={{ padding: 28 }}>
          <BrandHeader compact />
          <h2 style={{ color: "var(--navy)", marginTop: 24 }}>Painel interno seguro</h2>
          <p>Digite a senha administrativa.</p>
          <input type="password" name="rv-admin-key" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <br /><br />
          <button className="btn-primary" onClick={login}>Entrar</button>
        </div>
      </main>
    );
  }

  return <Dashboard loginWithPassword={loginWithPassword} />;
}

function Dashboard({ loginWithPassword }) {
  const [clients, setClients] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logClient, setLogClient] = useState(null);
  const [logLoading, setLogLoading] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeMenu, setActiveMenu] = useState(null);
  const [processTab, setProcessTab] = useState("andamento");
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    birth_date: "",
    phone: "",
    email: "",
    notes: ""
  });

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://visto-seguro.vercel.app";

  async function loadClients() {
    const res = await fetch("/api/admin/clients");
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao carregar clientes.");
      return;
    }
    setClients(data.clients || []);
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

    setForm({ name: "", cpf: "", birth_date: "", phone: "", email: "", notes: "" });
    await loadClients();
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
      notes: client.notes || "",
      family_group: client.family_group || "",
      no_form_required: !!client.no_form_required,
      is_renewal: !!client.is_renewal
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

    if (templateId === "rastreio" && !client.passport_tracking_code) {
      alert("Informe o código de rastreio em Datas e alertas antes de enviar o Email 09.");
      return;
    }

    const template = EMAIL_TEMPLATES.find((item) => item.id === templateId);
    const ok = confirm(`Enviar o email "${template?.label || templateId}" para ${client.name} (${client.email})?`);
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

  async function updateClientSchedule(client, fields) {
    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_schedule",
        interview_date: fields.interview_date ?? client.interview_date ?? "",
        casv_date: fields.casv_date ?? client.casv_date ?? "",
        video_call_date: fields.video_call_date ?? client.video_call_date ?? "",
        consulate_city: fields.consulate_city ?? client.consulate_city ?? "",
        passport_tracking_code: fields.passport_tracking_code ?? client.passport_tracking_code ?? "",
        client_sedex_tracking: fields.client_sedex_tracking ?? client.client_sedex_tracking ?? ""
      })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erro ao salvar datas. Confira se as colunas novas foram criadas no Supabase.");
      return;
    }
    await loadClients();
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
    const interviewDays = daysUntil(client.interview_date);
    const videoDays = daysUntil(client.video_call_date);
    const casvDays = daysUntil(client.casv_date);

    if (interviewDays !== null && interviewDays >= 0 && interviewDays <= 2) alerts.push({ level: "danger", text: `Entrevista em ${interviewDays === 0 ? "hoje" : `${interviewDays} dia(s)`}${client.consulate_city ? ` — ${client.consulate_city}` : ""}` });
    else if (interviewDays !== null && interviewDays > 2 && interviewDays <= 7) alerts.push({ level: "warning", text: `Entrevista em ${interviewDays} dias${client.consulate_city ? ` — ${client.consulate_city}` : ""}` });

    if (casvDays !== null && casvDays >= 0 && casvDays <= 3) alerts.push({ level: "info", text: `CASV em ${casvDays === 0 ? "hoje" : `${casvDays} dia(s)`}` });
    if (videoDays !== null && videoDays >= 0 && videoDays <= 2) alerts.push({ level: "info", text: `Videochamada em ${videoDays === 0 ? "hoje" : `${videoDays} dia(s)`}` });

    return alerts;
  }

  async function deleteClient(id) {
    const pass = prompt("Digite a senha do sistema para excluir este cliente:");
    if (!pass) return;

    try {
      await loginWithPassword(pass);
    } catch (error) {
      alert("Senha incorreta. Exclusão cancelada.");
      return;
    }

    if (!confirm("Confirmar exclusão do cliente e respostas?")) return;

    const res = await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erro ao excluir.");
      return;
    }

    await loadClients();
  }

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        (client.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (client.cpf || "").includes(cleanCPF(search)) ||
        (client.email || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || client.status === statusFilter;
      const matchesTab = processTab === "concluidos" ? !!client.is_completed : !client.is_completed;
      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [clients, search, statusFilter]);

  function clientLink(client) {
    return `${origin}/acesso/${client.access_token}`;
  }

  async function copyText(text, message = "Copiado.") {
    await navigator.clipboard.writeText(text);
    alert(message);
  }

  function whatsappMessage(client) {
    return `Olá, ${client.name}! Seu formulário da Resumindo Viagens já está pronto para preenchimento.\n\nAcesse seu link único e exclusivo:\n${clientLink(client)}\n\nPor segurança, o acesso será validado com CPF e data de nascimento.\n\nSe outros membros da família também estiverem preenchendo formulário, cada pessoa deverá acessar o próprio link individual.`;
  }

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: 24 }}>
      <div className="card" style={{ padding: 22, marginBottom: 22 }}>
        <BrandHeader />
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 22 }}>
        <h2>Mensagens WhatsApp (copiar)</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Mensagens gerais, não personalizadas por cliente. Clique para copiar e colar no WhatsApp.
        </p>
        <details className="admin-email-menu">
          <summary className="btn-primary">Abrir mensagens WhatsApp</summary>
          <div className="admin-email-options">
            {WHATSAPP_TEMPLATES.map((item) => (
              <button key={item.id} className="btn-light" onClick={() => copyText(item.text, `${item.label} copiada.`)}>
                {item.label}
              </button>
            ))}
          </div>
        </details>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 22 }}>
        <h2>Cadastrar cliente</h2>

        <div className="grid">
          <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
          <label className="admin-field-label"><span>Data de nascimento</span><input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></label>
          <input placeholder="Celular" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea className="wide" placeholder="Observações internas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <button className="btn-primary" onClick={createClient}>
          Cadastrar cliente e gerar link seguro
        </button>
      </div>

      <div className="card" style={{ padding: 22 }}>
        <div className="admin-tabs" style={{ marginBottom: 16 }}>
          <button className={processTab === "andamento" ? "btn-primary" : "btn-light"} onClick={() => setProcessTab("andamento")}>Processos em andamento</button>
          <button className={processTab === "concluidos" ? "btn-primary" : "btn-light"} onClick={() => setProcessTab("concluidos")}>Processos concluídos</button>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <input placeholder="Buscar por nome, CPF ou e-mail" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todos os status</option>
            <option value="not_started">Não iniciado</option>
            <option value="in_progress">Em preenchimento</option>
            <option value="submitted">Enviado</option>
          </select>
        </div>

        <table width="100%" cellPadding="10" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th align="left">Cliente</th>
              <th align="left">Status</th>
              <th align="left">Link seguro</th>
              <th align="left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>
                  <b>{client.name}</b><br />
                  <small>CPF: {client.cpf}</small><br />
                  <small>Nascimento: {formatDateBR(client.birth_date)}</small><br />
                  <small>Celular: {client.phone || "-"}</small><br />
                  <small>E-mail: {client.email || "-"}</small><br />
                  <small>Consulado: {client.consulate_city || "-"}</small><br />
                  <small>CASV: {formatDateBR(client.casv_date) || "-"}</small><br />
                  <small>Entrevista: {formatDateBR(client.interview_date) || "-"}</small><br />
                  <small>Videochamada: {formatDateBR(client.video_call_date) || "-"}</small><br />
                  <small>Grupo familiar: {client.family_group || "-"}</small><br />
                  <small>Rastreio passaporte: {client.passport_tracking_code || "-"}</small>
                  {client.client_sedex_tracking && <><br /><small>Sedex cliente: {client.client_sedex_tracking}</small></>}
                  {client.is_renewal && <div className="admin-renewal-alert">Renovação sem entrevista</div>}
                  {client.no_form_required && <div className="admin-renewal-alert muted">Cadastro de controle — sem formulário ao cliente</div>}
                  {scheduleAlerts(client).map((alert, index) => (
                    <div key={index} className={`admin-date-alert ${alert.level}`}>{alert.text}</div>
                  ))}
                  {getCriticalAlerts(client).length > 0 && (
                    <div className="admin-critical-alert">
                      Atenção: cliente respondeu <strong>Sim</strong> na pergunta {getCriticalAlerts(client).join(", ")}
                    </div>
                  )}
                </td>

                <td>
                  <span className="status-pill" style={{ background: client.status === "submitted" ? "#dcfce7" : "#fff7e8", color: client.status === "submitted" ? "#166534" : "#92400e" }}>
                    {statusLabel(client.status)} {client.is_locked ? "🔒" : ""}
                  </span>
                </td>

                <td>
                  <div className="copy-link">{clientLink(client)}</div>
                  <button className="btn-light" onClick={() => copyText(clientLink(client), "Link copiado.")} style={{ marginTop: 6 }}>
                    Copiar link
                  </button>
                </td>

                <td>
                  <div className="admin-actions">
                    <a className="btn-light" href={`/acesso/${client.access_token}`} target="_blank">Abrir</a>
                    <button className="btn-light" onClick={() => openEditClient(client)}>Editar dados</button>

                    <button className="btn-light" onClick={() => setActiveMenu(activeMenu === `dates-${client.id}` ? null : `dates-${client.id}`)}>Datas e alertas</button>
                    {activeMenu === `dates-${client.id}` && (
                      <div className="admin-email-options" style={{ minWidth: 320 }}>
                        <label><small>Data CASV</small><input type="date" defaultValue={client.casv_date || ""} onBlur={(e) => updateClientSchedule(client, { casv_date: e.target.value })} /></label>
                        <label><small>Data entrevista</small><input type="date" defaultValue={client.interview_date || ""} onBlur={(e) => updateClientSchedule(client, { interview_date: e.target.value })} /></label>
                        <label><small>Data videochamada</small><input type="date" defaultValue={client.video_call_date || ""} onBlur={(e) => updateClientSchedule(client, { video_call_date: e.target.value })} /></label>
                        <label><small>Cidade consulado</small><select defaultValue={client.consulate_city || ""} onChange={(e) => updateClientSchedule(client, { consulate_city: e.target.value })}><option value="">Selecionar</option>{CONSULATE_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
                        <label><small>Rastreio do passaporte ao cliente</small><input defaultValue={client.passport_tracking_code || ""} placeholder="Código dos Correios" onBlur={(e) => updateClientSchedule(client, { passport_tracking_code: e.target.value })} /></label>
                        {client.passport_tracking_code && <a className="btn-light" href={correiosUrl(client.passport_tracking_code)} target="_blank">Abrir rastreio nos Correios</a>}
                        {client.is_renewal && <label><small>Rastreio Sedex enviado pelo cliente</small><input defaultValue={client.client_sedex_tracking || ""} placeholder="Código informado pelo cliente" onBlur={(e) => updateClientSchedule(client, { client_sedex_tracking: e.target.value })} /></label>}
                        {client.is_renewal && <a className="btn-light" href={`/renovacao/${client.access_token}`} target="_blank">Link para cliente informar rastreio</a>}
                      </div>
                    )}

                    <button className="btn-light" onClick={() => setActiveMenu(activeMenu === `copy-${client.id}` ? null : `copy-${client.id}`)}>Gerar modelos de email (copiar)</button>
                    {activeMenu === `copy-${client.id}` && (
                      <div className="admin-email-options">
                        {EMAIL_TEMPLATES.map((template) => (
                          <a key={template.id} className="btn-light" href={`/email/${client.access_token}?template=${template.id}`} target="_blank">
                            {template.label}
                          </a>
                        ))}
                      </div>
                    )}

                    <button className="btn-primary" onClick={() => setActiveMenu(activeMenu === `send-${client.id}` ? null : `send-${client.id}`)}>Enviar emails automáticos (Brevo)</button>
                    {activeMenu === `send-${client.id}` && (
                      <div className="admin-email-options">
                        {EMAIL_TEMPLATES.map((template) => {
                          const disabled = DISABLED_AUTO_EMAILS.has(template.id);
                          const sentAt = client.email_sent_templates?.[template.id];
                          return (
                            <button key={template.id} className={sentAt ? "btn-success" : "btn-light"} disabled={disabled} onClick={() => sendEmail(client, template.id)} title={sentAt ? `Enviado em ${new Date(sentAt).toLocaleString("pt-BR")}` : ""}>
                              {sentAt ? "✅ " : "☐ "}{template.label}{disabled ? " (não disponível)" : ""}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <a className="btn-light" href={`/admin/pdf/${client.access_token}`} target="_blank">Gerar PDF</a>
                    <a className="btn-light" href={`/foto-instrucoes/${client.access_token}`} target="_blank">Instruções Foto</a>
                    <button className="btn-light" onClick={() => copyText(whatsappMessage(client), "Mensagem de WhatsApp copiada.")}>Copiar WhatsApp</button>
                    <button className="btn-light" onClick={() => loadLogs(client)}>Ver log</button>
                    <button className="btn-light" onClick={() => actionClient(client.id, "unlock")}>Desbloquear</button>
                    <button className="btn-light" onClick={() => actionClient(client.id, "new_token")}>Novo link</button>
                    <button className="btn-light" onClick={() => actionClient(client.id, client.is_completed ? "reopen" : "mark_completed")}>{client.is_completed ? "Reabrir processo" : "Marcar concluído"}</button>
                    <button className="btn-light" onClick={() => deleteClient(client.id)}>Excluir</button>
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
              <input placeholder="Celular" value={editForm.phone || ""} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              <input placeholder="E-mail" type="email" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              <input placeholder="Grupo familiar / processo" value={editForm.family_group || ""} onChange={(e) => setEditForm({ ...editForm, family_group: e.target.value })} />
              <label className="admin-checkbox"><input type="checkbox" checked={!!editForm.no_form_required} onChange={(e) => setEditForm({ ...editForm, no_form_required: e.target.checked })} /> Cadastro de controle — não enviar formulário</label>
              <label className="admin-checkbox"><input type="checkbox" checked={!!editForm.is_renewal} onChange={(e) => setEditForm({ ...editForm, is_renewal: e.target.checked })} /> Processo de renovação sem entrevista</label>
              <textarea className="wide" placeholder="Observações internas" value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
            </div>
            <button className="btn-primary" onClick={saveClientDetails} style={{ marginTop: 14 }}>Salvar alterações</button>
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
