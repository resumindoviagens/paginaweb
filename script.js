const filters=document.querySelectorAll('.filter');const cards=document.querySelectorAll('.card');filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;cards.forEach(c=>c.style.display=f==='Todos'||c.dataset.category===f?'':'none')}));const modal=document.getElementById('modal'),modalTitle=document.getElementById('modalTitle'),modalShort=document.getElementById('modalShort'),modalImg=document.getElementById('modalImg'),modalBullets=document.getElementById('modalBullets'),modalClosing=document.getElementById('modalClosing'),modalWhats=document.getElementById('modalWhats');document.querySelectorAll('.more-btn').forEach(btn=>btn.addEventListener('click',()=>{const title=btn.dataset.title;modalTitle.textContent=title;modalShort.textContent=btn.dataset.short;modalImg.src=btn.dataset.img;modalImg.alt=title;modalBullets.innerHTML=JSON.parse(btn.dataset.bullets).map(i=>`<li>${i}</li>`).join('');modalClosing.textContent=btn.dataset.closing;modalWhats.href=`https://wa.me/5511981210932?text=${encodeURIComponent('Olá, gostaria de mais informações sobre: '+title)}`;modal.classList.add('open');modal.setAttribute('aria-hidden','false')}));function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}document.getElementById('modalClose').addEventListener('click',closeModal);document.getElementById('modalBackdrop').addEventListener('click',closeModal);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

/* =========================================================
   CHATBOX INTELIGENTE — RESUMINDO VIAGENS
   ========================================================= */
