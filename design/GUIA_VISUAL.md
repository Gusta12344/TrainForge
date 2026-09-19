# Identidade visual do TrainForge

Direção inicial criada em 17/09/2026, a partir da autorização para desenvolver a marca e as telas de acesso. A identidade pode ser refinada durante o projeto; não representa aprovação externa nem registro de marca.

## Conceito

Esporte contemporâneo, com força tipográfica, fotografia de preparação física e marcações sutis de quadra. O monograma TF combina barras geométricas com cortes diagonais. A ideia de forja aparece na construção da forma e no laranja, sem depender de ilustrações de fogo ou equipamentos.

Hipertrofia, força e preparação física orientam a linguagem. Vôlei faz parte do escopo, mas as fotos não precisam demonstrar a modalidade: o foco está no treino. Evitar promessas de resultado, referências a progressão registrada, estatísticas fictícias e elementos que sugiram funcionalidades não implementadas.

## Arquivos da marca

- [Logo principal](../frontend/public/assets/logo-trainforge.svg): símbolo laranja e nome claro, para fundos escuros.
- [Logo escura](../frontend/public/assets/logo-trainforge-escura.svg): para fundos claros.
- [Logo branca](../frontend/public/assets/logo-trainforge-branca.svg): uso monocromático.
- [Símbolo](../frontend/public/assets/simbolo.svg): monograma para favicon e espaços pequenos.

Todos são SVG com formas vetoriais; o nome está convertido em curvas, sem depender de uma fonte instalada. Não esticar a marca. Manter uma área livre equivalente à espessura da barra superior do símbolo. Usar a assinatura completa a partir de 160 px; abaixo disso, preferir o símbolo, a partir de 24 px.

A tipografia da assinatura deriva de Barlow Condensed ExtraBold, sob SIL Open Font License. A licença está em [LICENCA-FONTE.txt](LICENCA-FONTE.txt).

## Cores e tipografia

| Uso | Cor |
| --- | --- |
| Fundo | `#111315` |
| Campos | `#1B1E21` |
| Texto principal | `#F4F3EF` |
| Texto secundário | `#B4BAC1` |
| Ação e destaque | `#FF6B35` |
| Borda de campo | `#646C76` |
| Erro | `#FFA293` |

Barlow Condensed 700/800 nos títulos e ações; Barlow 400/500/600 no corpo, rótulos e campos. As fontes são empacotadas localmente, sem requisições ao Google Fonts. Lucide fornece ícones de linha com espessura consistente.

## Interface e movimento

Desktop: duas áreas, fotografia à esquerda e formulário diretamente sobre o grafite à direita. Mobile: cabeçalho visual compacto e formulário em uma coluna. Campos de pelo menos 54 px de altura e controle de senha de 48 px. Foco laranja visível e erros associados aos campos.

Refinamento aprovado em 18/09/2026: direção esportiva premium, com degradê grafite, luz laranja discreta na divisão dos painéis e campos com profundidade suave. A marca e as cinco fotografias existentes foram preservadas; a imagem conceitual representa a direção, sem substituir os ativos reais.

- Logo entra em 600 ms; títulos são revelados por máscaras em 700 ms, com intervalos de 90 ms. A foto aproxima 4,5% e assenta em 1 segundo; as linhas se desenham uma vez.
- Título do formulário, campos e botão entram em 520 ms cada, com intervalos de 70 ms e deslocamento de 16 px. A entrada termina em cerca de 0,9 segundo no cadastro.
- A troca entre telas reposiciona os campos existentes por transformação em 360 ms. O campo Nome aparece após 80 ms, terminando junto aos demais. Marca e foto não são recriadas. O formulário permanece disponível; clicar, usar o teclado ou focar um controle encerra imediatamente seu movimento.
- Campos destacam borda e ícone em 200 ms, com halo suave. Erros mantêm a expansão em 220 ms. O botão recebe um reflexo único de 650 ms no hover/foco, elevação de 2 px e compressão leve ao pressionar, sem repetição contínua.
- A foto acompanha o mouse em até 6 px por eixo; linhas respondem no sentido oposto, em até 3 px. Ao sair ou perder foco, voltam ao centro.
- No celular não há parallax: entradas de 320 ms, deslocamento de 8 px e transição de 260 ms com deslocamento limitado a 18 px. O topo fotográfico permanece compacto.
- `prefers-reduced-motion` desliga animações/transições CSS e impede animações JavaScript. Alterar essa preferência ou ocultar a aba cancela movimentos pendentes do formulário. A implementação usa CSS e a API nativa de animações, sem GSAP ou outro framework.

Login e cadastro sorteiam uma entre cinco fotografias a cada carregamento. O painel permanece na troca animada entre as telas, sem novo sorteio. Não há troca automática durante o preenchimento. As cenas, arquivos, comportamento e prompts estão em [FUNDOS.md](FUNDOS.md).

## Conceitos e aplicação

- [Direção artística](direcao-artistica.png).
- [Conceito de login](conceito-login.png).
- [Conceito de cadastro](conceito-cadastro.png).

Os conceitos raster foram produzidos com a ferramenta integrada de geração de imagens. São referências de composição; os arquivos SVG e os estilos da interface são a especificação reproduzível. A marca final foi refinada em vetor para eliminar ruído e garantir nitidez. A fotografia foi gerada separadamente e convertida em WebP, com aproximadamente 110 KiB.

Diferenças intencionais em relação aos conceitos: fontes reais Barlow, placeholder de senha vazio, ícone de navegação e retorno de formulário sem simular autenticação. No celular, um degradê neutro escurece a região do texto sobre a fotografia para melhorar a leitura. Em 17/09/2026, a pedido do usuário, foram retiradas das duas telas a frase “Um programa que começa em você.” e a lista inferior “Hipertrofia / Força / Vôlei”, para reduzir os textos promocionais. Em 18/09/2026, também foram retirados a frase “Seu espaço para treinar com direção.”, seu ícone de apoio e o rótulo “Prévia de interface” do rodapé. A submissão continua informando que o acesso real ainda não foi implementado.

## Briefs utilizados na geração

1. **Identidade:** prancha de marca esportiva contemporânea para TRAINFORGE, monograma TF angular original, grafite `#111315`, branco `#F4F3EF`, laranja `#FF6B35`, tipografia condensada forte, versões monocromáticas e referência sutil às linhas de quadra; sem cyberpunk, brilho neon, halter genérico ou silhueta de fisiculturista.
2. **Login:** composição desktop de duas colunas, fotografia monocromática de mulher adulta preparando as mãos com magnésio numa academia, logo no alto, “SEU TREINO. SUA ROTINA. SUA FORJA.”, “Um programa que começa em você.”; formulário com “Bom ter você de volta.”, e-mail, senha, botão “Entrar”, navegação para cadastro; sem login social ou métricas fictícias.
3. **Cadastro:** preservar a composição do login; título “Sua jornada começa aqui.”, campos nome/e-mail/senha, orientação de 12 caracteres, botão “Criar conta” e retorno para login. Sem campos ou funcionalidades extras.
4. **Fotografia:** extrair e regenerar apenas a fotografia do conceito, mantendo sujeito, enquadramento e luz; remover todo texto, logo, controles e linhas gráficas.

Esses briefs resumem as instruções de produção dos conceitos; os arquivos finais acima são a referência visual mantida no repositório.
