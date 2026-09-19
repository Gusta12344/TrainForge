# Verificação da primeira interface

Data: 17/09/2026. Escopo: identidade visual e prévia de login/cadastro, branch local `base-autenticacao`.

## Resultado funcional

- Cinco testes de validação passaram: campos obrigatórios, e-mail inválido, entradas válidas com acento/espaços externos, limites de nova senha e regra específica do login.
- `npm test` e `npm run build` concluídos sem falhas. O runner neste ambiente resume a execução como um arquivo; executar `node frontend/tests/validation.test.js` mostra os cinco casos individualmente.
- Verificados no navegador integrado: navegar entre login e cadastro, campos vazios, senha curta, correção dos erros, mostrar senha e submissão válida com aviso explícito de prévia.
- Submissões não criam sessão, não enviam requisições de autenticação e não persistem credenciais no código da interface.
- Revisão independente identificou o risco de envio HTML padrão caso o módulo falhasse. Corrigido com `fieldset disabled` no HTML e habilitação somente após registrar os eventos. Uma cópia temporária do cadastro sem o módulo confirmou campos e botão desabilitados; a cópia foi removida.

## Responsividade e acessibilidade

- Login e cadastro conferidos em viewport de 360 × 800 px, sem elementos excedendo a largura disponível e sem rolagem horizontal. A rolagem vertical é prevista.
- Desktop conferido em 1504 × 1046 px, dimensões dos conceitos.
- Teclado: sequência nome → e-mail → senha → controle de visibilidade; rótulos e foco visível presentes. O primeiro campo inválido recebe foco ao submeter.
- Contraste calculado sobre as cores efetivamente usadas: texto principal 16,77:1; secundário 9,52:1; placeholder 7,22:1; texto do botão 6,35:1; link laranja 6,57:1; erro 8,64:1; indicação de prévia 8,40:1. Esses números cobrem as superfícies sólidas, não uma medição exaustiva de pixels sobre a fotografia.
- Escurecimento localizado adicionado atrás do texto no mobile para melhorar a legibilidade sobre a foto.
- As regras de `prefers-reduced-motion` foram inspecionadas no CSS e desativam animações/transições. A preferência do sistema não foi alterada ou emulada durante esta conferência.
- A navegação utiliza páginas HTML normais. Uma transição nativa entre documentos foi removida após interrupções na captura do navegador; as animações de entrada e dos controles continuam em CSS.

## Comparação visual

Conceitos: `design/conceito-login.png` e `design/conceito-cadastro.png`. Capturas reais do navegador foram inspecionadas ao lado dos conceitos com o visualizador de imagens.

| Ponto | Resultado / decisão |
| --- | --- |
| Composição | Preservadas duas colunas, imagem à esquerda e formulário sem cartão à direita. |
| Paleta | Grafite, branco suave e laranja preservados; cores de apoio ajustadas para contraste. |
| Tipografia | Hierarquia esportiva preservada usando Barlow e Barlow Condensed locais. Letras reais diferem do raster conceitual. |
| Marca | TF e assinatura reproduzidos em SVG com curvas limpas; proporções refinadas para uso em tamanhos menores. |
| Fotografia | Mesmo motivo e linguagem monocromática, com enquadramento responsivo; imagem de produção gerada separadamente. |
| Formulários e ícones | Campos e ações preservados; Lucide consistente, estados de foco/erro e controle de senha funcionais. |
| Texto | Títulos, descrições, rótulos e ações conferidos. Acréscimos intencionais: identificação da prévia e mensagens de validação/limitação. Senha não vem preenchida. |
| Linhas decorativas | Afastadas do texto inferior para evitar sobreposição. |
| Mobile | Composição própria de uma coluna; foto reduzida e formulário utilizável em 360 px. |

## Limites e próxima integração


### Atualização: acabamento e animações coordenadas — 18/09/2026

