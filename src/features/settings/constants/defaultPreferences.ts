import { navigationItems } from '@/features/navigation/config/navigationItems';
import { HOME_SECTION_IDS } from '@/shared/home/types';

import type { UserPreferences } from '../types/preferences.types';

/** IDs matching `NOTIFICATION_CATEGORIES` in `constants/notificationCategories.ts` — every category starts enabled while the master toggle is on. */
const defaultNotificationCategories: Record<string, boolean> = {
  'missions.deadlines': true,
  'missions.overdue': true,
  'missions.completed': true,
  'dailyRhythm.upcoming': true,
  'dailyRhythm.morningSummary': true,
  'dailyRhythm.eveningReview': true,
  'training.reminders': true,
  'training.missedPlanned': true,
  'nutrition.mealTimes': true,
  'nutrition.waterReminders': true,
  'habits.reminders': true,
  'habits.streakAtRisk': true,
  'habits.goalCompleted': true,
  'goals.progress': true,
  'goals.completed': true,
  'freeTime.plannedItems': true,
};

/**
 * The one place every default lives — components, hooks, services and
 * tests all import this instead of redeclaring their own fallback
 * values (which is how defaults quietly drift apart).
 */
export const defaultPreferences: UserPreferences = {
  general: {
    homePage: navigationItems[0]!.href,
    resumeLastPage: false,
    confirmImportantActions: true,
    lastVisitedPage: null,
  },
  appearance: {
    theme: 'system',
    accent: 'hinokami',
    contrast: 'normal',
    density: 'comfortable',
    textSize: 'default',
  },
  navigation: {
    sidebarMode: 'expanded',
    rememberSidebarState: true,
    transitions: true,
  },
  locale: {
    language: 'pt-BR',
    region: 'BR',
    dateFormat: 'DD/MM/AAAA',
    timeFormat: '24h',
    weekStartsOn: 1,
    timezoneMode: 'auto',
    timezone: 'America/Sao_Paulo',
  },
  routine: {
    dayStartsAt: '06:00',
    dayEndsAt: '23:00',
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    weekendDays: [0, 6],
    morningSummary: false,
    morningSummaryTime: '07:00',
    eveningReview: false,
    eveningReviewTime: '21:00',
    focusMode: false,
  },
  notifications: {
    enabled: true,
    inApp: true,
    push: false,
    email: false,
    categories: defaultNotificationCategories,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  },
  sound: {
    interfaceSounds: false,
    completionSound: false,
  },
  accessibility: {
    reducedMotion: 'system',
    colorAssist: 'default',
    underlineLinks: false,
    enhancedFocus: false,
  },
  privacy: {
    usageAnalytics: false,
    personalizedSuggestions: false,
  },
  home: {
    sectionOrder: [...HOME_SECTION_IDS],
    hiddenSections: [],
    compactMode: false,
    showGreeting: true,
    showCapacity: true,
    showInsights: true,
  },
};
