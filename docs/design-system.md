# Kokyu Design System (KDS)

## Filosofia

O Material UI é a base técnica do Kokyu, mas nenhum componente da aplicação depende diretamente
dos estilos padrão do MUI. Existe uma camada própria por cima dele — o Kokyu Design System —
porque o objetivo é poder mudar a identidade visual do produto (cores, tipografia, espaçamento)
sem precisar tocar em dezenas de componentes espalhados pela aplicação.

Essa camada segue uma hierarquia fixa:

```
PRIMITIVE TOKENS  →  SEMANTIC TOKENS  →  COMPONENT TOKENS  →  COMPONENTES
```

- **Primitivos** (`design-system/tokens/primitives/`): valores crus — uma escala de cor, uma
  escala de espaçamento, uma escala tipográfica. Não têm significado de uso.
- **Semânticos** (`design-system/tokens/semantic/`): dão significado de uso aos primitivos —
  `color.action.primary`, `color.text.secondary` — e são a única camada de cor que o tema e os
  componentes podem enxergar.
- **De componente** (`design-system/tokens/component/`): ajustes específicos de um componente
  (altura de botão, raio de card) que não fazem sentido como token global.
- **Componentes** (`design-system/components/`): o que a aplicação de fato importa e usa.

Uma regra concreta: **nenhum componente referencia uma família de cor primitiva pelo nome.**

```ts
// Errado — o Button não deveria saber que "hinokami" existe.
sx={{ color: 'hinokami.500' }}

// Certo — o Button usa o significado, não a família.
sx={{ color: theme.vars.palette.kokyu.action.primary }}
```

O token semântico `color.action.primary` hoje aponta para a escala Hinokami; se a identidade do
Kokyu mudar amanhã, só `tokens/semantic/colors.ts` muda — nenhum componente é tocado.

## Semântica das famílias de cor (Demon Slayer)

A paleta é inspirada nos estilos de respiração de Demon Slayer apenas como referência
conceitual — nenhum logo, ilustração, personagem ou arte oficial é reproduzido. Cada família tem
um papel fixo:

| Família      | Papel                                                                |
| ------------ | -------------------------------------------------------------------- |
| **Nichirin** | neutralidade, profundidade e superfícies — o fundo da aplicação      |
| **Hinokami** | ação principal, energia e progresso — botão primário, foco, erro     |
| **Mizu**     | calma, informação e concentração — estados de info                   |
| **Kaminari** | atenção e destaque — usado com moderação                             |
| **Fuji**     | identidade secundária e proteção — ação secundária                   |
| **Tanjiro**  | sucesso e evolução                                                   |
| **Nezuko**   | accent emocional opcional                                            |
| **Rengoku**  | energia e intensidade — distinto do Hinokami, reservado a ilustração |
| **neutral**  | texto, ícones e bordas — cinza puro, sem matiz de marca              |

## Tema inicial (login)

A tela de login usa a combinação **Nichirin + Hinokami + Fuji**: fundo escuro profundo
(Nichirin), ação principal em vermelho/laranja (Hinokami) e um accent secundário roxo (Fuji),
com texto claro. Os valores exatos de cada tom já foram escolhidos garantindo contraste
AA (texto claro sobre fundo `nichirin.950`, branco sobre `hinokami.500` no botão principal).

## Light e dark mode

O tema é construído com `createTheme({ cssVariables: true, colorSchemes: { light, dark } })` do
MUI v9 — CSS Variables nativas, não dois temas duplicados. A troca de esquema acontece
inteiramente via o atributo `data-mui-color-scheme` no `<html>`; nenhum componente precisa saber
qual modo está ativo. `dark` é o esquema padrão nesta fase (ver `KOKYU_DEFAULT_COLOR_SCHEME` em
`design-system/theme/index.ts`); não existe ainda uma UI de troca de tema.

Dentro de `sx`/`styleOverrides`, o padrão do projeto é ler `theme.vars.palette...` (não
`theme.palette...`) — é isso que mantém a troca de esquema reativa via CSS puro. Como
`theme.vars` é opcionalmente `undefined` no tipo do MUI (para o caso de tema sem CSS vars), use o
helper `themePalette(theme)` de `design-system/theme/useThemePalette.ts` em vez de acessar
`theme.vars` diretamente.

## Tokens

### Cor

Primitivos: `neutral` (13 tons, 0–1000) e oito famílias cromáticas — `nichirin`, `hinokami`,
`mizu`, `kaminari`, `fuji`, `tanjiro`, `nezuko`, `rengoku` (11 tons cada, 50–950).

