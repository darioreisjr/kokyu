# Metas — `features/goals`

Este documento explica o modelo de domínio do módulo Metas (`/app/metas`), por que ele foi
desenhado assim, e como estender cada peça (um tipo novo, um adapter novo, uma fonte automática
nova) sem tocar no resto. Para as regras gerais de arquitetura (dependência entre `app`/`features`/
`design-system`, Server vs. Client Components, estratégia de testes), ver
[`architecture.md`](./architecture.md).

## Objetivo do módulo

Metas responde **"onde eu quero chegar"**, não **"o que preciso fazer"** (Missões) nem **"o que
preciso repetir"** (Hábitos). O princípio central: sempre que o progresso puder vir automaticamente
de outro módulo Kokyu, a Meta não pede atualização manual — ela lê.

## Modelo de domínio (`types/`)

- **`Goal`** — a entidade principal. Além dos campos óbvios (`title`, `area`, `priority`,
  `startDate`/`targetDate`, `tags`, `motivation`, `successCriteria`), tem três campos que fazem o
  motor de progresso/status funcionar sem lógica espalhada pela UI:
  - `measurement: GoalMeasurement` — union discriminada por `type`, só com os campos relevantes
    para aquele tipo (ver "Tipos de meta" abaixo).
  - `progressMode: 'manual' | 'automatic'` + `source?: { module, metricId }` — quando automático,
    `measurement.currentValue` nunca é a fonte de verdade; o adapter é.
  - `status` / `systemStatus` / `lastCheckInStatus` — três conceitos separados, ver "Status" abaixo.
- **`GoalMilestone`** / **`GoalKeyResult`** — vivem dentro de `Goal.milestones`/`Goal.keyResults`,
  não em tabelas próprias. Um marco representa um resultado importante, não uma tarefa — se precisar
  de ações, isso vira uma Missão vinculada via `GoalLink` (ver "Links e contribuições").
- **`GoalProgressEntry`**, **`GoalCheckIn`**, **`GoalActivity`**, **`GoalLink`**, **`GoalReflection`**,
  **`GoalNote`**, **`GoalTemplate`** — cada um é uma tabela própria no mock DB, nunca sobrescrita
  silenciosamente (toda atualização de progresso gera uma nova `GoalProgressEntry`; toda mudança
  relevante gera uma `GoalActivity`).

## Tipos de meta (`GoalType`) e as 6 estratégias

A spec original lista 9 "tipos de meta" em linguagem de produto (valor, redução, binária, por
etapas, consistência, média, acumulativa, percentual, baseada em conclusão). No domínio, isso vira
**6 valores de `GoalType`**, um por estratégia real de cálculo — várias das nove formas de produto
colapsam na mesma estratégia, só variando parâmetros:

| `GoalType`    | Cobre (linguagem de produto)                                      | Estratégia                    |
| ------------- | ----------------------------------------------------------------- | ----------------------------- |
| `numeric`     | valor, redução (`direction: 'decrease'`), acumulativa, percentual | `numericProgressStrategy`     |
| `binary`      | binária                                                           | `binaryProgressStrategy`      |
| `milestone`   | por etapas, baseada em conclusão                                  | `milestoneProgressStrategy`   |
| `consistency` | consistência                                                      | `consistencyProgressStrategy` |
| `average`     | média                                                             | `averageProgressStrategy`     |
| `keyResult`   | resultados-chave (opcional, metas maiores)                        | `keyResultProgressStrategy`   |

Na Etapa 3 da criação (`MeasurementTypeStep`), o usuário vê 6 cards (Número, Conclusão, Etapas,
Consistência, Média, Porcentagem) mais "Resultados" — "Número" e "Porcentagem" resultam ambos em
`type: 'numeric'` (`goalTypeOptions.ts`'s `presetUnit` só ajusta a unidade padrão). "Resultados" usa
linguagem simples em vez de "OKR", por pedido explícito da spec.

### Fórmulas

- **Numérico/consistência** (`services/progressStrategies/numericProgressStrategy.ts` e
  `consistencyProgressStrategy.ts`): `percent = (current - baseline) / (target - baseline) * 100`
  para `direction: 'increase'`, invertido (`baseline - current` / `baseline - target`) para
  `decrease`. `allowOverachievement` mantém o valor real acima de 100% em `rawPercent` mesmo com
  `percent` (o que a barra desenha) sempre travado em 0–100.
- **Binário**: 0% ou 100%, sem meio-termo.
- **Marcos**: peso igual por marco quando nenhum tem `weight`; se **todos** tiverem, usa os pesos
  informados (nunca uma mistura — um marco sem peso no meio de outros com peso cai para igual, por
  simplicidade e previsibilidade).
- **Resultados-chave**: mesma regra de peso dos marcos, mas a média é ponderada pelo percentual de
  cada resultado (não pela contagem de concluídos).
- **Média**: `measurement.currentValue` é a média já calculada — nunca recalculada dentro do
  componente. Quem mantém isso atualizado é `goalService.addProgress`, que recalcula a média móvel
  sobre `periodDays` toda vez que uma nova `GoalProgressEntry` chega
  (`recalculateAverageMeasurement`, em `goalService.ts`).

Quando `progressMode === 'automatic'`, nenhuma dessas estratégias roda — `GoalProgressEngine`
delega ao adapter da fonte e compara o valor retornado contra `measurement`'s `targetValue` (ver
abaixo). Uma meta nunca mistura os dois.

