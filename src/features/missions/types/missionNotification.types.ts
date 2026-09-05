/**
 * Prepared, not dispatched anywhere yet (spec "NOTIFICAÇÕES") — there is no notification
 * dispatch/queue system in Kokyu at all today (see architecture research), only the
 * enabled/disabled toggles already wired in `features/settings` (`missions.deadlines`,
 * `missions.overdue`, `missions.completed`). This is the more granular vocabulary a future
 * dispatcher would use; `Mission.reminderIds` is where instances of it would be referenced.
 */
export type MissionNotificationType =
  | 'missionReminder'
  | 'missionDeadlineApproaching'
  | 'missionFollowUp'
  | 'missionUnblocked'
  | 'recurringMissionAvailable';

export type MissionDeadlineReminderOffset = 'atTime' | '1dayBefore' | '3daysBefore' | '1weekBefore' | 'custom';

export interface MissionReminder {
  id: string;
  missionId: string;
  type: MissionNotificationType;
  offset?: MissionDeadlineReminderOffset;
  customMinutesBefore?: number;
  enabled: boolean;
}
