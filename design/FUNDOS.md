# Fotografias de fundo

Criadas em 17/09/2026 com a ferramenta integrada de geração de imagens. O conjunto tem cinco fotos: a original com magnésio e quatro cenas de preparação física. Não é necessário representar diretamente o vôlei.

A cada carregamento de login ou cadastro, uma das cinco fotos é sorteada com a mesma probabilidade. Repetições são possíveis. A imagem permanece fixa durante o preenchimento e na navegação animada entre login e cadastro, inclusive ao voltar e avançar dentro desse fluxo. Um acesso direto ou recarregamento completo faz um novo sorteio. Apenas a escolhida é carregada. Se falhar, a interface tenta a foto original; se ela também falhar, mantém o fundo grafite. Não há armazenamento da escolha nem novas dependências.

## Arquivos

- [Preparação com magnésio](../frontend/public/assets/treinamento.webp), foto original.
- [Halteres](../frontend/public/assets/treinamento-forca.webp).
- [Mobilidade](../frontend/public/assets/treinamento-mobilidade.webp).
- [Salto](../frontend/public/assets/treinamento-salto.webp).
- [Preparação do calçado](../frontend/public/assets/treinamento-preparacao.webp).

As novas imagens foram convertidas em WebP com qualidade 80, mantendo a resolução de 1122 × 1402 px. O enquadramento mobile é configurado individualmente em `frontend/src/js/auth/background.js`. O CSS adiciona escurecimento localizado para legibilidade. No desktop com mouse, `photo-motion.js` permite deslocamento de até 6 px por eixo e retorna ao centro ao sair da foto. Touch, telas de até 760 px e preferência por movimento reduzido desativam esse efeito.

## Prompts das quatro novas fotos

### forca

Use case: photorealistic-natural. Create one portrait 4:5 editorial photograph for the background of TrainForge, a physical training website. Natural believable adult athlete, candid everyday training, not a glossy stock advertisement, realistic anatomy and equipment. Black-and-white low-key photography, graphite shadows, soft directional window rim light, subtle film grain, controlled highlights. Subject mainly in right half and lower half, left upper 55% very dark quiet negative space for large UI typography; entire scene photographic, no drawn gradient or UI. Plain dark athletic clothing with no branding. No text, numbers, logos, watermark, graphic overlays, sports balls or volleyball courts. Scene: adult male athlete with short hair, three-quarter rear view, standing upright holding a pair of dumbbells at his sides between strength sets in a dim ordinary gym. Medium-wide framing to include legs and both dumbbells, natural proportions, quiet focused moment. Different person from any prior image.

### mobilidade

Use case: photorealistic-natural. Create one portrait 4:5 editorial photograph for the background of TrainForge, a physical training website. Natural believable adult athlete, candid everyday training, not a glossy stock advertisement, realistic anatomy and equipment. Black-and-white low-key photography, graphite shadows, soft directional window rim light, subtle film grain, controlled highlights. Subject mainly in right half and lower half, left upper 55% very dark quiet negative space for large UI typography; entire scene photographic, no drawn gradient or UI. Plain dark athletic clothing with no branding. No text, numbers, logos, watermark, graphic overlays, sports balls or volleyball courts. Scene: adult female athlete with tied back hair doing a half-kneeling hip mobility warm-up on a dark exercise mat, side view, one knee on mat and other foot planted forward, upright relaxed torso and hands resting on forward thigh. Wide enough to show full body, located lower right, softly defocused plain gym wall behind.

### salto

Use case: photorealistic-natural. Create one portrait 4:5 editorial photograph for the background of TrainForge, a physical training website. Natural believable adult athlete, candid everyday training, not a glossy stock advertisement, realistic anatomy and equipment. Black-and-white low-key photography, graphite shadows, soft directional window rim light, subtle film grain, controlled highlights. Subject mainly in right half and lower half, left upper 55% very dark quiet negative space for large UI typography; entire scene photographic, no drawn gradient or UI. Plain dark athletic clothing with no branding. No text, numbers, logos, watermark, graphic overlays, sports balls or volleyball courts. Scene: adult male athlete in profile performing a modest vertical jump during physical conditioning in a dim training studio, full body, both feet clearly just above floor, knees lightly bent, arms naturally swinging, realistic achievable motion frozen by fast shutter. Subject on right, dark uncluttered gym floor and distant training rack. No jumping box.

### preparacao

Use case: photorealistic-natural. Create one portrait 4:5 editorial photograph for the background of TrainForge, a physical training website. Natural believable adult athlete, candid everyday training, not a glossy stock advertisement, realistic anatomy and equipment. Black-and-white low-key photography, graphite shadows, soft directional window rim light, subtle film grain, controlled highlights. Subject mainly in right half and lower half, left upper 55% very dark quiet negative space for large UI typography; entire scene photographic, no drawn gradient or UI. Plain dark athletic clothing with no branding. No text, numbers, logos, watermark, graphic overlays, sports balls or volleyball courts. Scene: close editorial detail of an adult athlete seated on a plain training bench bending down to tie the laces of a training shoe before a workout. Three-quarter side angle, hands and shoe in the lower right center, legs and edge of bench visible, distant dumbbell rack softly out of focus. Believable hands and laces, plain socks and unbranded shoes. Upper left mostly quiet shadow.