## `GoalProgressEngine` (`services/goalProgressEngine.ts`)

Único ponto de entrada para "qual é o progresso desta meta agora" — componentes chamam
`useGoalProgress`/`useGoalsProgressMap` (nunca uma strategy ou um adapter diretamente).

```
progressMode === 'automatic' && source
  → adapter.calculateProgress(goal, metricId) → compara contra measurement.targetValue
progressMode === 'manual' (ou sem source)
  → getGoalProgressStrategy(goal.type).calculate(goal)
```

## Fontes automáticas e adapters (`services/adapters/`)

Cada adapter implementa `GoalProgressSource` (`types/goalProgressSource.types.ts`):
`{ module, metrics: GoalSourceMetric[], calculateProgress(goal, metricId) }`. `services/adapters/
index.ts` é o único registro — a Etapa 6 da criação (`TrackingStep`) e o `GoalProgressEngine` leem
dali, nunca hardcodam um módulo.

**Integração real vs. preparada** — decisão de escopo documentada aqui porque não é óbvia lendo só
o código:

- **`leisureGoalAdapter`, `nutritionGoalAdapter` e `missionGoalAdapter`** — `features/leisure`,
  `features/nutrition` e `features/missions` já existem como features completas. Como `goals` não
  pode importar serviços de outra feature (regra de dependência do projeto — `home` e
  `daily-rhythm` são as únicas exceções documentadas, por serem features de síntese), esses
  adapters leem um snapshot local (`mocks/leisureSourceData.mock.ts`,
  `mocks/nutritionSourceData.mock.ts`, `mocks/missionsSourceData.mock.ts`) com a mesma forma que os
  dados reais têm hoje — é a integração mais próxima do real possível sem violar a fronteira de
  arquitetura. Compare com `features/home/providers/missionHomeProvider.ts`, que lê
  `missionService` de verdade porque `home` tem essa permissão (`docs/respiration-home.md`).
- **`trainingGoalAdapter` e `habitGoalAdapter`** — `features/training` **ainda não existe**
  (`/app/treinamento` é só um stub com um `<Typography>`); `habitGoalAdapter` também segue o padrão
  de snapshot mesmo `features/habits` já existindo, pela mesma regra de dependência acima. Ambos
  cumprem o contrato e já aparecem na Etapa 6 da criação, rodando sobre snapshots autocontidos
  (`mocks/trainingSourceData.mock.ts`, `mocks/habitsSourceData.mock.ts`) — no dia em que
  `features/training` existir, só a implementação interna daquele adapter muda (trocar o snapshot
  por uma chamada real via um provider de síntese, já que `goals` propriamente dito continua sem
  poder importar `features/training` diretamente).

Adicionar uma fonte nova: criar `mocks/xSourceData.mock.ts`, um adapter em `services/adapters/`
implementando `GoalProgressSource`, e registrá-lo em `services/adapters/index.ts`.

## Status (`services/goalStatusEngine.ts`, `goalStatusThresholds.ts`)

Três campos, três papéis:

- **`systemStatus`** — sempre recalculado (nunca confiar em um valor "guardado" antigo);
  `goalService.getGoals()`/`getGoal()` recalculam e reescrevem no mock DB a cada leitura
  (`hydrateGoalStatus`). Só é pulado para metas em estado de ciclo de vida (`paused`, `completed`,
  `abandoned`, `archived`) — essas nunca são "recalculadas de volta" para um estado de saúde.
- **`status`** — o que a UI mostra. Espelha `systemStatus` enquanto a meta está ativa; vira o
  estado de ciclo de vida assim que uma ação explícita (pausar/concluir/abandonar/arquivar) muda.
- **`lastCheckInStatus`** — o que o usuário percebeu no último check-in. Nunca sobrescreve
  `systemStatus`; quando os dois divergem, `GoalDetailPage` mostra ambos lado a lado (ver spec:
  "não sobrescrever silenciosamente opinião do usuário").

