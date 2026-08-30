import type { GoalCheckIn } from '../types';

export function createMockGoalCheckIns(): GoalCheckIn[] {
  return [
    {
      id: 'checkin-1',
      goalId: 'goal-read-20-books',
      perceivedStatus: 'onTrack',
      confidence: 4,
      progressSnapshot: 40,
      whatMovedForward: 'Terminei mais dois livros no mês.',
      nextStep: 'Começar o próximo da lista de Tempo Livre.',
      createdAt: '2026-08-20T12:00:00.000Z',
    },
    {
      id: 'checkin-2',
      goalId: 'goal-reduce-screen-time',
      perceivedStatus: 'attention',
      confidence: 3,
      progressSnapshot: 44,
      whatIsBlocking: 'Ainda uso o celular como despertador.',
      nextStep: 'Comprar um despertador separado.',
      createdAt: '2026-08-18T21:00:00.000Z',
    },
    {
      id: 'checkin-3',
      goalId: 'goal-improve-career',
      perceivedStatus: 'onTrack',
      confidence: 3,
      progressSnapshot: 34,
      whatMovedForward: 'Enviei mais candidaturas essa semana.',
      whatIsBlocking: 'O segundo curso não teve tempo de andar.',
      nextStep: 'Reservar 2h por semana só para o curso.',
      createdAt: '2026-08-15T18:00:00.000Z',
    },
  ];
}
