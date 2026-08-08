function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const CONTACTS = {
  whatsapp: "https://wa.me/5511981210932",
  whatsappLabel: "WhatsApp: (11) 98121-0932",
  instagram: "https://www.instagram.com/resumindoviagens",
  instagramLabel: "Instagram: @resumindoviagens",
  email: "mailto:contato@resumindoviagens.com.br",
  emailLabel: "contato@resumindoviagens.com.br"
};

export const EMAIL_TEMPLATES = [
  { id: "formulario", label: "01 - Envio do formulário" },
  { id: "formulario_pendente", label: "02 - Formulário pendente" },
  { id: "formulario_recebido", label: "03 - Formulário recebido" },
  { id: "taxa_paga", label: "04 - Taxa compensada / próximas datas" },
  { id: "instrucoes", label: "05 - Agendamento confirmado / instruções" },
  { id: "pre_entrevista", label: "06 - Preparação para videochamada" },
  { id: "videochamada_agendada", label: "06A - Videochamada agendada" },
  { id: "aprovado", label: "07 - Visto aprovado" },
  { id: "negado", label: "08 - Visto não aprovado" },
  { id: "rastreio", label: "09 - Enviar rastreio" },
  { id: "passaporte_recebido", label: "10 - Passaporte recebido / encerramento" },
  { id: "pesquisa_satisfacao", label: "11 - Enviar pesquisa de satisfação" },
  { id: "foto_instrucoes", label: "12 - Instruções de foto" },
  { id: "passaporte_docs", label: "P01 - Passaporte: solicitar documentos" },
  { id: "passaporte_cadastro_taxa", label: "P02 - Passaporte: cadastro realizado / taxa paga" },
  { id: "passaporte_agendado", label: "P03 - Passaporte: atendimento PF agendado" },
  { id: "passaporte_instrucoes", label: "P04 - Passaporte: instruções PF" },
  { id: "passaporte_pos_pf", label: "P05 - Passaporte: após atendimento PF" },
  { id: "passaporte_disponivel", label: "P06 - Passaporte: disponível para retirada" },
  { id: "passaporte_pesquisa", label: "P07 - Passaporte: avaliação do serviço" },
  { id: "canada_pesquisa", label: "C01 - Canadá: pesquisa de satisfação" },
  { id: "agenda_visto", label: "A01 - Agenda: CASV/Consulado" },
  { id: "lembrete_visto", label: "A02 - Lembrete: CASV/Consulado amanhã" },
  { id: "agenda_videochamada", label: "A03 - Agenda: Videochamada" },
  { id: "lembrete_videochamada", label: "A04 - Lembrete: Videochamada" },
  { id: "passaporte_agenda_pf", label: "P08 - Passaporte: agenda Polícia Federal" },
  { id: "passaporte_lembrete_pf", label: "P09 - Passaporte: lembrete Polícia Federal" }
];

function paragraph(content) {
  return `<p style="margin:0 0 14px;">${content}</p>`;
}

function cta(label, url) {
  if (!url) return "";
  return `
    <p style="margin:22px 0;text-align:left;">
      <a href="${escapeHtml(url)}" style="background:#1f2a60;color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:8px;display:inline-block;font-weight:700;">${escapeHtml(label)}</a>
    </p>`;
}

function plainLinkBlock(label, url) {
  if (!url) return "";
  return `
    <p style="margin:14px 0 6px;color:#4b5563;"><strong>${escapeHtml(label)}</strong></p>
    <p style="margin:0 0 16px;word-break:break-all;"><a href="${escapeHtml(url)}" style="color:#1f2a60;text-decoration:underline;">${escapeHtml(url)}</a></p>`;
}

