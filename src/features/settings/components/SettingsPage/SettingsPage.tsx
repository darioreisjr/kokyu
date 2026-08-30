'use client';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, type ComponentType } from 'react';

import { KokyuTextField } from '@/design-system/components';
import { useEffectiveReducedMotion } from '@/design-system/providers/MotionPreferenceProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { pageTransitionMotion } from '@/design-system/tokens/semantic/motion';

import { DEFAULT_SETTINGS_CATEGORY, settingsCategories } from '../../constants/settingsCategories';
import { settingsSearchIndex } from '../../constants/searchIndex';
import { searchSettings, type SettingsSearchResult } from '../../utils/searchSettings';
import { AccessibilitySettings } from '../AccessibilitySettings/AccessibilitySettings';
import { AccountSettings } from '../AccountSettings/AccountSettings';
import { AppearanceSettings } from '../AppearanceSettings/AppearanceSettings';
import { DataSettings } from '../DataSettings/DataSettings';
import { GeneralSettings } from '../GeneralSettings/GeneralSettings';
import { IntegrationSettings } from '../IntegrationSettings/IntegrationSettings';
import { LocaleSettings } from '../LocaleSettings/LocaleSettings';
import { NavigationSettings } from '../NavigationSettings/NavigationSettings';
import { NotificationSettings } from '../NotificationSettings/NotificationSettings';
import { PrivacySettings } from '../PrivacySettings/PrivacySettings';
import { RoutineSettings } from '../RoutineSettings/RoutineSettings';
import { SecuritySettings } from '../SecuritySettings/SecuritySettings';
import { SessionsSettings } from '../SessionsSettings/SessionsSettings';
import { SettingsNavigation } from '../SettingsNavigation/SettingsNavigation';
import { SoundSettings } from '../SoundSettings/SoundSettings';

const CATEGORY_COMPONENTS: Record<string, ComponentType> = {
  geral: GeneralSettings,
  aparencia: AppearanceSettings,
  navegacao: NavigationSettings,
  'idioma-e-regiao': LocaleSettings,
  rotina: RoutineSettings,
  notificacoes: NotificationSettings,
  'sons-e-feedback': SoundSettings,
  acessibilidade: AccessibilitySettings,
  privacidade: PrivacySettings,
  seguranca: SecuritySettings,
  'sessoes-e-dispositivos': SessionsSettings,
  dados: DataSettings,
  integracoes: IntegrationSettings,
  conta: AccountSettings,
};

const SETTINGS_ROUTE = '/app/configuracoes';

/** Both inputs are static, so this only ever needs computing once — not on every render of `SettingsPageContent`. */
const SEARCH_OPTIONS: SettingsSearchResult[] = settingsSearchIndex.map((entry) => ({
  ...entry,
  categoryLabel:
    settingsCategories.find((category) => category.id === entry.sectionId)?.label ?? '',
}));

/**
 * `useSearchParams` opts the tree under it into client-side rendering
 * unless wrapped in `Suspense` — the recommended App Router pattern,
 * so this stays the exported default even though everything it does
 * happens inside `SettingsPageContent`.
 */
export function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPageContent />
    </Suspense>
  );
}

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useEffectiveReducedMotion();

  const hasSectionParam = searchParams.has('section');
  const activeCategory = searchParams.get('section') ?? DEFAULT_SETTINGS_CATEGORY;
  const activeCategoryLabel =
    settingsCategories.find((category) => category.id === activeCategory)?.label ?? '';
  const ActiveCategoryComponent = CATEGORY_COMPONENTS[activeCategory] ?? GeneralSettings;

  function goToCategory(id: string, anchorId?: string) {
    const hash = anchorId ? `#${anchorId}` : '';
    router.push(`${SETTINGS_ROUTE}?section=${id}${hash}`, { scroll: false });
  }

  function goBackToList() {
    router.push(SETTINGS_ROUTE, { scroll: false });
  }

  function handleSearchSelect(result: SettingsSearchResult | null) {
    if (!result) return;
    goToCategory(result.sectionId, result.anchorId);
  }

  // Deep-linking's second half: `?section=` picks the category (read
  // above, synchronously, so there's no flash of the wrong one), and a
  // `#anchorId` on top of it scrolls/focuses one specific row once
  // that category's content exists in the DOM.
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    queueMicrotask(() => {
      const target = document.getElementById(hash);
      target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      target?.focus({ preventScroll: true });
    });
  }, [activeCategory, reducedMotion]);

  return (
    <Stack spacing={4}>
      <Stack spacing={0.5}>
        <Typography variant="displaySmall" component="h1">
          Configurações
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Como o Kokyu funciona para você.
        </Typography>
      </Stack>

      <Autocomplete<SettingsSearchResult>
        options={SEARCH_OPTIONS}
        groupBy={(option) => option.categoryLabel}
        getOptionLabel={(option) => option.label}
        filterOptions={(_options, state) =>
          searchSettings(state.inputValue, settingsSearchIndex, settingsCategories)
        }
        onChange={(_event, value) => handleSearchSelect(value)}
        noOptionsText="Nenhuma configuração encontrada"
        renderInput={(params) => (
          <KokyuTextField
            {...params}
            label="Buscar configurações"
            placeholder="Buscar nas configurações..."
          />
        )}
        sx={{ maxWidth: { sm: 420 } }}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'flex-start',
          gap: { xs: 0, sm: 5 },
        }}
      >
        <Box
          sx={{
            display: { xs: hasSectionParam ? 'none' : 'block', sm: 'block' },
            width: { sm: 260 },
            flexShrink: 0,
            position: { sm: 'sticky' },
            top: { sm: 24 },
          }}
        >
          <SettingsNavigation
            categories={settingsCategories}
            activeCategory={activeCategory}
            onSelectCategory={(id) => goToCategory(id)}
          />
        </Box>

        <Box
          sx={{
            display: { xs: hasSectionParam ? 'block' : 'none', sm: 'block' },
            flex: 1,
            minWidth: 0,
            width: '100%',
          }}
        >
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', marginBottom: 2 }}>
            <IconButton aria-label="Voltar para as categorias" onClick={goBackToList} edge="start">
              <ArrowBackRoundedIcon />
            </IconButton>
            <Typography variant="labelLarge">{activeCategoryLabel}</Typography>
          </Box>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeCategory}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{
                duration: pageTransitionMotion.duration,
                ease: pageTransitionMotion.enterEase,
              }}
            >
              <ActiveCategoryComponent />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Stack>
  );
}
