import { habitService } from '@/features/habits/services/habitService';
import { leisureItemService } from '@/features/leisure/services/leisureItemService';
import type { LeisureItem } from '@/features/leisure/types/leisureItem.types';
import { trainingDb } from '@/features/training/services/trainingMockDb';
import type { ScheduleCandidate, ScheduleCandidateProvider } from '@/shared/scheduling/types';
import { missionScheduleAdapter } from './missionScheduleAdapter';

export const leisureCandidateProvider: ScheduleCandidateProvider = {
  sourceType: 'leisure',
  label: 'Tempo Livre',
  async getCandidatesForSlot(availableMinutes: number): Promise<ScheduleCandidate[]> {
    const items = await leisureItemService.getLeisureItems();
    return items
      .filter((item: LeisureItem) => {
        const dur = item.estimatedDuration ?? item.minimumUsefulDuration ?? 30;
        return dur <= availableMinutes && item.status !== 'archived';
      })
      .map((item: LeisureItem) => {
        const dur = item.estimatedDuration ?? item.minimumUsefulDuration ?? 30;
        return {
          id: `candidate-leisure-${item.id}`,
          sourceType: 'leisure',
          sourceId: item.id,
          title: item.title,
          subtitle: item.type,
          durationMinutes: dur,
          estimatedMinutes: dur,
          category: item.type,
          priority: item.priority ?? 'medium',
          icon: 'MovieRounded',
        };
      });
  },
};

export const trainingCandidateProvider: ScheduleCandidateProvider = {
  sourceType: 'training',
  label: 'Treinamento',
  async getCandidatesForSlot(availableMinutes: number): Promise<ScheduleCandidate[]> {
    const routines = trainingDb.routines;
    return routines
      .filter((r) => (r.estimatedDurationMinutes ?? 45) <= availableMinutes)
      .map((r) => ({
        id: `candidate-training-${r.id}`,
        sourceType: 'training',
        sourceId: r.id,
        title: r.name,
        subtitle: `${r.exercises.length} exercícios`,
        durationMinutes: r.estimatedDurationMinutes ?? 45,
        estimatedMinutes: r.estimatedDurationMinutes ?? 45,
        category: 'Treino',
        priority: 'high',
        icon: 'FitnessCenterRounded',
      }));
  },
};

export const habitCandidateProvider: ScheduleCandidateProvider = {
  sourceType: 'habit',
  label: 'Hábitos',
  async getCandidatesForSlot(availableMinutes: number): Promise<ScheduleCandidate[]> {
    const habits = await habitService.getHabits();
    return habits
      .filter((h) => (h.estimatedDurationMinutes ?? 15) <= availableMinutes && h.status === 'active')
      .map((h) => ({
        id: `candidate-habit-${h.id}`,
        sourceType: 'habit',
        sourceId: h.id,
        title: h.name,
        subtitle: h.timeOfDay,
        durationMinutes: h.estimatedDurationMinutes ?? 15,
        estimatedMinutes: h.estimatedDurationMinutes ?? 15,
        category: 'Hábito',
        priority: h.priority ?? 'medium',
        icon: h.icon || 'AutorenewRounded',
      }));
  },
};

export const missionCandidateProvider: ScheduleCandidateProvider = {
  sourceType: 'mission',
  label: 'Missões',
  async getCandidatesForSlot(availableMinutes: number, date?: string): Promise<ScheduleCandidate[]> {
    const targetDate = date ?? new Date().toISOString().split('T')[0]!;
    const unscheduled = await missionScheduleAdapter.getUnscheduledEntries!(targetDate);
    return unscheduled
      .filter((m) => m.duration <= availableMinutes || m.splittable)
      .map((m) => ({
        id: `candidate-mission-${m.sourceId}`,
        sourceType: 'mission',
        sourceId: m.sourceId,
        title: m.title,
        subtitle: m.description,
        durationMinutes: m.duration,
        estimatedMinutes: m.duration,
        category: 'Missão',
        priority: m.priority ?? 'medium',
        icon: 'AssignmentRounded',
        splittable: m.splittable,
        minChunkDuration: m.minChunkDuration,
      }));
  },
};

export const allCandidateProviders: ScheduleCandidateProvider[] = [
  missionCandidateProvider,
  habitCandidateProvider,
  leisureCandidateProvider,
  trainingCandidateProvider,
];

export async function getCandidatesForAvailableTime(
  availableMinutes: number,
  date?: string,
): Promise<ScheduleCandidate[]> {
  const lists = await Promise.all(
    allCandidateProviders.map((provider) => provider.getCandidatesForSlot(availableMinutes, date)),
  );
  return lists.flat();
}

