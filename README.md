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
- `/treino.html` é uma **demonstração isolada** com programa A/B/C e histórico fictícios. Ela permite registrar séries, aquecimento e descanso neste navegador usando `localStorage`. Seus exercícios, imagens e vídeos não vêm do banco nem de um gerador. Consulte [as regras da demonstração](design/MEU_TREINO.md).
- O esquema do banco tem contas, sessões, perfis e tabelas iniciais para catálogo e programas. Programas futuros devem gravar o conteúdo completo em `content_snapshot`, preservando o histórico mesmo após alterações no catálogo. Ainda não há catálogo populado, motor de geração, API de programas, substituição ou PDF. A tela de treino não mostra um programa da conta.

As datas do cronograma são metas, não prova de implementação. Os critérios de qualidade previstos incluem 360 px sem rolagem horizontal, contraste de 4,5:1 para texto normal, 18 de 20 gerações em até 5 segundos e cinco páginas em até 3 segundos em 4G simulado. O desempenho do gerador e da rede ainda não foi medido.

## Tecnologias

HTML, CSS e JavaScript sem framework no navegador; Vite para desenvolvimento e build; Node.js com Express na API; MySQL 8 para persistência. Lucide fornece ícones e Fontsource distribui Barlow localmente. As dependências estão fixadas em `package-lock.json`.

## Executar

É necessário Node.js 22.12 ou superior, npm e MySQL 8. O projeto pode usar um MySQL já instalado. O script `npm run db:local` é específico para uma instância isolada configurada previamente no Windows; não cria um banco novo automaticamente.

1. Execute `npm ci` na raiz do repositório.
2. Copie `.env.example` para `.env` e preencha `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` para seu MySQL. Mantenha `FRONTEND_ORIGIN` igual ao endereço mostrado pelo Vite. `.env` é local e ignorado pelo Git.
3. Execute `npm run db:setup` para criar o banco e as tabelas ausentes. A conta MySQL usada aqui precisa poder criar o banco informado. Se a tabela `programs` já existir sem `content_snapshot`, o script a atualiza apenas quando estiver vazia; havendo registros, interrompe a operação para revisão dos dados.
4. Em um terminal, execute `npm run dev:api`. Em outro, execute `npm run dev` e abra o endereço exibido pelo Vite, normalmente [http://127.0.0.1:5173](http://127.0.0.1:5173).

O Vite encaminha `/api` para `http://127.0.0.1:43117`. Se alterar `API_PORT` no `.env`, ajuste também o proxy em [vite.config.js](vite.config.js). Se o Vite usar outra porta ou nome de host, atualize `FRONTEND_ORIGIN` e reinicie a API. Para servir o build pela API, execute `npm run build` e `npm start`, com o MySQL ligado, e acesse [http://127.0.0.1:43117](http://127.0.0.1:43117). `npm run preview` serve somente os arquivos estáticos e não substitui a API.

| Tela | Caminho |
| --- | --- |
| Login | `/` |
| Cadastro | `/cadastro.html` |
| Questionário e revisão | `/questionario.html` |
| Meu treino demonstrativo | `/treino.html` |

Use dados fictícios ao testar. Após cadastrar, a sessão abre o questionário. Preencha as etapas e salve na revisão; saia e entre novamente para conferir o perfil salvo. Para ver `/treino.html`, abra o caminho diretamente. Ele não exige conta, usa somente exemplos e permite restaurá-los em **Dados desta demonstração**.

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
