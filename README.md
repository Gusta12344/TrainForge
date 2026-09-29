# TrainForge

Sistema web para gerar programas de treinamento personalizados a partir do perfil, dos objetivos, da disponibilidade e da rotina esportiva do usuário. Projeto da disciplina de Projeto Interdisciplinar III, Análise e Desenvolvimento de Sistemas, segundo semestre de 2026.

## Equipe

| Integrante | GitHub | Responsabilidade principal |
| --- | --- | --- |
| Gustavo Maciel Huçulak | [Gusta12344](https://github.com/Gusta12344) | Gestão e Análise |
| Arthur Godoy Caminski | [Subarashii-Core](https://github.com/Subarashii-Core) | Solução Técnica |

Ambos participam da programação, documentação, testes e revisões.

## Proposta e escopo

A pessoa cria uma conta, preenche e confirma o questionário, e então deve receber um programa dividido por dias e sessões. O motor futuro combinará respostas, catálogo de exercícios e regras do projeto, sem depender de API de inteligência artificial. Hipertrofia, força e preparação física geral para vôlei são os objetivos da primeira versão. Futebol ficou fora desta entrega.

Os requisitos obrigatórios RF01–RF05 abrangem cadastro, login, questionário, confirmação do perfil, geração e consulta do programa atual. RF06, RF07, RF09 e RF10 preveem substituição compatível, histórico de programas, catálogo e regras administráveis. RF08, exportação textual do programa atual em PDF sem imagens, é desejável. O histórico é de **programas gerados**: os anteriores podem ser consultados, mas não editados nem reativados. Administradores manterão catálogo e parâmetros; cadastro público não concede esse papel.

O sistema não oferece aplicativo nativo, edição livre do programa, diagnóstico ou prescrição clínica. A tela demonstrativa descrita abaixo registra execução localmente, mas não representa acompanhamento persistido na conta ou análise de progressão.

## Estado implementado

- Cadastro e login usam a API Express e sessões por cookie `HttpOnly`. Senhas recebem hash com `scrypt` e sal; a API salva somente o hash do token de sessão.
- O questionário de sete etapas permite revisão e edição, inclusive descrições de restrições ou dúvidas, máquinas, outros equipamentos, outra região do corpo e observações. O servidor valida as respostas e as salva no MySQL por conta. Ao voltar, o usuário pode revisar e alterar o perfil salvo.
- `/treino.html` apresenta o programa A/B/C do JSON local e um histórico inicial fictício. Após salvar o questionário, a interface abre essa página; no login seguinte, contas com perfil salvo também vão direto a ela. Os exercícios ainda não são gerados das respostas nem persistidos na conta. Registros de séries, aquecimento e descanso ficam neste navegador via `localStorage`. O descanso mostra aviso visual ao zerar e tenta emitir som e vibração até ser silenciado, estendido ou encerrado, conforme os recursos permitidos pelo navegador. Consulte [as regras da tela](design/MEU_TREINO.md).
- O esquema do banco tem contas, sessões, perfis e tabelas iniciais para catálogo e programas. Programas futuros devem gravar o conteúdo completo em `content_snapshot`, preservando o histórico mesmo após alterações no catálogo. Ainda não há catálogo populado, motor de geração, API de programas, substituição ou PDF. A tela de treino não mostra um programa da conta.

As datas do cronograma são metas, não prova de implementação. Os critérios de qualidade previstos incluem 360 px sem rolagem horizontal, contraste de 4,5:1 para texto normal, 18 de 20 gerações em até 5 segundos e cinco páginas em até 3 segundos em 4G simulado. O desempenho do gerador e da rede ainda não foi medido.

## Tecnologias

HTML, CSS e JavaScript sem framework no navegador; Vite para desenvolvimento e build; Node.js com Express na API; MySQL 8 para persistência. Lucide fornece ícones e Fontsource distribui Barlow localmente. As dependências estão fixadas em `package-lock.json`.

## Rodar localmente

### Pré-requisitos

- Node.js **22.12 ou superior** e npm. Confira com `node --version` e `npm --version`.
- MySQL **8** instalado, iniciado e aceitando conexões TCP. Você precisa saber o endereço, a porta, o usuário e a senha. A porta usual é `3306`; o nome do serviço e a forma de iniciá-lo dependem da instalação e do sistema operacional. Por exemplo, no Linux o serviço pode ser iniciado com `sudo systemctl start mysql`; no Windows, procure o serviço MySQL no aplicativo **Serviços**.
- Acesso de escrita à pasta do projeto. Execute todos os comandos abaixo **na raiz do repositório**, onde está `package.json`.

No modo de desenvolvimento, mantenha **três processos ativos**: MySQL, API Express e Vite. Abrir apenas o HTML ou executar apenas o Vite não permite cadastrar, entrar ou salvar o questionário.

### 1. Instalar as dependências

```bash
npm ci
```

### 2. Configurar a conexão com o MySQL

Copie o exemplo de configuração. No Linux/macOS ou Git Bash:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

Edite `.env` com os dados **do seu MySQL**:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=trainforge
API_PORT=43117
FRONTEND_ORIGIN=http://127.0.0.1:5173
NODE_ENV=development
```

Use as credenciais configuradas durante a instalação do MySQL, como uma conta administrativa local, que consiga criar o banco `trainforge` e suas tabelas. Se o banco já existir, esse usuário ainda precisa de permissão para criar e alterar tabelas. `DB_HOST=127.0.0.1` usa TCP; uma conta configurada somente para acesso por socket pode falhar. O arquivo `.env` é local e ignorado pelo Git: não envie senhas ao repositório. Se a senha for vazia, deixe `DB_PASSWORD=`.

Se o cliente de linha de comando do MySQL estiver instalado, você pode conferir as credenciais antes de continuar (troque usuário e porta pelos valores do `.env`):

```bash
mysql -h 127.0.0.1 -P 3306 -u seu_usuario_mysql -p -e "SELECT VERSION();"
```

O comando `npm run db:local` **não instala nem inicializa um MySQL novo**. Ele só inicia uma instância Windows isolada que já tenha sido preparada em `database/local-mysql-data/`, na porta `3307`. Para uma instalação comum do MySQL, inicie o serviço do seu sistema e use a porta correspondente no `.env`.

### 3. Criar o banco e as tabelas

Com o MySQL ligado e o `.env` preenchido:

```bash
npm run db:setup
```

O comando cria `DB_NAME` se necessário e aplica `database/schema.sql`. Ao terminar, deve mostrar `Banco trainforge preparado com sucesso.` (ou o nome escolhido). Pode ser repetido sem apagar as tabelas existentes. Se já houver uma tabela `programs` antiga sem `content_snapshot`, a migração só é automática quando ela está vazia; com registros, o script interrompe para que os dados sejam revisados.

### 4. Iniciar a aplicação em desenvolvimento

Mantenha o MySQL ligado. Abra **dois terminais na raiz do projeto**:

| Terminal | Comando | Endereço |
| --- | --- | --- |
| API | `npm run dev:api` | `http://127.0.0.1:43117` |
| Interface | `npm run dev` | `http://127.0.0.1:5173` |

Primeiro, confira [http://127.0.0.1:43117/api/health](http://127.0.0.1:43117/api/health): a resposta deve ser `{"status":"ok"}`. Depois, abra [http://127.0.0.1:5173](http://127.0.0.1:5173) para usar o sistema. Deixe os dois terminais abertos durante o uso; `Ctrl+C` encerra cada processo.

O Vite encaminha as chamadas `/api` para `http://127.0.0.1:43117`, conforme [vite.config.js](vite.config.js). Se mudar `API_PORT`, altere também esse proxy e reinicie os servidores. Se o Vite abrir em outra porta ou host, atualize `FRONTEND_ORIGIN` com a origem **exata** exibida pelo Vite e reinicie a API; caso contrário, o navegador pode receber erro de origem ao enviar cadastro e respostas.

### Alternativa: interface e API no mesmo servidor

Com MySQL ligado, `.env` configurado e banco preparado, não é preciso executar Vite separadamente:

```bash
npm run build
npm start
```

Abra [http://127.0.0.1:43117](http://127.0.0.1:43117). `npm run build` gera `dist/`, que a API serve quando essa pasta existe. Refazer o build é necessário após mudanças na interface. `npm run preview` serve apenas arquivos estáticos e **não** substitui a API nem o MySQL.

### Se algo não abrir

| Sintoma | O que conferir |
| --- | --- |
| `Não foi possível conectar ao MySQL` ou `ECONNREFUSED` | MySQL iniciado; `DB_HOST` e `DB_PORT` iguais aos da instância em execução. |
| `Access denied for user` | `DB_USER`, `DB_PASSWORD` e permissões da conta MySQL para conexão TCP e para o banco. |
| `npm run db:setup` falha ao criar o banco ou tabelas | Permissões do usuário MySQL e compatibilidade com MySQL 8. |
| Cadastro/login não chegam à API | API ativa na porta `43117`; proxy do Vite apontando para a mesma porta. |
| Erro de origem no cadastro ou ao salvar respostas | `FRONTEND_ORIGIN` igual ao endereço real do Vite, incluindo porta; reinicie a API após editar `.env`. |
| Tela abre, mas só mostra conteúdo estático | Inicie também a API e o MySQL; `npm run preview` e o HTML isolado não oferecem as rotas de autenticação. |

| Tela | Caminho |
| --- | --- |
| Login | `/` |
| Cadastro | `/cadastro.html` |
| Questionário e revisão | `/questionario.html` |
| Meu treino | `/treino.html` |

Use dados fictícios ao testar. Após cadastrar, a sessão abre o questionário. Preencha as etapas e salve na revisão: a página Meu treino abrirá com o programa A/B/C. Ao entrar novamente, um perfil salvo leva a Meu treino; sem perfil, ao questionário. O link **Meu perfil** em Meu treino retorna à revisão das respostas. A página de treino também pode ser aberta diretamente sem conta; o histórico inicial contém exemplos e pode ser restaurado em **Dados deste dispositivo**.

## API

| Método e rota | Função |
| --- | --- |
| `GET /api/health` | Confere a conexão com o MySQL. |
| `POST /api/auth/register` | Cria conta comum e inicia sessão. |
| `POST /api/auth/login` | Inicia sessão. |
| `POST /api/auth/logout` | Encerra sessão. |
| `GET /api/auth/me` | Retorna a conta autenticada. |
| `GET /api/profile` | Retorna as respostas salvas da própria conta, ou `null`. |
| `PUT /api/profile` | Valida e salva as respostas completas da própria conta. |

Todas as rotas de perfil exigem autenticação. A API usa consultas parametrizadas e associa os dados ao usuário da sessão.

## Verificar

- `npm test`: validação da interface e da API, sessões, isolamento de contas e regras da demonstração com banco simulado.
- `npm run test:db`: teste das rotas contra o MySQL real configurado no `.env`; cria contas fictícias e as remove ao final. Execute depois de `npm run db:setup`.
- `npm run build`: gera os arquivos estáticos em `dist/`.

## Estrutura

- `frontend/`: HTML, estilos em `src/styles/`, JavaScript por fluxo em `src/js/`, testes e imagens.
- `backend/`: rotas, autenticação, validação, acesso a dados e testes.
- `database/schema.sql` e `database/migrations/`: estrutura inicial e evolução revisável do banco.
- `design/`: direção visual e regras da tela demonstrativa.

Arquivos `.env`, dados locais do MySQL, `node_modules/` e `dist/` não são versionados.
