const filters=document.querySelectorAll('.filter');const cards=document.querySelectorAll('.card');filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;cards.forEach(c=>c.style.display=f==='Todos'||c.dataset.category===f?'':'none')}));const modal=document.getElementById('modal'),modalTitle=document.getElementById('modalTitle'),modalShort=document.getElementById('modalShort'),modalImg=document.getElementById('modalImg'),modalBullets=document.getElementById('modalBullets'),modalClosing=document.getElementById('modalClosing'),modalWhats=document.getElementById('modalWhats');document.querySelectorAll('.more-btn').forEach(btn=>btn.addEventListener('click',()=>{const title=btn.dataset.title;modalTitle.textContent=title;modalShort.textContent=btn.dataset.short;modalImg.src=btn.dataset.img;modalImg.alt=title;modalBullets.innerHTML=JSON.parse(btn.dataset.bullets).map(i=>`<li>${i}</li>`).join('');modalClosing.textContent=btn.dataset.closing;modalWhats.href=`https://wa.me/5511981210932?text=${encodeURIComponent('Olá, gostaria de mais informações sobre: '+title)}`;modal.classList.add('open');modal.setAttribute('aria-hidden','false')}));function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}document.getElementById('modalClose').addEventListener('click',closeModal);document.getElementById('modalBackdrop').addEventListener('click',closeModal);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

/* =========================================================
   CHATBOX V4.1 — SUPABASE, TRIAGEM E ATENDIMENTO HUMANO
   ========================================================= */
