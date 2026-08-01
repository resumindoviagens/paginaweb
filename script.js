const filters=document.querySelectorAll('.filter');const cards=document.querySelectorAll('.card');filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;cards.forEach(c=>c.style.display=f==='Todos'||c.dataset.category===f?'':'none')}));const modal=document.getElementById('modal'),modalTitle=document.getElementById('modalTitle'),modalShort=document.getElementById('modalShort'),modalImg=document.getElementById('modalImg'),modalBullets=document.getElementById('modalBullets'),modalClosing=document.getElementById('modalClosing'),modalWhats=document.getElementById('modalWhats');document.querySelectorAll('.more-btn').forEach(btn=>btn.addEventListener('click',()=>{const title=btn.dataset.title;modalTitle.textContent=title;modalShort.textContent=btn.dataset.short;modalImg.src=btn.dataset.img;modalImg.alt=title;modalBullets.innerHTML=JSON.parse(btn.dataset.bullets).map(i=>`<li>${i}</li>`).join('');modalClosing.textContent=btn.dataset.closing;modalWhats.href=`https://wa.me/5511981210932?text=${encodeURIComponent('Olá, gostaria de mais informações sobre: '+title)}`;modal.classList.add('open');modal.setAttribute('aria-hidden','false')}));function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}document.getElementById('modalClose').addEventListener('click',closeModal);document.getElementById('modalBackdrop').addEventListener('click',closeModal);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

/* =========================================================
   ORIENTAÇÃO RESUMINDO V4.6
   Entrada nominal, perguntas livres e encaminhamento premium.
   ========================================================= */