`calculateExpectedProgress(goal, now)` — ritmo esperado. Linear por padrão
(`(hoje - início) / (prazo - início)`); para metas do tipo `milestone` com marcos que têm
`targetDate`, usa a proporção (ponderada por peso) de marcos cujo prazo já passou, em vez de uma
fração linear de tempo — um projeto raramente progride de forma linear. Sem `targetDate`, retorna
`null` (não dá para avaliar ritmo sem prazo).

`calculateGoalStatus(percent, expectedPercent, hasStarted)` compara os dois usando limites
centralizados em `goalStatusThresholds.ts` (`attentionGapPoints: 10`, `atRiskGapPoints: 20`) — nunca
um número mágico espalhado por componente ou teste.

## Marcos, resultados-chave e pesos

Ver `GoalMilestonesList`/`GoalKeyResultsList` para a UI. Ambos suportam peso opcional
(`weight`, 0–100); sem peso em nenhum item, o cálculo divide igualmente. `goalService` expõe
`addMilestone`/`completeMilestone`/`reorderMilestones` e `addKeyResult`/`updateKeyResult`.

## Check-ins (`GoalCheckIn`)

Um check-in é uma reflexão, não uma atualização numérica — `perceivedStatus` é o único campo
obrigatório; confiança (1–5), "o que avançou", "o que está bloqueando" e "próximo passo" são
opcionais (`GoalCheckInDialog` começa recolhido, só no status, e expande via "Adicionar
comentário"). `goalService.getPendingCheckIns()` usa `Goal.checkInFrequency` (`weekly`/`biweekly`/
`monthly`/`custom` — `custom` usa 30 dias como aproximação razoável, já que não há um campo de
intervalo customizado nesta fase) comparado a `lastCheckInAt ?? createdAt`, ordenado do mais
atrasado para o mais recente.

## Links e contribuições

`GoalLink` relaciona uma meta a uma entidade de outro módulo (`entityType` +
`entityId` + `entityLabel` já resolvido, para nunca precisar importar aquele módulo só para exibir
um nome). `goalContributionsService.getGoalContributions(goal)` é **deliberadamente separado** do
`GoalProgressEngine` — um módulo pode contribuir (aparecer em "O que está contribuindo") sem ser a
fonte oficial do percentual da meta.

## Planejamento e horizonte (`utils/goalHorizon.ts`)

`getGoalHorizon(goal, now)` deriva Agora/Este mês/Este trimestre/Este ano/Longo prazo/Sem prazo a
partir de `targetDate` — nunca um campo que o usuário escolhe manualmente. `GoalTimelineRow` desenha
a timeline simplificada do desktop (marcador de hoje + pontos de marco), sem tentar ser um Gantt.

## Filtros, busca e ordenação (`utils/goalFilters.ts`)

Puro e síncrono — busca (insensível a acento), área, status, prioridade, tipo, fonte, tag e os
filtros rápidos (Foco/No ritmo/Atenção/Em risco/Sem atualização/Prazo próximo) não dependem do
`GoalProgressEngine` assíncrono. Ordenar por progresso (`sortGoals(..., 'progress', percentMap)`)
recebe o mapa de percentuais já resolvido pelo chamador — nunca recalcula dentro da função de
ordenação.

## Design tokens

Sem tokens novos: os 8 estados de `GoalStatus` reaproveitam `feedback.{success,warning,error}` +
`surface.secondary`/`text.{primary,inverse}` (mesmo padrão do `StatusChip` de `features/leisure`) —
ver `GoalStatusChip`. Progresso usa `LinearProgress` (listas/cards) e `CircularProgress` duplo
(anel do cabeçalho de `/app/metas/[id]`) — nunca só o círculo, sempre com o texto "X de Y, Z%" ao
lado (`utils/goalFormatting.ts#formatGoalProgressAccessibleLabel`,
`utils/goalProgressCaption.ts#getGoalProgressCaption` para a frase certa por tipo — um marco não é
"8 de 20 livros", é "2 de 4 marcos concluídos").

## O que fica para o futuro

Não implementado nesta fase (só tipos/comentários de preparação onde fazia sentido): IA (sugerir
marcos, detectar meta vaga, resumir check-ins), previsão de conclusão, integração financeira/
distância/peso/volume (a spec lista `GoalUnit` como preparado para crescer, mas sem lançar uma
integração financeira ainda), metas compartilhadas/accountability, importação CSV/JSON,
dependências entre metas, gamificação (streaks, badges — a única celebração hoje é a animação
discreta de `GoalCompletionDialog`, via `motion`, respeitando `prefers-reduced-motion`).

`getGoalContributions`/um futuro `getFocusGoalsSummary` são os pontos de extensão previstos para a
página Respiração ("Metas em foco") e para a exportação geral do Kokyu — nenhum dos dois foi
conectado a `features/settings` ou à página Respiração nesta fase (cross-feature, fora de escopo),
mas a função existe e pode ser chamada de fora assim que esse consumidor existir.
