'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { goalRoutes } from '../../constants/goalRoutes';
import type { GoalTypeOptionDefinition, GoalTypeOptionId } from '../../constants/goalTypeOptions';
import { goalFormDefaultValues, goalSchema, type GoalFormValues } from '../../schemas/goalSchema';
import { goalService } from '../../services/goalService';
import type { Goal, GoalKeyResult, GoalMilestone } from '../../types';
import { toDateKey } from '../../utils/dateHelpers';
import { mapFormValuesToGoalInput, mapGoalToFormValues } from '../../utils/goalFormMapper';
import { AreaStep } from '../GoalFormSteps/AreaStep';
import { DetailsStep } from '../GoalFormSteps/DetailsStep';
import { MeasurementConfigStep } from '../GoalFormSteps/MeasurementConfigStep';
import { MeasurementTypeStep } from '../GoalFormSteps/MeasurementTypeStep';
import { TimelineStep } from '../GoalFormSteps/TimelineStep';
import { TitleStep } from '../GoalFormSteps/TitleStep';
import { TrackingStep } from '../GoalFormSteps/TrackingStep';

type Step =
  'title' | 'area' | 'measurementType' | 'measurementConfig' | 'timeline' | 'tracking' | 'details';

const STEP_ORDER: Step[] = [
  'title',
  'area',
  'measurementType',
  'measurementConfig',
  'timeline',
  'tracking',
  'details',
];
const STEP_VALIDATION_FIELDS: Record<Step, (keyof GoalFormValues)[]> = {
  title: ['title'],
  area: ['area'],
  measurementType: ['type'],
  measurementConfig: ['targetValue'],
  timeline: ['startDate'],
  tracking: ['sourceMetricId'],
  details: [],
};

function inferTypeOptionId(goal?: Goal): GoalTypeOptionId {
  if (!goal) return 'number';
  if (goal.type === 'numeric')
    return goal.measurement.type === 'numeric' && goal.measurement.unit === 'percentage'
      ? 'percentage'
      : 'number';
  if (goal.type === 'binary') return 'completion';
  if (goal.type === 'milestone') return 'steps';
  if (goal.type === 'consistency') return 'consistency';
  if (goal.type === 'average') return 'average';
  return 'keyResult';
}

export interface GoalFormPageProps {
  mode: 'create' | 'edit';
  initialGoal?: Goal;
}

/**
 * Fluxo guiado de criação/edição — etapas locais (`useState<Step>`), não um Stepper do MUI (não
 * existe esse padrão no Kokyu; ver `AddMealDialog` em `features/nutrition`). Um único
 * `useForm<GoalFormValues>` no topo; marcos/resultados-chave ficam fora do schema (arrays livres),
 * combinados no envio via `mapFormValuesToGoalInput`.
 */
export function GoalFormPage({ mode, initialGoal }: GoalFormPageProps) {
  const router = useRouter();
  const { showSuccess } = useSnackbar();
  const [step, setStep] = useState<Step>('title');
  const [selectedTypeOptionId, setSelectedTypeOptionId] = useState<GoalTypeOptionId>(
    inferTypeOptionId(initialGoal),
  );
  const [milestones, setMilestones] = useState<GoalMilestone[]>(initialGoal?.milestones ?? []);
  const [keyResults, setKeyResults] = useState<GoalKeyResult[]>(initialGoal?.keyResults ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: initialGoal
      ? mapGoalToFormValues(initialGoal)
      : { ...goalFormDefaultValues, startDate: toDateKey(new Date()) },
  });

  const type = watch('type');
  const progressMode = watch('progressMode');
  const sourceModule = watch('sourceModule');

  function handleSelectTypeOption(option: GoalTypeOptionDefinition) {
    setSelectedTypeOptionId(option.id);
    setValue('type', option.resultingType);
    if (option.presetUnit) setValue('unit', option.presetUnit);
  }

  async function goNext() {
    const valid = await trigger(STEP_VALIDATION_FIELDS[step]);
    if (!valid) return;
    const index = STEP_ORDER.indexOf(step);
    if (index < STEP_ORDER.length - 1) setStep(STEP_ORDER[index + 1]!);
  }

  function goBack() {
    const index = STEP_ORDER.indexOf(step);
    if (index > 0) setStep(STEP_ORDER[index - 1]!);
  }

  async function onSubmit(values: GoalFormValues) {
    setIsSubmitting(true);
    try {
      const input = mapFormValuesToGoalInput(values, { milestones, keyResults });
      if (mode === 'create') {
        const goal = await goalService.createGoal(input);
        showSuccess('Meta criada.');
        router.push(goalRoutes.detail(goal.id));
      } else if (initialGoal) {
        await goalService.updateGoal(initialGoal.id, input);
        showSuccess('Meta atualizada.');
        router.push(goalRoutes.detail(initialGoal.id));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepIndex = STEP_ORDER.indexOf(step);
  const isLastStep = step === 'details';

  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ maxWidth: 640 }}
    >
      <Stack spacing={0.5}>
        <Typography variant="displaySmall" component="h1">
          {mode === 'create' ? 'Nova meta' : 'Editar meta'}
        </Typography>
        <Typography
          variant="body2"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Etapa {stepIndex + 1} de {STEP_ORDER.length}
        </Typography>
      </Stack>

      {step === 'title' ? <TitleStep register={register} errors={errors} /> : null}
      {step === 'area' ? <AreaStep control={control} /> : null}
      {step === 'measurementType' ? (
        <MeasurementTypeStep selectedId={selectedTypeOptionId} onSelect={handleSelectTypeOption} />
      ) : null}
      {step === 'measurementConfig' ? (
        <MeasurementConfigStep
          type={type}
          control={control}
          register={register}
          milestones={milestones}
          onMilestonesChange={setMilestones}
          keyResults={keyResults}
          onKeyResultsChange={setKeyResults}
        />
      ) : null}
      {step === 'timeline' ? <TimelineStep control={control} /> : null}
      {step === 'tracking' ? (
        <TrackingStep
          control={control}
          progressMode={progressMode}
          sourceModule={sourceModule}
          setValue={setValue}
        />
      ) : null}
      {step === 'details' ? (
        <DetailsStep control={control} register={register} watch={watch} />
      ) : null}

      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between' }}>
        <KokyuButton variant="text" onClick={goBack} disabled={stepIndex === 0}>
          Voltar
        </KokyuButton>
        {!isLastStep ? (
          <KokyuButton variant="contained" onClick={goNext}>
            Continuar
          </KokyuButton>
        ) : (
          <KokyuButton type="submit" variant="contained" loading={isSubmitting}>
            {mode === 'create' ? 'Criar meta' : 'Salvar alterações'}
          </KokyuButton>
        )}
      </Stack>
    </Stack>
  );
}
