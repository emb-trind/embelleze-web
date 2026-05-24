interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const chatHistory: ChatMessage[] = [];
let greeted = false;
let isLoading = false;

const root    = document.getElementById('bella-fab-root') as HTMLElement;
const panel   = document.getElementById('bella-panel') as HTMLElement;
const btn     = document.getElementById('bella-fab-btn') as HTMLButtonElement;
const closeBtn= document.getElementById('bella-close') as HTMLButtonElement;
const msgs    = document.getElementById('bella-messages') as HTMLElement;
const input   = document.getElementById('bella-input') as HTMLInputElement;
const sendBtn = document.getElementById('bella-send') as HTMLButtonElement;
const waCta   = document.getElementById('bella-wa-cta') as HTMLAnchorElement;

const GREETING = root.dataset.greeting ?? '';

function openPanel() {
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  btn.setAttribute('aria-expanded', 'true');
  input.focus();
  if (!greeted) {
    greeted = true;
    setTimeout(() => appendBella(GREETING), 400);
  }
}

function closePanel() {
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  btn.setAttribute('aria-expanded', 'false');
}

function scrollBottom() {
  msgs.scrollTop = msgs.scrollHeight;
}

function formatMessage(text: string): string {
  // 1. strip wa.me links before any other processing (raw or markdown form)
  const noWa = text
    .replace(/\[([^\]]*)\]\(https?:\/\/wa\.me\/[^)]*\)/g, '')  // [text](wa.me/...)
    .replace(/https?:\/\/wa\.me\/[^\s)]+/g, '');                // raw wa.me/...

  // 2. escape HTML
  const escaped = noWa
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 3. markdown links [text](url) → <a>
  const mdLinks = escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>'
  );

  // 4. remaining bare URLs → <a>
  const linked = mdLinks.replace(
    /(https?:\/\/[^\s<"']+)/g,
    '<a href="$1" target="_blank" rel="noopener">$1</a>'
  );

  const headings = linked.replace(/^#{1,3}\s+(.+)$/gm, '<strong>$1</strong>');
  const bold = headings.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const hrs = bold.replace(/^---+$/gm, '<hr>');
  return hrs.replace(/\n/g, '<br>').replace(/(<br>)+$/g, '');
}

function appendMessage(content: string, role: 'bella' | 'user') {
  const div = document.createElement('div');
  div.className = `bella-msg bella-msg--${role}`;
  div.innerHTML = formatMessage(content);
  msgs.appendChild(div);
  scrollBottom();
}

function appendBella(content: string) {
  chatHistory.push({ role: 'assistant', content });
  appendMessage(content, 'bella');
  if (/99481-3565|wa\.me|consultora agora|encaminhar|botão verde|pra consultora|pelo whatsapp/i.test(content)) {
    waCta.style.display = 'flex';
  }
}

function showTyping() {
  const el = document.createElement('div');
  el.className = 'bella-typing';
  el.id = 'bella-typing';
  el.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(el);
  scrollBottom();
}

function removeTyping() {
  document.getElementById('bella-typing')?.remove();
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text || isLoading) return;

  input.value = '';
  isLoading = true;
  sendBtn.disabled = true;

  appendMessage(text, 'user');
  chatHistory.push({ role: 'user', content: text });
  showTyping();

  try {
    const res = await fetch('/api/bella/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: chatHistory.slice(-10) }),
    });

    removeTyping();

    if (!res.ok) {
      appendBella('Hmm, tive um probleminha aqui. Pode me chamar direto no WhatsApp? 😊');
      waCta.style.display = 'flex';
      return;
    }

    const data = await res.json();
    if (data.reply) appendBella(data.reply);
  } catch {
    removeTyping();
    appendBella('Parece que a conexão caiu. Me chama no WhatsApp que eu te atendo! 😊');
    waCta.style.display = 'flex';
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

btn.addEventListener('click', openPanel);
closeBtn.addEventListener('click', closePanel);
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

document.addEventListener('click', (e) => {
  if (panel.classList.contains('open') && !root.contains(e.target as Node)) {
    closePanel();
  }
});
