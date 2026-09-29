import { createIcons, Mail, LockKeyhole, Eye, EyeOff, ArrowRight, ArrowUpRight, UserRound } from 'lucide';
import { validateAuth } from './validation.js';
import { setRandomBackground } from './background.js';
import '../../styles/global.css';
import '../../styles/auth.css';
import { setupAuthNavigation } from './auth-navigation.js';
import { destinationAfterAuth } from './flow.js';
import { queueFeedback, showQueuedFeedback } from '../shared/feedback.js';
import { setupPhotoMotion } from './photo-motion.js';
import { animateAuthEntrance, prepareAuthMotion } from './auth-motion.js';

setRandomBackground(document.querySelector('.brand-panel'));
setupPhotoMotion(document.querySelector('.brand-panel'));

document.querySelector('[data-brand]').innerHTML = `
  <a class="brand-link" href="/" aria-label="TrainForge — início">
    <img src="/assets/logo-trainforge.svg" alt="TrainForge" width="250" height="55" />
  </a>
  <div class="brand-message">
    <p class="brand-headline"><span><span>Seu treino.</span></span><span><span>Sua rotina.</span></span><span><span>Sua forja.</span></span></p>
  </div>
  <div class="brand-bottom">
    <svg class="court-lines" viewBox="0 0 720 210" fill="none" aria-hidden="true">
      <path class="court-stroke" pathLength="1" d="M-100 15 470 100 900 320" />
      <path class="court-stroke" pathLength="1" d="M-50 125 120 48" />
      <path class="court-stroke" pathLength="1" d="M-70 255 420 92" />
      <path class="court-dash" d="m-50 185 330-114" />
    </svg>
  </div>`;

const icons = { Mail, LockKeyhole, Eye, EyeOff, ArrowRight, ArrowUpRight, UserRound };
const refreshIcons = () => createIcons({ icons, attrs: { 'stroke-width': 1.7, 'aria-hidden': 'true' } });
let resetForm = initializeAuth();
showQueuedFeedback();
animateAuthEntrance(document.querySelector('.auth-panel'));
window.addEventListener('pageshow', () => resetForm());
setupAuthNavigation(() => { resetForm = initializeAuth(); });

function initializeAuth() {
  refreshIcons();
  prepareAuthMotion(document.querySelector('.auth-panel'));
  const form = document.querySelector('#auth-form');
  const mode = document.body.dataset.page;
  const feedback = document.querySelector('.form-feedback');
  const fields = [...form.querySelectorAll('input')];
  const password = form.elements.password;
  const toggle = document.querySelector('.password-toggle');

  toggle.addEventListener('click', () => {
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(show));
    toggle.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
    toggle.innerHTML = `<i data-lucide="${show ? 'eye-off' : 'eye'}" aria-hidden="true"></i>`;
    refreshIcons();
  });

  function showFieldError(field, message) {
    const error = document.getElementById(`${field.id}-error`);
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (message) error.querySelector('p').textContent = message;
    error.hidden = false;
    error.classList.toggle('is-visible', Boolean(message));
    error.setAttribute('aria-hidden', String(!message));
    const descriptions = (field.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== error.id);
    if (message) descriptions.push(error.id);
    if (descriptions.length) field.setAttribute('aria-describedby', descriptions.join(' '));
    else field.removeAttribute('aria-describedby');
  }

  function values() {
    return Object.fromEntries(new FormData(form));
  }

  for (const field of fields) {
    field.addEventListener('blur', () => {
      // Só antecipa a validação quando a pessoa já começou a preencher o campo.
      if (field.value || field.getAttribute('aria-invalid') === 'true') {
        showFieldError(field, validateAuth(values(), mode)[field.name]);
      }
    });
    field.addEventListener('input', () => {
      feedback.hidden = true;
      if (field.getAttribute('aria-invalid') === 'true') {
        showFieldError(field, validateAuth(values(), mode)[field.name]);
      }
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errors = validateAuth(values(), mode);
    fields.forEach((field) => showFieldError(field, errors[field.name]));
    const firstInvalid = fields.find((field) => errors[field.name]);
    if (firstInvalid) {
      feedback.hidden = true;
      firstInvalid.focus();
      return;
    }

    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    feedback.dataset.state = 'pending';
    feedback.textContent = mode === 'register' ? 'Criando sua conta…' : 'Entrando…';
    feedback.hidden = false;
    try {
      const response = await fetch(mode === 'register' ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(values()),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.field) showFieldError(form.elements[result.field], result.error);
        feedback.dataset.state = 'error';
        feedback.textContent = result.error || 'Não foi possível concluir. Tente novamente.';
        feedback.focus();
        return;
      }
      password.value = '';
      if (mode === 'register') {
        queueFeedback('Conta criada. Complete o questionário para salvar seu perfil.','success');
        location.assign(destinationAfterAuth(mode));
        return;
      }
      feedback.textContent = 'Acesso confirmado. Carregando seu espaço…';
      const profileResponse = await fetch('/api/profile', { credentials: 'same-origin' });
      if (!profileResponse.ok) throw new Error('Não foi possível carregar seu perfil. Tente novamente.');
      const destination = destinationAfterAuth(mode, await profileResponse.json());
      queueFeedback(destination === '/treino.html' ? 'Login realizado. Bem-vindo ao seu espaço.' : 'Login realizado. Complete seu questionário.','success');
      location.assign(destination);
    } catch (error) {
      feedback.dataset.state = 'error';
      feedback.textContent = error.message?.startsWith('Não foi possível carregar seu perfil') ? error.message : 'Não foi possível conectar ao servidor. Confira se ele está ligado.';
      feedback.focus();
    } finally {
      submit.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });

  // Evita reexibir uma senha digitada ao voltar pelo histórico do navegador.
  const resetSensitiveState = () => {
    password.value = '';
    password.type = 'password';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.setAttribute('aria-label', 'Mostrar senha');
    toggle.innerHTML = '<i data-lucide="eye" aria-hidden="true"></i>';
    refreshIcons();
    feedback.hidden = true;
    delete feedback.dataset.state;
    fields.forEach((field) => showFieldError(field, ''));
  };

  // Sem JavaScript (ou se a inicialização falhar), o HTML permanece sem envio possível.
  resetSensitiveState();
  form.querySelector('fieldset').disabled = false;
  return resetSensitiveState;
}
