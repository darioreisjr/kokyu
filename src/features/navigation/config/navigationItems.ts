import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';

import type { NavigationItemConfig } from '@/design-system/components';

/**
 * The single source of truth for every authenticated route: `Sidebar`,
 * `NavigationDrawer` and `KokyuAppShell` (for the mobile top bar title
 * and active-item detection) all read from these two arrays instead of
 * each hardcoding its own copy of the menu.
 */
export const navigationItems: NavigationItemConfig[] = [
  { id: 'respiracao', label: 'Respiração', href: '/app', icon: HomeRoundedIcon },
  { id: 'missoes', label: 'Missões', href: '/app/missoes', icon: AssignmentRoundedIcon },
  {
    id: 'ritmo-diario',
    label: 'Ritmo Diário',
    href: '/app/ritmo-diario',
    icon: CalendarMonthRoundedIcon,
  },
  {
    id: 'treinamento',
    label: 'Treinamento',
    href: '/app/treinamento',
    icon: FitnessCenterRoundedIcon,
  },
  { id: 'nutricao', label: 'Nutrição', href: '/app/nutricao', icon: RestaurantRoundedIcon },
  { id: 'habitos', label: 'Hábitos', href: '/app/habitos', icon: AutorenewRoundedIcon },
  { id: 'metas', label: 'Metas', href: '/app/metas', icon: TrackChangesRoundedIcon },
  { id: 'tempo-livre', label: 'Tempo Livre', href: '/app/tempo-livre', icon: MovieRoundedIcon },
];

/** The lower section — "Sair" isn't here since it has no route (see `Sidebar`/`NavigationDrawer`). */
export const bottomNavigationItems: NavigationItemConfig[] = [
  { id: 'perfil', label: 'Perfil', href: '/app/perfil', icon: PersonRoundedIcon },
  {
    id: 'configuracoes',
    label: 'Configurações',
    href: '/app/configuracoes',
    icon: SettingsRoundedIcon,
  },
];
