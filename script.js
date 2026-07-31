const filters=document.querySelectorAll('.filter');const cards=document.querySelectorAll('.card');filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;cards.forEach(c=>c.style.display=f==='Todos'||c.dataset.category===f?'':'none')}));const modal=document.getElementById('modal'),modalTitle=document.getElementById('modalTitle'),modalShort=document.getElementById('modalShort'),modalImg=document.getElementById('modalImg'),modalBullets=document.getElementById('modalBullets'),modalClosing=document.getElementById('modalClosing'),modalWhats=document.getElementById('modalWhats');document.querySelectorAll('.more-btn').forEach(btn=>btn.addEventListener('click',()=>{const title=btn.dataset.title;modalTitle.textContent=title;modalShort.textContent=btn.dataset.short;modalImg.src=btn.dataset.img;modalImg.alt=title;modalBullets.innerHTML=JSON.parse(btn.dataset.bullets).map(i=>`<li>${i}</li>`).join('');modalClosing.textContent=btn.dataset.closing;modalWhats.href=`https://wa.me/5511981210932?text=${encodeURIComponent('Olá, gostaria de mais informações sobre: '+title)}`;modal.classList.add('open');modal.setAttribute('aria-hidden','false')}));function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}document.getElementById('modalClose').addEventListener('click',closeModal);document.getElementById('modalBackdrop').addEventListener('click',closeModal);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

/* =========================================================
   CHATBOX V4.5 — SUPABASE, TRIAGEM E ATENDIMENTO HUMANO
   ========================================================= */
