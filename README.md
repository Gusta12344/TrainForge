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

A primeira versão prevê **hipertrofia, força e preparação complementar para pelo menos uma modalidade entre vôlei e futebol**. A modalidade esportiva inicial ainda será definida pela dupla.

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

## Critérios de qualidade previstos

- Interface responsiva a partir de 360 px de largura, sem rolagem horizontal nas telas principais.
- Pelo menos 18 de 20 gerações de teste apresentadas em até 5 segundos após a confirmação.
- Cinco páginas principais carregadas em até 3 segundos em conexão 4G simulada.
- Senhas armazenadas com hash e sal, nunca em texto puro.
- Contraste mínimo de 4,5:1 para textos normais nas telas principais.

Esses critérios serão medidos durante os testes da implementação.

## Estado do projeto

O projeto está na preparação para o desenvolvimento. O conteúdo inicial é formado pelo README e pelas regras de exclusão do Git; ainda não há aplicação executável, banco implementado ou comandos de instalação disponíveis.

O planejamento prevê cadastro e questionário em 15/09, primeira geração em 22/09, versão principal testada e publicada em 29/09 e apresentação em 06/10/2026. Essas datas são metas do cronograma e não indicam funcionalidades concluídas.

## Organização prevista do código

As pastas abaixo serão acrescentadas conforme o desenvolvimento avançar:

```text
TrainForge/
├── frontend/       # Telas, estilos e interações
├── backend/        # API, autenticação e geração dos programas
├── database/       # Modelo, scripts e dados de exemplo
├── .gitignore
└── README.md
```

## Documentação acadêmica

As pastas locais `Docs/` e `ProfessorEnvios/` contêm, respectivamente, os documentos da dupla e os materiais do professor. Elas estão excluídas do versionamento pelo `.gitignore` e não acompanham o clone do repositório.

O material acadêmico reúne TAP, visão e escopo, requisitos e EAP, cronograma, riscos, comunicação e a atividade de fluxo, wireframes, tecnologias e banco. A entrega desses documentos ocorre separadamente do código.

## Trabalho em dupla

- Manter tarefas e decisões atualizadas no quadro do projeto.
- Fazer commits pequenos, com mensagens que expliquem a alteração.
- Revisar as mudanças com o outro integrante e registrar alterações de escopo.
- Conferir os critérios de aceite antes de considerar uma funcionalidade concluída.

Arquivos de ambiente, credenciais, dependências instaladas e saídas de compilação também ficam fora do versionamento. Exemplos de configuração podem ser publicados em arquivos como `.env.example`, sem dados reais.
