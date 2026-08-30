'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { recipeCategoryDefinitions } from '../../constants/recipeCategories';
import { unitDefinitions } from '../../constants/units';
import {
  recipeFormDefaultValues,
  recipeSchema,
  type RecipeFormValues,
} from '../../schemas/recipeSchema';
import type { Ingredient } from '../../types/ingredient.types';

export interface RecipeFormProps {
  ingredients: Ingredient[];
  defaultValues?: RecipeFormValues;
  submitLabel: string;
  onSubmit: (values: RecipeFormValues) => void;
  isSubmitting?: boolean;
}

/**
 * Create and edit share this one form — a fresh receita and an
 * existing one being edited only differ in `defaultValues`. Every
 * ingredient row resolves against the ingredient catalog by name at
 * submit time (see `RecipeFormPage`), not while the user is still
 * typing.
 */
export function RecipeForm({
  ingredients,
  defaultValues,
  submitLabel,
  onSubmit,
  isSubmitting,
}: RecipeFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: defaultValues ?? recipeFormDefaultValues,
    mode: 'onBlur',
  });

  const ingredientFields = useFieldArray({ control, name: 'ingredients' });
  const stepFields = useFieldArray({ control, name: 'steps' });

  return (
    <Stack component="form" spacing={4} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        <KokyuTextField
          label="Nome da receita"
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          {...register('name')}
        />
        <KokyuTextField
          label="Descrição (opcional)"
          multiline
          minRows={2}
          {...register('description')}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <KokyuTextField select label="Categoria" sx={{ flex: 1 }} {...field}>
                {recipeCategoryDefinitions.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.label}
                  </MenuItem>
                ))}
              </KokyuTextField>
            )}
          />
          <KokyuTextField
            label="Preparo (min)"
            type="number"
            error={Boolean(errors.preparationTime)}
            helperText={errors.preparationTime?.message}
            slotProps={{ htmlInput: { min: 0 } }}
            sx={{ flex: 1 }}
            {...register('preparationTime', { valueAsNumber: true })}
          />
          <KokyuTextField
            label="Cozimento (min)"
            type="number"
            error={Boolean(errors.cookingTime)}
            helperText={errors.cookingTime?.message}
            slotProps={{ htmlInput: { min: 0 } }}
            sx={{ flex: 1 }}
            {...register('cookingTime', { valueAsNumber: true })}
          />
          <KokyuTextField
            label="Porções"
            type="number"
            error={Boolean(errors.servings)}
            helperText={errors.servings?.message}
            slotProps={{ htmlInput: { min: 1 } }}
            sx={{ flex: 1 }}
            {...register('servings', { valueAsNumber: true })}
          />
        </Stack>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={field.value}
              onChange={(_event, value) => field.onChange(value)}
              renderInput={(params) => (
                <KokyuTextField
                  {...params}
                  label="Tags (opcional)"
                  placeholder="rápido, marmita..."
                />
              )}
            />
          )}
        />
      </Stack>

      <Stack spacing={2}>
        <Typography variant="labelLarge">Ingredientes</Typography>
        {errors.ingredients?.root ? (
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.error })}
          >
            {errors.ingredients.root.message}
          </Typography>
        ) : null}
        {ingredientFields.fields.map((field, index) => (
          <Paper
            key={field.id}
            elevation={0}
            sx={(theme) => ({
              borderRadius: cardTokens.radius,
              border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
              padding: 2,
            })}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Controller
                control={control}
                name={`ingredients.${index}.ingredientName`}
                render={({ field: nameField }) => (
                  <Autocomplete
                    freeSolo
                    options={ingredients}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                    inputValue={nameField.value}
                    onInputChange={(_event, value) => nameField.onChange(value)}
                    onChange={(_event, value) =>
                      nameField.onChange(typeof value === 'string' ? value : (value?.name ?? ''))
                    }
                    sx={{ flex: 2 }}
                    renderInput={(params) => (
                      <KokyuTextField
                        {...params}
                        label="Ingrediente"
                        error={Boolean(errors.ingredients?.[index]?.ingredientName)}
                        helperText={errors.ingredients?.[index]?.ingredientName?.message}
                      />
                    )}
                  />
                )}
              />
              <KokyuTextField
                label="Quantidade"
                type="number"
                slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                error={Boolean(errors.ingredients?.[index]?.quantity)}
                sx={{ flex: 1 }}
                {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
              />
              <Controller
                control={control}
                name={`ingredients.${index}.unit`}
                render={({ field: unitField }) => (
                  <KokyuTextField
                    select
                    label="Unidade"
                    sx={{ flex: 1, minWidth: 120 }}
                    {...unitField}
                  >
                    {unitDefinitions.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        {unit.label}
                      </MenuItem>
                    ))}
                  </KokyuTextField>
                )}
              />
              <IconButton
                aria-label="Remover ingrediente"
                onClick={() => ingredientFields.remove(index)}
                sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}
        <KokyuButton
          variant="text"
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={() =>
            ingredientFields.append({ ingredientName: '', quantity: 1, unit: 'unidade' })
          }
          sx={{ alignSelf: 'flex-start' }}
        >
          Adicionar ingrediente
        </KokyuButton>
      </Stack>

      <Stack spacing={2}>
        <Typography variant="labelLarge">Modo de preparo</Typography>
        {errors.steps?.root ? (
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.error })}
          >
            {errors.steps.root.message}
          </Typography>
        ) : null}
        {stepFields.fields.map((field, index) => (
          <Stack key={field.id} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="labelLarge" sx={{ marginTop: 1.5, minWidth: 24 }}>
              {index + 1}.
            </Typography>
            <KokyuTextField
              label={`Etapa ${index + 1}`}
              multiline
              minRows={1}
              error={Boolean(errors.steps?.[index]?.text)}
              helperText={errors.steps?.[index]?.text?.message}
              sx={{ flex: 1 }}
              {...register(`steps.${index}.text`)}
            />
            <Stack sx={{ marginTop: 0.5 }}>
              <IconButton
                aria-label="Mover etapa para cima"
                size="small"
                disabled={index === 0}
                onClick={() => stepFields.move(index, index - 1)}
              >
                <ArrowUpwardRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Mover etapa para baixo"
                size="small"
                disabled={index === stepFields.fields.length - 1}
                onClick={() => stepFields.move(index, index + 1)}
              >
                <ArrowDownwardRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
            <IconButton
              aria-label="Remover etapa"
              size="small"
              onClick={() => stepFields.remove(index)}
              sx={{ marginTop: 0.5 }}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        <KokyuButton
          variant="text"
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={() => stepFields.append({ text: '' })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Adicionar etapa
        </KokyuButton>
      </Stack>

      <KokyuTextField label="Notas (opcional)" multiline minRows={2} {...register('notes')} />

      <Box>
        <KokyuButton type="submit" variant="contained" loading={isSubmitting}>
          {submitLabel}
        </KokyuButton>
      </Box>
    </Stack>
  );
}
