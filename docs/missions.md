# Missões — `features/missions`

Este documento explica o modelo de domínio do módulo Missões (`/app/missoes`), por que ele foi
desenhado assim, e como estender cada peça sem tocar no resto. Para as regras gerais de
arquitetura (dependência entre `app`/`features`/`design-system`, Server vs. Client Components,
estratégia de testes), ver [`architecture.md`](./architecture.md).

## Objetivo do módulo

Missões responde **"o que precisa ser executado"**. Não é uma lista de tarefas simples: o módulo
cobre captura, organização, planejamento, priorização, execução, acompanhamento, reagendamento,
revisão, relacionamento, conclusão e arquivamento — o ciclo completo de uma ação, do momento em que
ela é lembrada até o momento em que deixa de importar.

## Mission vs. Goal vs. Habit vs. ScheduleEntry

Estes quatro conceitos são fáceis de confundir porque todos "aparecem no seu dia", mas respondem
perguntas diferentes:

| Conceito | Pergunta que responde | Exemplo |
| --- | --- | --- |
| `Goal` (Metas) | Onde eu quero chegar (destino) | "Lançar meu aplicativo" |
| `Mission` (Missões) | O que precisa ser feito (ação) | "Finalizar autenticação" |
| `Habit` (Hábitos) | O que precisa se repetir (comportamento contínuo) | "Ler todos os dias" |
| `ScheduleEntry` (compartilhado) | Quando isso acontece no dia | Bloco de 14h-15h para "Finalizar autenticação" |

Uma Mission nunca duplica os outros três:

- **Mission ≠ Goal**: uma Goal pode ser alcançada por várias Missions (`Mission.goalIds`), mas a
  Mission em si é a ação, não o resultado. "Publicar meu aplicativo" é uma Goal; "Configurar
  domínio" é uma Mission que contribui para ela.
- **Mission ≠ Habit**: nem toda ação recorrente vira Habit automaticamente. "Ler capítulo 5 hoje"
  ou "Finalizar livro até sexta" são Missions (têm fim); "Ler todos os dias" é um Habit
  (comportamento contínuo, sem fim natural). Ver "Recorrência" abaixo para o meio-termo (uma Mission
  que se repete mas continua tendo entregas discretas).
- **Mission ≠ ScheduleEntry**: Missões define **o quê**; Ritmo Diário (`shared/scheduling`) define
  **quando**. Quando uma Mission tem horário, ela se relaciona com o `ScheduleEntry` compartilhado
  — nunca existe um calendário paralelo dentro de `features/missions`. Ver "Scheduling" abaixo.

## Project vs. Goal

`MissionProject` é um conjunto organizado de Missions relacionadas a um resultado — não confundir
com `Goal` (destino/métrica). Um projeto pode contribuir para uma Goal (`MissionProject.goalIds`,
mesmo padrão de relacionamento que `GoalLink` já usa em outros módulos), mas o projeto em si é
puramente organizacional: seções, progresso agregado, próxima ação. Ele nunca duplica o que uma
Goal já representa.

## Datas: `availableFrom` vs. `plannedDate` vs. `deadline`

A regra mais importante do domínio: **nunca existe um único `dueDate`** cobrindo planejamento e
prazo ao mesmo tempo. Três campos independentes, cada um com um papel:

- **`availableFrom`** — quando a Mission passa a ficar relevante/visível. Antes disso, ela fica
  fora de Hoje/Próximas imediatas (evita poluição visual, spec "AVAILABLE FROM").
- **`plannedDate`** — a intenção do usuário: quando ele pretende executar. Pode mudar livremente
  (cada mudança incrementa `Mission.replanCount`, nunca julgado como "procrastinação" na UI — só
  contabilizado, spec "NÃO JULGAR").
- **`deadline`** — o limite real. Só um `deadline` no passado, em uma Mission não-terminal, deriva
  `overdue` (ver abaixo).