function formatDateBR(value) {
  if (!value) return "";
  const [year, month, day] = String(value).split("T")[0].split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function formatDateTimeBR(value) {
  if (!value) return "";
  const [datePart, timeRaw] = String(value).split("T");
  const date = formatDateBR(datePart);
  if (!timeRaw) return date;
  const [hour, minute] = timeRaw.split(":");
  if (!hour || !minute) return date;
  return `${date} às ${hour}:${minute}`;
}

function contactFooter() {
  return `
    <div style="border-top:1px solid #e5e7eb;margin-top:26px;padding-top:18px;">
      <p style="margin:0 0 8px;color:#374151;">Se precisar de qualquer coisa, conte comigo:</p>
      <p style="margin:0 0 6px;">📧 <a href="${CONTACTS.email}" style="color:#1f2a60;text-decoration:underline;">${CONTACTS.emailLabel}</a></p>
      <p style="margin:0 0 6px;">📱 <a href="${CONTACTS.whatsapp}" style="color:#1f2a60;text-decoration:underline;">${CONTACTS.whatsappLabel}</a></p>
      <p style="margin:0 0 14px;">📸 <a href="${CONTACTS.instagram}" style="color:#1f2a60;text-decoration:underline;">${CONTACTS.instagramLabel}</a></p>
      <p style="margin:18px 0 0;">Atenciosamente,<br /><strong>Resumindo Viagens</strong></p>
    </div>`;
}

function logoUrl() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://visto-seguro.vercel.app");
  return process.env.NEXT_PUBLIC_LOGO_URL || `${site}/logo.png`;
}


function emailTheme(templateId) {
  return "orlando";
}

function emailHeaderUrl(theme = "orlando") {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://app.resumindoviagens.com.br";
  return `${base.replace(/\/$/, "")}/email-headers/header-orlando-v38.png`;
}

