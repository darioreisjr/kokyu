import type {
  ScheduleAction,
  ScheduleEntry,
  ScheduleEntryActionProvider,
} from '@/shared/scheduling/types';

export interface ActionHandlers {
  onComplete?: (entry: ScheduleEntry) => Promise<void>;
  onStartFocus?: (entry: ScheduleEntry) => void;
  onReschedule?: (entry: ScheduleEntry) => void;
  onEdit?: (entry: ScheduleEntry) => void;
  onDelete?: (entry: ScheduleEntry) => Promise<void>;
  onNavigate?: (href: string) => void;
}

export function createScheduleEntryActionProvider(
  handlers: ActionHandlers,
): ScheduleEntryActionProvider {
  return {
    getActionsForEntry(entry: ScheduleEntry): ScheduleAction[] {
      const actions: ScheduleAction[] = [];

      // 1. Completion / Registration
      if (entry.status !== 'completed') {
        if (entry.sourceType === 'habit') {
          actions.push({
            id: 'register-habit',
            label: 'Registrar conclusão',
            icon: 'CheckCircleRounded',
            variant: 'primary',
            perform: async (e) => handlers.onComplete?.(e),
          });
        } else if (entry.sourceType === 'mission') {
          actions.push({
            id: 'start-focus',
            label: 'Focar agora',
            icon: 'CenterFocusStrongRounded',
            variant: 'primary',
            perform: async (e) => handlers.onStartFocus?.(e),
          });
          actions.push({
            id: 'complete-mission',
            label: 'Concluir missão',
            icon: 'CheckCircleRounded',
            perform: async (e) => handlers.onComplete?.(e),
          });
        } else if (entry.sourceType === 'training') {
          actions.push({
            id: 'start-training',
            label: 'Iniciar treino',
            icon: 'FitnessCenterRounded',
            variant: 'primary',
            href: '/app/treinamento',
            perform: async () => handlers.onNavigate?.('/app/treinamento'),
          });
        } else if (entry.sourceType === 'leisure') {
          actions.push({
            id: 'complete-leisure',
            label: 'Marcar concluído',
            icon: 'CheckCircleRounded',
            perform: async (e) => handlers.onComplete?.(e),
          });
        } else if (entry.sourceType === 'manual' || entry.sourceType === 'focus') {
          actions.push({
            id: 'complete-manual',
            label: 'Concluir',
            icon: 'CheckCircleRounded',
            perform: async (e) => handlers.onComplete?.(e),
          });
        }
      }

      // 2. Rescheduling & Editing
      actions.push({
        id: 'reschedule',
        label: 'Reagendar',
        icon: 'UpdateRounded',
        perform: async (e) => handlers.onReschedule?.(e),
      });

      if (entry.sourceType === 'manual') {
        actions.push({
          id: 'edit-manual',
          label: 'Editar detalhes',
          icon: 'EditRounded',
          perform: async (e) => handlers.onEdit?.(e),
        });
      }

      // 3. Navigation to Source Module
      const sourceRouteMap: Record<string, string> = {
        training: '/app/treinamento',
        habit: '/app/habitos',
        nutrition: '/app/nutricao',
        leisure: '/app/tempo-livre',
        mission: '/app/missoes',
        goal: '/app/metas',
      };

      const route = sourceRouteMap[entry.sourceType];
      if (route) {
        actions.push({
          id: 'open-source',
          label: `Abrir em ${entry.sourceType}`,
          icon: 'OpenInNewRounded',
          href: route,
          perform: async () => handlers.onNavigate?.(route),
        });
      }

      // 4. Deletion / Cancellation
      if (entry.sourceType === 'manual' || entry.sourceType === 'focus') {
        actions.push({
          id: 'delete-entry',
          label: 'Excluir da agenda',
          icon: 'DeleteOutlineRounded',
          variant: 'danger',
          perform: async (e) => handlers.onDelete?.(e),
        });
      }

      return actions;
    },
  };
}

