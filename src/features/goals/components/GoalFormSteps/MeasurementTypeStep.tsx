'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';

import {
  goalTypeOptionDefinitions,
  type GoalTypeOptionDefinition,
  type GoalTypeOptionId,
} from '../../constants/goalTypeOptions';

export interface MeasurementTypeStepProps {
  selectedId: GoalTypeOptionId;
  onSelect: (option: GoalTypeOptionDefinition) => void;
}

/** Etapa 3 — "Resultados" é o card do modo resultados-chave, com linguagem simples em vez de "OKR" (ver a spec: "não obrigar usuário comum a conhecer OKR"). */
export function MeasurementTypeStep({ selectedId, onSelect }: MeasurementTypeStepProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="labelLarge">Como vamos medir?</Typography>
      <Box
        role="radiogroup"
        aria-label="Como medir a meta"
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}
      >
        {goalTypeOptionDefinitions.map((option) => {
          const Icon = option.icon;
          const selected = selectedId === option.id;
          return (
            <Box
              key={option.id}
              role="radio"
              aria-checked={selected}
              tabIndex={0}
              onClick={() => onSelect(option)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(option);
                }
              }}
              sx={(theme) => ({
                display: 'flex',
                gap: 1.5,
                padding: 2,
                borderRadius: 2,
                cursor: 'pointer',
                border: `1px solid ${selected ? themePalette(theme).kokyu.action.primary : themePalette(theme).kokyu.border.subtle}`,
                backgroundColor: selected
                  ? themePalette(theme).kokyu.background.subtle
                  : themePalette(theme).kokyu.surface.primary,
              })}
            >
              <Icon
                fontSize="small"
                aria-hidden="true"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, flexShrink: 0 })}
              />
              <Stack spacing={0.25}>
                <Typography variant="labelMedium">{option.label}</Typography>
                <Typography
                  variant="body2"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                >
                  {option.description}
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
