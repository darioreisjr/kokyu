# Respiração — Home Inteligente (`features/home`)

Este documento explica a arquitetura da Home do Kokyu (`/app`), por que ela foi desenhada assim, e
como estender cada peça sem duplicar dados de outros módulos. Para as regras gerais de arquitetura
(dependência entre `app`/`features`/`design-system`, Server vs. Client Components, estratégia de
testes), ver [`architecture.md`](./architecture.md).

## Objetivo

Respiração não é um dashboard genérico — é a camada de síntese do Kokyu. Ela responde rapidamente:
"como está meu dia?", "o que está acontecendo agora?", "o que vem depois?", "estou tentando fazer
mais do que cabe hoje?". Ela **nunca possui dados** — apresenta projeções pequenas vindas de cada
módulo:

```
Módulos → Home Providers → HomeSnapshot → Respiração
```

Nunca `Respiração → cópia local dos dados de todos os módulos`.

## Regra de dependência (por que `features/home` importa de outras features)

`docs/architecture.md` descreve a regra original ("`features/*` nunca importa de outra feature")
válida enquanto só existia `features/auth`. O precedente real e atual — usado por
`features/daily-rhythm`, que já importa `habitService`, `trainingScheduleService`,
`mealPlanService`, `leisurePlanService` e `goalDb` diretamente — é que uma feature cujo papel é
**sintetizar/agregar** outras (o próprio Ritmo Diário, e agora a Home) tem permissão para importar
o serviço real de cada uma. `features/home` segue esse mesmo precedente: cada Home Provider mora em
`features/home/providers/` e importa o serviço oficial do módulo que projeta — nunca duplica a
lógica desse módulo, só lê um recorte pequeno dela.

## `HomeSectionProvider` — o contrato

Definido em `src/shared/home/types/homeProvider.types.ts` (ao lado de `HomeProviderContext` e
`HomeProviderResult<T>`), na mesma pasta conceitual que `shared/scheduling` já ocupa para
`ScheduleSourceAdapter`. Assim como `shared/scheduling`'s types nunca importam um tipo de
`features/*` (para não acoplar o contrato compartilhado a uma feature específica), os tipos de
projeção em `shared/home/types/homeProjections.types.ts` usam uniões locais (`HomeTimeOfDay`,
`HomeGoalStatus`) em vez de importar `HabitTimeOfDay`/`GoalStatus` das features.

```ts
interface HomeSectionProvider<T> {
  sourceType: HomeSourceType;
  label: string;
  getHomeProjection: (context: HomeProviderContext) => Promise<T>;
}
```

Cada provider concreto mora em `features/home/providers/*.ts`:

| Provider                    | Lê de                                                                 | Projeção                        |
| ---------------------------- | ---------------------------------------------------------------------- | -------------------------------- |
| `missionHomeProvider`        | `missionService.getMissions`/`getTodayMissions`                        | `MissionHomeProjection`          |
| `habitHomeProvider`          | `habitService.getHabitOccurrences`/`getRoutines`                       | `HabitHomeProjection`            |
| `trainingHomeProvider`       | `trainingScheduleService`, `activeWorkoutSessionStorage`                | `TrainingHomeProjection`         |
| `nutritionHomeProvider`      | `mealPlanService`, `pantryService`, `shoppingService`                   | `NutritionHomeProjection`        |
| `goalHomeProvider`           | `goalService`, `goalProgressEngine`                                     | `GoalHomeProjection`             |
| `leisureHomeProvider`        | `leisurePlanService`, `leisureItemService`                              | `LeisureHomeProjection`          |
| `dailyRhythmHomeProvider`    | `dailyRhythmService.getDaySchedule` (o mesmo call do Ritmo Diário)      | `DailyRhythmHomeProjection`      |

### `missionHomeProvider` lê `features/missions` de verdade

