export const habitRoutes = {
  today: '/app/habitos',
  routines: '/app/habitos/rotinas',
  all: '/app/habitos/todos',
  calendar: '/app/habitos/calendario',
  progress: '/app/habitos/progresso',
  reviews: '/app/habitos/revisoes',
  archived: '/app/habitos/arquivados',
  new: '/app/habitos/novo',
  detail: (id: string) => `/app/habitos/${id}`,
  edit: (id: string) => `/app/habitos/${id}/editar`,
  routineNew: '/app/habitos/rotinas/nova',
  routineDetail: (id: string) => `/app/habitos/rotinas/${id}`,
  routineEdit: (id: string) => `/app/habitos/rotinas/${id}/editar`,
  routinePlayer: (id: string) => `/app/habitos/rotinas/${id}/executar`,
};

export const habitTabs = [
  { id: 'hoje', label: 'Hoje', href: habitRoutes.today },
  { id: 'rotinas', label: 'Rotinas', href: habitRoutes.routines },
  { id: 'todos', label: 'Todos os hábitos', href: habitRoutes.all },
  { id: 'calendario', label: 'Calendário', href: habitRoutes.calendar },
  { id: 'progresso', label: 'Progresso', href: habitRoutes.progress },
  { id: 'revisoes', label: 'Revisões', href: habitRoutes.reviews },
  { id: 'arquivados', label: 'Arquivados', href: habitRoutes.archived },
];