(() => {
  const $ = selector => document.querySelector(selector);
  const WHATSAPP_DEFAULT = '5511981210932';
  const STORAGE_KEY = 'resumindo_live_chat_v45';
  const TRIAGE_WHATSAPP_KEY = 'resumindo_triage_whatsapp_v45';
  const VERSION = 'painel-chat-v4.5-recuperacao-sessao';

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
  const triageResultEl = $('#chatTriageResult');
  const triageCodeEl = $('#chatTriageCode');
  const triageWhatsappEl = $('#chatTriageWhatsapp');
  const copyCodeBtn = $('#chatCopyCode');
  const triageDismissBtn = $('#chatTriageDismiss');
  const callbackToggle = $('#chatCallbackToggle');
  const callbackForm = $('#chatCallbackForm');
  const callbackName = $('#callbackName');
  const callbackPhone = $('#callbackPhone');
  const callbackPreference = $('#callbackPreference');
  const callbackConsent = $('#callbackConsent');
  const callbackCancel = $('#callbackCancel');
  const callbackStatus = $('#callbackStatus');
  const callbackSubmit = $('#callbackSubmit');
  const startupErrorEl = $('#chatStartupError');
  const startupErrorText = $('#chatStartupErrorText');
  const retryBtn = $('#chatRetry');
  const startupWhatsApp = $('#chatStartupWhatsApp');

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
  let whatsappPrefillText = sessionStorage.getItem(TRIAGE_WHATSAPP_KEY) || '';
  let completedTriage = null;
  let initialized = false;
  let initializationPromise = null;
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

  function setInterfaceReady(value) {
    initialized = value;
    const closed = sessionStatus === 'closed';
    input.disabled = !value || closed;
    sendBtn.disabled = !value || closed;
    endBtn.disabled = false;
    quickEl.querySelectorAll('button').forEach(button => { button.disabled = !value || closed; });
    triageBtn && (triageBtn.disabled = !value || closed);
    humanBtn && (humanBtn.disabled = !value || closed);
  }

  function hideStartupError() {
    startupErrorEl?.classList.add('hidden');
    if (startupErrorText) startupErrorText.textContent = '';
  }

  function showStartupError(error) {
    console.error('[Chatbox Resumindo Viagens] Falha de inicialização:', error);
    setInterfaceReady(false);
    modeEl.textContent = 'Atendimento indisponível';
    const raw = String(error?.message || error || 'Falha desconhecida');
    const anonymousDisabled = error?.code === 'anonymous_provider_disabled' || /anonymous sign-ins are disabled|anonymous_provider_disabled/i.test(raw);
    const configurationMissing = error?.code === 'chat_not_configured' || /ainda não foi configurado/i.test(raw);
    const message = anonymousDisabled
      ? 'A sessão segura do chat está temporariamente desativada. Tente novamente em instantes ou continue pelo WhatsApp.'
      : configurationMissing
        ? 'O atendimento online ainda não foi configurado. Continue pelo WhatsApp enquanto a equipe conclui a configuração.'
        : 'Não foi possível iniciar o atendimento agora. Tente novamente ou continue pelo WhatsApp.';
    if (startupErrorText) startupErrorText.textContent = message;
    startupErrorEl?.classList.remove('hidden');
    setStatus(message, 'error');
    updateWhatsAppLink();
  }

  function scrollToBottom() {
    requestAnimationFrame(() => { messagesEl.scrollTop = messagesEl.scrollHeight; });
  }

  function whatsappUrl(text = '') {
    const number = String(settings.whatsapp_number || WHATSAPP_DEFAULT).replace(/\D/g, '') || WHATSAPP_DEFAULT;
    const encoded = text ? encodeURIComponent(text) : '';
    return `https://wa.me/${number}${encoded ? `?text=${encoded}` : ''}`;
  }

  function defaultWhatsAppMessage() {
    const firstName = nameInput.value.trim().slice(0, 60);
    return `Olá! Vim pelo Chatbox Resumindo Viagens.${firstName ? ` Meu nome é ${firstName}.` : ''}\n\nGostaria de continuar meu atendimento.`;
  }

  function triageWhatsAppMessage(code) {
    return `Olá! Concluí minha triagem no site da Resumindo Viagens.\n\nCódigo da triagem: ${code}\n\nGostaria de continuar o atendimento.`;
  }

  function updateWhatsAppLink() {
    const message = (whatsappPrefillText || '').trim() || defaultWhatsAppMessage();
    const url = whatsappUrl(message);
    whatsappBtn.href = url;
    whatsappBtn.dataset.message = message;
    whatsappBtn.dataset.hrefReady = url;
    whatsappBtn.classList.toggle('has-triage', Boolean((whatsappPrefillText || '').trim()));
    if (triageWhatsappEl) {
      triageWhatsappEl.href = url;
      triageWhatsappEl.dataset.message = message;
    }
  }

  function showTriageResult(code, summary) {
    completedTriage = { code, summary };
    triageCodeEl.textContent = code;
    callbackName.value = nameInput.value.trim();
    callbackForm.classList.add('hidden');
    callbackStatus.textContent = '';
    triageResultEl.classList.remove('hidden');
    updateWhatsAppLink();
    scrollToBottom();
  }

  async function notifyTriage(mode, extra = {}) {
    const token = await accessToken();
    return fetchJson('/api/triage-contact', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sessionId, mode, ...extra })
    });
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
    if (!initialized) ensureInitialized();
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
    hideStartupError();
    setInterfaceReady(false);
    modeEl.textContent = 'Iniciando atendimento...';
    setStatus('Preparando atendimento seguro...');

    const config = await fetchJson('/api/config');
    if (!config.configured) {
      const error = new Error('O atendimento dinâmico ainda não foi configurado.');
      error.code = 'chat_not_configured';
      throw error;
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
    let canReuseStoredSession = Boolean(
      stored?.version === VERSION &&
      stored?.userId === session.user.id &&
      stored?.sessionId
    );

    if (canReuseStoredSession) {
      const { data: previousSession, error: previousSessionError } = await db
        .from('chat_sessions')
        .select('id,status')
        .eq('id', stored.sessionId)
        .maybeSingle();
      if (previousSessionError) throw previousSessionError;
      canReuseStoredSession = Boolean(previousSession && previousSession.status !== 'closed');
    }

    if (!canReuseStoredSession) {
      sessionStorage.removeItem(TRIAGE_WHATSAPP_KEY);
      whatsappPrefillText = '';
    }

    sessionId = canReuseStoredSession ? stored.sessionId : crypto.randomUUID();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, userId: session.user.id, version: VERSION }));

    const { error: sessionCreateError } = await db.rpc('create_chat_session', {
      p_session_id: sessionId,
      p_name: nameInput.value || null,
      p_page_url: location.href
    });
    if (sessionCreateError) throw sessionCreateError;

    await Promise.all([loadSettings(), loadTriageQuestions(), loadMessages(), loadSession()]);
    subscribeToUpdates();
    setInterfaceReady(sessionStatus !== 'closed');
    setStatus('');
  }

  function ensureInitialized() {
    if (initialized) return Promise.resolve(true);
    if (initializationPromise) return initializationPromise;
    initializationPromise = initialize()
      .then(() => true)
      .catch(error => {
        showStartupError(error);
        return false;
      })
      .finally(() => { initializationPromise = null; });
    return initializationPromise;
  }

  async function loadSettings() {
    const { data, error } = await db.from('chat_settings').select('*');
    if (error) throw error;
    settings = Object.fromEntries((data || []).map(item => [item.key, item.value]));
    updateWhatsAppLink();
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
    input.disabled = !initialized || closed;
    sendBtn.disabled = !initialized || closed;
    endBtn.disabled = false;
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
    if (!initialized || !db || !sessionId) { showStartupError(new Error('Atendimento ainda não inicializado.')); return; }
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
    if (!initialized || !db || !sessionId) { showStartupError(new Error('Atendimento ainda não inicializado.')); return; }
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
    if (!initialized || !db || !sessionId || !triageState) {
      showStartupError(new Error('Atendimento ainda não inicializado.'));
      return;
    }

    const applicable = eligibleTriageQuestions();
    const lines = applicable
      .filter(question => question.include_in_whatsapp && triageState.labels[question.question_key])
      .map(question => `${question.whatsapp_label}: ${triageState.labels[question.question_key]}`);
    const code = `RV-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const summary = lines.join('\n');
    const stateToSubmit = triageState;

    setBusy(true);
    setStatus('Salvando a triagem...');
    try {
      const { error } = await db.rpc('submit_chat_triage', {
        p_session_id: sessionId,
        p_answers: stateToSubmit.answers,
        p_summary: summary,
        p_reference_code: code
      });
      if (error) throw error;

      triageState = null;
      restoreQuickButtons();
      input.disabled = false;
      sendBtn.disabled = false;
      input.placeholder = 'Digite sua dúvida...';

      const message = triageWhatsAppMessage(code);
      whatsappPrefillText = message;
      sessionStorage.setItem(TRIAGE_WHATSAPP_KEY, message);
      whatsappBtn.textContent = 'WhatsApp';
      showTriageResult(code, summary);

      localMessage(`Pronto! Sua triagem foi salva com o código ${code}. O resumo completo foi encaminhado para a equipe.`, 'system');
      setStatus('Enviando o resumo para a equipe...');
      try {
        const notification = await notifyTriage('summary');
        setStatus(notification.emailSent === false ? 'Triagem salva. A equipe poderá consultá-la no painel.' : 'Triagem concluída e resumo enviado para a equipe.', 'success');
      } catch {
        setStatus('Triagem salva. O alerta por e-mail não pôde ser enviado, mas a equipe poderá consultá-la no painel.', 'error');
      }
    } catch (error) {
      setStatus(`Não foi possível salvar a triagem: ${error.message}`, 'error');
    } finally {
      setBusy(false);
      if (triageState?.current?.input_type === 'choice') {
        input.disabled = true;
        sendBtn.disabled = true;
      }
    }
  }

  function restoreQuickButtons() {
    quickEl.innerHTML = `
      <button type="button" data-question="Como funciona a assessoria para o primeiro visto americano?">Primeiro visto</button>
      <button type="button" data-question="Qual a diferença entre primeiro visto e renovação?">Primeiro visto x renovação</button>
      <button type="button" data-question="O que é o DS-160?">O que é DS-160?</button>
      <button type="button" data-question="Quais serviços a Resumindo oferece?">Todos os serviços</button>
      <button type="button" data-question="Como funciona o seguro viagem?">Seguro viagem</button>
      <button type="button" id="chatTriageInline">Iniciar triagem</button>`;
    $('#chatTriageInline')?.addEventListener('click', startTriage);
  }

  async function requestHuman() {
    if (!initialized || !db || !sessionId) { showStartupError(new Error('Atendimento ainda não inicializado.')); return; }
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

  async function resetLocalConversation({ signOut = false } = {}) {
    if (channel && db) {
      try { await db.removeChannel(channel); } catch {}
    }
    channel = null;
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(TRIAGE_WHATSAPP_KEY);
    whatsappPrefillText = '';
    completedTriage = null;
    triageState = null;
    sessionId = null;
    sessionStatus = 'bot';
    conversationStarted = false;
    seenMessages.clear();
    messagesEl.innerHTML = '';
    triageResultEl?.classList.add('hidden');
    callbackForm?.classList.add('hidden');
    callbackStatus.textContent = '';
    restoreQuickButtons();
    input.value = '';
    input.placeholder = 'Digite sua dúvida...';
    modeEl.textContent = 'Iniciando atendimento...';
    setStatus('');
    hideStartupError();
    setInterfaceReady(false);
    updateWhatsAppLink();
    if (signOut && db) {
      try { await db.auth.signOut({ scope: 'local' }); } catch {}
    }
    db = null;
  }

  async function endAndClose() {
    endBtn.disabled = true;
    try {
      if (initializationPromise) await initializationPromise;
      if (initialized && db && sessionId && sessionStatus !== 'closed') {
        await finalize('encerrado pelo visitante', { silent: true });
      }
    } finally {
      await resetLocalConversation({ signOut: true });
      closeChat();
      endBtn.disabled = false;
    }
  }

  function prepareWhatsAppLink(event) {
    const message = (whatsappPrefillText || '').trim() || defaultWhatsAppMessage();
    const url = whatsappUrl(message);
    event.currentTarget.href = url;
    event.currentTarget.dataset.hrefReady = url;
    event.currentTarget.target = '_blank';
    event.currentTarget.rel = 'noopener noreferrer';
    if (navigator.clipboard && message) navigator.clipboard.writeText(message).catch(() => {});
    if (completedTriage) notifyTriage('whatsapp').catch(() => {});
    setTimeout(() => {
      if (initialized && sessionStatus !== 'closed') {
        input.disabled = false;
        sendBtn.disabled = false;
      }
      endBtn.disabled = false;
    }, 80);
    setStatus(completedTriage ? `O WhatsApp foi aberto com o código ${completedTriage.code}. Se o texto não aparecer, cole a mensagem copiada automaticamente.` : 'O WhatsApp foi aberto. Esta conversa continua ativa aqui.', 'success');
  }

  launcher.addEventListener('click', () => chatbox.classList.contains('open') ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);
  form.addEventListener('submit', event => { event.preventDefault(); ask(input.value); });
  input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); } });
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 100)}px`; });

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
  endBtn.addEventListener('click', endAndClose);
  whatsappBtn.addEventListener('mousedown', prepareWhatsAppLink);
  whatsappBtn.addEventListener('touchstart', prepareWhatsAppLink, { passive: true });
  whatsappBtn.addEventListener('click', event => {
    prepareWhatsAppLink(event);
    const ready = whatsappBtn.dataset.hrefReady || whatsappUrl(((whatsappPrefillText || '').trim()) || defaultWhatsAppMessage());
    whatsappBtn.href = ready;
  });


  triageDismissBtn?.addEventListener('click', () => {
    triageResultEl?.classList.add('hidden');
    setStatus(`Triagem ${completedTriage?.code || ''} salva. Você pode continuar fazendo perguntas.`, 'success');
    if (!input.disabled) input.focus();
  });

  copyCodeBtn?.addEventListener('click', async () => {
    if (!completedTriage?.code) return;
    try { await navigator.clipboard.writeText(completedTriage.code); copyCodeBtn.textContent = 'Código copiado'; setTimeout(() => { copyCodeBtn.textContent = 'Copiar código'; }, 1800); }
    catch { setStatus(`Código: ${completedTriage.code}`, 'success'); }
  });
  callbackToggle?.addEventListener('click', () => { callbackForm.classList.toggle('hidden'); if (!callbackForm.classList.contains('hidden')) { callbackName.value = callbackName.value || nameInput.value.trim(); callbackName.focus(); } });
  callbackCancel?.addEventListener('click', () => { callbackForm.classList.add('hidden'); callbackStatus.textContent = ''; });
  callbackPhone?.addEventListener('input', () => { const digits = callbackPhone.value.replace(/\D/g, '').slice(0, 11); if (digits.length <= 2) callbackPhone.value = digits; else if (digits.length <= 7) callbackPhone.value = `(${digits.slice(0,2)}) ${digits.slice(2)}`; else callbackPhone.value = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`; });
  callbackForm?.addEventListener('submit', async event => {
    event.preventDefault(); callbackStatus.textContent = ''; callbackStatus.className = 'callback-status';
    const name = callbackName.value.trim(); const phone = callbackPhone.value.trim(); const preference = callbackPreference.value; const consent = callbackConsent.checked;
    if (!completedTriage?.code) { callbackStatus.textContent = 'Conclua a triagem antes de solicitar contato.'; callbackStatus.classList.add('error'); return; }
    if (name.length < 2) { callbackStatus.textContent = 'Informe seu primeiro nome.'; callbackStatus.classList.add('error'); return; }
    if (phone.replace(/\D/g, '').length < 10) { callbackStatus.textContent = 'Informe um telefone com DDD.'; callbackStatus.classList.add('error'); return; }
    if (!preference || !consent) { callbackStatus.textContent = 'Escolha o período e confirme a autorização de contato.'; callbackStatus.classList.add('error'); return; }
    callbackSubmit.disabled = true; callbackStatus.textContent = 'Registrando sua solicitação...';
    try {
      const result = await notifyTriage('callback', { name, phone, preference, consent }); nameInput.value = name;
      callbackStatus.textContent = result.emailSent === false ? `Solicitação registrada com o código ${completedTriage.code}. A equipe poderá consultá-la no painel.` : `Solicitação enviada. A equipe entrará em contato pelo WhatsApp. Código: ${completedTriage.code}.`;
      callbackStatus.classList.add('success'); callbackForm.querySelectorAll('input,select,button').forEach(element => { element.disabled = true; });
      localMessage(`Sua solicitação de retorno foi registrada. Código: ${completedTriage.code}.`, 'system'); setStatus('Aguarde o contato da equipe pelo WhatsApp.', 'success');
    } catch (error) { callbackStatus.textContent = error.message || 'Não foi possível registrar a solicitação.'; callbackStatus.classList.add('error'); callbackSubmit.disabled = false; }
  });
  triageWhatsappEl?.addEventListener('mousedown', prepareWhatsAppLink);
  triageWhatsappEl?.addEventListener('touchstart', prepareWhatsAppLink, { passive: true });
  triageWhatsappEl?.addEventListener('click', prepareWhatsAppLink);
  startupWhatsApp?.addEventListener('click', prepareWhatsAppLink);
  retryBtn?.addEventListener('click', async () => {
    retryBtn.disabled = true;
    await resetLocalConversation({ signOut: true });
    const ok = await ensureInitialized();
    retryBtn.disabled = false;
    if (ok && !input.disabled) input.focus();
  });

  window.addEventListener('focus', () => {
    if (!initialized || sessionStatus === 'closed' || busy) return;
    const choiceQuestionActive = triageState?.current?.input_type === 'choice';
    if (!choiceQuestionActive) {
      input.disabled = false;
      sendBtn.disabled = false;
    }
    endBtn.disabled = false;
  });

  setInterfaceReady(false);
  ensureInitialized();
})();
