import type { Mission, MissionDependency, MissionFilters, MissionGroupField, MissionSort } from '../../types';
import { isMissionAvailable, isMissionTerminal } from '../../utils/missionDateStatus';
import { isMissionBlocked, type MissionStatusById } from './missionDependencyEngine';

/**
 * The one place list/board/saved-view filtering happens — never duplicated per-component (spec
 * "filtros calculados de forma inconsistente" is an explicit non-goal).
 */
export function applyMissionFilters(
  missions: Mission[],
  filters: MissionFilters,
  context: { today: string; dependencies: MissionDependency[] },
): Mission[] {
  const statusById: MissionStatusById = Object.fromEntries(missions.map((m) => [m.id, m.status]));
  const search = filters.search?.trim().toLowerCase();

  return missions.filter((mission) => {
    if (filters.status && !filters.status.includes(mission.status)) return false;
    if (filters.projectId && !(mission.projectId && filters.projectId.includes(mission.projectId))) return false;
    if (filters.sectionId && !(mission.sectionId && filters.sectionId.includes(mission.sectionId))) return false;
    if (filters.areaId && !(mission.areaId && filters.areaId.includes(mission.areaId))) return false;
    if (filters.priority && !filters.priority.includes(mission.priority)) return false;
    if (filters.importance && !(mission.importance && filters.importance.includes(mission.importance))) return false;
    if (filters.tagId && !filters.tagId.some((id) => mission.tagIds.includes(id))) return false;
    if (filters.contextId && !filters.contextId.some((id) => mission.contextIds.includes(id))) return false;
    if (
      filters.energyRequirement &&
      !(mission.energyRequirement && filters.energyRequirement.includes(mission.energyRequirement))
    ) {
      return false;
    }
    if (filters.goalId && !filters.goalId.some((id) => mission.goalIds.includes(id))) return false;
    if (filters.durationMax !== undefined && (mission.estimatedDuration ?? Infinity) > filters.durationMax) return false;
    if (filters.durationMin !== undefined && (mission.estimatedDuration ?? 0) < filters.durationMin) return false;
    if (filters.waiting !== undefined && (mission.status === 'waiting') !== filters.waiting) return false;
    if (filters.recurring !== undefined && !!mission.recurrenceRule !== filters.recurring) return false;
    if (filters.available !== undefined && isMissionAvailable(mission, context.today) !== filters.available) return false;
    if (filters.blocked !== undefined) {
      const blocked = isMissionBlocked(mission.id, context.dependencies, statusById);
      if (blocked !== filters.blocked) return false;
    }
    if (filters.plannedDateRange) {
      if (!mission.plannedDate) return false;
      if (filters.plannedDateRange.from && mission.plannedDate < filters.plannedDateRange.from) return false;
      if (filters.plannedDateRange.to && mission.plannedDate > filters.plannedDateRange.to) return false;
    }
    if (filters.deadlineRange) {
      if (!mission.deadline) return false;
      if (filters.deadlineRange.from && mission.deadline < filters.deadlineRange.from) return false;
      if (filters.deadlineRange.to && mission.deadline > filters.deadlineRange.to) return false;
    }
    if (search) {
      const haystack = `${mission.title} ${mission.description ?? ''}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

const PRIORITY_RANK: Record<Mission['priority'], number> = { critical: 4, high: 3, medium: 2, low: 1, none: 0 };

function compareBy(field: MissionSort['field'], a: Mission, b: Mission): number {
  switch (field) {
    case 'priority':
      // Ascending by rank (none→critical), like every other field here — `sortMissions` reverses for 'desc'.
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    case 'deadline':
      return (a.deadline ?? '9999-99-99').localeCompare(b.deadline ?? '9999-99-99');
    case 'plannedDate':
      return (a.plannedDate ?? '9999-99-99').localeCompare(b.plannedDate ?? '9999-99-99');
    case 'availableFrom':
      return (a.availableFrom ?? '9999-99-99').localeCompare(b.availableFrom ?? '9999-99-99');
    case 'duration':
      return (a.estimatedDuration ?? Infinity) - (b.estimatedDuration ?? Infinity);
    case 'createdAt':
      return a.createdAt.localeCompare(b.createdAt);
    case 'updatedAt':
      return a.updatedAt.localeCompare(b.updatedAt);
    case 'title':
      return a.title.localeCompare(b.title, 'pt-BR');
    case 'manual':
    default:
      return 0;
  }
}

export function sortMissions(missions: Mission[], sort: MissionSort): Mission[] {
  if (sort.field === 'manual') return [...missions];
  const sorted = [...missions].sort((a, b) => compareBy(sort.field, a, b));
  return sort.direction === 'desc' ? sorted.reverse() : sorted;
}

export interface MissionGroup {
  key: string;
  label: string;
  missions: Mission[];
}

export function groupMissions(
  missions: Mission[],
  field: MissionGroupField,
  context: { getProjectName: (id: string) => string; getSectionName: (id: string) => string },
): MissionGroup[] {
  if (field === 'none') {
    return [{ key: 'all', label: 'Todas', missions }];
  }

  const groups = new Map<string, MissionGroup>();

  const keyOf = (mission: Mission): { key: string; label: string } => {
    switch (field) {
      case 'project':
        return mission.projectId
          ? { key: mission.projectId, label: context.getProjectName(mission.projectId) }
          : { key: 'no-project', label: 'Sem projeto' };
      case 'section':
        return mission.sectionId
          ? { key: mission.sectionId, label: context.getSectionName(mission.sectionId) }
          : { key: 'no-section', label: 'Sem seção' };
      case 'status':
        return { key: mission.status, label: mission.status };
      case 'priority':
        return { key: mission.priority, label: mission.priority };
      case 'area':
        return mission.areaId ? { key: mission.areaId, label: mission.areaId } : { key: 'no-area', label: 'Sem área' };
      case 'date':
        return mission.plannedDate ? { key: mission.plannedDate, label: mission.plannedDate } : { key: 'no-date', label: 'Sem data' };
      default:
        return { key: 'all', label: 'Todas' };
    }
  };

  for (const mission of missions) {
    const { key, label } = keyOf(mission);
    const group = groups.get(key) ?? { key, label, missions: [] };
    group.missions.push(mission);
    groups.set(key, group);
  }

  return Array.from(groups.values());
}

export function isMissionTerminalForFilters(mission: Mission): boolean {
  return isMissionTerminal(mission);
}
