# TrainForge

Sistema web para gerar programas de treinamento personalizados a partir do perfil, dos objetivos, da disponibilidade e da rotina esportiva do usuário.

Projeto desenvolvido para a disciplina de **Projeto Interdisciplinar III**, do curso de **Análise e Desenvolvimento de Sistemas**, no segundo semestre de 2026.

## Integrantes

| Integrante | GitHub | Responsabilidade principal |
| --- | --- | --- |
| Gustavo Maciel Huçulak | [Gusta12344](https://github.com/Gusta12344) | Gestão e Análise |
| Arthur Godoy Caminski | [Subarashii-Core](https://github.com/Subarashii-Core) | Solução Técnica |

Os papéis indicam quem responde por cada frente. Os dois participam da programação, da documentação, dos testes e das revisões, com commits próprios.

## Proposta

O TrainForge foi pensado para quem quer organizar seus treinos, mas não sabe escolher exercícios ou montar um programa por conta própria. A pessoa informa seu objetivo, experiência, disponibilidade, estrutura de treino e prática esportiva. Com essas informações, o sistema organiza um programa por dias e sessões e apresenta os exercícios com orientações de execução.

A primeira versão prevê **hipertrofia, força e preparação física para vôlei** como caminhos de objetivo principal. No caminho esportivo, o usuário pode escolher um objetivo complementar, como hipertrofia. Vôlei foi definido como a modalidade esportiva inicial e será tratado de forma geral, sem exigir distinção entre quadra e praia; futebol não faz parte desta primeira entrega.

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
| Obrigatório - RF01 a RF05 | Cadastro, login, questionário, confirmação do perfil, geração e consulta guiada do programa atual salvo. |
| Importante - RF06, RF07, RF09 e RF10 | Substituição automática de exercícios com registro do motivo, histórico de programas, administração dos exercícios e manutenção das regras. |
| Desejável - RF08 | Exportação do programa atual completo em PDF, com orientações textuais e sem imagens. |

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

## Estado atual

Esta cópia já inclui cadastro e login reais, sessões de acesso, questionário de sete etapas e salvamento das respostas no MySQL. O usuário pode entrar novamente e revisar ou editar o perfil salvo. O servidor valida as respostas antes de gravá-las e associa cada perfil à própria conta.

O gerador de treinos, a tela de resultado e a consulta aos programas ainda serão construídos. As tabelas necessárias para exercícios e programas já estão preparadas, mas permanecem vazias nesta etapa. Não há integração com IA.

## Rodar neste computador

O projeto usa uma instância MySQL isolada na porta `3307`, com dados em `database/local-mysql-data/`. Ela não altera o serviço `MySQL80` já instalado na porta `3306`. As credenciais locais foram gravadas em `.env`; não compartilhe esse arquivo. Os dois caminhos são ignorados pelo Git.

Abra três terminais na pasta que contém `package.json`:

1. Inicie o banco com `npm run db:local` e deixe o terminal aberto.
2. Inicie a API com `npm run dev:api` e deixe o terminal aberto.
3. Inicie a interface com `npm run dev` e abra o endereço mostrado pelo Vite, normalmente `http://127.0.0.1:5173`.

Se esta for uma instalação nova, execute `npm ci` antes. O banco desta cópia já recebeu `npm run db:setup`. Esse comando pode ser repetido com segurança para criar tabelas ausentes.

Para conferir a versão compilada, execute `npm run build` e depois `npm start` enquanto o banco estiver ligado. Acesse `http://127.0.0.1:43117`. Termine cada processo com `Ctrl+C`.

## Rodar em outra máquina

O diretório de dados e `.env` são locais e não acompanham o código. Instale MySQL 8.0 ou superior, crie um usuário com permissão para criar o banco `trainforge`, copie `.env.example` para `.env` e informe host, porta, usuário e senha. Execute `npm ci`, `npm run db:setup`, `npm run dev:api` e `npm run dev`. Se usar outra porta para a API, ajuste também o proxy em `vite.config.js`.

## Rotas da API

| Método e rota | Função |
| --- | --- |
| `GET /api/health` | Verifica a conexão com o banco. |
| `POST /api/auth/register` | Cria conta com nome, e-mail e senha; inicia a sessão. |
| `POST /api/auth/login` | Entra com e-mail e senha. |
| `POST /api/auth/logout` | Encerra a sessão. |
| `GET /api/auth/me` | Retorna a conta autenticada. |
| `GET /api/profile` | Retorna as respostas salvas da própria conta, ou `null`. |
| `PUT /api/profile` | Valida e salva o questionário completo da própria conta. |

As rotas de perfil exigem autenticação. O navegador recebe uma sessão em cookie `HttpOnly`. O banco armazena somente o hash da senha e o hash do token de sessão. O cadastro nunca aceita um papel administrativo enviado pela interface.

## Testes

- `npm test` verifica as regras do questionário, a API e o isolamento de usuários com um banco simulado.
- `npm run test:db` executa o mesmo percurso principal contra o MySQL real e remove apenas as contas de teste que ele criou.
- `npm run build` confere a compilação da interface.

## Organização

- `frontend/`: páginas, estilos e lógica do navegador.
- `backend/`: API, autenticação, validação, configuração e testes.
- `database/schema.sql`: tabelas de contas, sessões, perfis, exercícios e programas.
- `design/`: identidade visual e referências de interface.

O questionário coleta objetivo, idade, altura, peso, experiência, rotina esportiva, dias e tempo disponíveis, local, equipamentos e restrições informadas. A primeira modalidade esportiva prevista é vôlei. A geração futura deve considerar somente combinações de respostas que o projeto decidir atender.