(() => {
  const $ = selector => document.querySelector(selector);
  const WHATSAPP_DEFAULT = '5511981210932';
  const STORAGE_KEY = 'resumindo_live_chat_v41';
  const VERSION = 'painel-chat-v4.1-imagens-preservadas';

  const launcher = $('#chatLauncher');
  const chatbox = $('#chatbox');
  const closeBtn = $('#chatClose');
  const form = $('#chatForm');
  const input = $('#chatInput');
  const sendBtn = $('#chatSend');
  const messagesEl = $('#chatMessages');
  const quickEl = $('#chatQuick');
  const endBtn = $('#chatEnd');
  const whatsappBtn = $('#chatWhatsApp');
  const humanBtn = $('#chatHuman');
  const triageBtn = $('#chatTriage');
  const nameInput = $('#chatName');
  const statusEl = $('#chatStatus');
  const modeEl = $('#chatMode');

  if (!launcher || !chatbox || !form || !input || !messagesEl) return;

  let db = null;
  let sessionId = null;
  let sessionStatus = 'bot';
  let channel = null;
  let settings = {};
  let triageQuestions = [];
  let triageState = null;
  let busy = false;
  let finalizing = false;
  let conversationStarted = false;
  const seenMessages = new Set();

  const escapeText = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[character]);

  const formatTime = value => {
    try {
      return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
    } catch {
      return '';
    }
  };

  function safeStoredState() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function setStatus(text = '', type = '') {
    statusEl.textContent = text;
    statusEl.className = `chatbox-status ${type}`.trim();
  }

  function scrollToBottom() {
    requestAnimationFrame(() => { messagesEl.scrollTop = messagesEl.scrollHeight; });
  }

  function whatsappUrl(text = '') {
    const number = String(settings.whatsapp_number || WHATSAPP_DEFAULT).replace(/\D/g, '') || WHATSAPP_DEFAULT;
    return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  }

  function linkifySafeText(text) {
    const safe = escapeText(text);
    return safe.replace(/https:\/\/wa\.me\/\d+(?:\?[^\s<]*)?/g, match =>
      `<a class="chat-inline-whatsapp" href="${match}" target="_blank" rel="noopener">abrir WhatsApp</a>`
    );
  }

  function renderMessage(message) {
    if (message.id && seenMessages.has(message.id)) return;
    if (message.id) seenMessages.add(message.id);

    const row = document.createElement('div');
    const cssClass = message.sender_type === 'visitor'
      ? 'user'
      : message.sender_type === 'system'
        ? 'system'
        : 'assistant';
    row.className = `chat-message ${cssClass}`;

    const label = message.sender_type === 'human'
      ? '<span class="human-label">Atendente</span>'
      : '';
    row.innerHTML = `<div class="chat-bubble">${label}${linkifySafeText(message.content)}<span class="chat-time">${formatTime(message.created_at || message.timestamp)}</span></div>`;
    messagesEl.appendChild(row);
    scrollToBottom();
  }

  function localMessage(content, senderType = 'system') {
    renderMessage({ sender_type: senderType, content, created_at: new Date().toISOString() });
  }

  function setBusy(value) {
    busy = value;
    const locked = value || sessionStatus === 'closed';
    sendBtn.disabled = locked;
    input.disabled = locked;
    quickEl.querySelectorAll('button').forEach(button => { button.disabled = locked; });
  }

  function openChat() {
    chatbox.classList.add('open');
    chatbox.setAttribute('aria-hidden', 'false');
    launcher.setAttribute('aria-expanded', 'true');
    if (!input.disabled) input.focus();
    scrollToBottom();
  }

  function closeChat() {
    chatbox.classList.remove('open');
    chatbox.setAttribute('aria-hidden', 'true');
    launcher.setAttribute('aria-expanded', 'false');
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, { cache: 'no-store', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Falha ao acessar ${url}.`);
    return data;
  }

  async function initialize() {
    const config = await fetchJson('/api/config');
    if (!config.configured) {
      setStatus('O atendimento dinâmico ainda não foi configurado.', 'error');
      modeEl.textContent = 'Configuração pendente';
      return;
    }
    if (!window.supabase?.createClient) throw new Error('A biblioteca do atendimento não foi carregada. Atualize a página.');

    db = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey);
    let { data: { session }, error: sessionError } = await db.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      const result = await db.auth.signInAnonymously();
      if (result.error) throw result.error;
      session = result.data.session;
    }
    if (!session?.user?.id) throw new Error('Não foi possível criar a sessão segura do visitante.');

    const stored = safeStoredState();
    sessionId = stored?.userId === session.user.id && stored?.sessionId
      ? stored.sessionId
      : crypto.randomUUID();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, userId: session.user.id, version: VERSION }));

    const { error: sessionCreateError } = await db.rpc('create_chat_session', {
      p_session_id: sessionId,
      p_name: nameInput.value || null,
      p_page_url: location.href
    });
    if (sessionCreateError) throw sessionCreateError;

    await Promise.all([loadSettings(), loadTriageQuestions(), loadMessages(), loadSession()]);
    subscribeToUpdates();
  }

  async function loadSettings() {
    const { data, error } = await db.from('chat_settings').select('*');
    if (error) throw error;
    settings = Object.fromEntries((data || []).map(item => [item.key, item.value]));
    whatsappBtn.href = whatsappBtn.dataset.triageHref || whatsappUrl();
    updateHumanButton();
  }

  async function loadTriageQuestions() {
    const { data, error } = await db.from('triage_questions').select('*').eq('active', true).order('sort_order');
    if (error) throw error;
    triageQuestions = data || [];
  }

  async function loadMessages() {
    const { data, error } = await db.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at');
    if (error) throw error;
    messagesEl.innerHTML = '';
    seenMessages.clear();
    if (data?.length) {
      data.forEach(renderMessage);
      conversationStarted = data.some(message => message.sender_type === 'visitor');
    } else {
      localMessage(settings.welcome_message || 'Olá! Sou o Chatbox Resumindo Viagens. Como posso ajudar?', 'bot');
      localMessage('Para sua segurança, não envie CPF, número de passaporte, documentos, senhas ou comprovantes.', 'system');
    }
  }

  function updateHumanButton() {
    const available = settings.human_available === true;
    const shouldShow = available && !['human', 'waiting_human', 'closed'].includes(sessionStatus);
    humanBtn.classList.toggle('hidden', !shouldShow);
  }

  async function loadSession() {
    const { data, error } = await db.from('chat_sessions').select('*').eq('id', sessionId).maybeSingle();
    if (error) throw error;
    if (!data) return;

    sessionStatus = data.status;
    const labels = {
      bot: 'Assistente virtual',
      waiting_human: 'Aguardando atendente',
      human: 'Atendente ao vivo',
      closed: 'Atendimento encerrado'
    };
    modeEl.textContent = labels[sessionStatus] || '';
    const closed = sessionStatus === 'closed';
    input.disabled = closed;
    sendBtn.disabled = closed;
    endBtn.disabled = closed;
    updateHumanButton();
  }

  function subscribeToUpdates() {
    if (channel) db.removeChannel(channel);
    channel = db.channel(`visitor-${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sessionId}` }, payload => renderMessage(payload.new))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_sessions', filter: `id=eq.${sessionId}` }, () => loadSession().catch(console.error))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_settings' }, () => loadSettings().catch(console.error))
      .subscribe();
  }

  async function accessToken() {
    const { data, error } = await db.auth.getSession();
    if (error) throw error;
    const token = data.session?.access_token;
    if (!token) throw new Error('A sessão expirou. Atualize a página para continuar.');
    return token;
  }

  async function ask(text) {
    const question = String(text || '').trim().slice(0, 1200);
    if (!question || busy || sessionStatus === 'closed') return;
    if (triageState) return acceptTriageText(question);

    conversationStarted = true;
    setBusy(true);
    input.value = '';
    input.style.height = 'auto';
    setStatus(sessionStatus === 'human' || sessionStatus === 'waiting_human' ? 'Enviando ao atendente...' : 'Preparando resposta...');

    try {
      const token = await accessToken();
      const data = await fetchJson('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId, question })
      });
      if (data.userMessage) renderMessage(data.userMessage);
      if (data.assistantMessage) renderMessage(data.assistantMessage);
      setStatus(data.humanMode ? 'Mensagem enviada ao atendente.' : '');
    } catch (error) {
      setStatus(error.message, 'error');
    } finally {
      setBusy(false);
      if (!input.disabled) input.focus();
    }
  }

  function eligibleTriageQuestions() {
    return triageQuestions.filter(question => {
      if (!question.condition_question_key) return true;
      return (question.condition_values || []).includes(triageState.answers[question.condition_question_key]);
    });
  }

  function startTriage() {
    if (busy || sessionStatus === 'closed') return;
    triageState = { answers: {}, labels: {}, current: null };
    conversationStarted = true;
    localMessage('Vamos fazer uma triagem rápida. As respostas poderão seguir preenchidas para o WhatsApp, evitando repetição.', 'system');
    showNextTriageQuestion();
  }

  function showNextTriageQuestion() {
    const question = eligibleTriageQuestions().find(item => !Object.prototype.hasOwnProperty.call(triageState.answers, item.question_key));
    if (!question) return finishTriage();

    triageState.current = question;
    localMessage(question.prompt, 'bot');
    if (question.help_text) localMessage(question.help_text, 'system');
    quickEl.innerHTML = '';

    if (question.input_type === 'choice') {
      (question.options || []).forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = option.label;
        button.addEventListener('click', () => saveTriageAnswer(option.value, option.label));
        quickEl.appendChild(button);
      });
      if (!question.required) addSkipButton();
      addCancelTriageButton();
      input.placeholder = 'Escolha uma opção acima';
      input.disabled = true;
      sendBtn.disabled = true;
    } else {
      if (!question.required) addSkipButton();
      addCancelTriageButton();
      input.disabled = false;
      sendBtn.disabled = false;
      input.placeholder = question.input_type === 'month_year'
        ? 'Digite mês e ano, por exemplo 05/2026'
        : 'Digite sua resposta';
      input.focus();
    }
  }

  function addSkipButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'triage-skip';
    button.textContent = 'Pular esta pergunta';
    button.addEventListener('click', () => saveTriageAnswer(null, 'Não informado'));
    quickEl.appendChild(button);
  }

  function addCancelTriageButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'triage-cancel';
    button.textContent = 'Cancelar triagem';
    button.addEventListener('click', cancelTriage);
    quickEl.appendChild(button);
  }

  function cancelTriage() {
    triageState = null;
    restoreQuickButtons();
    input.disabled = sessionStatus === 'closed';
    sendBtn.disabled = sessionStatus === 'closed';
    input.placeholder = 'Digite sua dúvida...';
    setStatus('Triagem cancelada. Você pode continuar conversando normalmente.');
  }

  function acceptTriageText(text) {
    const question = triageState.current;
    const clean = String(text || '').trim();
    if (!clean) return;
    if (question.input_type === 'month_year' && !/^(0[1-9]|1[0-2])\/\d{4}$/.test(clean)) {
      setStatus('Use o formato mês/ano, por exemplo 05/2026.', 'error');
      return;
    }
    saveTriageAnswer(clean, clean);
    input.value = '';
  }

  function saveTriageAnswer(value, label) {
    const question = triageState.current;
    triageState.answers[question.question_key] = value;
    triageState.labels[question.question_key] = label;
    localMessage(label, 'visitor');
    setStatus('');
    showNextTriageQuestion();
  }

  async function finishTriage() {
    const applicable = eligibleTriageQuestions();
    const lines = applicable
      .filter(question => question.include_in_whatsapp && triageState.labels[question.question_key])
      .map(question => `${question.whatsapp_label}: ${triageState.labels[question.question_key]}`);
    const code = `RV-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const summary = lines.join('\n');
    const stateToSubmit = triageState;

    setStatus('Salvando a triagem...');
    const { error } = await db.rpc('submit_chat_triage', {
      p_session_id: sessionId,
      p_answers: stateToSubmit.answers,
      p_summary: summary,
      p_reference_code: code
    });
    if (error) {
      setStatus(`Não foi possível salvar a triagem: ${error.message}`, 'error');
      return;
    }

    triageState = null;
    restoreQuickButtons();
    input.disabled = false;
    sendBtn.disabled = false;
    input.placeholder = 'Digite sua dúvida...';

    const message = `Olá! Vim pelo Chatbox Resumindo Viagens e concluí a triagem.\n\n${summary}\n\nCódigo da triagem: ${code}\n\nGostaria de receber os próximos passos e valores.`;
    const url = whatsappUrl(message);
    whatsappBtn.href = url;
    whatsappBtn.dataset.triageHref = url;
    whatsappBtn.textContent = 'Continuar no WhatsApp';
    localMessage(`Pronto! Sua triagem foi organizada com o código ${code}. Ao abrir o WhatsApp, as respostas já estarão preenchidas; basta conferir e enviar.`, 'system');
    setStatus('Triagem concluída.', 'success');
  }

  function restoreQuickButtons() {
    quickEl.innerHTML = `
      <button type="button" data-question="Como funciona a assessoria para o primeiro visto americano?">Primeiro visto</button>
      <button type="button" data-question="Como funciona a renovação do visto americano?">Renovação</button>
      <button type="button" data-question="O que é o DS-160?">O que é DS-160?</button>
      <button type="button" id="chatTriageInline">Iniciar triagem</button>`;
    $('#chatTriageInline')?.addEventListener('click', startTriage);
  }

  async function requestHuman() {
    if (settings.human_available !== true) {
      setStatus('Não há atendente disponível no chat neste momento. Você pode continuar com a IA ou pelo WhatsApp.', 'error');
      return;
    }
    const { error } = await db.rpc('request_chat_human', { p_session_id: sessionId });
    if (error) setStatus(error.message, 'error');
    else {
      sessionStatus = 'waiting_human';
      updateHumanButton();
      setStatus('Pedido enviado. Aguarde nesta conversa.', 'success');
    }
  }

  async function finalize(reason, { silent = false, keepalive = false } = {}) {
    if (finalizing || sessionStatus === 'closed') return true;
    finalizing = true;
    if (!silent) setStatus('Encerrando e enviando o resumo...');
    try {
      const token = await accessToken();
      const data = await fetchJson('/api/end-session', {
        method: 'POST',
        keepalive,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sessionId,
          name: nameInput.value.trim().slice(0, 60),
          reason,
          page: location.href,
          endedAt: new Date().toISOString()
        })
      });
      sessionStatus = 'closed';
      await loadSession();
      if (!silent) setStatus(data.emailSent === false ? 'Atendimento encerrado.' : 'Atendimento encerrado e resumo enviado.', 'success');
      return true;
    } catch (error) {
      if (!silent) setStatus(error.message, 'error');
      return false;
    } finally {
      finalizing = false;
    }
  }

  function openWhatsAppAndClose(event) {
    event.preventDefault();
    const url = event.currentTarget.href || whatsappUrl();
    window.open(url, '_blank', 'noopener');
    if (conversationStarted && sessionStatus !== 'closed') {
      finalize('encaminhado para atendimento pelo WhatsApp', { silent: true, keepalive: true });
    }
  }

  launcher.addEventListener('click', () => chatbox.classList.contains('open') ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);
  form.addEventListener('submit', event => { event.preventDefault(); ask(input.value); });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 100)}px`;
  });
  quickEl.addEventListener('click', event => {
    const button = event.target.closest('[data-question]');
    if (button) ask(button.dataset.question);
  });
  nameInput.addEventListener('change', async () => {
    if (!db || !sessionId) return;
    await db.rpc('update_own_chat_name', { p_session_id: sessionId, p_name: nameInput.value });
  });
  triageBtn?.addEventListener('click', startTriage);
  humanBtn?.addEventListener('click', requestHuman);
  endBtn.addEventListener('click', () => finalize('encerrado pelo visitante'));
  whatsappBtn.addEventListener('click', openWhatsAppAndClose);

  document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
    if (link !== whatsappBtn) link.addEventListener('click', event => {
      if (!conversationStarted || sessionStatus === 'closed') return;
      const url = link.href;
      event.preventDefault();
      window.open(url, link.target || '_blank', 'noopener');
      finalize('encaminhado para atendimento pelo WhatsApp', { silent: true, keepalive: true });
    });
  });

  initialize().catch(error => {
    modeEl.textContent = 'Atendimento indisponível';
    setStatus(`Falha ao iniciar o atendimento: ${error.message}`, 'error');
  });
})();
