# Kokyu

**Kokyu** (呼吸) significa _respiração_ em japonês. O conceito do produto é inspirado na ideia de
respiração, disciplina, equilíbrio, evolução e concentração — uma referência conceitual a Demon
Slayer (paleta, geometria, naming), nunca uma cópia de logos, artes ou personagens oficiais.

O objetivo final do Kokyu é ser uma central para gerenciar a vida cotidiana: trabalho, estudos,
academia, alimentação, saúde, tarefas, compromissos, hábitos, metas, finanças, filmes/séries,
lazer e rotina diária.

**Esta primeira etapa não implementa nenhuma dessas funcionalidades.** Ela constrói a fundação:
arquitetura de frontend, Design System, tokens, infraestrutura de testes, Storybook, layout base
e a tela de login. Não há backend nesta fase — o login é validado no cliente e a autenticação é
mockada por trás de um contrato (`AuthService`) pronto para receber um provedor real depois.

## Stack

|                        |                                                    |
| ---------------------- | -------------------------------------------------- |
| Runtime                | Node.js (recomendado: 24 LTS — ver nota abaixo)    |
| Framework              | Next.js 16 (App Router) + React 19                 |
| Linguagem              | TypeScript 5.9 (modo estrito — ver nota abaixo)    |
| UI                     | Material UI 9 + Emotion, sob o Kokyu Design System |
| Formulário             | React Hook Form + Zod                              |
| Testes unitários       | Vitest + Testing Library + jest-dom                |
| Testes E2E             | Playwright                                         |
| Documentação de UI     | Storybook 10 (`@storybook/nextjs-vite`)            |
| Gerenciador de pacotes | pnpm                                               |

**Nota sobre TypeScript:** a versão estável mais recente no momento (7.0.2) ainda não é
suportada pelo `typescript-eslint` usado pelo `eslint-config-next` (peer range `>=4.8.4 <6.0.0`).
Por isso o projeto fixa TypeScript em `5.9.3` — a última versão 5.x, com suporte oficial completo
do ecossistema Next.js/ESLint. Isso será revisto quando o `typescript-eslint` adicionar suporte à
série 7.

**Nota sobre Node:** o ambiente onde este projeto foi construído tem Node 22.x instalado; o
projeto não usa nenhuma API exclusiva do Node 24, então roda normalmente em qualquer Node ≥ 20.9.
Ainda assim, recomendamos Node 24 LTS para alinhar com o restante da stack.

## Requisitos

- Node.js ≥ 20.9 (recomendado: 24 LTS)
- pnpm ≥ 10

## Instalação

```bash
pnpm install
```

## Execução

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) — a rota raiz `/` redireciona
automaticamente para `/login`.

## Scripts

| Script                              | O que faz                                                           |
| ----------------------------------- | ------------------------------------------------------------------- |
| `pnpm dev`                          | inicia o servidor de desenvolvimento                                |
| `pnpm build`                        | build de produção                                                   |
| `pnpm start`                        | serve o build de produção                                           |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                                                              |
| `pnpm format` / `pnpm format:check` | Prettier                                                            |
| `pnpm typecheck`                    | gera os tipos de rota do Next e roda `tsc --noEmit`                 |
| `pnpm test`                         | testes unitários (Vitest, uma vez)                                  |
| `pnpm test:watch`                   | testes unitários em modo watch                                      |
| `pnpm test:coverage`                | testes unitários com relatório de cobertura                         |
| `pnpm test:e2e`                     | testes end-to-end (Playwright, builda e sobe a app automaticamente) |
| `pnpm test:e2e:ui`                  | testes E2E no modo interativo do Playwright                         |
| `pnpm storybook`                    | Storybook em modo desenvolvimento (porta 6006)                      |
| `pnpm build-storybook`              | build estático do Storybook                                         |
| `pnpm check`                        | `lint` + `typecheck` + `test`, em sequência                         |

## Testes

- **Unitários** (`pnpm test`): Vitest + Testing Library, ambiente jsdom. Testam comportamento —
  o que o usuário vê e pode fazer — nunca detalhe de implementação. Cobertura mínima configurada:
  80% statements, 75% branches, 80% functions, 80% lines (`vitest.config.ts`).
- **End-to-end** (`pnpm test:e2e`): Playwright, contra um build de produção real
  (`next build` + `next start`). Cobre o fluxo completo de login — redirecionamento, validação,
  mostrar/ocultar senha, envio, botão do Google — e os três breakpoints principais
  (mobile/tablet/desktop). Configurado para Chromium, Firefox, WebKit e viewports mobile/tablet
  (`playwright.config.ts`); a verificação padrão roda em Chromium.

## Storybook

```bash
pnpm storybook
```

Duas seções:

- **Kokyu Foundations** — visualização dos tokens (`design-system/foundations/`): cores,
  tipografia, espaçamento, raio de borda, sombras, breakpoints e motion.
