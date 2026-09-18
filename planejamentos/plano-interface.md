# Primeira entrega de interface

## Objetivo e limites

Aplicar a direção artística do TrainForge ao login e cadastro em HTML, CSS e JavaScript, preservando os campos da E5. Esta entrega é uma prévia interativa: não cria contas, não autentica, não envia nem persiste senhas. RF01/RF02 somente estarão completos após integração e validação com a API e o MySQL.

O usuário autorizou a criação da marca e a escolha dos detalhes visuais. Branch local: `base-autenticacao`. Hipertrofia, força e vôlei são os objetivos/modalidade de referência. Nenhuma publicação ou integração à main faz parte desta etapa.

## Decisões

- Grafite, branco suave e laranja; fotografia monocromática de treinamento e linhas de quadra.
- Monograma TF e nome TRAINFORGE; títulos condensados e corpo legível.
- Formulários sem cartão flutuante; layout dividido no desktop e uma coluna no celular.
- Lucide para ícones, fontes locais via Fontsource e Vite apenas para desenvolvimento/build. Não há framework de interface.
- Animações por CSS e Web Animations API, com suporte a movimento reduzido; controles utilizáveis por teclado.
- Cadastro coleta nome, e-mail e senha. A prévia propõe 12 a 128 caracteres de senha, a alinhar com a validação do servidor na integração. Login exige somente senha preenchida.

## Execução e comprovação

- [x] Preservar os conceitos e entregar os arquivos da marca com guia de uso.
- [x] Implementar login e cadastro, incluindo validação e mostrar/ocultar senha.
- [x] Verificar campos ausentes, e-mail inválido, senha curta e navegação; submissão válida deve informar que nenhuma conta foi criada/acessada nesta prévia.
- [x] Conferir desktop, celular de 360 px, teclado, contraste e comparação com os conceitos; revisar as regras de movimento reduzido, registrando a ausência de emulação.
- [x] Atualizar README, índice local e revisão documental com o estado real e comandos verificados.

Resultados e limitações: [verificação da interface](verificacao-interface.md). Conceitos, arquivos e diferenças intencionais: [guia visual](../design/GUIA_VISUAL.md).

## Organização

`frontend/index.html` e `frontend/cadastro.html` contêm os formulários. Os JavaScripts ficam em `frontend/src/js/`, organizados por páginas ou fluxo. Em `auth/`, `auth.js` inicializa os formulários, `validation.js` valida entradas, `auth-navigation.js` controla a transição e o histórico, `background.js` sorteia o fundo e `photo-motion.js` controla o movimento pelo mouse. Em `frontend/src/styles/`, `global.css` reúne a base geral e `auth.css` reúne as duas telas de acesso. `frontend/public/assets/` guarda marca e fotografias. `design/` preserva os conceitos. `frontend/tests/` testa regras de validação; as interações são conferidas no navegador.