(() => {
  const WHATSAPP_URL = 'https://wa.me/5511981210932';
  const STORAGE_KEY = 'resumindo_chat_session_v1';
  const IDLE_MS = 15 * 60 * 1000;

  const launcher = document.getElementById('chatLauncher');
  const chatbox = document.getElementById('chatbox');
  const closeBtn = document.getElementById('chatClose');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const messagesEl = document.getElementById('chatMessages');
  const quickEl = document.getElementById('chatQuick');
  const endBtn = document.getElementById('chatEnd');
  const whatsappBtn = document.getElementById('chatWhatsApp');
  const nameInput = document.getElementById('chatName');
  const statusEl = document.getElementById('chatStatus');

  if (!launcher || !chatbox || !form) return;

  let state = loadState();
  let busy = false;
  let typingNode = null;
  let idleTimer = null;

  function newSession() {
    return {
      sessionId: (crypto.randomUUID ? crypto.randomUUID() : `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`),
      startedAt: new Date().toISOString(),
      name: '',
      ended: false,
      transcriptSent: false,
      messages: []
    };
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return newSession();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.messages) || parsed.ended) return newSession();
      return parsed;
    } catch (_) {
      return newSession();
    }
  }

  function saveState() {
    try {
      state.name = nameInput ? nameInput.value.trim().slice(0, 60) : state.name;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  function nowLabel(iso) {
    try {
      return new Intl.DateTimeFormat('pt-BR', {hour:'2-digit', minute:'2-digit'}).format(new Date(iso));
    } catch (_) { return ''; }
  }

  function escapeText(text) {
    return String(text ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  }

  function linkifyWhatsApp(text) {
    const safe = escapeText(text);
    return safe.replace(/https:\/\/wa\.me\/5511981210932/g, `<a class="chat-inline-whatsapp" href="${WHATSAPP_URL}" target="_blank" rel="noopener">abrir o WhatsApp da Resumindo</a>`);
  }

  function renderMessage(message) {
    const row = document.createElement('div');
    row.className = `chat-message ${message.role}`;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = `${linkifyWhatsApp(message.content)}<span class="chat-time">${nowLabel(message.timestamp)}</span>`;
    row.appendChild(bubble);
    messagesEl.appendChild(row);
  }

  function addMessage(role, content, persist = true) {
    const message = {role, content: String(content).trim(), timestamp: new Date().toISOString()};
    if (persist && (role === 'user' || role === 'assistant')) {
      state.messages.push(message);
      if (state.messages.length > 80) state.messages = state.messages.slice(-80);
      saveState();
    }
    renderMessage(message);
    scrollToBottom();
    resetIdleTimer();
    return message;
  }

  function renderInitial() {
    messagesEl.innerHTML = '';
    if (state.messages.length) {
      state.messages.forEach(renderMessage);
    } else {
      addMessage('assistant', 'Olá! Sou o assistente virtual da Resumindo Viagens. Posso responder dúvidas gerais sobre vistos, passaporte, seguro viagem, passagens, hotéis, Orlando, Europa, locação de veículos e planejamento. Não tenho acesso ao cadastro ou ao processo de nenhuma pessoa.', false);
      addMessage('system', 'Para proteger sua privacidade, não envie documentos nem dados pessoais. Para consulta individual, análise aprofundada ou atendimento humano, use o WhatsApp da Resumindo.', false);
    }
    nameInput.value = state.name || '';
  }

  function scrollToBottom() {
    requestAnimationFrame(() => { messagesEl.scrollTop = messagesEl.scrollHeight; });
  }

  function setStatus(text = '', type = '') {
    statusEl.textContent = text;
    statusEl.className = `chatbox-status ${type}`.trim();
  }

  function setBusy(value) {
    busy = value;
    sendBtn.disabled = value || state.ended;
    input.disabled = value || state.ended;
    quickEl.querySelectorAll('button').forEach(b => b.disabled = value || state.ended);
  }

  function showTyping() {
    const row = document.createElement('div');
    row.className = 'chat-message assistant';
    row.innerHTML = '<div class="chat-typing"><i></i><i></i><i></i></div>';
    messagesEl.appendChild(row);
    typingNode = row;
    scrollToBottom();
  }

  function hideTyping() {
    if (typingNode) typingNode.remove();
    typingNode = null;
  }

  function openChat() {
    chatbox.classList.add('open');
    chatbox.setAttribute('aria-hidden', 'false');
    launcher.setAttribute('aria-expanded', 'true');
    input.focus();
    scrollToBottom();
  }

  function closeChat() {
    chatbox.classList.remove('open');
    chatbox.setAttribute('aria-hidden', 'true');
    launcher.setAttribute('aria-expanded', 'false');
  }

  async function ask(question) {
    const clean = String(question || '').trim().slice(0, 1200);
    if (!clean || busy || state.ended) return;

    setStatus('');
    addMessage('user', clean);
    input.value = '';
    input.style.height = 'auto';
    setBusy(true);
    showTyping();

    try {
      const history = state.messages.slice(0, -1).slice(-16).map(({role, content}) => ({role, content}));
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          sessionId: state.sessionId,
          question: clean,
          history
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Não foi possível obter a resposta.');
      hideTyping();
      addMessage('assistant', data.answer || `Não consegui aprofundar essa dúvida. Fale com a equipe: ${WHATSAPP_URL}`);
    } catch (error) {
      hideTyping();
      addMessage('assistant', `Não consegui responder com segurança neste momento. Fale diretamente com a equipe da Resumindo pelo WhatsApp: ${WHATSAPP_URL}`);
      setStatus('O atendimento automático encontrou uma indisponibilidade.', 'error');
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  async function finalizeSession(reason = 'encerrado pelo visitante', silent = false) {
    if (state.transcriptSent || state.ended) return true;
    const hasConversation = state.messages.some(m => m.role === 'user');
    if (!hasConversation) {
      if (!silent) setStatus('Faça uma pergunta antes de encerrar o atendimento.');
      return false;
    }

    setBusy(true);
    if (!silent) setStatus('Enviando o resumo do atendimento...');

    try {
      const response = await fetch('/api/end-session', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          sessionId: state.sessionId,
          startedAt: state.startedAt,
          endedAt: new Date().toISOString(),
          reason,
          name: nameInput.value.trim().slice(0,60),
          page: location.href,
          messages: state.messages
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Falha no envio do resumo.');
      state.transcriptSent = true;
      state.ended = true;
      state.name = nameInput.value.trim().slice(0,60);
      saveState();
      chatbox.classList.add('ended');
      endBtn.disabled = true;
      if (!silent) {
        addMessage('system', 'Atendimento encerrado. O resumo das perguntas e respostas foi encaminhado para a Resumindo Viagens.', false);
        setStatus('Resumo enviado com sucesso.', 'success');
      }
      return true;
    } catch (error) {
      if (!silent) setStatus('Não foi possível enviar o resumo. Tente novamente ou fale pelo WhatsApp.', 'error');
      return false;
    } finally {
      setBusy(false);
    }
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    if (state.ended) return;
    idleTimer = setTimeout(async () => {
      if (state.messages.some(m => m.role === 'user')) {
        const ok = await finalizeSession('encerrado automaticamente após 15 minutos de inatividade');
        if (ok) setStatus('Atendimento encerrado por inatividade e resumo enviado.', 'success');
      }
    }, IDLE_MS);
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
    input.style.height = `${Math.min(input.scrollHeight,100)}px`;
    resetIdleTimer();
  });
  nameInput.addEventListener('change', saveState);
  nameInput.addEventListener('input', resetIdleTimer);
  quickEl.addEventListener('click', event => {
    const button = event.target.closest('[data-question]');
    if (button) ask(button.dataset.question);
  });
  endBtn.addEventListener('click', () => finalizeSession('encerrado pelo visitante'));

  whatsappBtn.addEventListener('click', async event => {
    event.preventDefault();
    await finalizeSession('encaminhado para atendimento pelo WhatsApp', true);
    window.open(WHATSAPP_URL, '_blank', 'noopener');
  });

  // Se a pessoa clicar em qualquer link de WhatsApp do site após conversar,
  // tenta enviar o resumo antes de abrir o atendimento humano.
  document.querySelectorAll('a[href*="wa.me/5511981210932"]').forEach(link => {
    if (link === whatsappBtn) return;
    link.addEventListener('click', async event => {
      if (!state.ended && state.messages.some(m => m.role === 'user')) {
        event.preventDefault();
        await finalizeSession('encaminhado para atendimento pelo WhatsApp', true);
        window.open(link.href, link.target || '_blank', 'noopener');
      }
    });
  });

  renderInitial();
  resetIdleTimer();
})();
