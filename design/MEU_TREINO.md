# Meu treino demonstrativo

Atualizado em 29/09/2026. A tela `/treino.html` exercita um diário local de execução com um programa A/B/C definido em JSON. A conta e o perfil são persistidos pela API, mas as respostas ainda não determinam este programa. Os registros de execução permanecem neste navegador.

## Comportamento e dados

- Segunda, quarta e sexta exibem Treinos A, B e C. Os demais dias exibem descanso. A semana abre na data local de hoje. É possível executar hoje uma sessão planejada para outro dia; a data planejada continua separada da data real.
- No desktop, o calendário preserva a hierarquia visual do celular: rótulo **SUA SEMANA**, intervalo de datas em destaque e número do dia em cada cartão, além do nome do treino ou descanso.
- No calendário, treinos concluídos exibem um visto laranja e um cartão em tom de laranja escuro. Treinos planejados já passados sem execução e treinos encerrados incompletos exibem um X vermelho vivo; o rótulo acessível distingue os dois casos. Dias de descanso passados mantêm o fundo padrão e exibem uma lua neutra. Os estados de treino concluído e não realizado aparecem também numa faixa superior. O dia selecionado recebe um contorno branco, sem trocar sua cor de fundo. Hoje e dias futuros sem registro continuam neutros. Um treino ainda ativo não é marcado como falta. Dias anteriores ao início do programa demonstrativo não recebem classificação de falta ou descanso passado.
- Ao selecionar um exercício, o painel com vídeo, histórico, aquecimento e séries abre verticalmente logo abaixo do seu cartão, deslocando os cartões seguintes. Outros cartões podem ser abertos sem fechar os painéis anteriores; selecionar um cartão aberto recolhe somente seu painel com animação. Uma nova seleção durante o recolhimento reverte o movimento a partir da altura atual. Cada painel mantém seus próprios controles de vídeo, carga e séries. Lista e detalhe usam toda a largura disponível, como o calendário, inclusive com a sidebar recolhida. **Começar treino** inicia a execução e abre o primeiro exercício. A seleção funciona por clique e teclado, com animação desativada conforme a preferência de movimento reduzido do navegador.
- O primeiro acesso cria um histórico fictício da semana anterior e o programa do arquivo `frontend/src/js/treino/data/programa-inicial.json`. A chave legada `trainforge.workout-demo.v1` guarda os registros em `localStorage` para preservar dados já salvos. O catálogo e o histórico inicial são exemplos. A restauração exige confirmação e remove somente essa chave.
- Uma execução conserva uma cópia da prescrição recebida. Somente uma sessão pode ficar ativa. Série principal concluída requer carga e repetições realizadas; aquecimento pode ser registrado ou marcado como não realizado. Sessões encerradas são somente para leitura.
- Séries concluídas usam fundo grafite e contorno laranja, com selo de visto e texto **Concluído**. Durante a execução, **Desfazer** continua disponível ao lado do selo; o estado somente para leitura conserva a identificação visual sem ação de desfazer.
- A referência de carga é a primeira série principal concluída da última execução **concluída** do mesmo exercício, equipamento e convenção de carga. Rascunhos e sessões incompletas não entram no cálculo. No exemplo, supino de 40 kg totais gera 20 kg × 8 e 27,5 kg × 5. A regra usa 50% e 70%, arredondados para a maior carga disponível abaixo do percentual e da referência. Com um único aquecimento, sugere 50% × 8. Sem carga compatível, a sugestão fica vazia e a pessoa informa o que realmente usou. Essa heurística não é prescrição validada.
- A duração estimada do JSON considera 5 minutos de preparação geral, 3 segundos por repetição mínima planejada, descansos indicados e 60 segundos de transição entre exercícios: A 39, B 39 e C 37 minutos, todos abaixo dos 50 disponíveis no exemplo. O futuro motor deverá compor e adaptar sessões a dados reais.
- O descanso usa horários persistidos, 60 segundos após aquecimento, 90 segundos após série principal multiarticular e 60 segundos após acessório. O tempo é sugestivo; não bloqueia a próxima série. Ao zerar, o painel mostra **Tempo concluído** e repete um aviso sonoro com vibração até a pessoa silenciar, acrescentar 30 segundos ou encerrar o descanso. O ícone de alto-falante alterna som e vibração juntos; a escolha de silêncio vale para os demais descansos enquanto a página permanece aberta. O aviso visual e os controles continuam disponíveis quando o navegador ou dispositivo não permite áudio ou vibração.
- Falha de armazenamento aparece na interface. A página continua apenas na memória da aba quando a gravação falha. Dados de versão incompatível ou JSON corrompido não são apagados automaticamente.

