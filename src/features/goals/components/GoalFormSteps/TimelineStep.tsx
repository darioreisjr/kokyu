'use client';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, type Control } from 'react-hook-form';

import { KokyuDateField } from '@/design-system/components';

import type { GoalFormValues } from '../../schemas/goalSchema';
import { fromDateKey, toDateKey } from '../../utils/dateHelpers';

export interface TimelineStepProps {
  control: Control<GoalFormValues>;
}

/** "Sem prazo" só é oferecida aqui — não em toda etapa, já que nem toda meta precisa de uma (ver a spec: "permitir 'sem prazo' somente quando fizer sentido"). */
export function TimelineStep({ control }: TimelineStepProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="labelLarge">Quando você quer alcançar?</Typography>
      <Controller
        control={control}
        name="startDate"
        render={({ field, fieldState }) => (
          <KokyuDateField
            label="Data inicial"
            value={field.value ? fromDateKey(field.value) : null}
            onChange={(value) => field.onChange(value ? toDateKey(value) : '')}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="targetDate"
        render={({ field }) => (
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!field.value}
                  onChange={(event) =>
                    field.onChange(event.target.checked ? '' : toDateKey(new Date()))
                  }
                />
              }
              label="Sem prazo"
            />
            {field.value ? (
              <KokyuDateField
                label="Prazo"
                value={fromDateKey(field.value)}
                onChange={(value) => field.onChange(value ? toDateKey(value) : '')}
              />
            ) : null}
          </Stack>
        )}
      />
    </Stack>
  );
}
