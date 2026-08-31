'use client';

import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { zodResolver } from '@hookform/resolvers/zod';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { KokyuButton } from '@/design-system/components';
import { habitAreaDefinitions } from '../../constants/habitAreas';
import { habitRoutes } from '../../constants/habitRoutes';
import type { HabitArea } from '../../types/habit.types';
import { useHabit } from '../../hooks/useHabit';
import {
  habitFormDefaultValues,
  habitSchema,
  type HabitFormValues,
} from '../../schemas/habitSchema';
import { habitService } from '../../services/habitService';
import type { HabitTarget } from '../../types/habit.types';

export interface HabitEditPageProps {
  habitId: string;
}

export function HabitEditPage({ habitId }: HabitEditPageProps) {
  const router = useRouter();
  const { habit, isLoading } = useHabit(habitId);
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split('T')[0]!,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: habitFormDefaultValues,
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = form;

  useEffect(() => {
    if (habit) {
      reset({
        name: habit.name,
        description: habit.description ?? '',
        area: habit.area,
        direction: habit.direction,
        trackingType: habit.trackingType,
        targetValue: 'targetValue' in habit.target ? habit.target.targetValue : 1,
        targetMinutes: 'targetMinutes' in habit.target ? habit.target.targetMinutes : 30,
        minimumMinutes: 'minimumMinutes' in habit.target ? habit.target.minimumMinutes : 10,
        maxLimit: 'maxLimit' in habit.target ? habit.target.maxLimit : 2,
        unit: 'unit' in habit.target && habit.target.unit ? habit.target.unit : 'times',
        customUnitLabel: 'customUnitLabel' in habit.target ? habit.target.customUnitLabel : '',
        allowOverachievement: 'allowOverachievement' in habit.target ? habit.target.allowOverachievement : true,
        limitPeriod: 'period' in habit.target ? habit.target.period : 'week',
        frequencyType: habit.schedule.frequencyType,
        weekdays: habit.schedule.weekdays ?? [1, 2, 3, 4, 5],
        timesPerPeriod: habit.schedule.timesPerPeriod ?? 3,
        intervalDays: habit.schedule.intervalDays ?? 2,
        startDate: habit.startDate,
        endDate: habit.endDate ?? '',
        effectiveFrom: effectiveDate,
        timeOfDay: habit.timeOfDay,
        preferredTime: habit.preferredTime ?? '',
        priority: habit.priority ?? 'medium',
        icon: habit.icon,
        tags: habit.tags,
        motivation: habit.motivation ?? '',
        cue: habit.cue ?? '',
        triggerHabitId: habit.triggerHabitId ?? '',
        reward: habit.reward ?? '',
        source: habit.source,
        sourceMetricId: habit.sourceRef?.metricId ?? '',
        goalIds: habit.goalIds,
        routineIds: habit.routineIds,
        reminderEnabled: habit.reminders.length > 0,
        reminderTime: habit.reminders[0]?.time ?? '',
      });
    }
  }, [habit, reset, effectiveDate]);

  if (isLoading || !habit) {
    return (
      <Container maxWidth="md" sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const onSubmit = async (values: HabitFormValues) => {
    setIsSubmitting(true);
    try {
      let target: HabitTarget;
      if (values.trackingType === 'binary') {
        target = { type: 'binary' };
      } else if (values.trackingType === 'quantity') {
        target = {
          type: 'quantity',
          targetValue: values.targetValue ?? 20,
          unit: values.unit ?? 'pages',
          customUnitLabel: values.customUnitLabel,
          allowOverachievement: values.allowOverachievement ?? true,
        };
      } else if (values.trackingType === 'duration') {
        target = {
          type: 'duration',
          targetMinutes: values.targetMinutes ?? 30,
          minimumMinutes: values.minimumMinutes,
        };
      } else if (values.trackingType === 'limit') {
        target = {
          type: 'limit',
          maxLimit: values.maxLimit ?? 2,
          unit: values.unit ?? 'times',
          period: values.limitPeriod ?? 'week',
        };
      } else {
        target = {
          type: 'count',
          targetValue: values.targetValue ?? 1,
        };
      }

      await habitService.updateHabit(
        habitId,
        {
          name: values.name,
          description: values.description,
          area: values.area,
          direction: values.direction,
          trackingType: values.trackingType,
          target,
          schedule: {
            frequencyType: values.frequencyType,
            weekdays: values.weekdays,
            timesPerPeriod: values.timesPerPeriod,
            intervalDays: values.intervalDays,
            startDate: values.startDate,
            endDate: values.endDate || undefined,
            effectiveFrom: effectiveDate,
          },
          timeOfDay: values.timeOfDay,
          preferredTime: values.preferredTime || undefined,
          priority: values.priority ?? 'medium',
          motivation: values.motivation || undefined,
          cue: values.cue || undefined,
          reward: values.reward || undefined,
          tags: values.tags || [],
        },
        { effectiveDate },
      );

      router.push(habitRoutes.detail(habitId));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button
            component={NextLink}
            href={habitRoutes.detail(habitId)}
            startIcon={<ArrowBackRoundedIcon />}
          >
            Voltar ao hábito
          </Button>
        </Stack>

        <Stack spacing={0.5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Editar Hábito
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Alterações de frequência e metas passam a valer a partir da data de vigência,
            preservando o histórico anterior.
          </Typography>
        </Stack>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Nome do hábito"
                  {...register('name')}
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Descrição"
                  {...register('description')}
                />

                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 1 }}>Área</FormLabel>
                  <Select
                    value={watch('area')}
                    onChange={(e) => setValue('area', e.target.value as HabitArea)}
                  >
                    {habitAreaDefinitions.map((areaDef) => (
                      <MenuItem key={areaDef.id} value={areaDef.id}>
                        {areaDef.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {watch('trackingType') === 'quantity' && (
                  <TextField
                    fullWidth
                    type="number"
                    label="Alvo numérico"
                    {...register('targetValue', { valueAsNumber: true })}
                  />
                )}

                {watch('trackingType') === 'duration' && (
                  <TextField
                    fullWidth
                    type="number"
                    label="Alvo em minutos"
                    {...register('targetMinutes', { valueAsNumber: true })}
                  />
                )}

                <TextField
                  fullWidth
                  type="date"
                  label="Data de vigência desta alteração"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  helperText="Estatísticas anteriores a esta data continuarão usando a meta da época."
                />

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Motivação"
                  {...register('motivation')}
                />

                <TextField
                  fullWidth
                  label="Gatilho (Depois de...)"
                  {...register('cue')}
                />

                <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 2 }}>
                  <Button component={NextLink} href={habitRoutes.detail(habitId)} color="inherit">
                    Cancelar
                  </Button>
                  <KokyuButton
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={<SaveRoundedIcon />}
                  >
                    Salvar Alterações
                  </KokyuButton>
                </Stack>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
