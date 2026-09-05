'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import type { Mission, MissionSuggestion } from '../../types';

export interface MissionSuggestionsProps {
  suggestions: MissionSuggestion[];
  missionsById: Record<string, Mission>;
  onAddToToday: (missionId: string) => void;
}

/** Never adds anything automatically (spec "NÃO ADICIONAR AUTOMATICAMENTE") — the user always confirms. */
export function MissionSuggestions({ suggestions, missionsById, onAddToToday }: MissionSuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nenhuma sugestão no momento.
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {suggestions.map((suggestion) => {
        const mission = missionsById[suggestion.missionId];
        if (!mission) return null;
        return (
          <Stack
            key={suggestion.missionId}
            direction="row"
            spacing={1.5}
            sx={(theme) => ({
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
            })}
          >
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                {mission.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {suggestion.reason}
              </Typography>
            </Stack>
            <KokyuButton size="small" variant="outlined" onClick={() => onAddToToday(suggestion.missionId)}>
              Adicionar a hoje
            </KokyuButton>
          </Stack>
        );
      })}
    </Stack>
  );
}
