export function setupPhotoMotion(panel) {
  const enabled = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px) and (prefers-reduced-motion: no-preference)');
  let frame;

  const reset = () => {
    cancelAnimationFrame(frame);
    panel.style.setProperty('--photo-x', '0px');
    panel.style.setProperty('--photo-y', '0px');
    panel.style.setProperty('--lines-x', '0px');
    panel.style.setProperty('--lines-y', '0px');
  };

  panel.addEventListener('pointermove', (event) => {
    if (!enabled.matches || event.pointerType !== 'mouse') return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      panel.style.setProperty('--photo-x', `${x * 12}px`);
      panel.style.setProperty('--photo-y', `${y * 12}px`);
      panel.style.setProperty('--lines-x', `${x * -6}px`);
      panel.style.setProperty('--lines-y', `${y * -6}px`);
    });
  });
  panel.addEventListener('pointerleave', reset);
  enabled.addEventListener('change', reset);
  window.addEventListener('blur', reset);
}