- **Kokyu Components** — cada componente do Design System com seus estados
  (`design-system/components/**/*.stories.tsx`).
- **Kokyu Pages** — a tela de login completa (`app/(auth)/login/page.stories.tsx`), com stories
  fixas em desktop/tablet/mobile.

Viewports customizados (Mobile Small, Mobile, Mobile Large, Tablet, Laptop, Desktop) já
configurados na toolbar do Storybook (`.storybook/preview.tsx`).

## Estrutura de pastas

```
src/
  app/                        composição e roteamento (App Router)
    layout.tsx                 html, fontes, metadata, <Providers>
    page.tsx                   redireciona "/" → "/login"
    providers.tsx               agrega os providers da aplicação
    (auth)/login/page.tsx       tela de login (Server Component)

  features/
    auth/
      components/               LoginForm, LoginFormPanel, LoginVisualPanel, LoginFooter
      hooks/                     useLoginForm
      schemas/                   loginSchema (Zod)
      services/                  authService (contrato + mock)
      types/                     AuthCredentials, AuthUser, AuthResult, AuthService
      constants/                 authText (todo texto pt-BR)
      __tests__/                 testes de comportamento

  design-system/
    tokens/
      primitives/                cor, espaçamento, borda, sombra, motion, opacidade, z-index,
                                  breakpoint, container, tipografia
      semantic/                  tokens de cor com significado de uso (light + dark)
      component/                 tokens específicos de botão/input/card
    theme/                       createKokyuTheme(), fontes (next/font), augmentação de tipos
    providers/                   ThemeRegistry (MUI + App Router)
    components/                  KokyuButton, KokyuTextField, KokyuPasswordField, KokyuCheckbox,
                                  KokyuLink, KokyuDivider, KokyuLogo, KokyuAuthCard,
                                  KokyuGoogleButton
    foundations/                 stories de documentação visual dos tokens

test/                          setup e utilitário de render do Vitest
e2e/                            testes Playwright
docs/                           arquitetura e Design System em detalhe
```

Detalhes de arquitetura (regra de dependência entre `app`/`features`/`design-system`, quando um
componente precisa de `'use client'`, estratégia de testes) estão em
[`docs/architecture.md`](docs/architecture.md).

## Design System

O **Kokyu Design System (KDS)** é uma camada própria sobre o Material UI — nenhum componente da
aplicação depende diretamente do visual padrão do MUI. Tokens seguem a hierarquia
`primitivo → semântico → componente → componente React`, e a paleta usa CSS Variables nativas do
MUI v9 (`createTheme({ cssVariables: true })`) para suportar light/dark sem duplicar componentes.

Detalhes completos — filosofia, cada camada de token, semântica das famílias de cor inspiradas em
Demon Slayer, como criar um token ou componente novo — estão em
[`docs/design-system.md`](docs/design-system.md).

## Convenções

- Componentes: `PascalCase`. Hooks: `useNome`. Tipos: `PascalCase`, sem prefixo `I`.
- Alias de import: `@/*` → `src/*`. Sem imports relativos profundos (`../../../..`).
- `index.ts` só existe onde forma uma API pública real (`design-system/components`,
  `design-system/tokens`, `features/auth`) — nunca criado automaticamente em toda pasta.
- Nada de `utils.ts`/`helpers.ts` genéricos: cada arquivo tem um nome específico do que contém.
- Commits seguem [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`,
  `refactor`, `test`, `docs`, `chore`, `style`, `build`, `ci`).

## Responsividade

Mobile-first, sem layouts específicos por resolução — comportamento fluido entre breakpoints
(`xs: 0`, `sm: 600`, `md: 900`, `lg: 1200`, `xl: 1536`, alinhados aos defaults do MUI). No
desktop (`md+`) o login usa layout dividido (painel de marca + formulário); abaixo disso o painel
decorativo desaparece e o formulário ocupa a largura total. Tipografia usa `clamp()` para fluir
entre tamanhos sem breakpoints extras. Validado manualmente e via Playwright em 390px (mobile),
820px (tablet) e 1440px (desktop) — ver `e2e/responsive.spec.ts`.

## Acessibilidade

Meta: WCAG 2.2 AA.

- Todo campo tem `<label>` real (nunca placeholder como substituto).
- Mensagens de erro associadas ao campo via `aria-describedby`/`helperText` do MUI.
- Foco sempre visível (`:focus-visible` com contorno de 2px na cor semântica `border.focus`).
- Toggle de mostrar/ocultar senha é um `<button>` com `aria-label` e `aria-pressed` corretos,
  operável por teclado.
- Botão de submit usa `aria-busy` durante o carregamento e permanece com o mesmo tamanho.
- Animações (incluindo a "respiração" decorativa do painel visual) respeitam
  `prefers-reduced-motion`.
- Addon `@storybook/addon-a11y` ativo no Storybook para checagem contínua durante o
  desenvolvimento dos componentes.
