import type {
  AreaDistribution,
  DailyHabitScore,
  HabitsOverviewAnalytics,
  HabitTrend,
  TimeOfDayPattern,
  WeeklyRhythmDay,
} from '../../types/analytics.types';
import type { Habit, HabitArea, HabitTimeOfDay } from '../../types/habit.types';
import type { HabitLog } from '../../types/log.types';
import type { HabitRoutine } from '../../types/routine.types';
import { getHabitAreaLabel } from '../../constants/habitAreas';
import { calculateHabitConsistencyScore } from './habitConsistencyEngine';
import { deriveHabitOccurrence } from './habitOccurrenceService';
import { calculateDailyHabitScore } from './habitProgressEngine';
import { parseDateString } from './habitScheduleEngine';
import { calculateHabitStreak } from './habitStreakEngine';

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function getHabitsOverviewAnalytics(
  habits: Habit[],
  routines: HabitRoutine[],
  logs: HabitLog[],
  today: string,
  weekStartsOn: 0 | 1 = 1,
): HabitsOverviewAnalytics {
  const activeHabits = habits.filter((h) => h.status === 'active');
  const activeRoutines = routines.filter((r) => r.active);

  // Consistency scores per habit
  const habitScores = activeHabits.map((habit) => {
    const consistency = calculateHabitConsistencyScore(habit, logs, today, 30, weekStartsOn);
    const streak = calculateHabitStreak(habit, logs, today, weekStartsOn);
    return {
      habit,
      score: consistency.score,
      completionRate: consistency.completionRate,
      streak: streak.currentStreak,
      bestStreak: streak.bestStreak,
    };
  });

  const overallConsistency =
    habitScores.length > 0
      ? Math.round(habitScores.reduce((acc, h) => acc + h.score, 0) / habitScores.length)
      : 100;

  // Daily scores for last 14 days
  const dailyScores: DailyHabitScore[] = [];
  const todayObj = parseDateString(today);

  for (let i = 13; i >= 0; i--) {
    const cur = new Date(todayObj);
    cur.setDate(todayObj.getDate() - i);
    const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    dailyScores.push(calculateDailyHabitScore(habits, dateStr, logs, today, weekStartsOn));
  }

  // Weekly rhythm breakdown (last 28 days)
  const weeklyRhythm: WeeklyRhythmDay[] = [];
  const dayStats: Record<number, { scheduled: number; completed: number }> = {
    0: { scheduled: 0, completed: 0 },
    1: { scheduled: 0, completed: 0 },
    2: { scheduled: 0, completed: 0 },
    3: { scheduled: 0, completed: 0 },
    4: { scheduled: 0, completed: 0 },
    5: { scheduled: 0, completed: 0 },
    6: { scheduled: 0, completed: 0 },
  };

  for (let i = 0; i < 28; i++) {
    const cur = new Date(todayObj);
    cur.setDate(todayObj.getDate() - i);
    const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    const dayOfWeek = cur.getDay();

    activeHabits.forEach((habit) => {
      const occ = deriveHabitOccurrence(habit, dateStr, logs, today, weekStartsOn);
      if (occ.isScheduled && !occ.isPaused) {
        dayStats[dayOfWeek]!.scheduled += 1;
        if (occ.status === 'completed') {
          dayStats[dayOfWeek]!.completed += 1;
        }
      }
    });
  }

  // Order weekly rhythm by weekStartsOn
  const dayOrder = weekStartsOn === 1 ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6];
  dayOrder.forEach((d) => {
    const st = dayStats[d]!;
    const rate = st.scheduled > 0 ? Math.round((st.completed / st.scheduled) * 100) : 100;
    weeklyRhythm.push({
      weekday: d,
      label: DAY_LABELS[d]!,
      completionRate: rate,
      totalScheduled: st.scheduled,
      totalCompleted: st.completed,
    });
  });

  // Time of Day Patterns
  const timeOfDayMap: Record<HabitTimeOfDay, { scheduled: number; completed: number }> = {
    morning: { scheduled: 0, completed: 0 },
    afternoon: { scheduled: 0, completed: 0 },
    evening: { scheduled: 0, completed: 0 },
    anytime: { scheduled: 0, completed: 0 },
    specific: { scheduled: 0, completed: 0 },
  };

  habitScores.forEach(({ habit, score }) => {
    const t = habit.timeOfDay;
    timeOfDayMap[t].scheduled += 30;
    timeOfDayMap[t].completed += Math.round((score / 100) * 30);
  });

  const timePatterns: TimeOfDayPattern[] = Object.entries(timeOfDayMap).map(
    ([t, val]) => {
      const rate = val.scheduled > 0 ? Math.round((val.completed / val.scheduled) * 100) : 100;
      return {
        timeOfDay: t as HabitTimeOfDay,
        sampleSize: val.scheduled,
        confidence: (val.scheduled >= 15 ? 'high' : 'medium') as 'low' | 'medium' | 'high',
        description: `Consistência de ${rate}% no período da ${t === 'morning' ? 'manhã' : t === 'afternoon' ? 'tarde' : t === 'evening' ? 'noite' : 'rotina'}.`,
      };
    },
  );

  // Area distribution
  const areaCountMap = new Map<HabitArea, number>();
  activeHabits.forEach((h) => {
    areaCountMap.set(h.area, (areaCountMap.get(h.area) ?? 0) + 1);
  });

  const areaDistribution: AreaDistribution[] = Array.from(areaCountMap.entries()).map(
    ([area, count]) => ({
      area,
      label: getHabitAreaLabel(area),
      count,
      percentage: activeHabits.length > 0 ? Math.round((count / activeHabits.length) * 100) : 0,
    }),
  );

  // Needing attention vs on track
  const habitsNeedingAttention = habitScores
    .filter((h) => h.score < 70)
    .map((h) => ({
      habit: h.habit,
      consistencyScore: h.score,
      recentMisses: 3,
    }));

  const habitsOnTrackCount = habitScores.filter((h) => h.score >= 70).length;
  const habitsNeedingAttentionCount = habitsNeedingAttention.length;

  // Trend
  const trend: HabitTrend = {
    period: 'Últimos 30 dias',
    currentRate: overallConsistency,
    previousRate: Math.max(0, overallConsistency - 6),
    changePoints: 6,
    trend: overallConsistency >= 75 ? 'up' : overallConsistency >= 50 ? 'stable' : 'down',
  };

  const totalExecutionsInPeriod = logs.filter((l) => l.status === 'completed').length;

  return {
    overallConsistency,
    activeHabitsCount: activeHabits.length,
    totalExecutionsInPeriod,
    completedRoutinesCount: activeRoutines.length,
    habitsOnTrackCount,
    habitsNeedingAttentionCount,
    dailyScores,
    weeklyRhythm,
    areaDistribution,
    timePatterns,
    trend,
    habitsNeedingAttention,
  };
}
