import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import PrivacyTipRoundedIcon from '@mui/icons-material/PrivacyTipRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';

import type { SettingsCategoryConfig } from '../components/SettingsNavigation/SettingsNavigation';

/**
 * The 14 Configurações categories, in the fixed order the whole feature
 * (`SettingsNavigation`, deep-link `?section=` values, the search
 * index) shares. "Sessões e dispositivos" is its own category rather
 * than a subsection of "Segurança" — keeps both content panels a
 * readable length instead of one long combined screen.
 */
export const settingsCategories: SettingsCategoryConfig[] = [
  { id: 'geral', label: 'Geral', icon: TuneRoundedIcon },
  { id: 'aparencia', label: 'Aparência', icon: PaletteRoundedIcon },
  { id: 'navegacao', label: 'Navegação', icon: ViewSidebarRoundedIcon },
  { id: 'idioma-e-regiao', label: 'Idioma e região', icon: LanguageRoundedIcon },
  { id: 'rotina', label: 'Rotina', icon: ScheduleRoundedIcon },
  { id: 'notificacoes', label: 'Notificações', icon: NotificationsRoundedIcon },
  { id: 'sons-e-feedback', label: 'Sons e feedback', icon: VolumeUpRoundedIcon },
  { id: 'acessibilidade', label: 'Acessibilidade', icon: AccessibilityNewRoundedIcon },
  { id: 'privacidade', label: 'Privacidade', icon: PrivacyTipRoundedIcon },
  { id: 'seguranca', label: 'Segurança', icon: LockRoundedIcon },
  { id: 'sessoes-e-dispositivos', label: 'Sessões e dispositivos', icon: DevicesRoundedIcon },
  { id: 'dados', label: 'Dados', icon: StorageRoundedIcon },
  { id: 'integracoes', label: 'Integrações', icon: ExtensionRoundedIcon },
  { id: 'conta', label: 'Conta', icon: ManageAccountsRoundedIcon },
];

export const DEFAULT_SETTINGS_CATEGORY = 'geral';
