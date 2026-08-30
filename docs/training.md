# Treinamento — `features/training`

Este documento explica o modelo de domínio do módulo Treinamento (`/app/treinamento`), por que ele
foi desenhado assim, e como estender cada peça sem tocar no resto. Para as regras gerais de
arquitetura (dependência entre `app`/`features`/`design-system`, Server vs. Client Components,
estratégia de testes), ver [`architecture.md`](./architecture.md).

## Objetivo do módulo

Treinamento é a central completa de musculação, força, hipertrofia, funcional, peso corporal,
cardio, mobilidade e alongamento — planejamento, execução e acompanhamento. O princípio central,
obrigatório em todo o domínio:

```
Programa → Bloco → Semana → Rotina planejada → Sessão executada → Exercícios → Séries → Histórico → Progressão
```

Uma **rotina** (`WorkoutRoutine`) é um modelo reutilizável — "Push A". Uma **sessão**
(`WorkoutSession`) é a execução real de uma rotina em um dia específico. Editar uma rotina depois
de uma sessão **nunca** altera o histórico: toda sessão guarda um snapshot próprio
(`SessionExercise`/`PerformedSet`), nunca uma referência viva à rotina original — ver
"Snapshot de sessão" abaixo.

## Modelo de domínio (`types/`)

Um arquivo por agregado, união de tipos por barrel em `types/index.ts`. Enums são sempre uniões de
string literal, nunca `enum` do TypeScript (mesma convenção de `features/goals`).

- **`Exercise`** — catálogo de exercícios. `createdByUser: false` = exercício da biblioteca
  (somente leitura para nome/músculos/equipamento — `exerciseService.updateExercise` recusa a
  edição); `favorite`/`exercisePreference`/`personalNotes` continuam editáveis em qualquer
  exercício, custom ou não. `trackingType` decide quais campos um `SetPrescription`/`PerformedSet`
  realmente mostram (`weightReps`, `reps`, `time`, `distanceTime`, `weightTime`, `distance`,
  `custom`).
- **`Equipment`** / **`TrainingLocation`** — catálogo de equipamentos e locais de treino, cada
  local com seu próprio subconjunto de equipamentos (`TrainingLocation.equipmentIds`).
- **`ProgressionConfig`** — união discriminada por `strategy`: `manual` (padrão, nunca sugere
  nada), `linear`, `doubleProgression`, `percentOfTrainingMax`. Ver "Motor de progressão" abaixo.
- **`WorkoutRoutine`** — `exercises: RoutineExercise[]` + `groups: ExerciseGroup[]` (união
  discriminada por `kind`: `single | superset | circuit`). `muscleGroups`/`equipmentIds` são
  **derivados dos exercícios e gravados no momento de salvar** (`routineService`'s
  `deriveRoutineMetadata`) — nunca recalculados na leitura.
- **`TrainingProgram`** — `blocks: TrainingBlock[]`, cada bloco com `weeks: ProgramWeek[]`.
  `ProgramWeek.scheduledRoutines: ScheduledRoutineSlot[]` usa `weekday` 0–6 (`Date#getDay()`),
  mesma numeração de `features/settings`'s `locale.weekStartsOn`. `isDeload` é sempre manual —
  nunca gerado automaticamente.
- **`WorkoutSession`** — `sessionExercises: SessionExercise[]`, cada um com um snapshot da
  prescrição (`SessionExercisePrescriptionSnapshot[]`) em vez de uma referência à rotina.
  `PerformedSet` é uma tabela separada (`sessionId`/`sessionExerciseId` como chaves), nunca
  reaproveita o tipo de prescrição.
- **`PersonalRecord`** — `recordType`: `maxWeight | maxReps | maxVolume |
bestEstimatedOneRepMax | repPR`. `repPR` é o único tipo com `reps` preenchido (uma linha por
  faixa de repetições, não um recorde único).
- **`TrainingScheduleEntry`** — o ponto de integração com um futuro Ritmo Diário (ver
  "Integrações preparadas" abaixo). `status: 'missed'` nunca é definido pelo usuário — é derivado
  na leitura (`trainingScheduleService.getTrainingCalendar`) sempre que um `planned` já passou da
  data, espelhando o `hydrateGoalStatus` de `features/goals`.
- **`TrainingPreferences`** — preferências específicas de treino (unidade de peso, descanso
  padrão, anilhas disponíveis, fórmula de 1RM, RPE/RIR visível...). Vive inteiramente dentro da
  feature, não em `features/settings` — ver "Preferências" abaixo.

### Snapshot de sessão

