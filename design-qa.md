# QA visual — Meu treino

final result: passed

## Alinhamento dos campos no celular

- Os campos de carga e repetições de uma série começavam com diferença vertical de 8,4 px porque o rótulo de carga contém a unidade em uma linha adicional. Após alinhar o conteúdo dos rótulos pela base, a diferença medida na prévia de 632 px ficou em 0 px; a página continuou sem rolagem horizontal (`scrollWidth = 617`, viewport de 632 px).

## Correção da confirmação imediata da série

- A conclusão durante o treino atualizava os dados, mas inseria diretamente o botão quadrado antigo. Ao trocar de dia, a renderização completa mostrava o selo **Concluído**. A atualização imediata e a reabertura agora usam a mesma marcação.
- O teste de regressão confirmou selo e ação **Desfazer** na marcação usada pela atualização imediata. `npm test` (7 arquivos) e `npm run build` passaram. A confirmação manual na aba do usuário não foi repetida para preservar seu registro de treino.

## Série concluída — contorno laranja

- A opção visual 2 aprovada para o aquecimento substituiu o fundo verde fosco por fundo grafite, contorno laranja e selo **Concluído**. A ação **Desfazer** permanece na execução ativa; o histórico é somente para leitura.
- [Captura do histórico concluído](design/qa/meu-treino-serie-concluida.png) em largura móvel de 632 px: os campos, o selo e o contorno ficam legíveis, sem rolagem horizontal (`scrollWidth = 617`, viewport de 632 px). A captura usa os registros fictícios já existentes e não alterou a execução atual.
- `npm run build` e `npm test` passaram após o ajuste. A execução ativa com **Desfazer** foi revisada no código; a captura visual usou o histórico de exemplo.

## Situação dos dias no calendário

- Na semana de exemplo, os treinos concluídos exibiram visto e faixa laranja. Os descansos passados conservaram a lua, agora neutra e sobre o mesmo fundo dos dias futuros. O X e a faixa dos treinos não realizados ou incompletos permanecem vermelhos. Os botões anunciam a situação por texto acessível.
- Selecionar o descanso de terça-feira, 22/09, mostrou contorno branco sem preencher o cartão. Selecionar o treino concluído de segunda-feira, 21/09, preservou o fundo laranja escuro e acrescentou o mesmo contorno. O foco por teclado tem contorno branco tracejado. O contraste calculado dos símbolos escuros sobre laranja, vermelho e cinza neutro foi de 6,62:1, 6,42:1 e 13,61:1, respectivamente.
- A semana não apresentou rolagem horizontal em 360 px (`scrollWidth = clientWidth = 345`) nem em 1280 px (`1265 = 1265`).
- Os testes automatizados cobrem treino concluído, incompleto, não realizado, descanso passado, treino ativo, hoje pendente e datas anteriores ao início do programa. `npm test` e `npm run build` passaram.

## Painéis simultâneos

- Na prévia desktop, abrir o supino reto e depois o supino inclinado manteve os dois painéis sob seus respectivos cartões. Fechar o segundo preservou o primeiro aberto. Os painéis têm IDs distintos e nenhum ID duplicado no documento.
- Os botões de séries, carga de referência e vídeo agora identificam o exercício pelo próprio cartão, para que ações em um painel não atuem no outro. `npm test` e `npm run build` passaram após essa mudança.

## Refinamento do acordeão e calendário desktop

- A animação usa uma curva de aceleração e desaceleração que mantém a borda do painel descendo e recolhendo visivelmente. O conteúdo acompanha o movimento vertical: 820/740 ms para abrir/fechar no desktop e 700/640 ms no celular. Movimento reduzido continua imediato; três cliques rápidos mantiveram um único painel e o estado de expansão correto.
- O estilo desktop deixou de ocultar **SUA SEMANA** e de reduzir o intervalo de datas a 14 px. Os números dos dias agora aparecem nos cartões em todas as larguras. A largura total da lista, entregue na revisão anterior, foi preservada.
- [Captura desktop atual com sidebar recolhida](design/qa/meu-treino-desktop-atual.png), em viewport de 1280 px. Nela, **SUA SEMANA**, o intervalo de datas e os números dos dias ficam visíveis. Calendário, lista e painel mediram 1129 px cada com a sidebar recolhida; com a sidebar aberta, calendário e lista mediram 939 px cada. Após a transição da sidebar, `scrollWidth = clientWidth = 1265` px.