Exemplo do spec: Mission "Enviar relatório" com `availableFrom` segunda, `plannedDate` quarta,
`deadline` sexta — mover o plano para quinta não muda o prazo de sexta.

### Status derivados (nunca persistidos)

`overdue` não é um `MissionStatus` — é sempre derivado (`utils/missionDateStatus.ts`):
`deadline < hoje` **e** a Mission não está `completed`/`cancelled`/`archived`. Um `plannedDate` no
passado não vira `overdue`; ele só marca `needsReview` (spec "PLANNED PAST"), exposto durante a
Revisão, nunca promovido automaticamente. `computeMissionDerivedFlags` compõe todos os flags
(`overdue`, `dueToday`, `availableToday`, `scheduledToday`, `followUpDue`, `blocked`, `waiting`,
`needsReview`) a partir da Mission + contexto (hoje, se está bloqueada, se está agendada hoje) —
nunca calculados ad hoc em componente.

## Inbox vs. Backlog

Fácil de confundir porque os dois "não têm compromisso hoje":

- **Inbox** (`status: 'inbox'`) — coisas **ainda não processadas**. Captura rápida
  (`MissionQuickCapture`) sempre cai aqui quando não há organização explícita (sem projeto, prazo
  ou prioridade). Processar um item da Inbox (`missionService.processInboxMission`) sempre resolve
  para outro lugar — nunca fica "meio processado".
- **Backlog** — coisas **já organizadas**, mas sem `plannedDate` ainda (`status: 'ready'` e
  `plannedDate` vazio). `missionService.getBacklog()` é só esse filtro.

## Waiting e Follow-up

`status: 'waiting'` marca uma Mission que depende de terceiro (resposta, aprovação, entrega
externa). `Mission.waitingFor` é o texto livre explicando o quê; `Mission.followUpAt` é quando
checar de novo. O `followUpEngine` (embutido em `missionService.getTodayMissions`/`shouldAppearInToday`)
nunca muda o status sozinho quando a data chega — só expõe a Mission em Hoje/Aguardando/Revisão
(spec "Não mudar status automaticamente").

## Dependencies

`MissionDependency` é uma aresta direcionada única: `blockerMissionId` → `blockedMissionId`. Não
existem duas linhas ("blocks" e "blockedBy") para a mesma relação — `missionDependencyEngine`
deriva as duas visões (`getBlockerIds`/`getBlockedIds`) a partir dessa única tabela.

- **Ciclos são proibidos**: `wouldCreateCycle` faz uma busca (BFS) no grafo de "blocks" antes de
  qualquer inserção; `validateNewDependency` recusa auto-referência, duplicata e ciclo.
