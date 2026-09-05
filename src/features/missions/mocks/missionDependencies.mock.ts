import type { MissionDependency } from '../types';

/** "Configurar domínio" waits on "Finalizar autenticação" — matches the seed missions in `missions.mock.ts`. */
export function createMockMissionDependencies(): MissionDependency[] {
  return [
    {
      id: 'dependency-domain-blocked-by-auth',
      blockerMissionId: 'mission-auth',
      blockedMissionId: 'mission-domain',
      createdAt: '2026-08-12T09:00:00Z',
    },
  ];
}
