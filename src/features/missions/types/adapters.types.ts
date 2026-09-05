import type { Mission } from './mission.types';

/**
 * Prepared, not implemented (spec "IA FUTURA"): the contract a future AI adapter must satisfy.
 * Every method returns a *proposal* — nothing is ever applied automatically without the user
 * confirming it, mirroring how `MissionConversionService` never deletes a mission on its own.
 */
export interface MissionAssistantProposal {
  type:
    | 'breakdown'
    | 'durationSuggestion'
    | 'dependencySuggestion'
    | 'projectSuggestion'
    | 'summary'
    | 'planningSuggestion'
    | 'goalMissionSuggestion'
    | 'duplicateDetection'
    | 'nextActionSuggestion';
  missionId?: string;
  payload: unknown;
  confidence?: number;
}

export interface MissionAssistantProvider {
  proposeBreakdown?: (mission: Mission) => Promise<MissionAssistantProposal>;
  proposeDuration?: (mission: Mission) => Promise<MissionAssistantProposal>;
  proposeDependencies?: (mission: Mission, candidates: Mission[]) => Promise<MissionAssistantProposal>;
  proposeProject?: (mission: Mission) => Promise<MissionAssistantProposal>;
  summarizeDescription?: (mission: Mission) => Promise<MissionAssistantProposal>;
  detectDuplicates?: (mission: Mission, candidates: Mission[]) => Promise<MissionAssistantProposal>;
}

/** Prepared, not implemented (spec "ATTACHMENTS FUTUROS"): no real storage backs this yet. */
export interface MissionAttachment {
  id: string;
  missionId: string;
  name: string;
  url: string;
  mimeType?: string;
  sizeBytes?: number;
  createdAt: string;
}