- **Bloqueio nunca esconde a Mission**: `isMissionBlocked` só alimenta um badge ("Bloqueada por 2
  missões") — a Mission continua totalmente acessível e editável.
- **Concluir o bloqueador não conclui o dependente**: `getMissionsUnblockedBy` só identifica quem
  ficou livre, para uma notificação futura (`missionUnblocked`) — nunca aplica a conclusão em
  cascata.

## Recorrência

`MissionRecurrenceRule` (`daily`/`weekdays`/`weekly`/`monthly`/`yearly`/`specificWeekdays`/
`customInterval`) descreve o padrão; `basis` decide se a próxima ocorrência conta a partir da data
planejada (`scheduledDate`) ou da data real de conclusão (`completionDate` — "30 dias após
concluir"). `missionRecurrenceEngine.generateNextOccurrence` nunca sobrescreve a ocorrência
concluída: ele retorna o **input** de uma Mission nova, com `recurrenceSeriesId` preservado (grupo
da série) e o mesmo intervalo `plannedDate`→`deadline` da ocorrência anterior. Cada ocorrência tem
seu próprio histórico (`MissionActivity`) — nada é reescrito.

Edição por escopo (`thisOccurrence`/`thisAndFuture`/`entireSeries`, spec "EXCEPTION FUTURA") está
preparada no tipo `MissionRecurrenceEditScope` mas não tem UI ainda — hoje toda edição afeta só a
ocorrência aberta.

## Submissões vs. Checklist

Ambos quebram uma Mission em partes, mas com identidades diferentes:

- **Submissão** — uma Mission filha de verdade (`Mission.parentMissionId`), com prazo, prioridade,
  `ScheduleEntry` e status próprios. Profundidade limitada a um nível (Mission → Submissão) para
  evitar recursão arbitrária.
- **Checklist** (`MissionChecklistItem`) — um passo simples: `text`, `completed`, `order`. Não tem
  prazo, prioridade ou agendamento próprios.

`Mission.progressMode` (`binary`/`submissions`/`checklist`) decide qual delas (se alguma) alimenta
o percentual de conclusão — sempre derivado (`missionProgressService`), nunca um campo redundante
gravado na Mission.

## Priority vs. Importance vs. Eisenhower

`MissionPriority` (urgência temporal: `none`/`low`/`medium`/`high`/`critical`) e
`MissionImportance` (`low`/`high`, opcional) são eixos independentes de propósito — juntos permitem
os quatro quadrantes de Eisenhower sem forçar toda Mission a ter os dois preenchidos
(`MissionEisenhower` classifica só quem já foi categorizado; o resto continua funcionando
normalmente em todas as outras views).

## Focus e FocusSession

"Focar agora" abre uma `FocusSession` do sistema compartilhado (`shared/scheduling`) com
`sourceType: 'mission'`/`sourceId: <missionId>` — não existe um segundo timer dentro de Missões.
`Mission.actualDurationMinutes` é um cache somado a partir das `FocusSession`s relacionadas,
recalculado pelo `missionService`; `estimatedDuration` nunca é sobrescrito por ele (spec "NÃO
SOBRESCREVER").

## Scheduling

`Mission.plannedDate` é a intenção; ela só vira um `ScheduleEntry` de verdade (com horário) quando
`Mission.scheduledStartAt` também está definido. Isso é o que separa "Missão sem horário" (aparece
em "Para encaixar") de "Missão com horário" (tem um bloco no dia). `daily-rhythm`'s
`missionScheduleAdapter` (`features/daily-rhythm/adapters/missionScheduleAdapter.ts`) traduz isso
para o contrato `ScheduleSourceAdapter` compartilhado — reagendar (`onEntryRescheduled`) chama
`missionService.scheduleMission`, que **nunca** toca `deadline`; remover o horário
(`onEntryDeleted`) chama `missionService.unscheduleMission`, que **nunca** apaga a Mission, só
limpa `plannedDate`/`scheduledStartAt`. `missionCandidateProvider` (em
`features/daily-rhythm/adapters/candidateProviders.ts`) implementa `ScheduleCandidateProvider` para
"Preencher este tempo": uma Mission de 90 min não divisível nunca é sugerida para um slot de 30 min;
uma Mission divisível (`splittable`) pode ser.

## Saved Views, filtros, ordenação e agrupamento

`SavedMissionView` guarda `filters`/`sorting`/`grouping`/`layout` — tudo aplicado sempre pelo mesmo
motor (`services/engines/missionFilterEngine.ts`: `applyMissionFilters`/`sortMissions`/
`groupMissions`), nunca recalculado por componente (spec: evitar "filtros calculados de forma
inconsistente"). As Smart Views nativas (Hoje, Atrasadas, Sem data, Aguardando, Bloqueadas, Em
foco, Concluídas recentemente) são predefinições desse mesmo motor, não linhas editáveis de
`SavedMissionView`.

## Adapters (integração entre módulos)

Cada integração vive atrás de um contrato plano, nunca importado diretamente pela UI de outro
módulo:

| Adapter | Onde mora | Contrato | Papel |
| --- | --- | --- | --- |
| `missionScheduleAdapter` | `features/daily-rhythm/adapters/` | `ScheduleSourceAdapter` (shared) | Traduz Mission ↔ `ScheduleEntry` |
| `missionCandidateProvider` | `features/daily-rhythm/adapters/` | `ScheduleCandidateProvider` (shared) | Sugere Missions para preencher um slot livre |
| `missionHomeProvider` | `features/home/providers/` | `HomeSectionProvider<MissionHomeProjection>` (shared) | Resumo de Missões para a Respiração |
| `missionGoalAdapter` | `features/goals/services/adapters/` | `GoalProgressSource` (goals) | Progresso automático de Goals a partir de Missions concluídas |
| `missionHabitAdapter` | `features/habits/services/adapters/` | `HabitSourceAdapter` (habits) | Eventos de Missões disponíveis como fonte automática de Hábito |

`daily-rhythm` e `home` são as duas features com permissão documentada de importar o serviço real
de outra feature — seu papel é sintetizar/agregar, não duplicar lógica (ver
[`respiration-home.md`](./respiration-home.md)). Por isso `missionScheduleAdapter`/
`missionCandidateProvider`/`missionHomeProvider` chamam `missionService` de verdade.
`missionGoalAdapter` mora dentro de `features/goals`, que **não** tem essa permissão — ele continua
lendo um snapshot local (`goals/mocks/missionsSourceData.mock.ts`) na mesma forma que os dados reais
têm hoje, exatamente como `leisureGoalAdapter`/`nutritionGoalAdapter` já fazem para features que
também já existem (ver [`goals.md`](./goals.md#integração-real-vs-preparada)). `missionHabitAdapter`
segue a mesma regra do lado de `habits`.

`MissionLink` (`types/missionLink.types.ts`) é o relacionamento genérico para os casos de "ação
auxiliar" do spec — comprar ingresso (Tempo Livre), comprar potes (Nutrição) — sem nunca puxar a
atividade recreativa ou a lista de compras para dentro de Missões.

## Domain Events (preparados)

`MissionActivityType` já cobre o vocabulário de eventos de domínio (`created`, `updated`,
`planned`, `scheduled`, `rescheduled`, `started`, `completed`, `reopened`, `waiting`, `blocked`,
`unblocked`, `priorityChanged`, `deadlineChanged`, `projectChanged`, `cancelled`, `archived`) e é
gravado como `MissionActivity` (append-only) a cada mutação relevante em `missionService`. Uma
automação futura ("ao concluir, notificar dependentes") consumiria esse mesmo log — não precisa de
um sistema de eventos novo.

## Integrações externas futuras (preparadas, não implementadas)

`MissionExternalRef` (`provider`/`externalId`/`sourceUrl`/`syncMode`) e `MissionImportProvider`
(`todoist`/`csv`/`json`/`microsoftToDo`/`github`/`email`/`slack`) existem como tipos para que um
importador futuro tenha onde gravar identidade externa de forma idempotente (mesmo par
provider+externalId nunca cria duplicata) — nenhum importador real está implementado.
`MissionAssistantProvider`/`MissionAssistantProposal` (`types/adapters.types.ts`) preparam o
contrato de uma IA futura: toda sugestão é uma *proposta*, nunca aplicada sem confirmação do
usuário.

## Testes

Domínio primeiro: `utils/missionDateStatus.test.ts` (datas independentes, overdue, planned-past),
`services/engines/missionDependencyEngine.test.ts` (bloqueio, ciclos), `missionRecurrenceEngine.test.ts`
(próxima ocorrência, histórico preservado), `missionProgressService.test.ts`/
`missionProjectProgressService.test.ts` (progresso derivado), `missionSuggestionService.test.ts`
(nunca adiciona automaticamente), `missionAnalyticsService.test.ts` (sem score agregado, threshold
de amostra), `missionFilterEngine.test.ts` (contexto/duração/busca), e testes de serviço
(`missionService.test.ts`, `missionProjectService.test.ts`) cobrindo o ciclo completo via o mock DB.