function layout({ heading, greetingName, body, ctaLabel, ctaUrl, extraLinks, theme = "nova-york" }) {
  const header = emailHeaderUrl(theme);
  const themeLabel = theme === "orlando" ? "Orlando" : "Resumindo Viagens";
  const headerBlock = header
    ? `<div style="background:#1f2a60;"><img src="${header}" alt="Resumindo Viagens - ${themeLabel}" width="720" style="width:100%;max-width:720px;height:auto;display:block;border:0;outline:none;text-decoration:none;" /></div>`
    : `<div style="background:#ffffff;text-align:center;padding:26px 24px 12px;"><img src="${logoUrl()}" alt="Resumindo Viagens" style="max-width:210px;height:auto;display:inline-block;border:0;" /></div>`;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.62;max-width:720px;margin:0 auto;background:#f6f8fb;padding:0;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
    ${headerBlock}
    <div style="background:#ffffff;padding:28px;">
      <p style="margin:0 0 4px;color:#f59e0b;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:.4px;">${themeLabel}</p>
      <h2 style="color:#1f2a60;margin:0 0 20px;font-size:24px;line-height:1.25;">${heading}</h2>
      <p style="margin:0 0 16px;">Olá,</p>
      <p style="margin:0 0 18px;font-size:18px;"><strong>${escapeHtml(greetingName || "")}</strong></p>
      ${body}
      ${cta(ctaLabel, ctaUrl)}
      ${extraLinks || ""}
      ${contactFooter()}
    </div>
  </div>`;
}

function videoText(url) {
  return escapeHtml(url || "[INSERIR LINK DO VÍDEO]");
}

export function getEmailTemplate(templateId, client, options = {}) {
  const nomeCompleto = client?.name || "";
  const formLink = options.formLink || "[INSERIR LINK DO FORMULÁRIO]";
  const preparationLink = options.preparationLink || (formLink && formLink.includes("/acesso/") ? formLink.replace("/acesso/", "/preparacao/") : "[INSERIR LINK DA PÁGINA DE PREPARAÇÃO]");
  const feedbackLink = options.feedbackLink || "[INSERIR LINK DA PESQUISA DE SATISFAÇÃO]";
  const rastreio = options.rastreio || client?.passport_tracking_code || "[INSERIR CÓDIGO DE RASTREIO]";
  const templateTheme = emailTheme(templateId);
  const correiosBase = "https://rastreamento.correios.com.br/app/index.php";
  const correiosUrl = options.correiosUrl || (rastreio && !String(rastreio).includes("INSERIR") ? `${correiosBase}?objeto=${encodeURIComponent(rastreio)}` : correiosBase);
  const videoFormulario = options.videoFormulario || process.env.NEXT_PUBLIC_VIDEO_FORMULARIO || "[INSERIR LINK DO VÍDEO]";
  const videoEntrevista = options.videoEntrevista || process.env.NEXT_PUBLIC_VIDEO_ENTREVISTA || "[INSERIR LINK DO VÍDEO]";
  const videoCallDateTime = formatDateTimeBR(options.videoCallDateTime || options.video_call_date || client?.process_group?.video_call_date || client?.video_call_date);
  const passportPfDate = formatDateTimeBR(client?.passport_pf_datetime || options.passport_pf_datetime);
  const passportPfCity = client?.passport_pf_city || options.passport_pf_city || "[INSERIR CIDADE]";
  const passportPfLocation = client?.passport_pf_location || options.passport_pf_location || "[INSERIR LOCAL]";
  const feedbackService = client?.feedback_service || (client?.tipo_processo === "Passaporte" ? "passaporte" : (String(client?.tipo_processo || "").toLowerCase().includes("canad") ? "canadense" : "visto"));
  const passaporteInstrucoesUrl = options.passaporteInstrucoesUrl || `${options.origin || process.env.NEXT_PUBLIC_SITE_URL || ""}/passaporte-instrucoes`;

  const templates = {
    formulario: {
      subject: "Acesso ao seu formulário de visto americano",
      html: layout({
        theme: templateTheme,
        heading: "Acesso ao seu formulário de visto americano",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Seu formulário da Resumindo Viagens já está disponível para preenchimento.`)}
          ${paragraph(`Este não é o formulário do consulado. As informações enviadas por você serão analisadas, organizadas e traduzidas para o inglês antes de serem inseridas no sistema oficial.`)}
          ${paragraph(`<strong>🔐 Segurança</strong><br />O acesso é individual e protegido. Para entrar, será necessário informar CPF e data de nascimento.`)}
          ${paragraph(`<strong>📝 Preenchimento</strong><br />Você pode preencher com calma, salvar e continuar depois pelo mesmo link. Não é necessário finalizar de uma vez.`)}
          ${paragraph(`<strong>🎥 Orientações importantes</strong><br />Na primeira página do formulário você encontrará instruções detalhadas e um vídeo explicativo com todas as orientações para o preenchimento correto.`)}
          ${paragraph(`Recomendo assistir antes de iniciar — isso ajuda a evitar dúvidas e garante que o processo seja feito da melhor forma possível.`)}
          ${paragraph(`Ao concluir, clique em <strong>“Enviar definitivamente”</strong>. Após esse envio, o formulário será bloqueado para edição, mas será possível gerar um PDF com suas respostas.`)}
          ${paragraph(`<strong>👨‍👩‍👧‍👦 Processos em família</strong><br />Cada solicitante possui um link individual. Caso uma única pessoa esteja preenchendo para todos, basta acessar cada link correspondente.`)}`,
        ctaLabel: "Acessar meu formulário",
        ctaUrl: formLink,
        extraLinks: plainLinkBlock("Se preferir, copie e cole o link no navegador:", formLink)
      })
    },
    formulario_pendente: {
      subject: "Lembrete de preenchimento do formulário de visto",
      html: layout({
        theme: templateTheme,
        heading: "Lembrete de formulário pendente",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Passando apenas para lembrar que o preenchimento do formulário ainda está pendente.`)}
          ${paragraph(`Quanto antes as informações forem enviadas, mais rápido consigo analisar o conteúdo, esclarecer eventuais dúvidas e avançar para a etapa oficial do DS-160.`)}
          ${paragraph(`Recomendo preencher com calma, conferindo documentos, evitando abreviações e salvando o progresso sempre que necessário.`)}`,
        ctaLabel: "Acessar meu formulário",
        ctaUrl: formLink,
        extraLinks: plainLinkBlock("Se preferir, copie e cole o link no navegador:", formLink)
      })
    },
    formulario_recebido: {
      subject: "Recebimento do seu formulário de visto",
      html: layout({
        theme: templateTheme,
        heading: "Formulário recebido / em análise",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Recebi o seu formulário preenchido e já estou iniciando a análise das informações.`)}
          ${paragraph(`Agora vou organizar os dados, revisar os pontos necessários e realizar o preenchimento do formulário oficial do consulado.`)}
          ${paragraph(`Caso seja necessário complementar alguma informação ou esclarecer algum detalhe, entro em contato com você.`)}
          ${paragraph(`Assim que essa etapa estiver concluída, seguiremos para a emissão da taxa consular e agendamento do processo.`)}`
      })
    },
    taxa_paga: {
      subject: "Taxa consular confirmada — próxima etapa do seu processo",
      html: layout({
        theme: templateTheme,
        heading: "Taxa consular confirmada — próxima etapa",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`A taxa consular já foi identificada no sistema e agora podemos avançar para a próxima etapa do seu processo.`)}
          ${paragraph(`Vou verificar as datas disponíveis conforme a cidade escolhida e a disponibilidade do sistema.`)}
          ${paragraph(`Em seguida, entro em contato com você por WhatsApp para te apresentar as opções e realizarmos a escolha da melhor data.`)}
          ${paragraph(`Após a sua confirmação, o agendamento será realizado e você receberá as orientações completas para o comparecimento.`)}`
      })
    },
    instrucoes: {
      subject: "Agendamento confirmado — acesse suas orientações",
      html: layout({
        theme: templateTheme,
        heading: "Agendamento confirmado — orientações importantes",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Seu agendamento foi realizado com sucesso.`)}
          ${paragraph(`Estou te encaminhando as orientações completas e personalizadas para seu comparecimento ao CASV e/ou Consulado/Embaixada em uma página protegida da Resumindo Viagens.`)}
          ${paragraph(`<strong>🔐 Acesso protegido</strong><br />O material é exclusivo para você. Para acessar, confirme CPF e data de nascimento.`)}
          ${paragraph(`<strong>📌 Importante</strong><br />Leia as orientações com atenção. Elas explicam documentos, comparecimento, entrevista, foto, cuidados e pontos que costumam gerar dúvidas.`)}
          ${paragraph(`<strong>⚠️ Não compartilhe</strong><br />Este conteúdo faz parte da assessoria contratada e é personalizado para seu processo.`)}
        `,
        ctaLabel: "Acessar minhas orientações",
        ctaUrl: preparationLink,
        extraLinks: plainLinkBlock("Copiar o link da página protegida:", preparationLink)
      })
    },
    pre_entrevista: {
      subject: "Prepare-se antes da nossa videochamada",
      html: layout({
        theme: templateTheme,
        heading: "Prepare-se antes da nossa videochamada",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Como a sua entrevista está se aproximando, entramos na etapa de preparação final.`)}
          ${paragraph(`Antes da nossa conversa, acesse a página protegida abaixo, assista ao vídeo de preparação e leia as orientações principais.`)}
          ${paragraph(`Isso tornará nossa videochamada mais objetiva, pois poderemos focar nos pontos específicos do seu caso e nas dúvidas que permanecerem.`)}
          ${paragraph(`<strong>🔐 Acesso protegido</strong><br />A página é exclusiva para você e será validada com CPF e data de nascimento.`)}
        `,
        ctaLabel: "Acessar preparação para entrevista",
        ctaUrl: preparationLink,
        extraLinks: plainLinkBlock("Copiar o link da preparação:", preparationLink)
      })
    },
    videochamada_agendada: {
      subject: "Videochamada agendada — preparação para sua entrevista",
      html: layout({
        theme: templateTheme,
        heading: "Videochamada agendada",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Mais uma etapa do seu processo foi concluída: a nossa videochamada de preparação foi agendada.`)}
          ${paragraph(`<strong>📅 Data e horário:</strong><br />${escapeHtml(videoCallDateTime || "Data e horário serão confirmados pela Resumindo Viagens.")}`)}
          ${paragraph(`No horário indicado, entraremos em contato informando o link de acesso pelo Zoom ou outra forma combinada, como chamada pelo WhatsApp.`)}
          ${paragraph(`Caso ocorra alguma indisponibilidade ou problema técnico, ajustaremos a melhor forma de contato no momento, sem prejuízo à orientação.`)}
          ${paragraph(`Antes da chamada, se possível, acesse a página de preparação e revise as orientações principais.`)}
        `,
        ctaLabel: "Acessar preparação para entrevista",
        ctaUrl: preparationLink,
        extraLinks: plainLinkBlock("Copiar o link da preparação:", preparationLink)
      })
    },
    aprovado: {
      subject: "Parabéns! Seu visto americano foi aprovado",
      html: layout({
        theme: templateTheme,
        heading: "Parabéns! Seu visto americano foi aprovado",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Que ótima notícia! Fico muito feliz pela aprovação do seu visto americano 😊`)}
          ${paragraph(`Obrigado pela confiança no meu trabalho durante todo esse processo.`)}
          ${paragraph(`Agora é necessário aguardar a emissão do visto e a entrega ou retirada do passaporte, conforme a modalidade escolhida.`)}
          ${paragraph(`Assim que houver atualização de rastreio ou liberação, seguimos acompanhando juntos os próximos passos.`)}
          ${paragraph(`<strong>✈️ Próximos planos</strong><br />Quando começar a organizar sua viagem, posso te auxiliar também com passagens, hospedagem, ingressos e outros serviços para que tudo seja feito com segurança e tranquilidade.`)}`
      })
    },
    negado: {
      subject: "Sobre o resultado da sua entrevista de visto",
      html: layout({
        theme: templateTheme,
        heading: "Sobre o resultado da sua entrevista de visto",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Sinto muito pelo resultado da sua entrevista.`)}
          ${paragraph(`Sei que é uma situação frustrante, principalmente após todo o cuidado com a preparação.`)}
          ${paragraph(`A decisão final é sempre do consulado americano e, na maioria dos casos, não há possibilidade de recurso dentro do próprio processo.`)}
          ${paragraph(`Se você quiser, podemos conversar com calma sobre como foi a entrevista, quais perguntas foram feitas e avaliar juntos se faz sentido uma nova tentativa no futuro, em um momento mais adequado.`)}
          ${paragraph(`Cada caso pode evoluir com o tempo, e uma nova solicitação bem planejada pode trazer um resultado diferente.`)}`
      })
    },
    rastreio: {
      subject: "Rastreio do seu passaporte — acompanhe a entrega",
      html: layout({
        theme: templateTheme,
        heading: "Rastreio do seu passaporte",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`O seu passaporte já foi enviado e você pode acompanhar a entrega pelo código de rastreio abaixo:`)}
          <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1f2a60;">📦 ${escapeHtml(rastreio)}</p>
          ${paragraph(`Assim que receber o passaporte, por favor me avise por aqui 👍`)}`,
        ctaLabel: "Acompanhar entrega",
        ctaUrl: correiosUrl
      })
    },
    passaporte_recebido: {
      subject: "Passaporte recebido — conte conosco para os próximos passos",
      html: layout({
        theme: templateTheme,
        heading: "Passaporte recebido — próximos passos",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Fico muito feliz em saber que o seu passaporte foi recebido corretamente 😊`)}
          ${paragraph(`Obrigado pela confiança na Resumindo Viagens durante todo esse processo. É uma satisfação poder participar de um momento tão importante dos seus planos.`)}
          ${paragraph(`<strong>✈️ Próximos passos</strong><br />Quando começar a organizar sua viagem, posso te auxiliar também com passagens, hospedagem, ingressos e outros serviços, garantindo praticidade e segurança em cada etapa.`)}
          ${paragraph(`<strong>🌎 Outras oportunidades</strong><br />Agora que você possui o visto americano, também é possível solicitar o visto eletrônico canadense, de forma mais simples e sem necessidade de entrevista.`)}
          ${paragraph(`<strong>🤝 Indicações</strong><br />Se conhecer alguém que esteja pensando em tirar o visto, fico à disposição para ajudar. A sua indicação é sempre muito bem-vinda.`)}`
      })
    },
    pesquisa_satisfacao: {
      subject: "Sua opinião sobre a experiência com a Resumindo Viagens",
      html: layout({
        theme: templateTheme,
        heading: "Pesquisa rápida de satisfação",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Seu processo foi concluído e gostaríamos muito de ouvir sua opinião sobre a experiência com a Resumindo Viagens.`)}
          ${paragraph(`A pesquisa é rápida, segura e leva menos de 1 minuto.`)}
          ${paragraph(`Sua resposta nos ajuda a aprimorar o atendimento e, caso você autorize, poderá ser utilizada parcialmente como depoimento, sem exposição de dados sensíveis.`)}
          ${paragraph(`<strong>🔐 Acesso protegido</strong><br />O link é individual e vinculado ao seu atendimento.`)}
        `,
        ctaLabel: "Responder pesquisa de satisfação",
        ctaUrl: feedbackLink,
        extraLinks: plainLinkBlock("Se preferir, copie e cole o link no navegador:", feedbackLink)
      })
    },


    passaporte_docs: {
      subject: "Documentos necessários para emissão do passaporte",
      html: layout({
        theme: templateTheme,
        heading: "Documentos necessários para emissão do passaporte",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Para iniciarmos a assessoria de emissão do passaporte brasileiro, preciso que você encaminhe os documentos e informações necessários para o cadastro.`)}
          ${paragraph(`<strong>Documentos comuns:</strong><br />• Documento de identificação original;<br />• CPF;<br />• Certidão de casamento/divórcio, se houve alteração de nome;<br />• Passaporte anterior, se houver;<br />• Comprovante de endereço;<br />• Para menores, documentos dos pais e certidão da criança.`)}
          ${paragraph(`Se o caso envolver menor de idade ou alteração de nome, posso solicitar documentos complementares para evitar problemas no atendimento da Polícia Federal.`)}
          ${cta("Falar pelo WhatsApp", CONTACTS.whatsapp)}
        `
      })
    },

    passaporte_cadastro_taxa: {
      subject: "Passaporte — cadastro realizado e próxima etapa",
      html: layout({
        theme: templateTheme,
        heading: "Cadastro realizado — passaporte",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`O cadastro para emissão do passaporte foi realizado.`)}
          ${paragraph(`Com a guia paga/compensada, já podemos seguir para o agendamento do atendimento na Polícia Federal, conforme disponibilidade do sistema.`)}
          ${paragraph(`Assim que o horário for confirmado, encaminharei as informações completas de cidade, unidade, data, hora e instruções.`)}
        `
      })
    },

    passaporte_agendado: {
      subject: "Passaporte — atendimento na Polícia Federal agendado",
      html: layout({
        theme: templateTheme,
        heading: "Atendimento na Polícia Federal agendado",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Seu atendimento para emissão do passaporte foi agendado.`)}
          ${paragraph(`<strong>Cidade:</strong> ${passportPfCity}<br /><strong>Local:</strong> ${passportPfLocation}<br /><strong>Data e hora:</strong> ${passportPfDate || "[INSERIR DATA E HORA]"}`)}
          ${paragraph(`Confira cuidadosamente data, hora e local. O agendamento possui limite de reagendamentos e a ausência pode prejudicar o planejamento da viagem.`)}
        `
      })
    },

    passaporte_instrucoes: {
      subject: "Passaporte — instruções para comparecimento à Polícia Federal",
      html: layout({
        theme: templateTheme,
        heading: "Instruções para comparecimento à Polícia Federal",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Estou encaminhando as orientações para o dia do atendimento do passaporte.`)}
          ${paragraph(`Leia com atenção antes de comparecer. A Polícia Federal não realiza impressão de documentos no local, portanto revise tudo antes de sair de casa.`)}
          ${paragraph(`<strong>Resumo importante:</strong><br />• Leve os documentos originais;<br />• Imprima protocolo, comprovante de agendamento e autorizações quando aplicável;<br />• Para menores, ambos os pais devem comparecer ou a autorização deve estar adequada;<br />• Crianças menores de 5 anos devem levar foto 5x7 impressa.`)}
          ${paragraph(`As instruções completas estão disponíveis no botão abaixo.`)}
        `,
        ctaLabel: "Ver instruções completas",
        ctaUrl: passaporteInstrucoesUrl,
        extraLinks: plainLinkBlock("Copiar link das instruções:", passaporteInstrucoesUrl)
      })
    },

    passaporte_pos_pf: {
      subject: "Passaporte — atendimento realizado na Polícia Federal",
      html: layout({
        theme: templateTheme,
        heading: "Atendimento realizado — próxima etapa",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Agora que o atendimento na Polícia Federal foi realizado, normalmente o passaporte fica disponível em aproximadamente 8 dias.`)}
          ${paragraph(`A Resumindo Viagens acompanhará a etapa final e avisará você assim que houver informação de disponibilidade para retirada.`)}
        `
      })
    },

    passaporte_disponivel: {
      subject: "Passaporte disponível para retirada",
      html: layout({
        theme: templateTheme,
        heading: "Passaporte disponível para retirada",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Seu passaporte já consta como disponível para retirada.`)}
          ${paragraph(`Agradecemos a confiança na Resumindo Viagens para esta assessoria.`)}
          ${paragraph(`Permanecemos à disposição também para passagens aéreas, hotéis, seguro viagem e assessoria para vistos americanos, canadenses, australianos, mexicanos e outros destinos internacionais.`)}
          ${cta("Falar com a Resumindo Viagens", CONTACTS.whatsapp)}
        `
      })
    },

    passaporte_pesquisa: {
      subject: "Pesquisa de satisfação — assessoria de passaporte",
      html: layout({
        theme: templateTheme,
        heading: "Pesquisa de satisfação — passaporte",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`A assessoria para emissão do seu passaporte foi concluída e gostaríamos muito de conhecer sua experiência.`)}
          ${paragraph(`A pesquisa contém perguntas específicas sobre orientação de documentos, cadastro, taxa, agendamento na Polícia Federal, comparecimento e acompanhamento até a retirada.`)}
          ${paragraph(`Sua resposta é rápida e ajuda a Resumindo Viagens a aperfeiçoar continuamente este serviço.`)}
        `,
        ctaLabel: "Responder pesquisa",
        ctaUrl: feedbackLink,
        extraLinks: plainLinkBlock("Copiar link da pesquisa:", feedbackLink)
      })
    },

    canada_pesquisa: {
      subject: "Pesquisa de satisfação — visto canadense",
      html: layout({
        theme: templateTheme,
        heading: "Pesquisa de satisfação — visto canadense",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Seu atendimento relacionado ao visto canadense foi concluído e gostaríamos muito de ouvir sua opinião.`)}
          ${paragraph(`A pesquisa é rápida e sua resposta nos ajuda a aprimorar a assessoria da Resumindo Viagens.`)}
        `,
        ctaLabel: "Responder pesquisa",
        ctaUrl: feedbackLink,
        extraLinks: plainLinkBlock("Copiar link da pesquisa:", feedbackLink)
      })
    },


    agenda_visto: {
      subject: "Compromisso(s) do seu processo de visto — Resumindo Viagens",
      html: layout({
        theme: templateTheme,
        heading: "Compromisso(s) do seu processo",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Estou encaminhando o(s) compromisso(s) do seu processo de visto.`)}
          ${paragraph(`Este email pode conter arquivos de calendário (.ics) para adicionar CASV e/ou Consulado à sua agenda.`)}
          ${paragraph(`<strong>Importante:</strong> o alerta se baseia na informação cadastrada no sistema no momento do envio. Confira sempre os documentos oficiais e eventuais atualizações.`)}
          ${paragraph(`Antes do comparecimento, revise as orientações já enviadas pela Resumindo Viagens.`)}
        `
      })
    },

    lembrete_visto: {
      subject: "Lembrete: compromisso do visto se aproxima",
      html: layout({
        theme: templateTheme,
        heading: "Lembrete de compromisso",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Seu compromisso do processo de visto está se aproximando.`)}
          ${paragraph(`Recomendamos revisar novamente as orientações enviadas pela Resumindo Viagens e conferir documentos, horários e endereço.`)}
          ${paragraph(`Este lembrete é enviado para reforçar sua organização e tranquilidade na etapa presencial.`)}
        `
      })
    },

    agenda_videochamada: {
      subject: "Videochamada agendada — Resumindo Viagens",
      html: layout({
        theme: templateTheme,
        heading: "Videochamada agendada",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Sua videochamada com a Resumindo Viagens foi agendada.`)}
          ${paragraph(`Este email pode conter arquivo de calendário (.ics) para adicionar a videochamada à sua agenda.`)}
          ${paragraph(`Antes da conversa, revise as orientações já enviadas e anote suas dúvidas.`)}
        `
      })
    },

    lembrete_videochamada: {
      subject: "Lembrete: videochamada com a Resumindo Viagens",
      html: layout({
        theme: templateTheme,
        heading: "Lembrete de videochamada",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Passando para lembrar da sua videochamada com a Resumindo Viagens.`)}
          ${paragraph(`Aproveite para revisar as orientações e separar suas dúvidas para conversarmos com objetividade.`)}
        `
      })
    },

    passaporte_agenda_pf: {
      subject: "Passaporte — compromisso na Polícia Federal",
      html: layout({
        theme: templateTheme,
        heading: "Compromisso na Polícia Federal",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Seu atendimento para emissão de passaporte foi agendado.`)}
          ${paragraph(`Este email pode conter arquivo de calendário (.ics) para adicionar o compromisso à sua agenda.`)}
          ${paragraph(`Antes de comparecer, revise as instruções completas da Resumindo Viagens.`)}
        `,
        ctaLabel: "Ver instruções completas",
        ctaUrl: passaporteInstrucoesUrl,
        extraLinks: plainLinkBlock("Copiar link das instruções:", passaporteInstrucoesUrl)
      })
    },

    passaporte_lembrete_pf: {
      subject: "Lembrete: atendimento na Polícia Federal",
      html: layout({
        theme: templateTheme,
        heading: "Lembrete de atendimento na Polícia Federal",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Seu atendimento na Polícia Federal está se aproximando.`)}
          ${paragraph(`Revise os documentos, confira endereço, horário e leia novamente as instruções completas antes de sair de casa.`)}
        `,
        ctaLabel: "Ver instruções completas",
        ctaUrl: passaporteInstrucoesUrl,
        extraLinks: plainLinkBlock("Copiar link das instruções:", passaporteInstrucoesUrl)
      })
    },


    foto_instrucoes: {
      subject: "Instruções para envio da foto do visto americano",
      html: layout({
        theme: templateTheme,
        heading: "Instruções para envio da foto",
        greetingName: nomeCompleto,
        body: `
          ${paragraph(`Para dar continuidade ao seu processo, precisamos que a foto seja enviada seguindo o padrão adequado para visto americano.`)}
          ${paragraph(`<strong>Orientações principais:</strong><br />• foto recente, colorida e nítida;<br />• fundo branco ou bem claro;<br />• rosto centralizado, sem óculos escuros, bonés ou acessórios que prejudiquem a identificação;<br />• cabelo sem cobrir o rosto;<br />• expressão neutra ou sorriso discreto;<br />• boa iluminação, sem sombra forte.`)}
          ${paragraph(`A foto será analisada antes do uso, para evitar problemas no processo.`)}
          ${paragraph(`Se tiver dúvida, envie pelo WhatsApp antes de tirar a foto definitiva.`)}
          ${cta("Falar pelo WhatsApp", CONTACTS.whatsapp)}
        `
      }),
      text: `Olá, ${nomeCompleto}.\n\nPara dar continuidade ao seu processo, precisamos que a foto seja enviada seguindo o padrão adequado para visto americano.\n\nOrientações principais:\n- foto recente, colorida e nítida;\n- fundo branco ou bem claro;\n- rosto centralizado;\n- sem óculos escuros, bonés ou acessórios;\n- cabelo sem cobrir o rosto;\n- boa iluminação.\n\nSe tiver dúvida, envie pelo WhatsApp antes de tirar a foto definitiva.`
    },
  };
  const selected = templates[templateId];
  if (!selected) throw new Error("Modelo de email não encontrado.");

  const text = selected.html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { ...selected, text, toName: nomeCompleto };
}