`SessionExercise`/`SessionExercisePrescriptionSnapshot` copiam tudo que a sessão precisa da
rotina **no momento em que o treino começa**. `sessionService`/`TrainingSessionProvider` nunca
releem `routineService` depois disso. Um teste dedicado
(`sessionService.test.ts`: "editing the source routine afterward never changes an already-completed
session") garante essa regra.

## Motor de progressão (`services/progressionStrategies/`, `trainingProgressionEngine.ts`)

Mesmo padrão de `features/goals`'s `goalProgressEngine`/`progressStrategies`: um registro
`Record<ProgressionStrategyType, ProgressionStrategy>` (`progressionStrategies/index.ts`), cada
estratégia um `suggestNext(config, targetSets, history) => ProgressionSuggestion | null` puro.
`trainingProgressionEngine.suggestNextPrescription(routineExercise, history)` é o único ponto de
entrada — componentes nunca chamam uma estratégia diretamente.

- **`manual`** — nunca sugere nada.
- **`linear`** — sugere um incremento só depois que as últimas N sessões (`incrementAfterSuccesses`)
  bateram a meta em **todas** as séries de trabalho.
- **`doubleProgression`** — só sugere quando **toda** série de trabalho da sessão mais recente
  atingiu o topo da faixa de reps (uma série curta já impede a sugestão, por design).
- **`percentOfTrainingMax`** — sem histórico, sempre `trainingMaxKg × percentOfMax`.

O sistema nunca altera a carga da próxima sessão sozinho — só sugere (a UI mostra a frase, o
usuário decide).

## Recorde pessoal (`personalRecordEngine.ts`)

`checkForPersonalRecords(exerciseId, performedSets, existingRecords)` é puro e síncrono. Séries de
aquecimento nunca contam. Retorna um resultado por tipo avaliável, incluindo `isNewRecord: false`
(permite aos testes/chamadores distinguir "avaliado, sem novo recorde" de "não avaliável").
`repPR` retorna um resultado por contagem de repetições distinta realmente executada — a tabela de
recordes por faixa de reps depende disso.

`sessionService.completeWorkout` é o único ponto que persiste um `PersonalRecord` — chama o motor,
grava só os resultados com `isNewRecord: true`, e devolve a lista completa para a UI mostrar
feedback discreto (nunca um modal grande).

## 1RM estimado (`estimatedOneRepMaxCalculator.ts`)

Fórmula centralizada (`epley` por padrão, `brzycki` como alternativa via
`TrainingPreferences.e1rmFormula`), nunca duplicada em um componente. Sempre apresentado como
"1RM estimado" — nunca uma medição exata.

## Volume por músculo (`muscleVolumeCalculator.ts`)

**Decisão documentada**: uma série de trabalho (não aquecimento) conta como "série direta" para
**todo** músculo primário do exercício. Músculos secundários são ignorados nesta primeira métrica —
evita contar a mesma série várias vezes espalhada por grupos diferentes. `calculateSessionMuscleVolume`
cobre uma sessão; `calculateMuscleVolumeAcrossSessions` agrega várias (usado pelo mapa de calor
semanal em Progresso).

## Calculadoras (`plateCalculator.ts`, `warmupCalculator.ts`)

`calculatePlateBreakdown` usa uma estratégia gulosa (maior anilha primeiro) por lado da barra;
`achievable: false` sinaliza quando o peso exato não é possível com o conjunto de anilhas
disponível, mostrando a combinação mais próxima em vez de arredondar silenciosamente.
`calculateWarmupSets` gera uma rampa simples de ~40% a ~90% do peso de trabalho — nunca apresentada
como prevenção garantida de lesão.

## Estimativa de recuperação (`recoveryEstimateEngine.ts`, `recoveryEstimateService.ts`)

Modelo simples e transparente, não uma caixa-preta: horas necessárias para "recuperação total"
escalam com o número de séries diretas recentes; um percentual objetivo (baseado em tempo) é
combinado 50/50 com o check-in mais recente do usuário quando existe um. Sempre rotulado como
estimativa (`estimatedRecoveryPercent`) — nunca uma medição médica. `RecoveryPage` reforça isso com
um aviso explícito e vocabulário de bem-estar ("desconforto informado", nunca "lesão").

## Sessão ativa e execução (`providers/TrainingSessionProvider.tsx`, `services/activeWorkoutSessionStorage.ts`)

Uma sessão em andamento **nunca** toca `trainingMockDb` — vive só em estado do React +
`localStorage` (mesmo padrão de `features/settings/services/preferencesStorage.ts`: envelope
versionado, try/catch, fallback silencioso) até que `finishWorkout` a grave de uma vez via
`sessionService.completeWorkout`. Isso evita sessões "penduradas" no banco falso e mantém a regra
"descartar não deixa rastro".

- **Timer sem drift** — `useRestTimer`/`useElapsedSeconds` usam `useSyncExternalStore`: o
  `getSnapshot` sempre recalcula a partir do timestamp absoluto (`restEndAt`/`startedAt`), nunca
  um contador acumulado. `Date.now()` só é lido dentro do `getSnapshot`, nunca durante o corpo do
  componente — é assim que os hooks continuam "puros" para o React (regra
  `react-hooks/purity`/`react-hooks/set-state-in-effect` do ESLint deste projeto).
- **Recuperação após F5** — `TrainingSessionProvider` reidrata de `localStorage` no mount
  (`isHydrated` guarda contra mismatch de SSR). `/app/treinamento/sessao/[id]` compara
  `params.id` com `activeSession.sessionId`; se não bater, tenta uma sessão **já concluída**
  (deep link de histórico) antes de cair no estado vazio.
- **Bloquear segunda sessão ativa** — a checagem vive nos chamadores
  (`hooks/useStartWorkout.ts`, usado por `TrainingTodayPage`/`RoutineDetailPage`), não dentro do
  provider. `ActiveSessionConflictDialog` oferece Continuar / Descartar e iniciar novo.

## Preferências (`services/trainingPreferencesService.ts`)

`TrainingPreferences` vive inteiramente dentro de `features/training` — não foi adicionada ao
`UserPreferences` global de `features/settings`, porque unidade de peso/anilhas/fórmula de 1RM são
específicas do domínio de treino, diferente de `routine` (o ritmo diário genérico) que já existe
em `UserPreferences`. `TrainingPreferencesDialog` é acessível pelo ícone de engrenagem em
`TrainingTodayPage`; `Configurações → Geral` tem um atalho ("Abrir Treinamento") em vez de duplicar
a UI — `features/settings` não pode importar `features/training` (regra de dependência do
projeto), então um link simples é o único caminho.

Treinamento **lê** (nunca escreve) preferências globais via `usePreferences()` de
`features/settings` para respeitar `locale.weekStartsOn` (calendário, consistência semanal) e
`general.confirmImportantActions` (via `hooks/useConfirmAction.ts`, cópia local do mesmo padrão de
`features/goals`/`features/leisure`/`features/nutrition`) — esse é o único ponto sancionado onde
uma feature importa de outra (confirmado em `leisure`/`nutrition`, que já fazem o mesmo).

## Unidade de peso (`utils/weightUnit.ts`)

Todo peso é armazenado em kg internamente — este arquivo é o **único** lugar que converte para
exibição/entrada (kg ↔ lb). `PersonalRecordEngine`, `TrainingAnalyticsService`, `PlateCalculator`
etc. nunca veem outra coisa além de kg, então as duas unidades nunca se misturam dentro de um
cálculo.

## Gráficos (`design-system/components/KokyuTrendChart`)

Não existe biblioteca de gráficos no projeto (confirmado antes de começar — nenhuma dependência,
nenhum uso em nenhuma feature). Em vez de adicionar uma para poucas telas, criamos **um** primitivo
novo: `KokyuTrendChart`, uma polyline SVG minimalista sem dependência externa. O SVG é
`aria-hidden`; uma legenda em texto ao lado sempre descreve a tendência por extenso — mesma regra
que `GoalProgressBar` já segue para barras de progresso (nunca um gráfico puramente decorativo).
Distribuição de volume por músculo continua usando `LinearProgress` (é uma proporção, não uma
tendência — não precisa de um gráfico novo).

## Integrações preparadas (não conectadas ainda)

`/app/ritmo-diario` e `/app/habitos` ainda são apenas stubs (`<Typography>` sem lógica) — não há
código real do outro lado para conectar hoje. Três costuras ficam documentadas para quando isso
mudar:

1. **Metas** — `features/goals/services/adapters/trainingGoalAdapter.ts` já lê um snapshot
   estático (`mocks/trainingSourceData.mock.ts`) com os campos `sessionsCompletedThisYear`,
   `minutesTrainedThisYear`, `weeklyFrequency`. `TrainingAnalyticsSummary`
   (`trainingAnalyticsService.getTrainingAnalytics()`) usa exatamente os mesmos nomes de campo de
   propósito — trocar o adapter para ler daqui em vez do snapshot estático é uma mudança de uma
   linha, não uma resposta de forma. **`features/goals/` não foi modificado** por este módulo.
2. **Ritmo Diário** — `TrainingScheduleEntry.label` já vem pré-resolvido (mesmo truque de
   `GoalLink.entityLabel`), então um futuro adapter nunca precisará importar `features/training`
   só para mostrar um nome.
3. **Hábitos** — uma futura integração de "frequência semanal" pode consumir
   `trainingAnalyticsService.getTrainingAnalytics().weeklyFrequency` do mesmo jeito.

Eventos de domínio (`WorkoutScheduled`, `WorkoutStarted`, `SetCompleted`, `WorkoutCompleted`,
`PersonalRecordAchieved`, `ProgramStarted`, `ProgramCompleted`) não têm um barramento de eventos
formal ainda — não existe um em nenhuma outra feature deste projeto para reaproveitar, então não
foi inventado um aqui. O contrato de dados (tipos + serviços) já é suficiente para um consumidor
futuro chamar os serviços diretamente.

## O que fica para o futuro

Não implementado nesta fase (mesma lista que o prompt original marcou como preparação, não
entrega): exercícios via API externa (`ExerciseProvider` — hoje só a interface implícita do
`exerciseService`), Apple Health/Health Connect/Strava/Garmin/Fitbit, geração de treino por IA,
periodização automática, wake lock/PWA offline, importação/exportação, mapa muscular corporal
(SVG interativo), medidas corporais/fotos de progresso, treinador/programas compartilhados,
comunidade. Nenhum destes tem um ponto de extensão fingido — quando existirem, entram como um novo
serviço/adapter seguindo os mesmos padrões documentados acima.
