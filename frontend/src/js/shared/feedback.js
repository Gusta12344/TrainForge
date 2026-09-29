let timeout;

export function showFeedback(message, tone = 'info') {
  let notice = document.querySelector('#system-feedback');
  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'system-feedback';
    notice.className = 'system-feedback';
    notice.innerHTML = '<span class="feedback-mark" aria-hidden="true"></span><p></p><button type="button" aria-label="Fechar aviso">×</button>';
    notice.querySelector('button').addEventListener('click', () => {
      clearTimeout(timeout);
      notice.hidden = true;
    });
    document.body.append(notice);
  }
  clearTimeout(timeout);
  notice.querySelector('p').textContent = message;
  notice.dataset.tone = tone;
  notice.setAttribute('role', tone === 'error' ? 'alert' : 'status');
  notice.hidden = false;
  if (tone !== 'error') timeout = setTimeout(() => { notice.hidden = true; }, 5000);
}

export function queueFeedback(message, tone = 'info') {
  try { sessionStorage.setItem('trainforge.next-feedback', JSON.stringify({ message, tone })); } catch { /* Navegação continua sem o aviso. */ }
}

export function showQueuedFeedback() {
  try {
    const raw = sessionStorage.getItem('trainforge.next-feedback');
    if (!raw) return;
    sessionStorage.removeItem('trainforge.next-feedback');
    const next = JSON.parse(raw);
    if (typeof next.message === 'string' && ['info', 'success', 'error'].includes(next.tone)) showFeedback(next.message, next.tone);
  } catch { /* O armazenamento pode estar indisponível. */ }
}