Semânticos (`SemanticColorTokens`, um conjunto por color scheme):
`background.{default,paper,subtle,elevated}`, `surface.{primary,secondary,inverse}`,
`text.{primary,secondary,disabled,inverse}`, `border.{default,subtle,strong,focus}`,
`action.{primary,primaryHover,primaryActive,secondary,secondaryHover,secondaryActive,disabled,disabledBackground}`,
`feedback.{success,warning,error,info}`, `icon.{primary,secondary,disabled}`.

### Tipografia

Fontes carregadas via `next/font/google` (`design-system/theme/fonts.ts`): **Inter** para
corpo/UI, **Manrope** para display/headings e a marca Kokyu — nenhuma chamada de rede em tempo de
execução, tudo self-hosted pelo Next.

Escala (`design-system/tokens/primitives/typography.ts`): `displayLarge/Medium/Small`,
`heading1`–`heading6`, `bodyLarge/Medium/Small`, `labelLarge/Medium/Small`, `caption`. Os tamanhos
usam `clamp()` para fluir entre mobile e desktop sem breakpoints extras. Esses tokens são
expostos como variantes reais do `<Typography>` do MUI (incluindo as que não têm equivalente
padrão, como `displayLarge` ou `labelSmall`) — ver `design-system/theme/typography.ts` e a
augmentação de tipos em `design-system/theme/augmentation.d.ts`.

### Espaçamento

Unidade base de 4px (`design-system/tokens/primitives/spacing.ts`): `spacing.1 = 4px` até
`spacing.24 = 96px`. `theme.spacing()` do MUI foi configurado com fator 4 para bater exatamente
com essa escala.

### Borda, sombra, movimento, opacidade, z-index, breakpoints, container

Todos em `design-system/tokens/primitives/`, cada um com seu próprio arquivo
(`borders.ts`, `shadows.ts`, `motion.ts`, `opacity.ts`, `zIndex.ts`, `breakpoints.ts`,
`containers.ts`). `zIndex` e as opacidades de `action` (`hover`/`focus`/`disabled`) alimentam
diretamente `createKokyuTheme()`, então qualquer `Modal`/`Drawer`/`Tooltip` futuro já herda a
escala correta sem configuração extra.

Animações respeitam `prefers-reduced-motion` globalmente (`app/globals.css`): com a preferência
ativada, toda `animation`/`transition` do site — incluindo a respiração de fundo do painel visual
do login — cai para praticamente instantânea.

### Componente

`design-system/tokens/component/` — hoje `button.ts`, `input.ts`, `card.ts`. Existem porque
altura de botão, raio de input e padding de card não são conceitos globais o suficiente para
virar token primitivo, mas também não deveriam ser números soltos dentro do componente.

## Componentes do Design System (fase atual)

Só os componentes realmente usados pela tela de login existem por enquanto: `KokyuButton`,
`KokyuTextField`, `KokyuPasswordField`, `KokyuCheckbox`, `KokyuLink`, `KokyuDivider`,
`KokyuLogo`, `KokyuAuthCard`, `KokyuGoogleButton`. Cada um encapsula um padrão visual do KDS e
aceita as props padrão do componente MUI equivalente — sem reinventar uma API própria.

`KokyuGoogleButton` não conhece nenhum provedor de autenticação: ele só recebe `onClick` como
qualquer outro botão. Quem decide o que acontece ao clicar é `features/auth` (ver
`docs/architecture.md`).

## Como criar um novo token

1. Pergunte em que camada ele vive: é um valor cru (primitivo) ou já tem um significado de uso
   (semântico)?
2. Primitivo novo → adicione ao arquivo já existente da categoria (`colors.ts`, `spacing.ts`...)
   seguindo a mesma nomenclatura da escala.
3. Semântico novo → adicione a ambos os color schemes em `tokens/semantic/colors.ts`
   (`lightColorTokens` e `darkColorTokens`), nunca só um.
4. Não invente uma escala nova para um caso único — reaproveite a mais próxima já existente.

## Como criar um novo componente do Design System

1. Ele deveria existir? Só crie o que a feature atual realmente precisa (ver seção 1 do prompt
   mestre) — nada de componente "para o futuro".
2. Componente puramente apresentacional (sem hook, sem `sx` em função) pode ficar sem
   `'use client'`. Se ele usa `theme.vars` dentro de `sx`, precisa de `'use client'` — veja a
   explicação em `docs/architecture.md`.
3. Sempre em `design-system/components/NomeDoComponente/NomeDoComponente.tsx`, reexportado em
   `design-system/components/index.ts`.
4. Sempre com uma story ao lado (`NomeDoComponente.stories.tsx`) demonstrando os estados
   relevantes, e teste (`NomeDoComponente.test.tsx`) quando houver comportamento — não "renderiza
   sem quebrar".