- Implementados: títulos revelados por máscaras, entrada do formulário em sequência, foto e linhas em camadas opostas, luz na divisão dos painéis, foco iluminado, reflexo do botão e compressão ao pressionar. A troca login/cadastro reposiciona campos e revela Nome sem recriar a marca/foto. Nenhuma dependência nova.
- Conferência no navegador integrado, em `http://127.0.0.1:5173/`: desktop 1280 × 800 e 1280 × 720; mobile 360 × 800. Login e cadastro sem rolagem horizontal. Após ajuste do espaçamento, cadastro sem erros cabe nos 720 px de altura; erros e avisos podem exigir rolagem vertical. Capturas desktop e mobile foram inspecionadas; não houve tela vazia persistente nem sobreposição de erro do Vite.
- Navegação login → cadastro → voltar → avançar preservou a foto e limpou senha, visibilidade e feedback. Tab após o título alcançou Nome. Campos vazios exibiram os erros esperados; entradas fictícias válidas recolheram as mensagens (altura e opacidade zero). Mostrar senha e submissão com aviso de prévia funcionaram.
- Instrumentação temporária de `getAnimations()` confirmou entrada desktop de 520 ms por elemento, com atrasos de 100/170/240/310 ms no login; troca de 360 ms, com Nome entrando em 280 ms após 80 ms. No mobile, entrada de 320 ms e troca de 260 ms (Nome: 180 ms após 80 ms). A cópia de teste foi removida.
- Uma alteração de `matchMedia` simulada na cópia temporária durante a transição cancelou todas as animações JavaScript do formulário, sem rejeição não tratada. A navegação permaneceu funcional com a preferência simulada. A preferência nativa do sistema não foi alterada; a regra CSS de movimento reduzido foi inspecionada, não emulada.
- Falha simulada de `fetch` abriu o cadastro pela navegação completa, com o formulário habilitado e sem carregar a instrumentação. Foto e linhas moveram-se em sentidos opostos e voltaram a zero ao sair com o mouse.
- `npm test`, `npm run build` e `git diff --check` passaram. Sem erros/avisos no console da aplicação. Os testes automatizados existentes cobrem validação; interação e movimento foram conferidos no navegador. Build: JavaScript compartilhado de aproximadamente 5,06 kB gzip; não é uma medição de tempo em 4G.
- README, guia visual, índice local e revisão documental atualizados. Conteúdo anterior e documentos acadêmicos preservados. Trabalho apenas local, sem commit, push ou publicação.
- Limites: outros navegadores, preferência nativa de movimento reduzido e desempenho em 4G não foram medidos. Autenticação/API continuam fora desta alteração.


### Atualização: movimento e organização dos estilos — 18/09/2026

- CSS separado em `frontend/src/styles/global.css` (fontes, cores, base e acessibilidade) e `auth.css` (login/cadastro). Nenhuma dependência adicionada. O rótulo “Prévia de interface” foi retirado do rodapé; o aviso funcional de ausência de autenticação continua na submissão válida.
- No navegador integrado, login → cadastro preservou a fotografia, atualizou URL/título e habilitou o novo formulário. Voltar → avançar funcionou com senha vazia, oculta e sem mensagens antigas. Após o foco no título, Tab alcançou o campo nome.
- Cadastro vazio exibiu os três erros; corrigir nome/e-mail/senha recolheu as mensagens e preservou a orientação da senha em `aria-describedby`. Mostrar senha funcionou. Submissão válida continuou informando que nenhuma conta foi criada.
- Movimento pelo mouse verificado no desktop: deslocamento observado de 4,64 px no eixo horizontal e retorno a 0 px ao sair. Linhas e formulários usam as novas animações de entrada; capturas desktop e mobile foram inspecionadas.
- Login e cadastro em 360 × 800 px sem rolagem horizontal; desktop em 1280 × 720 px. Nenhum erro ou aviso no console, nenhuma tela vazia ou sobreposição de erro do Vite.
- Uma cópia temporária da página com falha simulada de `fetch` confirmou que o link continua abrindo o cadastro por navegação completa. A cópia foi removida após a conferência.
- `npm run build`, `npm test` e `git diff --check` passaram. Os cinco casos automatizados cobrem validação; transições, histórico, foco e fallback foram exercitados no navegador.
- Movimento reduzido foi tratado em CSS e JavaScript, mas a preferência do sistema não foi emulada nesta execução. Outros navegadores e medições de desempenho em 4G continuam pendentes.

### Atualização: cinco fundos aleatórios — 17/09/2026

- Mantida a fotografia original e acrescentadas quatro fotos de preparação física, geradas com a ferramenta integrada e convertidas em WebP (32 a 70 KB cada).
- As cinco opções apareceram no sorteio durante recarregamentos no navegador. Conferidas visualmente no login a 360 × 800 px e no cadastro a 1504 × 1046 px; nenhuma excedeu a largura da página. Cadastro também conferido em 360 px.
- Ajustados individualmente os recortes mobile de halteres, mobilidade, salto e preparação do calçado. Capturas avaliadas após a animação de entrada.
- `npm test`, `npm run build` e `git diff --check` passaram. Nenhum erro ou aviso registrado no console na conferência final.
- O código carrega somente a foto sorteada e tenta a original em caso de erro; a falha de rede não foi simulada. A preferência por movimento reduzido continua prevista no CSS. As metas de 4G e contraste pixel a pixel nas fotos não foram medidas.
- Arquivos e prompts: [design/FUNDOS.md](../design/FUNDOS.md).

Não houve autenticação real, persistência MySQL, validação de permissões, teste de usuário leigo, medição em 4G simulada nem teste de desempenho do gerador. RNF02/RNF03/RNF04 não podem ser declarados atendidos nesta entrega. A conferência de responsividade e contraste cobre estas duas telas, não as cinco páginas do projeto.

Antes de conectar o formulário, combinar com a API os campos, limites de entrada, respostas e erros, substituir o aviso de prévia pelo fluxo real e implementar validação no servidor. A política de nova senha de 12 a 128 caracteres é uma proposta desta interface, ainda sem contrato de API aprovado.

RF01/RF02 e o protótipo completo permanecem pendentes. Os arquivos estão locais; esta verificação não afirma commit, push, aprovação da dupla, implantação ou merge.
