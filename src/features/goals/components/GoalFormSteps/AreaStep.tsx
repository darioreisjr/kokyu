'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, type Control } from 'react-hook-form';

import { themePalette } from '@/design-system/theme/useThemePalette';

import { goalAreaDefinitions } from '../../constants/goalAreas';
import type { GoalFormValues } from '../../schemas/goalSchema';

export interface AreaStepProps {
  control: Control<GoalFormValues>;
}

export function AreaStep({ control }: AreaStepProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="labelLarge">Em qual área isso se encaixa?</Typography>
      <Controller
        control={control}
        name="area"
        render={({ field }) => (
          <Box
            role="radiogroup"
            aria-label="Área da meta"
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
              gap: 1.5,
            }}
          >
            {goalAreaDefinitions.map((area) => {
              const Icon = area.icon;
              const selected = field.value === area.id;
              return (
                <Box
                  key={area.id}
                  role="radio"
                  aria-checked={selected}
                  tabIndex={0}
                  onClick={() => field.onChange(area.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      field.onChange(area.id);
                    }
                  }}
                  sx={(theme) => ({
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    padding: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    textAlign: 'center',
                    border: `1px solid ${selected ? themePalette(theme).kokyu.action.primary : themePalette(theme).kokyu.border.subtle}`,
                    backgroundColor: selected
                      ? themePalette(theme).kokyu.background.subtle
                      : themePalette(theme).kokyu.surface.primary,
                  })}
                >
                  <Icon fontSize="small" aria-hidden="true" />
                  <Typography variant="labelSmall">{area.label}</Typography>
                </Box>
              );
            })}
          </Box>
        )}
      />
    </Stack>
  );
}
