# Arquitetura — Kokyu

Este documento explica como o frontend do Kokyu está organizado, por que ele está organizado
assim, e as regras que mantêm essa organização sustentável à medida que novos módulos
(academia, dieta, finanças, hábitos, agenda...) forem adicionados.

## Visão geral

O projeto usa **arquitetura por features** sobre o **App Router** do Next.js, com um **Design
System** próprio (Kokyu Design System) como camada de UI compartilhada.

```
src/
  app/            camada de composição e roteamento (Next.js App Router)
  features/       lógica e UI específicas de cada domínio (auth, e futuramente outros)
  design-system/  Kokyu Design System — tokens, tema, componentes base
```

Não existem hoje as pastas `shared/`, `config/` ou `styles/` do desenho inicial: nenhuma delas
tinha conteúdo real ainda, e pastas vazias não são criadas "para o futuro" (ver seção
[Convenções](#convenções)). Elas devem nascer no dia em que uma segunda feature realmente
precisar compartilhar algo que hoje só existe dentro de `features/auth`.

## Regra de dependência

```
app  ──────────────▶  features  ──────────────▶  design-system
                              ╲                  ╱
                               ╲────────────────▶
                         (features também podem depender
                          diretamente do design-system)
```

- **`app`** só compõe e roteia. Não deve conter lógica de negócio — isso vive em `features`.
- **`features/*`** pode importar de `design-system`, mas nunca de outra feature. Quando duas
  features precisarem compartilhar algo, esse algo sobe para `design-system` (se for de UI/token)
  ou para uma futura pasta `shared` (se for lógica sem relação com UI).
- **`design-system`** não importa nada de `features` nem de `app`. Ele não sabe que "login"
  existe.

Essa direção única é o que permite adicionar uma feature nova (ex.: `features/habits`) sem
precisar tocar em `features/auth` ou no Design System.

## `app/` como camada de composição

- `app/layout.tsx` — Server Component. Define `<html>`, fontes (`next/font`), metadata e monta
  `<Providers>`.
- `app/providers.tsx` — único lugar que agrega todo provider de app inteiro (hoje, só o
  `ThemeRegistry` do Design System).
- `app/page.tsx` — redireciona `/` para `/login` via `redirect()` do `next/navigation`.
- `app/(auth)/login/page.tsx` — Server Component. Só compõe peças de `features/auth` e
  `design-system/components`; não tem `useState`, não valida formulário, não fala com serviço
  nenhum.

## `features/auth/`

```
features/auth/
  components/   UI da feature (LoginForm, LoginFormPanel, LoginVisualPanel, LoginFooter)
  hooks/        useLoginForm — orquestra react-hook-form + zod + authService
  schemas/      loginSchema (Zod) — única fonte de verdade da validação
  services/     authService — contrato AuthService + implementação mockada
  types/        AuthCredentials, AuthUser, AuthResult, AuthService
  constants/    authText — todo texto em pt-BR da tela de login
  __tests__/    testes de comportamento (Vitest + Testing Library)
```

`index.ts` reexporta só o que `app/` precisa (`LoginForm`, `LoginFormPanel`, `LoginVisualPanel`,
`LoginFooter`, `authText`) — os internos da feature (hook, schema, service) não são re-exportados
porque nada fora da feature deveria importá-los diretamente.

### O contrato `AuthService`

Ainda não existe backend. Para que a próxima etapa (Auth.js, Cognito, Firebase, ou API própria)
não exija reescrever a tela de login, toda a feature depende apenas da interface `AuthService`
(`types/auth.types.ts`):

```ts
interface AuthService {
  signInWithCredentials: (credentials: AuthCredentials) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
}
```

`services/authService.ts` hoje exporta uma implementação mockada dessa interface. Trocar de
provedor de autenticação é trocar esse arquivo — `LoginForm`, `useLoginForm` e o botão do Google
não mudam.

## Server Components vs. Client Components

Regra geral: um componente só ganha `'use client'` quando ele realmente precisa — estado,
efeitos, event handlers definidos ali, ou (motivo menos óbvio, explicado abaixo) `sx` do MUI em
formato de função.

| Componente                                                                            | Tipo                           | Por quê                                                                                       |
| ------------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------- |
| `app/layout.tsx`, `app/page.tsx`, `app/(auth)/login/page.tsx`                         | Server                         | roteamento/composição pura                                                                    |
| `LoginVisualPanel`                                                                    | Server                         | decorativo, usa cores fixas do tema escuro (tokens diretos, não `theme.vars`)                 |
| `LoginForm`                                                                           | Client                         | `react-hook-form`, estado de loading, handlers                                                |
| `KokyuPasswordField`                                                                  | Client                         | `useState` para mostrar/ocultar senha                                                         |
| `KokyuButton`, `KokyuTextField`, `KokyuCheckbox`, `KokyuLink`, `KokyuLogo`            | Universal (sem `'use client'`) | só compõem componentes MUI (que já são Client Components) e não usam hooks nem `sx` em função |
| `KokyuAuthCard`, `KokyuDivider`, `KokyuGoogleButton`, `LoginFormPanel`, `LoginFooter` | Client                         | usam `sx={(theme) => ...}` — ver nota abaixo                                                  |
| `ThemeRegistry`                                                                       | Client                         | `AppRouterCacheProvider` e `ThemeProvider` exigem client                                      |

### Por que `sx` em função força `'use client'`

Componentes do MUI (`Button`, `Box`, `Typography`, ...) já vêm marcados `'use client'` no próprio
pacote — por isso dá para usá-los dentro de um Server Component sem problema, desde que as props
passadas para eles sejam serializáveis.

O problema aparece quando o **próprio** Server Component cria uma função e a passa como prop —
por exemplo `sx={(theme) => ({ color: theme.vars.palette.kokyu.text.secondary })}`. Funções não
são serializáveis através do limite Server → Client, e o build falha com
`Functions cannot be passed directly to Client Components`.

A correção usada aqui foi simples: qualquer componente cujo `sx` precise ler o tema em tempo de
render (porque a cor depende do color scheme ativo) virou Client Component. `LoginVisualPanel`
ficou de fora dessa lista de propósito — ele é o painel decorativo de marca, sempre no tema
escuro independente do color scheme ativo, então em vez de ler `theme.vars` ele importa os
tokens semânticos escuros (`darkColorTokens`) diretamente como valores estáticos, e por isso
pode continuar sendo Server Component.

## Estratégia de testes

- **Vitest + Testing Library** (`*.test.tsx`, colocados ao lado do arquivo testado) — testam
  comportamento de componentes do Design System e da feature `auth`: o que o usuário vê, o que
  acontece quando ele interage, nunca detalhe de implementação.
- **Playwright** (`e2e/*.spec.ts`) — o fluxo completo rodando num navegador de verdade, contra um
  build de produção (`next build` + `next start`), incluindo os três breakpoints principais
  (mobile/tablet/desktop).
- **Storybook** (`*.stories.tsx`) — não é suíte de teste automatizado nesta fase; é documentação
  viva e ambiente de revisão visual/isolada de cada peça do Design System, incluindo as páginas de
  fundamentos (`design-system/foundations/`).

`src/app/**` fica fora do relatório de cobertura do Vitest: página e layout são compostas quase
inteiramente de `features`/`design-system` (já cobertos ali) e do provider (coberto pelo
Playwright), então testá-los de novo em isolamento com RTL não agregaria sinal.

## Convenções

- **Barrels (`index.ts`)** só existem onde formam uma API pública real: `design-system/components`,
  `design-system/tokens`, `features/auth`. Nenhuma pasta ganha `index.ts` automaticamente.
- **Pastas vazias não são criadas.** Se `shared/`, `config/` ou uma nova feature ainda não têm
  conteúdo, elas simplesmente não existem no repositório até terem.
- **Nomes de arquivo específicos.** Nada de `utils.ts`/`helpers.ts` genéricos — cada arquivo tem
  um nome que diz o que ele contém (`loginSchema.ts`, `authService.ts`, `useThemePalette.ts`).
