import { animateAuthChange, captureAuthLayout } from './auth-motion.js';

const routes = new Map([['/', 'login'], ['/index.html', 'login'], ['/cadastro.html', 'register']]);

// Melhoria progressiva: os links e os dois HTMLs continuam funcionando sem esta navegação.
export function setupAuthNavigation(initializeForm) {
  let controller;
  let revision = 0;

  async function navigate(url, fromHistory = false) {
    const currentRevision = ++revision;
    controller?.abort();
    controller = new AbortController();
    const main = document.querySelector('.auth-panel');
    main.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('Página indisponível');
      const next = new DOMParser().parseFromString(await response.text(), 'text/html');
      const nextMain = next.querySelector('.auth-panel');
      if (!nextMain?.querySelector('#auth-form fieldset') || next.body.dataset.page !== routes.get(url.pathname)) {
        throw new Error('Página de acesso inválida');
      }
      if (currentRevision !== revision) return;

      const previous = captureAuthLayout(main);
      main.replaceWith(nextMain);
      document.body.dataset.page = next.body.dataset.page;
      document.title = next.title;
      document.querySelector('meta[name="description"]').content = next.querySelector('meta[name="description"]').content;
      initializeForm();
      if (!fromHistory) history.pushState(null, '', url);
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Anuncia a nova tela sem jogar o teclado diretamente em um campo no celular.
      const heading = nextMain.querySelector('h1');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      animateAuthChange(nextMain, previous);
    } catch (error) {
      if (currentRevision !== revision || error.name === 'AbortError') return;
      // Falha no efeito ou no carregamento volta à navegação normal do navegador.
      if (fromHistory) location.reload();
      else location.assign(url);
    } finally {
      if (currentRevision === revision) document.querySelector('.auth-panel').removeAttribute('aria-busy');
    }
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !routes.has(url.pathname) || url.search || url.hash) return;
    if (routes.get(url.pathname) === document.body.dataset.page) return;
    event.preventDefault();
    void navigate(url);
  });

  window.addEventListener('popstate', () => {
    const url = new URL(location.href);
    if (routes.has(url.pathname)) void navigate(url, true);
    else location.reload();
  });
}