(() => {
  const $ = selector => document.querySelector(selector);
  const WHATSAPP_DEFAULT = '5511981210932';
  const STORAGE_KEY = 'resumindo_guidance_v46';
  const VERSION = 'orientacao-resumindo-v4.6';
  const IDLE_MS = 15 * 60 * 1000;
  const HEARTBEAT_MS = 60 * 1000;

  const launcher = $('#chatLauncher');
  const panel = $('#guidancePanel');
  const backdrop = $('#guidanceBackdrop');
  const closeBtn = $('#chatClose');
  const intro = $('#guidanceIntro');
  const conversation = $('#guidanceConversation');
  const profileForm = $('#guidanceProfileForm');
  const startBtn = $('#guidanceStart');
  const profileStatus = $('#guidanceFormStatus');
  const nameInput = $('#chatName');
  const phoneInput = $('#chatPhone');
  const emailInput = $('#chatEmail');
  const visitorNameEl = $('#guidanceVisitorName');
  const form = $('#chatForm');
  const input = $('#chatInput');
  const sendBtn = $('#chatSend');
  const messagesEl = $('#chatMessages');
  const endBtn = $('#chatEnd');
  const whatsappBtn = $('#chatWhatsApp');
  const restartBtn = $('#chatRestart');
  const statusEl = $('#chatStatus');
  const modeEl = $('#chatMode');
  const startupErrorEl = $('#chatStartupError');
  const startupErrorText = $('#chatStartupErrorText');
  const retryBtn = $('#chatRetry');

  if (!launcher || !panel || !profileForm || !form || !messagesEl) return;

  let db = null;
  let sessionId = null;
  let sessionStatus = 'bot';
  let settings = {};
  let channel = null;
  let initialized = false;
  let initializationPromise = null;
  let busy = false;
  let finalizing = false;
  let conversationStarted = false;
  let idleTimer = null;
  let lastHeartbeatAt = 0;
  let lastVisitorQuestion = '';
  let cachedAccessToken = '';
  let profile = { name: '', phone: '', email: '' };
  const seenMessages = new Set();

  const escapeText = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[character]);

  const clean = (value, max = 500) => String(value ?? '').replace(/\u0000/g, '').trim().slice(0, max);

  function formatTime(value) {
    try {
      return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
    } catch {
      return '';
    }
  }

  function safeStoredState() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function storeState(extra = {}) {
    const current = safeStoredState() || {};
    const next = {
      ...current,
      sessionId,
      version: VERSION,
      profile,
      lastActivityAt: Date.now(),
      ...extra
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  function setProfileStatus(text = '', type = '') {
    profileStatus.textContent = text;
    profileStatus.className = `guidance-form-status ${type}`.trim();
  }

  function setStatus(text = '', type = '') {
    statusEl.textContent = text;
    statusEl.className = `guidance-status ${type}`.trim();
  }

  function setInterfaceReady(value) {
    const closed = sessionStatus === 'closed';
    input.disabled = !value || closed || busy;
    sendBtn.disabled = !value || closed || busy;
    endBtn.disabled = busy;
  }

  function hideStartupError() {
    startupErrorEl.classList.add('hidden');
    startupErrorText.textContent = '';
  }

  function showStartupError(error) {
    console.error('[Orientação Resumindo] Falha de inicialização:', error);
    const raw = String(error?.message || error || 'Falha desconhecida');
    const anonymousDisabled = error?.code === 'anonymous_provider_disabled' || /anonymous sign-ins are disabled|anonymous_provider_disabled/i.test(raw);
    const message = anonymousDisabled
      ? 'A orientação online está temporariamente indisponível. A equipe já pode ser contatada pelos canais do site.'
      : 'Não foi possível iniciar a orientação agora. Tente novamente em instantes.';
    startupErrorText.textContent = message;
    startupErrorEl.classList.remove('hidden');
    setProfileStatus(message, 'error');
    startBtn.disabled = false;
    modeEl.textContent = 'Orientação temporariamente indisponível';
  }

  function showIntro() {
    intro.classList.remove('hidden');
    conversation.classList.add('hidden');
    panel.classList.remove('ended');
    panel.classList.add('profile-mode');
  }

  function showConversation() {
    intro.classList.add('hidden');
    conversation.classList.remove('hidden');
    panel.classList.remove('profile-mode');
    visitorNameEl.textContent = profile.name || 'Visitante';
  }

  function scrollToBottom() {
    requestAnimationFrame(() => { messagesEl.scrollTop = messagesEl.scrollHeight; });
  }

  function whatsappUrl(text = '') {
    const number = String(settings.whatsapp_number || WHATSAPP_DEFAULT).replace(/\D/g, '') || WHATSAPP_DEFAULT;
    return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  }

  function defaultWhatsAppMessage() {
    const firstName = clean(profile.name, 60);
    return `Olá! Meu nome é ${firstName || 'visitante'}. Vim pela orientação do site da Resumindo Viagens e gostaria de aprofundar meu atendimento.`;
  }

  function updateWhatsAppLink() {
    whatsappBtn.href = whatsappUrl(defaultWhatsAppMessage());
  }

  function linkifySafeText(text) {
    const safe = escapeText(text);
    return safe.replace(/https:\/\/wa\.me\/\d+(?:\?[^\s<]*)?/g, match =>
      `<a href="${match}" target="_blank" rel="noopener noreferrer">continuar pelo WhatsApp</a>`
    );
  }

  function renderMessage(message) {
    if (message.id && seenMessages.has(message.id)) return;
    if (message.id) seenMessages.add(message.id);

    const sender = message.sender_type;
    const type = sender === 'visitor' ? 'question' : sender === 'human' ? 'human' : sender === 'system' ? 'notice' : 'answer';
    const label = sender === 'visitor' ? 'Sua pergunta' : sender === 'human' ? 'Equipe Resumindo' : sender === 'system' ? 'Aviso' : 'Orientação Resumindo';
    const entry = document.createElement('article');
    entry.className = `guidance-entry ${type}`;
    entry.innerHTML = `<div class="guidance-entry-head"><strong>${label}</strong><time>${formatTime(message.created_at || message.timestamp)}</time></div><div class="guidance-entry-content">${linkifySafeText(message.content)}</div>`;
    messagesEl.appendChild(entry);

    if (sender === 'visitor') {
      conversationStarted = true;
      lastVisitorQuestion = clean(message.content, 1200);
    }
    scrollToBottom();
  }

  function localMessage(content, senderType = 'system') {
    renderMessage({ sender_type: senderType, content, created_at: new Date().toISOString() });
  }

  function setBusy(value) {
    busy = value;
    setInterfaceReady(initialized);
  }

  function openPanel() {
    panel.classList.add('open');
    backdrop?.classList.add('open');
    backdrop?.setAttribute('aria-hidden', 'false');
    panel.setAttribute('aria-hidden', 'false');
    launcher.setAttribute('aria-expanded', 'true');
    const stored = safeStoredState();
    if (!initialized && stored?.version === VERSION && stored?.profile?.name) {
      ensureInitialized(stored.profile).catch(() => {});
    }
    if (initialized && sessionStatus !== 'closed') recordActivity(false);
    setTimeout(() => {
      if (!intro.classList.contains('hidden')) nameInput.focus();
      else if (!input.disabled) input.focus();
    }, 50);
  }

  function closePanel() {
    panel.classList.remove('open');
    backdrop?.classList.remove('open');
    backdrop?.setAttribute('aria-hidden', 'true');
    panel.setAttribute('aria-hidden', 'true');
    launcher.setAttribute('aria-expanded', 'false');
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, { cache: 'no-store', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `Falha ao acessar ${url}.`);
      error.details = data;
      throw error;
    }
    return data;
  }

  function normalizePhone(value) {
    const digits = clean(value, 30).replace(/\D/g, '');
    return digits;
  }

  function validEmail(value) {
    return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function readAndValidateProfile() {
    [nameInput, phoneInput, emailInput].forEach(field => field.removeAttribute('aria-invalid'));
    const candidate = {
      name: clean(nameInput.value, 60),
      phone: normalizePhone(phoneInput.value),
      email: clean(emailInput.value, 160).toLowerCase()
    };
    if (candidate.name.length < 2) {
      nameInput.setAttribute('aria-invalid', 'true');
      nameInput.focus();
      throw new Error('Informe seu nome para começarmos.');
    }
    if (candidate.phone && candidate.phone.length < 10) {
      phoneInput.setAttribute('aria-invalid', 'true');
      phoneInput.focus();
      throw new Error('Confira o telefone com DDD ou deixe o campo em branco.');
    }
    if (!validEmail(candidate.email)) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailInput.focus();
      throw new Error('Confira o e-mail informado ou deixe o campo em branco.');
    }
    return candidate;
  }

  async function initialize(candidateProfile) {
    hideStartupError();
    startBtn.disabled = true;
    setProfileStatus('Preparando sua orientação...');
    modeEl.textContent = 'Preparando orientação segura...';

    const config = await fetchJson('/api/config');
    if (!config.configured) throw new Error('A orientação online ainda não foi configurada.');
    if (!window.supabase?.createClient) throw new Error('O recurso de orientação não foi carregado. Atualize a página.');

    db = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey);
    let { data: { session }, error: sessionError } = await db.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      const result = await db.auth.signInAnonymously();
      if (result.error) throw result.error;
      session = result.data.session;
    }
    if (!session?.user?.id) throw new Error('Não foi possível criar a sessão segura.');
    cachedAccessToken = session.access_token || cachedAccessToken;

    const stored = safeStoredState();
    let previousSession = null;
    let canReuse = Boolean(
      stored?.version === VERSION &&
      stored?.userId === session.user.id &&
      stored?.sessionId
    );

    if (canReuse) {
      const result = await db.from('chat_sessions').select('*').eq('id', stored.sessionId).maybeSingle();
      if (result.error) throw result.error;
      previousSession = result.data;
      canReuse = Boolean(previousSession && previousSession.status !== 'closed' && !previousSession.report_sent_at);
    }

    profile = {
      name: clean(candidateProfile?.name || previousSession?.visitor_name || stored?.profile?.name, 60),
      phone: normalizePhone(candidateProfile?.phone || previousSession?.visitor_phone || stored?.profile?.phone),
      email: clean(candidateProfile?.email || previousSession?.visitor_email || stored?.profile?.email, 160).toLowerCase()
    };
    if (profile.name.length < 2) throw new Error('Informe seu nome para começarmos.');

    sessionId = canReuse ? stored.sessionId : crypto.randomUUID();
    const rpcPayload = {
      p_session_id: sessionId,
      p_name: profile.name,
      p_page_url: location.href,
      p_phone: profile.phone || null,
      p_email: profile.email || null
    };
    let sessionCreation = await db.rpc('create_guidance_session', rpcPayload);
    if (sessionCreation.error && /create_guidance_session|function .* does not exist|schema cache/i.test(String(sessionCreation.error.message || ''))) {
      sessionCreation = await db.rpc('create_chat_session', {
        p_session_id: sessionId,
        p_name: profile.name,
        p_page_url: location.href
      });
    }
    if (sessionCreation.error) throw sessionCreation.error;

    storeState({ userId: session.user.id, sessionId, profile, lastActivityAt: stored?.lastActivityAt || Date.now() });
    await Promise.all([loadSettings(), loadMessages(), loadSession()]);
    subscribeToUpdates();
    initialized = sessionStatus !== 'closed';
    showConversation();
    updateWhatsAppLink();
    setInterfaceReady(initialized);
    modeEl.textContent = initialized ? 'Informações gerais antes do atendimento personalizado' : 'Orientação encerrada';
    setProfileStatus('');
    setStatus('');
    startBtn.disabled = false;

    const lastActivityAt = Number(safeStoredState()?.lastActivityAt || Date.now());
    if (initialized && Date.now() - lastActivityAt >= IDLE_MS) {
      await handleIdle();
    } else if (initialized) {
      scheduleIdle(lastActivityAt);
    }
    return true;
  }

  function ensureInitialized(candidateProfile = profile) {
    if (initialized) return Promise.resolve(true);
    if (initializationPromise) return initializationPromise;
    initializationPromise = initialize(candidateProfile)
      .catch(error => {
        showIntro();
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
  }

  async function loadMessages() {
    const { data, error } = await db.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at');
    if (error) throw error;
    messagesEl.innerHTML = '';
    seenMessages.clear();
    conversationStarted = false;
    lastVisitorQuestion = '';
    if (data?.length) {
      data.forEach(renderMessage);
    } else {
      localMessage(`Olá, ${profile.name.split(/\s+/)[0]}. Escreva livremente sua dúvida. Esta etapa esclarece informações gerais; quando houver necessidade de analisar detalhes do seu caso, a equipe dará continuidade diretamente com você.`, 'bot');
    }
  }

  async function loadSession() {
    const { data, error } = await db.from('chat_sessions').select('*').eq('id', sessionId).maybeSingle();
    if (error) throw error;
    if (!data) return;
    sessionStatus = data.status;
    profile = {
      name: clean(data.visitor_name || profile.name, 60),
      phone: normalizePhone(data.visitor_phone || profile.phone),
      email: clean(data.visitor_email || profile.email, 160).toLowerCase()
    };
    visitorNameEl.textContent = profile.name;
    updateWhatsAppLink();
    if (sessionStatus === 'closed') setEndedState('Esta orientação foi encerrada.');
  }

  function subscribeToUpdates() {
    if (channel) db.removeChannel(channel);
    channel = db.channel(`guidance-${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sessionId}` }, payload => renderMessage(payload.new))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_sessions', filter: `id=eq.${sessionId}` }, () => loadSession().catch(console.error))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_settings' }, () => loadSettings().catch(console.error))
      .subscribe();
  }

  async function accessToken() {
    if (cachedAccessToken) return cachedAccessToken;
    const { data, error } = await db.auth.getSession();
    if (error) throw error;
    const token = data.session?.access_token;
    if (!token) throw new Error('A sessão expirou. Inicie uma nova orientação.');
    cachedAccessToken = token;
    return token;
  }

  async function heartbeat() {
    if (!db || !sessionId || sessionStatus === 'closed') return;
    const now = Date.now();
    if (now - lastHeartbeatAt < HEARTBEAT_MS) return;
    lastHeartbeatAt = now;
    try { await db.rpc('touch_guidance_session', { p_session_id: sessionId }); } catch {}
  }

  function scheduleIdle(reference = Date.now()) {
    clearTimeout(idleTimer);
    if (!initialized || sessionStatus === 'closed') return;
    const remaining = Math.max(500, IDLE_MS - (Date.now() - reference));
    idleTimer = setTimeout(handleIdle, remaining);
  }

  function recordActivity(sync = true) {
    if (!initialized || sessionStatus === 'closed') return;
    const now = Date.now();
    storeState({ lastActivityAt: now });
    scheduleIdle(now);
    if (sync) heartbeat();
  }

  async function handleIdle() {
    if (!initialized || sessionStatus === 'closed' || finalizing) return;
    setStatus('Encerrando por inatividade e encaminhando a cópia à equipe...');
    const sent = await finalize('inatividade por 15 minutos', { silent: true, keepalive: true });
    setEndedState(
      sent ? 'Orientação encerrada após 15 minutos sem interação. A equipe recebeu a cópia para acompanhamento.' : 'Orientação encerrada por inatividade. O sistema tentará novamente o envio da cópia.',
      sent ? 'success' : 'error'
    );
  }

  async function ask(text) {
    const question = clean(text, 1200);
    if (!question || busy || sessionStatus === 'closed') return;
    if (!initialized || !db || !sessionId) {
      setStatus('Inicie a orientação antes de enviar sua dúvida.', 'error');
      return;
    }

    setBusy(true);
    input.value = '';
    input.style.height = 'auto';
    setStatus('Preparando a orientação...');
    recordActivity();

    try {
      const token = await accessToken();
      const data = await fetchJson('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId, question })
      });
      if (data.userMessage) renderMessage(data.userMessage);
      if (data.assistantMessage) renderMessage(data.assistantMessage);
      setStatus('');
      recordActivity(false);
    } catch (error) {
      setStatus(error.message, 'error');
    } finally {
      setBusy(false);
      if (!input.disabled) input.focus();
    }
  }

  async function finalize(reason, { silent = false, keepalive = false } = {}) {
    if (finalizing || !db || !sessionId || sessionStatus === 'closed') return true;
    finalizing = true;
    clearTimeout(idleTimer);
    if (!silent) setStatus('Encaminhando a cópia à equipe...');
    try {
      const token = await accessToken();
      const data = await fetchJson('/api/end-session', {
        method: 'POST',
        keepalive,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sessionId,
          name: profile.name,
          phone: profile.phone,
          email: profile.email,
          reason,
          page: location.href,
          endedAt: new Date().toISOString()
        })
      });
      sessionStatus = 'closed';
      initialized = false;
      setInterfaceReady(false);
      if (!silent) setStatus(data.emailSent === false ? 'Orientação encerrada.' : 'Cópia encaminhada à equipe.', 'success');
      return true;
    } catch (error) {
      sessionStatus = 'closed';
      initialized = false;
      setInterfaceReady(false);
      setStatus('A orientação foi encerrada. O envio da cópia será tentado novamente pelo sistema.', 'error');
      return false;
    } finally {
      finalizing = false;
    }
  }

  function setEndedState(message, type = 'success') {
    clearTimeout(idleTimer);
    sessionStatus = 'closed';
    initialized = false;
    panel.classList.add('ended');
    input.disabled = true;
    sendBtn.disabled = true;
    endBtn.classList.add('hidden');
    restartBtn.classList.remove('hidden');
    modeEl.textContent = 'Orientação encerrada';
    if (message) setStatus(message, type);
  }

  async function resetLocalConversation({ preserveProfile = true, signOut = false } = {}) {
    clearTimeout(idleTimer);
    if (channel && db) {
      try { await db.removeChannel(channel); } catch {}
    }
    channel = null;
    sessionStorage.removeItem(STORAGE_KEY);
    sessionId = null;
    sessionStatus = 'bot';
    initialized = false;
    initializationPromise = null;
    busy = false;
    finalizing = false;
    conversationStarted = false;
    lastVisitorQuestion = '';
    cachedAccessToken = '';
    seenMessages.clear();
    messagesEl.innerHTML = '';
    input.value = '';
    input.style.height = 'auto';
    panel.classList.remove('ended');
    endBtn.classList.remove('hidden');
    restartBtn.classList.add('hidden');
    setStatus('');
    hideStartupError();
    modeEl.textContent = 'Informações gerais antes do atendimento personalizado';
    if (preserveProfile) {
      nameInput.value = profile.name;
      phoneInput.value = formatPhone(profile.phone);
      emailInput.value = profile.email;
    } else {
      profile = { name: '', phone: '', email: '' };
      profileForm.reset();
    }
    if (signOut && db) {
      try { await db.auth.signOut({ scope: 'local' }); } catch {}
    }
    db = null;
    showIntro();
  }

  async function endAndClose() {
    endBtn.disabled = true;
    try {
      await finalize('encerrado pelo visitante', { silent: true });
    } finally {
      await resetLocalConversation({ preserveProfile: true, signOut: false });
      closePanel();
      endBtn.disabled = false;
    }
  }

  function formatPhone(value) {
    const digits = normalizePhone(value).slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  launcher.addEventListener('click', () => panel.classList.contains('open') ? closePanel() : openPanel());
  closeBtn.addEventListener('click', closePanel);
  backdrop?.addEventListener('click', closePanel);
  profileForm.addEventListener('submit', async event => {
    event.preventDefault();
    setProfileStatus('');
    try {
      const candidate = readAndValidateProfile();
      profile = candidate;
      await ensureInitialized(candidate);
    } catch (error) {
      setProfileStatus(error.message, 'error');
    }
  });
  retryBtn.addEventListener('click', async () => {
    try {
      const candidate = readAndValidateProfile();
      await resetLocalConversation({ preserveProfile: true, signOut: true });
      profile = candidate;
      await ensureInitialized(candidate);
    } catch (error) {
      setProfileStatus(error.message, 'error');
    }
  });
  phoneInput.addEventListener('input', () => { phoneInput.value = formatPhone(phoneInput.value); });
  form.addEventListener('submit', event => { event.preventDefault(); ask(input.value); });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
    recordActivity();
  });
  conversation.addEventListener('pointerdown', () => recordActivity(), { passive: true });
  endBtn.addEventListener('click', endAndClose);
  restartBtn.addEventListener('click', async () => {
    await resetLocalConversation({ preserveProfile: true, signOut: false });
    nameInput.focus();
  });
  whatsappBtn.addEventListener('pointerdown', () => { updateWhatsAppLink(); }, { passive: true });
  whatsappBtn.addEventListener('click', () => {
    updateWhatsAppLink();
    setStatus('Abrindo o WhatsApp e encaminhando a cópia à equipe...', 'success');
    void finalize('continuação pelo WhatsApp', { silent: true, keepalive: true }).then(sent => {
      setEndedState(
        sent ? 'A conversa foi encaminhada à equipe. O atendimento continuará pelo WhatsApp.' : 'O WhatsApp foi aberto. O sistema tentará novamente o envio da cópia à equipe.',
        sent ? 'success' : 'error'
      );
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });
  window.addEventListener('pagehide', () => {
    if (!initialized || sessionStatus === 'closed' || finalizing) return;
    void finalize('saída da página', { silent: true, keepalive: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !initialized || sessionStatus === 'closed') return;
    const last = Number(safeStoredState()?.lastActivityAt || Date.now());
    if (Date.now() - last >= IDLE_MS) handleIdle();
    else scheduleIdle(last);
  });

  const stored = safeStoredState();
  if (stored?.version === VERSION && stored?.profile?.name) {
    profile = stored.profile;
    nameInput.value = profile.name || '';
    phoneInput.value = formatPhone(profile.phone || '');
    emailInput.value = profile.email || '';
  }
  showIntro();
  updateWhatsAppLink();
})();
