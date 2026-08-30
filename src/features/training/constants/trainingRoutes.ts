export const trainingRoutes = {
  today: '/app/treinamento',
  calendar: '/app/treinamento/calendario',
  routines: '/app/treinamento/treinos',
  newRoutine: '/app/treinamento/treinos/novo',
  routine: (id: string) => `/app/treinamento/treinos/${id}`,
  editRoutine: (id: string) => `/app/treinamento/treinos/${id}/editar`,
  programs: '/app/treinamento/programas',
  newProgram: '/app/treinamento/programas/novo',
  program: (id: string) => `/app/treinamento/programas/${id}`,
  editProgram: (id: string) => `/app/treinamento/programas/${id}/editar`,
  exercises: '/app/treinamento/exercicios',
  exercise: (id: string) => `/app/treinamento/exercicios/${id}`,
  progress: '/app/treinamento/progresso',
  history: '/app/treinamento/historico',
  recovery: '/app/treinamento/recuperacao',
  session: (id: string) => `/app/treinamento/sessao/${id}`,
} as const;

export interface TrainingTabConfig {
  id: string;
  label: string;
  href: string;
}

export const trainingTabs: TrainingTabConfig[] = [
  { id: 'hoje', label: 'Hoje', href: trainingRoutes.today },
  { id: 'calendario', label: 'Calendário', href: trainingRoutes.calendar },
  { id: 'treinos', label: 'Meus treinos', href: trainingRoutes.routines },
  { id: 'programas', label: 'Programas', href: trainingRoutes.programs },
  { id: 'exercicios', label: 'Exercícios', href: trainingRoutes.exercises },
  { id: 'progresso', label: 'Progresso', href: trainingRoutes.progress },
  { id: 'historico', label: 'Histórico', href: trainingRoutes.history },
  { id: 'recuperacao', label: 'Recuperação', href: trainingRoutes.recovery },
];