## Refinamento de animação e largura

- O limite de `1050px` da lista foi removido. Na prévia de 632 px, calendário, cartões e painel mediram 583 px cada; não houve rolagem horizontal. No desktop, todos usam o mesmo contêiner da página, que também cresce quando a sidebar é recolhida.
- A abertura anima altura e conteúdo; o fechamento anima a altura de volta a zero antes de remover o painel. Esta primeira versão usou 520/430 ms no desktop e 400/340 ms no celular; foi substituída pelos tempos e pela curva da revisão acima após novo feedback. Três cliques rápidos no mesmo cartão terminaram com um único painel aberto e estado `aria-expanded` correto; o fechamento completo deixou zero painéis. Movimento reduzido aplica o estado final imediatamente.
- [Captura atual](design/qa/meu-treino-detalhe-apos-cartao.png). O console da prévia não apresentou erros após as interações.

## Revisão após ajuste da abertura dos exercícios

- Após a correção do usuário, o detalhe abre imediatamente abaixo do cartão escolhido e desloca os cartões seguintes. [Captura atual](design/qa/meu-treino-detalhe-apos-cartao.png), feita com viewport de 632 × 710 px. A expansão anima a altura do painel; o conteúdo fica interativo de imediato e a animação pode ser interrompida.
- No navegador, trocar do primeiro para o segundo exercício manteve o cartão escolhido a 317 px do topo e a rolagem em 294 px até o fim da animação. Havia um único painel, dentro do cartão selecionado. Recolher o cartão deixou zero painéis; Enter abriu o terceiro e manteve o foco no botão. Sem erro no console nem rolagem horizontal (`scrollWidth = clientWidth = 617` px).
- **Começar treino** abriu o primeiro exercício e exibiu suas cinco séries no teste de interação. `npm test` e `npm run build` passaram após a alteração.
- As setas da semana avançaram de 28/09–04/10 para 05/10–11/10; **Hoje** retornou à semana atual. Elas navegam por semana, e cada dia da faixa pode ser selecionado diretamente.
- As capturas e comparações da seção seguinte documentam a composição inicial, com detalhe em coluna lateral. Servem como registro da referência original; a nova disposição vertical segue o ajuste solicitado depois.

## Evidência e estado

- Verdade visual: `planejamentos/meu-treino/conceito-aprovado.png` (referência local fornecida pelo usuário, 1536 × 1024 px).
- Implementação: [captura desktop](design/qa/meu-treino-desktop.png), [comparação completa](design/qa/meu-treino-comparacao.png) e [comparação do detalhe](design/qa/meu-treino-detalhe.png). Capturas complementares: [celular](design/qa/meu-treino-mobile.png) e [tablet](design/qa/meu-treino-tablet.png).
- Viewport desktop CSS 1536 × 1024 px, densidade 1. O navegador retornou 1521 × 1014 px de conteúdo visível na captura, por excluir sua barra de rolagem/área de controle. A comparação mantém os pixels nativos; o quadro direito fica 15 px mais estreito e 10 px mais baixo. Não foi aplicado zoom nem ajuste de escala.
- Estado comparado: Treino A selecionado, sidebar expandida, primeiro exercício aberto e execução iniciada em 28/09/2026. A referência mostra carga/repetições de uma série ilustrativa; a implementação espera o registro real. A data, o nome completo dos exercícios e a estimativa de 39 min vêm do fixture funcional.

## Achados e comparação

Na comparação da composição anterior, não restavam divergências P0, P1 ou P2 sem tratamento. Ela registrou lateral fixa, título condensado branco/laranja, semana em linha, lista à esquerda e detalhe à direita. A comparação focada confirmou peso tipográfico, bordas, foto monocromática, botão de play e faixa de metadados. A revisão acima substitui a posição do detalhe na interface atual.