`features/missions` existe (ver `docs/missions.md`) e `features/home` é uma das duas features com
permissão documentada de importar o serviço real de outra (a outra é `daily-rhythm`) — seu papel é
justamente **sintetizar/agregar**, não duplicar lógica. `missionHomeProvider` chama
`missionService.getMissions()`/`getTodayMissions()` diretamente; "foco de hoje" não é um campo
persistido em `Mission` — é a missão de maior prioridade entre as que já qualificam para Hoje (a
seleção real de 1-3 missões principais mora em `DailyPriority`, do Ritmo Diário, composta à parte
por `homeSnapshotService`). `homeQuickCompleteService.completeMission` chama
`missionService.completeMission` (não é mais um mock write).

Esse é exatamente o padrão que `features/goals` ainda **não** pode seguir para `missionGoalAdapter`
— `goals` não é uma feature-síntese, então continua lendo um snapshot local mesmo agora que
`features/missions` existe (ver `docs/goals.md`).

## `HomeSnapshot`

`src/shared/home/types/homeSnapshot.types.ts`. Contém só o essencial para renderizar a página —
nunca entidades completas:

```
date, now, dayProgress, currentEntry, currentFreeSlot, nextEntries, dailyPriorities,
missions, habits, training, nutrition, goals, leisure, schedule (cada um HomeProviderResult<T>),
alerts, quickActions, hasAnyPlannedActivity, generatedAt
```

`currentEntry`/`nextEntries` vêm do provider `dailyRhythmHomeProvider` (que por sua vez lê
`dailyRhythmService.getDaySchedule`) — nunca uma segunda fonte de agenda. `dayProgress` é
calculado localmente (`homeDayService.computeDayProgress`) a partir de `now` +
`preferences.routine.dayStartsAt/dayEndsAt` — é um fato ("14:30 de 06:00–23:00"), nunca um score.

## `HomeSnapshotService` (`features/home/services/homeSnapshotService.ts`)

Orquestra os 7 providers com `Promise.all` + um `runProvider` que envolve cada chamada em
try/catch, transformando uma falha em `{ status: 'error', data: null, error }` em vez de derrubar
o snapshot inteiro — ver "Partial Failure" abaixo. Depois:

1. Calcula `dayProgress`.
2. Monta `dailyPriorities` (foco de hoje da Missão + Metas em foco, capado em 5) — uma Missão
   nunca usa a mesma UI de uma Meta (`HomeFocus` diferencia por `kind`).
3. Chama `getHomeAttention` (`homeAttentionService.ts`) para montar `alerts`.
4. Deriva `currentFreeSlot` (o `FreeTimeSlot` que contém "agora", quando não há `currentEntry`).
5. Deriva `hasAnyPlannedActivity` (liga o onboarding compacto quando falso).

## `HomeAttentionService` (`features/home/services/homeAttentionService.ts`)

Único lugar que decide o que vira alerta e em que ordem — nenhuma regra de alerta mora dentro de um
card. Ordem (do próprio enunciado do produto): conflito de agenda → Missão atrasada → Meta em risco
→ Missão aguardando retorno → despensa vencendo → check-in de Meta pendente → compras pendentes.
Severidade é `info`/`attention`/`important` (nunca "error" para tudo) — ver `HomeAttentionItem`.

## `HomeSuggestionService` (`features/home/services/homeSuggestionService.ts`)

`getHomeSuggestions(availableMinutes, date?)` — chama o `getCandidatesForAvailableTime` que já
existe (`features/daily-rhythm/adapters/candidateProviders.ts`, o mesmo que `SlotSuggestionDialog`
usa) e só ordena/rotula o resultado. Nunca um segundo algoritmo de candidatos. O diálogo completo
de "Ver o que cabe aqui" reaproveita `SlotSuggestionDialog` (daily-rhythm) diretamente; o preview
inline em `HomeFreeTimeCard` usa `getHomeSuggestions` para as 2–3 melhores opções sem abrir diálogo.

## Reuso de UI (nada duplicado)

- `HomeNextTimeline` reaproveita `ScheduleEntryCard` (modo `compact`) do Ritmo Diário.
- `HomeCapacity` reaproveita `CapacityIndicator` (modo `compact`).
- O CTA principal de `HomeNowCard` reaproveita `createScheduleEntryActionProvider` (mesma função
  que gera as ações do menu de `ScheduleEntryCard`) para o rótulo por origem ("Iniciar treino",
  "Registrar conclusão", "Focar agora"...) — só sobrepõe "Continuar treino" quando
  `activeWorkoutSessionStorage.hasActive()` é verdadeiro.
