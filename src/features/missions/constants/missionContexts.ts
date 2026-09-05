import type { MissionContext } from '../types';

/** Seed contexts (spec examples) — stored as regular data in `missionMockDb`, so nothing stops a user from adding more later. */
export const defaultMissionContexts: MissionContext[] = [
  { id: 'context-computer', label: 'Computador', icon: 'ComputerRounded' },
  { id: 'context-phone', label: 'Celular', icon: 'SmartphoneRounded' },
  { id: 'context-home', label: 'Casa', icon: 'HomeRounded' },
  { id: 'context-work', label: 'Trabalho', icon: 'BusinessCenterRounded' },
  { id: 'context-errands', label: 'Rua', icon: 'DirectionsWalkRounded' },
  { id: 'context-online', label: 'Internet', icon: 'WifiRounded' },
  { id: 'context-offline', label: 'Offline', icon: 'WifiOffRounded' },
];
