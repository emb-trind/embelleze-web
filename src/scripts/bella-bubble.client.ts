// Exibe a bolha da Bella após X segundos de inatividade
const DELAY_MS = 8000;

let timer: ReturnType<typeof setTimeout>;

function showBubble() {
  const bubble = document.getElementById('bellaBubble');
  if (bubble) bubble.classList.remove('hidden');
}

function resetTimer() {
  clearTimeout(timer);
  timer = setTimeout(showBubble, DELAY_MS);
}

document.addEventListener('DOMContentLoaded', () => {
  resetTimer();
  ['mousemove', 'scroll', 'keydown', 'touchstart'].forEach(evt =>
    document.addEventListener(evt, resetTimer, { passive: true })
  );
});
