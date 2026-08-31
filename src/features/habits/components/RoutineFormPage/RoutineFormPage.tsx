'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
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
import { habitRoutes } from '../../constants/habitRoutes';
import { useHabits } from '../../hooks/useHabits';
import {
  routineFormDefaultValues,
  routineSchema,
  type RoutineFormValues,
} from '../../schemas/routineSchema';
import { habitService } from '../../services/habitService';

export function RoutineFormPage() {
  const router = useRouter();
  const { habits } = useHabits();
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RoutineFormValues>({
    resolver: zodResolver(routineSchema),
    defaultValues: routineFormDefaultValues,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  const toggleHabit = (id: string) => {
    const next = selectedHabitIds.includes(id)
      ? selectedHabitIds.filter((hId) => hId !== id)
      : [...selectedHabitIds, id];
    setSelectedHabitIds(next);
    setValue('habitIds', next);
  };

  const onSubmit = async (values: RoutineFormValues) => {
    setIsSubmitting(true);
    try {
      await habitService.createRoutine({
        name: values.name,
        description: values.description,
        timeOfDay: values.timeOfDay,
        preferredTime: values.preferredTime || undefined,
        estimatedDurationMinutes: values.estimatedDurationMinutes,
        habitIds: selectedHabitIds,
        items: selectedHabitIds.map((hId, index) => ({
          routineId: '',
          habitId: hId,
          order: index,
        })),
        active: true,
      });

      router.push(habitRoutes.routines);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Button
          component={NextLink}
          href={habitRoutes.routines}
          startIcon={<ArrowBackRoundedIcon />}
        >
          Voltar para rotinas
        </Button>

        <Stack spacing={0.5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Nova Rotina
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Crie blocos encadeados de hábitos para executar em sequência (Habit Stacking).
          </Typography>
        </Stack>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Nome da rotina"
                  placeholder="Ex: Rotina Matinal de Alta Performance"
                  {...register('name')}
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Descrição (opcional)"
                  placeholder="Intenção ou foco desta rotina..."
                  {...register('description')}
                />

                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 1 }}>Período do dia</FormLabel>
                  <Select
                    value={watch('timeOfDay')}
                    onChange={(e) =>
                      setValue('timeOfDay', e.target.value as 'morning' | 'afternoon' | 'evening' | 'anytime')
                    }
                  >
                    <MenuItem value="morning">Manhã</MenuItem>
                    <MenuItem value="afternoon">Tarde</MenuItem>
                    <MenuItem value="evening">Noite</MenuItem>
                    <MenuItem value="anytime">Qualquer horário</MenuItem>
                  </Select>
                </FormControl>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Horário de preferência"
                    placeholder="Ex: 07:00"
                    {...register('preferredTime')}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Duração estimada (minutos)"
                    placeholder="Ex: 30"
                    {...register('estimatedDurationMinutes', { valueAsNumber: true })}
                  />
                </Stack>

                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Selecione os hábitos desta rotina:</Typography>
                  {errors.habitIds && (
                    <Typography variant="caption" color="error">
                      {errors.habitIds.message}
                    </Typography>
                  )}

                  <Stack spacing={1}>
                    {habits.map((habit) => {
                      const isChecked = selectedHabitIds.includes(habit.id);
                      return (
                        <Box
                          key={habit.id}
                          onClick={() => toggleHabit(habit.id)}
                          sx={() => ({
                            p: 1.5,
                            borderRadius: 2,
                            border: 1,
                            borderColor: isChecked ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                          })}
                        >
                          <Checkbox checked={isChecked} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{habit.name}</Typography>
                            {habit.description && (
                              <Typography variant="body2" color="text.secondary">
                                {habit.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 2 }}>
                  <Button component={NextLink} href={habitRoutes.routines} color="inherit">
                    Cancelar
                  </Button>
                  <KokyuButton
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || selectedHabitIds.length === 0}
                    startIcon={<SaveRoundedIcon />}
                  >
                    Salvar Rotina
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
