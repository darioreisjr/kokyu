# Módulo Ritmo Diário — Arquitetura e Documentação Técnica

## 1. Visão Geral

O **Ritmo Diário** (`/app/ritmo-diario`) é a central temporal e operacional do **Kokyu**. Ele unifica em uma única experiência contínua e coerente todas as atividades que possuem data, horário, duração, prioridade ou disponibilidade, evitando que o usuário precise abrir múltiplos módulos isoladamente para entender o fluxo do seu dia.

---

## 2. Princípios Fundamentais

1. **Central Temporal Única**: Nenhuma entidade de domínio (Treino, Hábito, Refeição, Lazer, Meta) é duplicada. As integrações operam via contratos compartilhados (`ScheduleEntry`) e adaptadores bidirecionais.
2. **Determinismo e Explicabilidade**: Nenhum reagendamento automático é opaco ou silencioso. O usuário visualiza propostas com justificativas claras (*"Encaixado às 10:00 por ser o melhor horário de alta energia e respeitar o buffer de 15min"*) e confirma antes de aplicar.
3. **Respeito aos Compromissos Fixos**: Itens marcados como `locked` ou bloqueios externos de calendário nunca são sobrepostos ou movidos automaticamente.
4. **Precisão Temporal e Sobrevivência a Recarregamento**: Timers (como o Modo de Foco) baseiam-se em timestamps absolutos (`startedAt`, `accumulatedPausedSeconds`), eliminando qualquer desvio por `setInterval` e persistindo após refresh.
5. **Acessibilidade e Design System**: Compatibilidade estrita com WCAG 2.2 AA, navegação por teclado (atalhos `N`, `T`, `F`, `P`), suporte a `prefers-reduced-motion` e tokens visuais Kokyu.

---

## 3. Estrutura de Rotas

- `/app/ritmo-diario`: **Hoje** (Linha do tempo diária com indicador ao vivo, blocos livres, painel de itens para encaixar e indicador de capacidade).
- `/app/ritmo-diario/semana`: **Semana** (Visão de 7 dias com distribuição de carga e planejamento semanal).
- `/app/ritmo-diario/calendario`: **Calendário** (Visão mensal e seleção de dias).
- `/app/ritmo-diario/inbox`: **Caixa de Entrada** (Captura rápida e triagem para converter em Missão, Hábito, Lazer ou Agendamento).
- `/app/ritmo-diario/rotinas`: **Rotinas e Modelos de Dia** (Modelos pré-configurados como *Dia de Escritório*, *Home Office*, *Fim de Semana*).
- `/app/ritmo-diario/foco`: **Modo de Foco** (Timer imersivo com anotação de interrupções, extensões rápidas e fechamento).
- `/app/ritmo-diario/revisao`: **Revisão Diária** (Fechamento guiado do dia, resolução de pendências e métricas de uso do tempo).

---

## 4. Adaptadores de Origem (`src/features/daily-rhythm/adapters/`)

| Origem | Adaptador | Ações Suportadas |
| :--- | :--- | :--- |
| **Treinamento** | `trainingScheduleAdapter` | Sincroniza treinos agendados; reagendamento atualiza `trainingScheduleService`. |
| **Hábitos** | `habitScheduleAdapter` | Calcula ocorrências do dia; conclusão registra log em `habitService`. |
| **Nutrição** | `nutritionScheduleAdapter` | Converte refeições planejadas; mover atualiza `mealPlanService`. |
| **Tempo Livre** | `leisureScheduleAdapter` | Mapeia planos de lazer; conclusão atualiza `leisurePlanService`. |
| **Missões** | `missionScheduleAdapter` | Permite chunking de tarefas longas e priorização determinística. |
| **Metas** | `goalScheduleAdapter` | Encaixa check-ins e revisões de marcos no dia. |
| **Calendário** | `externalCalendarAdapter` | Trata eventos externos ocupados como fixos (`locked: true`). |

---

## 5. Motores Determinísticos (`src/shared/scheduling/engines/`)

1. **`scheduleConflictEngine`**: Identifica colisões de horários, conflitos com itens fixos e desrespeito à janela acordada do usuário.
2. **`freeTimeEngine`**: Detecta com precisão todos os intervalos vazios entre atividades e calcula durações utilizáveis.
3. **`dailyCapacityEngine`**: Compara o total de horas acordadas no dia contra a soma de compromissos fixos e atividades flexíveis, atribuindo status (*Leve*, *Equilibrado*, *Cheio*, *Acima da capacidade*).
4. **`schedulingStrategies`**: Avalia pontuações determinísticas para candidatos baseando-se em preferência de horário, urgência/prioridade, necessidade de energia e regras de chunking.
5. **`dailyScheduleEngine`**: Orquestra o auto-agendamento determinístico em 8 passos gerando um `PlanPreview` explicável antes da confirmação.
6. **`replanEngine`**: Reorganiza o restante do dia a partir do horário atual quando ocorrem imprevistos ou atrasos.

---

## 6. Atalhos de Teclado

- `N`: Nova entrada rápida na agenda.
- `T`: Ir para o dia de hoje.
- `F`: Abrir Modo de Foco.
- `P`: Abrir assistente "Planejar meu dia".

