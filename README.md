# TrainForge

Sistema web para gerar programas de treinamento personalizados a partir do perfil, dos objetivos, da disponibilidade e da rotina esportiva do usuário.

Projeto desenvolvido para a disciplina de **Projeto Interdisciplinar III**, do curso de **Análise e Desenvolvimento de Sistemas**, no segundo semestre de 2026.

**Para testar em outra máquina, siga [Executar a interface](#executar-a-interface).** A versão atual permite testar as telas de login e cadastro; ainda não há autenticação real ou geração de treinos.

## Integrantes

| Integrante | GitHub | Responsabilidade principal |
| --- | --- | --- |
| Gustavo Maciel Huçulak | [Gusta12344](https://github.com/Gusta12344) | Gestão e Análise |
| Arthur Godoy Caminski | [Subarashii-Core](https://github.com/Subarashii-Core) | Solução Técnica |

Os papéis indicam quem responde por cada frente. Os dois participam da programação, da documentação, dos testes e das revisões, com commits próprios.

## Proposta

O TrainForge foi pensado para quem quer organizar seus treinos, mas não sabe escolher exercícios ou montar um programa por conta própria. A pessoa informa seu objetivo, experiência, disponibilidade, estrutura de treino e prática esportiva. Com essas informações, o sistema organiza um programa por dias e sessões e apresenta os exercícios com orientações de execução.

A primeira versão prevê **hipertrofia, força e preparação complementar para vôlei**. Vôlei foi definido como a modalidade esportiva inicial; futebol não faz parte desta primeira entrega.

## Como o sistema deve funcionar

1. O usuário cria uma conta e faz login.
2. Preenche um questionário sobre seu perfil, objetivo, experiência, dias e tempo disponíveis, estrutura, prioridades e restrições previamente identificadas. Se pratica esporte, informa também sua rotina esportiva.
3. Confere o resumo das respostas e pode corrigir os dados antes de confirmar.
4. O gerador combina as informações do perfil com a base de exercícios e as regras de geração.
5. O programa fica salvo e pode ser consultado por dia e sessão, com séries, repetições, instruções e observações.
6. Conforme as funcionalidades implementadas, o usuário pode solicitar substituições, consultar programas anteriores e exportar o programa atual em PDF.

A geração será orientada por algoritmos e regras do projeto. Não há integração obrigatória com uma API de inteligência artificial no escopo inicial.

## Perfis de acesso

- **Usuário comum:** preenche o próprio perfil, gera e consulta seus programas e solicita substituições.
- **Administrador:** mantém o catálogo de exercícios e os parâmetros usados na geração.

## Escopo e prioridades

As prioridades seguem os requisitos definidos pela dupla. A lista representa o planejamento, não funcionalidades já concluídas.

| Prioridade | Funcionalidades previstas |
| --- | --- |
| Obrigatório — RF01 a RF05 | Cadastro, login, questionário, confirmação do perfil, geração e consulta guiada do programa atual salvo. |
| Importante — RF06, RF07, RF09 e RF10 | Substituição automática de exercícios com registro do motivo, histórico de programas, administração dos exercícios e manutenção das regras. |
| Desejável — RF08 | Exportação do programa atual completo em PDF, com orientações textuais e sem imagens. |

O histórico guarda **programas gerados**, que podem ser consultados posteriormente. Programas antigos não podem ser editados ou reativados como atuais nesta versão.

### Fora da primeira versão

- Registro de cargas, repetições realizadas e acompanhamento de progressão.
- Aplicativo nativo para Android ou iOS.
- Edição livre de exercícios, séries e repetições pelo usuário.
- Atendimento a todos os esportes, planos alimentares e integrações com dispositivos.
- Análise avançada dos motivos de substituição e recursos de IA generativa.

O sistema não realiza diagnóstico, tratamento ou reabilitação de lesões e não substitui acompanhamento profissional, conforme as restrições do projeto.

## Tecnologias

Escolhas registradas na atividade de 8 de setembro de 2026:

| Camada | Tecnologia | Motivo |
| --- | --- | --- |
| Front-end | HTML, CSS e JavaScript | Construção das telas e interações com as tecnologias já conhecidas pela dupla. |
| Back-end | Node.js com Express | API em JavaScript para autenticação, geração e persistência dos programas. |
| Banco de dados | MySQL | Modelo relacional para usuários, programas, sessões, exercícios e regras. |

O front-end está documentado sem framework nesta etapa. Mudanças nas tecnologias devem ser registradas no README e na documentação correspondente.

Na primeira interface, Vite executa o servidor de desenvolvimento e gera os arquivos estáticos; Lucide fornece os ícones; Fontsource distribui localmente as fontes Barlow e Barlow Condensed. Essas ferramentas não alteram a escolha de HTML, CSS e JavaScript sem framework. As versões estão fixadas no `package-lock.json`.

## Critérios de qualidade previstos

- Interface responsiva a partir de 360 px de largura, sem rolagem horizontal nas telas principais.
- Pelo menos 18 de 20 gerações de teste apresentadas em até 5 segundos após a confirmação.
- Cinco páginas principais carregadas em até 3 segundos em conexão 4G simulada.
- Senhas armazenadas com hash e sal, nunca em texto puro.
- Contraste mínimo de 4,5:1 para textos normais nas telas principais.

Esses critérios serão medidos durante os testes da implementação.

## Estado do projeto

Existe uma **prévia interativa de login e cadastro**, com identidade visual, logo em SVG, layout responsivo, navegação, validação de preenchimento e controle para mostrar/ocultar senha. As telas sorteiam uma entre cinco fotografias de preparação física a cada carregamento, mantendo o fundo fixo durante o preenchimento e na transição entre as duas telas. A entrada revela os títulos por linha e apresenta os campos em sequência. Foto e linhas respondem discretamente ao mouse em camadas diferentes; campos têm foco iluminado e o botão tem reflexo e resposta ao pressionar. Login e cadastro reposicionam os campos suavemente, mantendo a marca e a foto. As mensagens de erro expandem e recolhem sem saltos.

**A prévia não cria contas, não autentica e não envia nem persiste os dados digitados.** Os formulários informam essa limitação quando os campos válidos são submetidos. Se o JavaScript não carregar, os controles permanecem desabilitados. A regra de 12 a 128 caracteres para nova senha é uma proposta da interface e precisa ser alinhada com o servidor.

Ainda não existem API, banco implementado, questionário, painel ou motor de geração. RF01 e RF02 não estão concluídos: dependem da autenticação real e dos testes de integração. A prévia cobre somente as telas de acesso, não o protótipo completo do fluxo do projeto.

O planejamento prevê cadastro e questionário em 15/09, primeira geração em 22/09, versão principal testada e publicada em 29/09 e apresentação em 06/10/2026. Essas datas são metas do cronograma e não indicam funcionalidades concluídas.

## Executar a interface

### 1. Preparar a máquina

- Instale **Node.js 22.12 ou superior**, com **npm**. Não é necessário instalar Vite globalmente.
- Tenha **Git** para clonar o repositório, ou receba um ZIP da versão que será testada.
- Use um navegador atualizado com JavaScript habilitado.
- Tenha acesso à internet para baixar o projeto e suas dependências na primeira instalação.

No terminal (Prompt de Comando/PowerShell no Windows ou terminal do Linux/macOS), confira:

```bash
node --version
npm --version
```

**Não é necessário instalar MySQL, configurar `.env`, criar uma conta ou obter chaves de API.** Express e MySQL pertencem ao planejamento do sistema; a prévia atual executa somente o front-end. Imagens, ícones e fontes são distribuídos com o projeto e suas dependências.

### 2. Obter a versão com as telas

Clone a branch `main`, que reúne a versão integrada do projeto:

```bash
git clone --branch main https://github.com/Gusta12344/TrainForge.git
cd TrainForge
```

Se receber um ZIP, extraia o projeto e abra o terminal na pasta que contém `package.json`, `package-lock.json` e `vite.config.js`. Não execute os comandos de instalação dentro de `frontend/`.

### 3. Instalar e iniciar

Na raiz do projeto, execute:

```bash
npm ci
npm run dev
```

`npm ci` instala as versões do `package-lock.json`. Cada pessoa deve instalar as dependências na própria máquina; não copie a pasta `node_modules` de outro computador.

Mantenha o terminal aberto e acesse o endereço exibido pelo Vite, normalmente [http://127.0.0.1:5173](http://127.0.0.1:5173). Se a porta estiver ocupada, o Vite pode usar outra: siga o endereço informado no terminal.

| Tela | Caminho no servidor local |
| --- | --- |
| Login | `/` |
| Cadastro | `/cadastro.html` |

**Não abra os HTMLs com duplo clique ou pelo endereço `file://`.** Os módulos e recursos precisam do servidor Vite. `127.0.0.1` aponta para a própria máquina: quem for testar deve iniciar seu próprio servidor.

Encerre com `Ctrl+C`. Nas próximas execuções, basta `npm run dev`; execute novamente `npm ci` se receber uma atualização das dependências.

### 4. Conferir o funcionamento

1. No login, clique em **Criar conta** e confira a mudança para cadastro.
2. Envie o formulário vazio: os campos devem mostrar os erros e o primeiro campo inválido deve receber foco.
3. Preencha com dados fictícios, por exemplo: nome `Pessoa Teste`, e-mail `teste@example.com` e senha `treino-ficticio-2026`.
4. Confira o botão de mostrar/ocultar senha e envie o cadastro. O resultado esperado é a mensagem de que **nenhuma conta foi criada e nenhum dado foi enviado**.
5. Volte ao login, preencha e envie. O aviso de que o acesso ainda não está disponível é esperado. Não existe uma conta de demonstração para entrar em um painel.

A ausência de autenticação é uma limitação desta entrega, não um problema de instalação. As animações são reduzidas no celular e desativadas quando a preferência de movimento reduzido está ativa no sistema/navegador.

### Testes e versão compilada

Na raiz do projeto, use outro terminal ou interrompa o servidor antes de executar:

```bash
npm test
npm run build
npm run preview
```

`npm test` verifica as regras de validação da interface. `npm run build` gera os arquivos estáticos em `dist/`; `npm run preview` serve esse resultado localmente, no endereço exibido no terminal. Execute o build novamente depois de alterar o código se quiser conferir essas alterações no preview. O preview não publica o projeto na internet.

`node_modules/` e `dist/` são gerados localmente e ignorados pelo Git. A validação no navegador não substitui a validação da futura API.

### Problemas comuns

| Problema | Como resolver |
| --- | --- |
| `node` ou `npm` não reconhecido | Instale o Node.js com npm, reabra o terminal e confira as versões. |
| Erro de versão do Node (`EBADENGINE`) | Use Node.js 22.12 ou superior, conforme `package.json`. |
| PowerShell bloqueia `npm.ps1` | Execute os comandos no Prompt de Comando, ou use `npm.cmd` no lugar de `npm` no PowerShell. |
| `package.json` não encontrado (`ENOENT`) | Abra o terminal na raiz do projeto. Se o arquivo não existir na cópia, confira se recebeu a versão com as telas. |
| Falha de conexão durante `npm ci` | Confira o acesso ao registro npm na rede e tente novamente. Preserve `package-lock.json`. |
| Página não abre | Mantenha `npm run dev` em execução e confira o endereço/porta que o terminal mostrou. |
| Formulário desabilitado ou recursos ausentes | Acesse pelo servidor Vite, habilite JavaScript e confira erros no terminal e no console do navegador. |
| Preview ausente ou desatualizado | Execute `npm run build` antes de `npm run preview`. |
| Não consigo entrar após preencher os campos | A autenticação ainda não está implementada; o comportamento esperado é o aviso de prévia. |

## Organização atual

```text
TrainForge/
├── frontend/
│   ├── index.html       # Login
│   ├── cadastro.html    # Cadastro
│   ├── src/
│   │   ├── js/          # JavaScript organizado por páginas ou fluxo
│   │   │   └── auth/    # Interações, navegação e validação de login/cadastro
│   │   └── styles/      # global.css (base) e auth.css (login/cadastro)
│   ├── public/assets/   # Logos e fotografias
│   └── tests/           # Testes de validação
├── design/              # Conceitos, guia visual e licença da fonte da marca
├── planejamentos/       # Escopo e verificação desta entrega
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

Os estilos são divididos por responsabilidade: `frontend/src/styles/global.css` reúne fontes, cores, regras básicas e acessibilidade; `auth.css` contém layout, componentes e animações das telas de acesso. Novas páginas devem importar o global e seu CSS específico. Componentes compartilhados podem ganhar um arquivo próprio quando houver reutilização real. O Vite pode reunir esses arquivos no build; a separação permanece no código-fonte.

Os JavaScripts ficam em `frontend/src/js/`, agrupados pelas páginas que atendem. A pasta `auth/` reúne os módulos de login e cadastro, com `auth.js` como ponto de entrada. As próximas páginas terão suas próprias pastas; módulos compartilhados serão separados quando houver reutilização entre fluxos.

Login e cadastro mantêm seus HTMLs e endereços próprios. `auth-navigation.js` carrega o próximo formulário e atualiza o histórico sem recriar a marca ou sortear outra foto. Se esse carregamento falhar, segue o link normalmente. `auth-motion.js` coordena a entrada e o reposicionamento dos campos com a API nativa de animações do navegador, sem novas dependências. As animações do formulário são encerradas quando a pessoa interage, a aba é ocultada ou a preferência de movimento muda. `photo-motion.js` move foto e linhas em camadas, somente com mouse no desktop. CSS e JavaScript respeitam movimento reduzido; no celular, os deslocamentos e tempos são menores.

`backend/` e `database/` serão introduzidas nas próximas entregas. A direção visual está em [design/GUIA_VISUAL.md](design/GUIA_VISUAL.md); os resultados e limites das verificações, em [planejamentos/verificacao-interface.md](planejamentos/verificacao-interface.md).