- `RespirationHeader`'s data usa `formatDateHeading` (de `features/leisure/utils/dateHelpers`, já o
  ponto de reuso cross-feature que `daily-rhythm` também usa).
- O "breath indicator" decorativo reaproveita a keyframe `kokyu-breathe-slow` já definida em
  `app/globals.css` para o painel visual do login — não é um novo padrão de animação.

## Partial failure / isolamento de erro

Cada card de "Áreas de hoje" (`HomeMissionSummary`, `HomeHabitSummary`, ...) recebe o
`HomeProviderResult<T>` inteiro e usa `HomeAreaCardShell` para resolver `loading`/`error`/`empty`/
conteúdo — uma falha em Nutrição mostra "Não foi possível carregar agora." só naquele card; todos
os outros continuam funcionando normalmente (coberto por
`homeSnapshotService.test.ts`'s "isolates a failing provider...").

## Personalização (`preferences.home`)

Segue exatamente o padrão de `features/settings` (`UserPreferences` → `defaultPreferences` →
`preferencesStorage`'s `mergeWithDefaults` → `usePreferences().updateSection('home', patch)`), sem
inventar um segundo mecanismo de persistência:

```ts
home: {
  sectionOrder: HomeSectionId[];   // default = HOME_SECTION_IDS (shared/home/types)
  hiddenSections: HomeSectionId[];
  compactMode: boolean;
  showGreeting: boolean;
  showCapacity: boolean;
  showInsights: boolean;
}
```

`now`/`next` (`HOME_ESSENTIAL_SECTIONS`) nunca aparecem na lista de seções ocultáveis do
`HomePersonalizationDialog` — sempre visíveis, só reordenáveis pelo restante da lista.

## `getLogicalToday`/dia lógico

Não existe hoje um `getToday()` centralizado no projeto nem lógica de timezone real — todo módulo
calcula "hoje" com `toDateKey(new Date())` (convenção de `features/leisure/utils/dateHelpers.ts`,
já reaproveitada por `daily-rhythm`). `features/home/services/homeDayService.ts` segue a mesma
convenção (`getLogicalToday`) em vez de inventar uma oitava versão dessa função — ver o comentário
no próprio arquivo. `dayStartsAt`/`dayEndsAt` (janela de vigília, não o dia de calendário) vêm de
`preferences.routine`, exatamente como o Ritmo Diário já usa.

## Futuro BFF

Quando existir um backend, o endpoint natural é `GET /home/snapshot`, devolvendo exatamente a forma
de `HomeSnapshot` — o frontend já está desenhado para essa substituição: só
`homeSnapshotService.getHomeSnapshot` muda de "rodar 7 providers em paralelo" para "um fetch", o
resto (hook, componentes, tipos) fica igual.

## Invalidação

Não há barramento de eventos em nenhum lugar do projeto (nem em `features/training`, que documenta
essa mesma lacuna). `useHomeSnapshot` segue o padrão pull já usado por `useDailyRhythm`: carrega no
mount, e cada ação que muda dado de um provider (concluir Missão/Hábito, criar um compromisso a
partir de uma sugestão de tempo livre) chama `refresh()` depois — nunca uma mutação otimista do
snapshot em memória.

## Acessibilidade

- H1 real da página é "Respiração" (visualmente oculto — o título já aparece na navegação/aba);
  H2 nomeiam as seções (Agora, Próximo, Em foco, Ritmo do dia, Áreas de hoje, Precisa de atenção,
  Adicionar).
- "Precisa de atenção" nunca aparece vazio (seção inteira retorna `null` quando `alerts.length === 0`).
- Severidades usam `Alert` com ícone + cor, nunca só cor.

## O que fica para depois (fora de escopo desta etapa, ver o próprio prompt do produto)

IA real, clima, mapa/localização, integração direta com Google Calendar/Gmail, feed social, score
de produtividade/equilíbrio de vida, widgets nativos, PWA/lock screen/smartwatch.
