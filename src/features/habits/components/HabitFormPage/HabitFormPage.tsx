'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { KokyuButton } from '@/design-system/components';
import { habitTemplates } from '../../constants/habitTemplates';
import { habitRoutes } from '../../constants/habitRoutes';
import {
  habitFormDefaultValues,
  habitSchema,
  type HabitFormValues,
} from '../../schemas/habitSchema';
import { habitService, type HabitInput } from '../../services/habitService';
import type { HabitTarget } from '../../types/habit.types';
import {
  Step1Identification,
  Step2Direction,
  Step3TrackingType,
  Step4TargetConfig,
  Step5Schedule,
  Step6TimeOfDay,
  Step7Reminders,
  Step8Integration,
  Step9Motivation,
  Step10GoalConnection,
} from '../HabitFormSteps/HabitFormSteps';

const TOTAL_STEPS = 10;

export function HabitFormPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: habitFormDefaultValues,
    mode: 'onChange',
  });

  const { handleSubmit, reset } = form;

  const applyTemplate = (templateId: string) => {
    const tmpl = habitTemplates.find((t) => t.id === templateId);
    if (!tmpl) return;

    reset({
      ...habitFormDefaultValues,
      name: tmpl.name,
      description: tmpl.description,
      area: tmpl.area,
      direction: tmpl.direction,
      trackingType: tmpl.trackingType,
      frequencyType: tmpl.frequencyType,
      timeOfDay: tmpl.timeOfDay,
      targetValue: 'targetValue' in tmpl.target ? tmpl.target.targetValue : 1,
      targetMinutes: 'targetMinutes' in tmpl.target ? tmpl.target.targetMinutes : 30,
      maxLimit: 'maxLimit' in tmpl.target ? tmpl.target.maxLimit : 2,
      unit: 'unit' in tmpl.target ? tmpl.target.unit : 'times',
      cue: tmpl.cue ?? '',
      motivation: tmpl.motivation ?? '',
      tags: tmpl.tags,
    });
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

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
          timerPresets: [5, 10, 15, 25, 30, 45],
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

      const input: HabitInput = {
        name: values.name,
        description: values.description,
        area: values.area,
        direction: values.direction,
        trackingType: values.trackingType,
        status: 'active',
        target,
        schedule: {
          frequencyType: values.frequencyType,
          weekdays: values.weekdays,
          timesPerPeriod: values.timesPerPeriod,
          intervalDays: values.intervalDays,
          startDate: values.startDate,
          endDate: values.endDate || undefined,
          effectiveFrom: values.startDate,
        },
        reminders: values.reminderEnabled && values.reminderTime
          ? [{ id: 'rem-1', time: values.reminderTime, enabled: true }]
          : [],
        timeOfDay: values.timeOfDay,
        preferredTime: values.preferredTime || undefined,
        priority: values.priority ?? 'medium',
        icon: values.icon || 'CheckCircleRounded',
        tags: values.tags || [],
        motivation: values.motivation || undefined,
        cue: values.cue || undefined,
        triggerHabitId: values.triggerHabitId || undefined,
        reward: values.reward || undefined,
        source: values.source,
        sourceRef: values.source !== 'manual' && values.sourceMetricId
          ? { module: values.source, metricId: values.sourceMetricId, autoLog: true }
          : undefined,
        goalIds: values.goalIds || [],
        routineIds: values.routineIds || [],
        startDate: values.startDate,
        endDate: values.endDate || undefined,
      };

      const created = await habitService.createHabit(input);
      router.push(habitRoutes.detail(created.id));
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = Math.round((currentStep / TOTAL_STEPS) * 100);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Novo Hábito
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Construa consistência no seu ritmo com um fluxo simples passo a passo.
          </Typography>
        </Stack>

        {currentStep === 1 && (
          <Stack spacing={1}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Ou escolha um modelo pronto:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {habitTemplates.slice(0, 5).map((tmpl) => (
                <Chip
                  key={tmpl.id}
                  label={tmpl.name}
                  clickable
                  onClick={() => applyTemplate(tmpl.id)}
                  size="small"
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Stack>
        )}

        <Stack spacing={1}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Etapa {currentStep} de {TOTAL_STEPS}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {progressPercent}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            aria-label={`Progresso da criação: ${progressPercent}%`}
            sx={{ borderRadius: 1, height: 6 }}
          />
        </Stack>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {currentStep === 1 && <Step1Identification form={form} />}
              {currentStep === 2 && <Step2Direction form={form} />}
              {currentStep === 3 && <Step3TrackingType form={form} />}
              {currentStep === 4 && <Step4TargetConfig form={form} />}
              {currentStep === 5 && <Step5Schedule form={form} />}
              {currentStep === 6 && <Step6TimeOfDay form={form} />}
              {currentStep === 7 && <Step7Reminders form={form} />}
              {currentStep === 8 && <Step8Integration form={form} />}
              {currentStep === 9 && <Step9Motivation form={form} />}
              {currentStep === 10 && <Step10GoalConnection form={form} />}

              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pt: 4,
                  mt: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isSubmitting}
                  startIcon={<ArrowBackRoundedIcon />}
                >
                  Voltar
                </Button>

                {currentStep < TOTAL_STEPS ? (
                  <KokyuButton
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardRoundedIcon />}
                  >
                    Continuar
                  </KokyuButton>
                ) : (
                  <KokyuButton
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={<CheckRoundedIcon />}
                  >
                    Criar Hábito
                  </KokyuButton>
                )}
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