| Superfície | Evidência e avaliação |
| --- | --- |
| Fontes e tipografia | Barlow e Barlow Condensed locais preservam a hierarquia do conceito. Cabeçalhos, rótulos pequenos e números foram inspecionados na captura focada; há diferença discreta de tamanho em alguns metadados, classificada P3. |
| Espaçamento e layout | Sidebar de 266 px, linha semanal e divisão lista/detalhe seguem a referência. Histórico, carga de referência e aquecimento criam conteúdo adicional antes das séries principais; essa altura resulta dos requisitos funcionais. A semana mostra data e controles de navegação reais. |
| Cores e contraste | Fundo grafite, texto claro e laranja seguem os tokens existentes. Cálculo dos pares principais: `#b4bac1`/`#1b1e21` = 8,56:1; `#ff6b35`/`#111315` = 6,57:1; `#101214`/`#ff6b35` = 6,62:1. |
| Imagens e qualidade | Logo SVG existente; 15 posters WebP ilustrativos e monocromáticos, com enquadramentos específicos por exercício. A foto do supino difere da referência, mas mantém o assunto e a direção visual (P3). Os posters são rotulados como ilustração. |
| Cópia e conteúdo | Título e hierarquia dos treinos correspondem ao conceito. Nomes completos, histórico fictício, aquecimento, status local e links de fonte são acréscimos funcionais. Não há texto provisório apresentado como dado real. |

### Histórico de correções P2

1. Em 1024 px, o `aspect-ratio` com altura mínima impunha largura extra ao poster. Foi adicionado `width: 100%` e `min-width: 0`. Medição posterior: `scrollWidth = clientWidth = 1009`.
2. Em 360 e 768 px, as colunas da lista geravam 5 px de rolagem lateral. Foram aplicados `minmax(0,1fr)` no detalhe e cards com largura mínima apropriada ao tablet. Após a correção, `scrollWidth = clientWidth`: 345/345 a 360 px, 375/375 a 390 px, 753/753 a 768 px, 1009/1009 a 1024 px e 1425/1425 a 1440 px. As capturas móvel e tablet registram o resultado.
3. No descanso móvel expirado, a mensagem de tempo concluído estava oculta no painel compacto. Ela agora aparece quando o relógio chega a zero; o aviso de descanso flexível continua visível. A captura móvel e a inspeção de `display: block` confirmaram a correção.

## Interação observada no navegador

- Seleção de dia e exercício alternada dez vezes cada: último estado correto, um único detalhe e nenhum player/ID duplicado. Menu desktop alternado dez vezes sem sobreposição nem rolagem lateral.
- Aquecimento A1 concluído: linha desabilitada, opção separada de desfazer e timer iniciado. Recarregar manteve o registro e o horário do descanso. Com descanso aberto em 360 px, o campo A2 ficou acima do painel e permaneceu focado.
- Gaveta móvel: abriu com foco no fechamento; Escape fechou, devolveu foco ao botão de menu e liberou a rolagem. Player criado somente após clique, com URL da fonte visível.
- Em duas abas, iniciar um treino na segunda exibiu aviso de dados desatualizados na primeira; tentar iniciar ali foi bloqueado até recarregar.
- `finalTab.dev.logs` não registrou erros de console na captura final. `npm test` e `npm run build` passaram.

## Limites do ensaio

- A renderização do player remoto no navegador embutido não comprovou reprodução audiovisual. Os 15 URLs são vídeos reais verificados nas páginas/descrições das fontes; o link direto fica disponível. Cinco opções Vimeo do Muscle & Strength foram descartadas porque o próprio player informou bloqueio de privacidade fora do site. O catálogo final usa dez vídeos do Muscle & Strength e cinco do Bodybuilding.com no YouTube.
- Não foram medidos 60 fps, duração exata da coreografia, 4G simulado, zoom do navegador, teclado virtual real nem a troca de `prefers-reduced-motion` durante animação. Essas medições não são afirmadas como atendidas.

## Ajustes opcionais P3

- Reduzir ligeiramente a altura do cabeçalho e dos blocos informativos se a equipe preferir séries principais mais próximas da primeira dobra no desktop.
- Refinar o enquadramento dos posters para aproximar ainda mais as fotos da referência.
