export interface NotificationCategory {
  id: string;
  label: string;
}

export interface NotificationCategoryGroup {
  group: string;
  categories: NotificationCategory[];
}

/**
 * Every notification toggle the Notifications section renders, grouped
 * by the app area it belongs to — mirrors `navigationItems` labels
 * (Missões, Ritmo Diário, ...) without importing it directly, since
 * these are about *content that doesn't exist yet* (missions, habits,
 * workouts, ...), not routes. `defaultPreferences.notifications.categories`
 * has one entry per `id` here.
 */
export const notificationCategoryGroups: NotificationCategoryGroup[] = [
  {
    group: 'Missões',
    categories: [
      { id: 'missions.deadlines', label: 'Prazos de missões' },
      { id: 'missions.overdue', label: 'Missões atrasadas' },
      { id: 'missions.completed', label: 'Missões concluídas' },
    ],
  },
  {
    group: 'Ritmo Diário',
    categories: [
      { id: 'dailyRhythm.upcoming', label: 'Compromissos próximos' },
      { id: 'dailyRhythm.morningSummary', label: 'Resumo da manhã' },
      { id: 'dailyRhythm.eveningReview', label: 'Revisão noturna' },
    ],
  },
  {
    group: 'Treinamento',
    categories: [
      { id: 'training.reminders', label: 'Lembretes de treino' },
      { id: 'training.missedPlanned', label: 'Treino planejado não realizado' },
    ],
  },
  {
    group: 'Nutrição',
    categories: [
      { id: 'nutrition.mealTimes', label: 'Horário de refeições' },
      { id: 'nutrition.waterReminders', label: 'Lembretes de água' },
    ],
  },
  {
    group: 'Hábitos',
    categories: [
      { id: 'habits.reminders', label: 'Lembretes de hábitos' },
      { id: 'habits.streakAtRisk', label: 'Sequência em risco' },
      { id: 'habits.goalCompleted', label: 'Meta de hábito concluída' },
    ],
  },
  {
    group: 'Metas',
    categories: [
      { id: 'goals.progress', label: 'Progresso das metas' },
      { id: 'goals.completed', label: 'Meta concluída' },
    ],
  },
  {
    group: 'Tempo Livre',
    categories: [{ id: 'freeTime.plannedItems', label: 'Lembretes de itens planejados' }],
  },
];
