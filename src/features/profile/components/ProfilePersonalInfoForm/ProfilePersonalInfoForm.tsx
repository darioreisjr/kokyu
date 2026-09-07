'use client';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';

import { KokyuDateField, KokyuTextField } from '@/design-system/components';
import { calculateAge } from '@/features/auth';

import { countries } from '../../constants/countries';
import type { ProfileFormValues } from '../../schemas/profileSchema';

export interface ProfilePersonalInfoFormProps {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  disabled?: boolean;
}

/** Data de nascimento (+ derived Idade), País, Estado/Região and Cidade. */
export function ProfilePersonalInfoForm({
  control,
  register,
  errors,
  disabled = false,
}: ProfilePersonalInfoFormProps) {
  const birthDate = useWatch({ control, name: 'birthDate' });
  const age = birthDate ? calculateAge(birthDate) : null;
  // `region`/`city` are registered via `register()` (ref-based, unlike
  // `birthDate`/`country` above which are `Controller`-driven and so
  // already correctly server-rendered) — see `ProfileIdentityForm`'s
  // "Sobre você" field for why an uncontrolled field also needs an
  // explicit `defaultValue`, or the server ships it empty and a fast
  // interaction right after load can corrupt it.
  const region = useWatch({ control, name: 'region' });
  const city = useWatch({ control, name: 'city' });

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" component="h2">
        Informações pessoais
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
        <Controller
          control={control}
          name="birthDate"
          render={({ field, fieldState }) => (
            <KokyuDateField
              label="Data de nascimento"
              value={field.value ?? null}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              maxDate={new Date()}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              disabled={disabled}
            />
          )}
        />
        <KokyuTextField
          label="Idade"
          value={age !== null ? `${age} anos` : ''}
          disabled
          helperText="Calculada a partir da data de nascimento"
          slotProps={{ input: { readOnly: true } }}
        />
      </Box>

      <Controller
        control={control}
        name="country"
        render={({ field }) => (
          // `register()` doesn't give MUI's Select the `value` prop it
          // needs to know what's selected (it only wires up
          // onChange/onBlur/ref, fine for a plain <input> but not
          // this) — `Controller` is required here, same reason the
          // date field above needs it.
          <KokyuTextField
            select
            label="País"
            disabled={disabled}
            error={Boolean(errors.country)}
            helperText={errors.country?.message}
            {...field}
          >
            {countries.map((country) => (
              <MenuItem key={country.code} value={country.code}>
                {country.label}
              </MenuItem>
            ))}
          </KokyuTextField>
        )}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
        <KokyuTextField
          label="Estado/Região"
          disabled={disabled}
          error={Boolean(errors.region)}
          helperText={errors.region?.message}
          defaultValue={region ?? ''}
          {...register('region')}
        />
        <KokyuTextField
          label="Cidade"
          disabled={disabled}
          error={Boolean(errors.city)}
          helperText={errors.city?.message}
          defaultValue={city ?? ''}
          {...register('city')}
        />
      </Box>
    </Stack>
  );
}
