const backgrounds = [
  { src: '/assets/treinamento.webp', mobilePosition: 'center 34%' },
  { src: '/assets/treinamento-forca.webp', mobilePosition: 'center 20%' },
  { src: '/assets/treinamento-mobilidade.webp', mobilePosition: 'center 70%' },
  { src: '/assets/treinamento-salto.webp', mobilePosition: 'center 15%' },
  { src: '/assets/treinamento-preparacao.webp', mobilePosition: 'center 100%' },
];

export function setRandomBackground(panel) {
  const selected = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  const photo = new Image();
  let current = selected;

  // Carrega só a foto sorteada e revela o fundo quando ela estiver disponível.
  photo.onload = () => {
    panel.style.setProperty('--brand-image', `url("${current.src}")`);
    panel.style.setProperty('--brand-mobile-position', current.mobilePosition);
    panel.classList.add('has-background');
  };
  photo.onerror = () => {
    if (current === backgrounds[0]) return;
    current = backgrounds[0];
    photo.src = current.src;
  };
  photo.src = current.src;
}
