const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const compactScreen = matchMedia('(max-width: 760px)');
const activeAnimations = new Set();
const easing = 'cubic-bezier(.22, 1, .36, 1)';

export function finishAuthMotion() {
  // O estilo final já está no CSS: cancelar libera foco e cliques imediatamente.
  for (const animation of activeAnimations) animation.cancel();
  activeAnimations.clear();
}

reducedMotion.addEventListener('change', finishAuthMotion);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) finishAuthMotion();
});

function animate(element, frames, options = {}) {
  if (reducedMotion.matches || !element.animate) return;
  const animation = element.animate(frames, {
    duration: compactScreen.matches ? 260 : 360,
    easing,
    fill: 'backwards',
    ...options,
  });
  activeAnimations.add(animation);
  animation.finished.then(
    () => activeAnimations.delete(animation),
    () => activeAnimations.delete(animation),
  );
}

function movingElements(panel) {
  return new Map([
    ['heading', panel.querySelector('.form-heading')],
    ...[...panel.querySelectorAll('.field')].map(field => [field.querySelector('input').id, field]),
    ['submit', panel.querySelector('.primary-button')],
  ]);
}

export function captureAuthLayout(panel) {
  finishAuthMotion();
  return new Map([...movingElements(panel)].map(([key, element]) => [key, element.getBoundingClientRect()]));
}

export function prepareAuthMotion(panel) {
  // Nunca fazer a pessoa perseguir um controle em movimento com mouse ou teclado.
  panel.addEventListener('pointerdown', finishAuthMotion);
  panel.addEventListener('keydown', finishAuthMotion);
  panel.addEventListener('focusin', event => {
    if (event.target.matches('input, button')) finishAuthMotion();
  });
}

export function animateAuthEntrance(panel) {
  let index = 0;
  for (const element of movingElements(panel).values()) {
    animate(element, [
      { opacity: 0, transform: `translateY(${compactScreen.matches ? 8 : 16}px)` },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: compactScreen.matches ? 320 : 520, delay: 100 + index++ * 70 });
  }
}

export function animateAuthChange(panel, previous) {
  for (const [key, element] of movingElements(panel)) {
    const before = previous.get(key);
    const after = element.getBoundingClientRect();
    // FLIP: mede antes/depois e anima só a transformação, sem recalcular o layout a cada quadro.
    // No celular, limita o deslocamento mesmo se a pessoa estava no fim do formulário.
    const limit = compactScreen.matches ? 18 : 100;
    const y = before ? Math.max(-limit, Math.min(limit, before.top - after.top)) : 18;
    const reveal = !before || key === 'heading';
    animate(element, [
      { opacity: reveal ? 0 : 1, transform: `translateY(${y}px)` },
      { opacity: 1, transform: 'translateY(0)' },
    ], !before ? { delay: 80, duration: compactScreen.matches ? 180 : 280 } : {});
  }
  animate(panel.querySelector('.auth-navigation'), [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
}