## Mídia

Os vídeos são demonstrações de dois produtores: **10 do Muscle & Strength** e **5 do Bodybuilding.com**. As páginas dos 15 exercícios foram conferidas em 28/09/2026. A preferência foi manter o Muscle & Strength; cinco vídeos do seu catálogo usam Vimeo com restrição de incorporação fora do site, então foram escolhidos vídeos pertinentes do mesmo canal alternativo para esses casos. Todos os links incorporados nesta demonstração usam YouTube. O player é criado somente ao clicar, sem reprodução automática. O link da fonte permanece visível. A reprodução exige internet e pode ser bloqueada pelo navegador, pela rede ou pelo fornecedor. Os arquivos de vídeo não foram copiados para o projeto.

| Sessão | Exercício | Página da fonte |
| --- | --- | --- |
| A | Supino reto com barra | [Muscle & Strength](https://www.muscleandstrength.com/exercises/barbell-bench-press.html) |
| A | Supino inclinado com halteres | [Muscle & Strength](https://www.muscleandstrength.com/exercises/incline-dumbbell-bench-press.html) |
| A | Desenvolvimento com halteres | [Muscle & Strength](https://www.muscleandstrength.com/exercises/seated-dumbbell-press.html) |
| A | Elevação lateral | [Bodybuilding.com no YouTube](https://www.youtube.com/watch?v=E3abEP8SIh0) |
| A | Tríceps na polia | [Muscle & Strength](https://www.muscleandstrength.com/videos/how-to-perfect-your-tricep-pushdown) |
| B | Puxada frontal | [Muscle & Strength](https://www.muscleandstrength.com/exercises/lat-pull-down.html) |
| B | Remada baixa | [Bodybuilding.com no YouTube](https://www.youtube.com/watch?v=IzoCF_b3cIY) |
| B | Remada unilateral com halter | [Muscle & Strength](https://www.muscleandstrength.com/exercises/one-arm-dumbbell-row.html) |
| B | Rosca direta | [Bodybuilding.com no YouTube](https://www.youtube.com/watch?v=dDI8ClxRS04) |
| B | Rosca martelo | [Bodybuilding.com no YouTube](https://www.youtube.com/watch?v=0IAM2YtviQY) |
| C | Agachamento no Smith | [Muscle & Strength](https://www.muscleandstrength.com/exercises/smith-machine-squat.html) |
| C | Leg press 45° | [Muscle & Strength](https://www.muscleandstrength.com/exercises/45-degree-leg-press.html) |
| C | Cadeira extensora | [Muscle & Strength](https://www.muscleandstrength.com/exercises/leg-extension.html) |
| C | Mesa flexora | [Bodybuilding.com no YouTube](https://www.youtube.com/watch?v=jxctD6fL_FQ) |
| C | Panturrilha na máquina | [Muscle & Strength](https://www.muscleandstrength.com/exercises/standing-machine-calf-raise) |

As 15 imagens WebP em `frontend/public/assets/treino/` foram geradas para o visual da interface. São ilustrações monocromáticas, não instruções de execução. Quando o vídeo está indisponível, a tela conserva o link da fonte e orientações textuais básicas.

## Integração futura

A API já fornece autenticação e perfil. Ainda deverá fornecer o programa gerado e seu histórico imutável, além de validar no servidor qualquer registro de execução que vier a fazer parte do produto. O JSON atual não deve ser confundido com dados gerados nem importado silenciosamente como histórico real. Uma migração de `localStorage` para conta exige decisão sobre consentimento, conflitos entre dispositivos, propriedade dos registros e compatibilidade de versões. O motor de geração permanece pendente.
