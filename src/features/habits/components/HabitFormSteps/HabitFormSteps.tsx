'use client';

import type { ComponentType } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import type { UseFormReturn } from 'react-hook-form';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { habitAreaDefinitions } from '../../constants/habitAreas';
import type { HabitFormValues } from '../../schemas/habitSchema';
import type {
  HabitArea,
  HabitDirection,
  HabitProgressSource,
  HabitTimeOfDay,
  HabitTrackingType,
  HabitUnit,
} from '../../types/habit.types';
import type { HabitFrequencyType } from '../../types/schedule.types';

export interface StepProps {
  form: UseFormReturn<HabitFormValues>;
}

export function Step1Identification({ form }: StepProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const currentArea = watch('area');

  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
        O que você quer tornar consistente?
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Dê um nome claro para o hábito e escolha em qual área da sua vida ele se encaixa.
      </Typography>

      <TextField
        fullWidth
        label="Nome do hábito"
        placeholder="Ex: Ler 20 páginas, Treinar musculação..."
        {...register('name')}
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
      />

      <TextField
        fullWidth
        multiline
        rows={2}
        label="Descrição (opcional)"
        placeholder="Detalhes ou intenção deste hábito..."
        {...register('description')}
      />

      <FormControl fullWidth>
        <FormLabel sx={{ mb: 1 }}>Área do Kokyu</FormLabel>
        <Select
          value={currentArea}
          onChange={(e) => setValue('area', e.target.value as HabitArea)}
        >
          {habitAreaDefinitions.map((areaDef) => (
            <MenuItem key={areaDef.id} value={areaDef.id}>
              {areaDef.label} — {areaDef.description}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

export function Step2Direction({ form }: StepProps) {
  const { watch, setValue } = form;
  const currentDirection = watch('direction');

  const options: { id: HabitDirection; title: string; desc: string; icon: ComponentType<SvgIconProps> }[] = [
    {
      id: 'build',
      title: 'Construir',
      desc: 'Comportamento que você deseja repetir ou aumentar a frequência.',
      icon: CheckCircleRoundedIcon,
    },
    {
      id: 'reduce',
      title: 'Reduzir',
      desc: 'Comportamento que você deseja diminuir ou manter dentro de um limite máximo.',
      icon: TrendingDownRoundedIcon,
    },
    {
      id: 'observe',
      title: 'Acompanhar',
      desc: 'Comportamento que você quer apenas registrar sem meta de certo ou errado.',
      icon: VisibilityRoundedIcon,
    },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
        O que você quer fazer com este hábito?
      </Typography>

      <Stack spacing={2}>
        {options.map((opt) => {
          const isSelected = currentDirection === opt.id;
          const Icon = opt.icon;
          return (
            <Card
              key={opt.id}
              variant="outlined"
              onClick={() => setValue('direction', opt.id)}
              sx={(theme) => ({
                cursor: 'pointer',
                p: 1,
                borderRadius: 2.5,
                borderColor: isSelected
                  ? themePalette(theme).kokyu.action.primary
                  : themePalette(theme).kokyu.border.default,
                backgroundColor: isSelected
                  ? themePalette(theme).kokyu.surface.secondary
                  : themePalette(theme).kokyu.background.paper,
                '&:hover': {
                  borderColor: themePalette(theme).kokyu.border.strong,
                },
              })}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Radio checked={isSelected} value={opt.id} />
                <Icon sx={(theme) => ({ color: themePalette(theme).kokyu.action.primary })} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{opt.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {opt.desc}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
}

export function Step3TrackingType({ form }: StepProps) {
  const { watch, setValue } = form;
  const currentTracking = watch('trackingType');

  const options: { id: HabitTrackingType; title: string; desc: string }[] = [
    { id: 'binary', title: 'Concluir (Sim / Não)', desc: 'Basta marcar como feito ou não feito.' },
    { id: 'quantity', title: 'Quantidade', desc: 'Meta com número e unidade (ex: 20 páginas, 2L de água).' },
    { id: 'duration', title: 'Duração / Tempo', desc: 'Acompanhar em minutos com timer integrado (ex: 30 min).' },
    { id: 'count', title: 'Contagem de vezes', desc: 'Quantas vezes aconteceu no dia (ex: 4 copos, 3 sessões).' },
    { id: 'limit', title: 'Limite Máximo', desc: 'Permanecer abaixo de um teto (ex: máx. 2x por semana).' },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
        Como você quer acompanhar?
      </Typography>

      <Stack spacing={2}>
        {options.map((opt) => {
          const isSelected = currentTracking === opt.id;
          return (
            <Card
              key={opt.id}
              variant="outlined"
              onClick={() => setValue('trackingType', opt.id)}
              sx={(theme) => ({
                cursor: 'pointer',
                borderRadius: 2.5,
                borderColor: isSelected
                  ? themePalette(theme).kokyu.action.primary
                  : themePalette(theme).kokyu.border.default,
                backgroundColor: isSelected
                  ? themePalette(theme).kokyu.surface.secondary
                  : themePalette(theme).kokyu.background.paper,
              })}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Radio checked={isSelected} value={opt.id} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{opt.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {opt.desc}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
}

export function Step4TargetConfig({ form }: StepProps) {
  const { register, watch, setValue } = form;
  const trackingType = watch('trackingType');

  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
        Configurar Alvo
      </Typography>

      {trackingType === 'binary' && (
        <Typography variant="body2" color="text.secondary">
          Este hábito será concluído com uma simples confirmação diária.
        </Typography>
      )}

      {(trackingType === 'quantity' || trackingType === 'count') && (
        <Stack spacing={2}>
          <TextField
            fullWidth
            type="number"
            label="Meta numérica"
            placeholder="Ex: 20"
            {...register('targetValue', { valueAsNumber: true })}
          />

          <FormControl fullWidth>
            <FormLabel sx={{ mb: 1 }}>Unidade</FormLabel>
            <Select
              value={watch('unit') ?? 'units'}
              onChange={(e) => setValue('unit', e.target.value as HabitUnit)}
            >
              <MenuItem value="pages">Páginas</MenuItem>
              <MenuItem value="times">Vezes</MenuItem>
              <MenuItem value="cups">Copos</MenuItem>
              <MenuItem value="minutes">Minutos</MenuItem>
              <MenuItem value="hours">Horas</MenuItem>
              <MenuItem value="km">Km</MenuItem>
              <MenuItem value="units">Unidades</MenuItem>
              <MenuItem value="custom">Personalizado</MenuItem>
            </Select>
          </FormControl>

          {watch('unit') === 'custom' && (
            <TextField
              fullWidth
              label="Nome da unidade personalizada"
              placeholder="Ex: capítulos, séries, aulas"
              {...register('customUnitLabel')}
            />
          )}

          <FormControlLabel
            control={
              <Switch
                checked={watch('allowOverachievement') ?? true}
                onChange={(e) => setValue('allowOverachievement', e.target.checked)}
              />
            }
            label="Permitir ultrapassar a meta (ex: 25/20 páginas)"
          />
        </Stack>
      )}

      {trackingType === 'duration' && (
        <Stack spacing={2}>
          <TextField
            fullWidth
            type="number"
            label="Meta em minutos"
            placeholder="Ex: 30"
            {...register('targetMinutes', { valueAsNumber: true })}
          />
          <TextField
            fullWidth
            type="number"
            label="Duração mínima (opcional)"
            placeholder="Ex: 15"
            {...register('minimumMinutes', { valueAsNumber: true })}
          />
        </Stack>
      )}

      {trackingType === 'limit' && (
        <Stack spacing={2}>
          <TextField
            fullWidth
            type="number"
            label="Limite máximo"
            placeholder="Ex: 2"
            {...register('maxLimit', { valueAsNumber: true })}
          />
          <FormControl fullWidth>
            <FormLabel sx={{ mb: 1 }}>Por período</FormLabel>
            <Select
              value={watch('limitPeriod') ?? 'week'}
              onChange={(e) => setValue('limitPeriod', e.target.value as 'day' | 'week' | 'month')}
            >
              <MenuItem value="day">Por dia</MenuItem>
              <MenuItem value="week">Por semana</MenuItem>
              <MenuItem value="month">Por mês</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      )}
    </Stack>
  );
}

export function Step5Schedule({ form }: StepProps) {
  const { register, watch, setValue } = form;
  const frequencyType = watch('frequencyType');
  const weekdays = watch('weekdays') ?? [];

  const toggleWeekday = (day: number) => {
    const next = weekdays.includes(day)
      ? weekdays.filter((d) => d !== day)
      : [...weekdays, day];
    setValue('weekdays', next);
  };

  const dayLabels = [
    { d: 1, l: 'Seg' },
    { d: 2, l: 'Ter' },
    { d: 3, l: 'Qua' },
    { d: 4, l: 'Qui' },
    { d: 5, l: 'Sex' },
    { d: 6, l: 'Sáb' },
    { d: 0, l: 'Dom' },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
        Com que frequência?
      </Typography>

      <FormControl fullWidth>
        <FormLabel sx={{ mb: 1 }}>Frequência</FormLabel>
        <Select
          value={frequencyType}
          onChange={(e) => setValue('frequencyType', e.target.value as HabitFrequencyType)}
        >
          <MenuItem value="daily">Todos os dias</MenuItem>
          <MenuItem value="specificDays">Dias específicos da semana</MenuItem>
          <MenuItem value="flexibleWeekly">X vezes por semana (flexível)</MenuItem>
          <MenuItem value="flexibleMonthly">X vezes por mês (flexível)</MenuItem>
          <MenuItem value="interval">Em intervalos (a cada N dias)</MenuItem>
          <MenuItem value="weekdays">Dias úteis (Seg a Sex)</MenuItem>
          <MenuItem value="weekends">Fins de semana (Sáb e Dom)</MenuItem>
        </Select>
      </FormControl>

      {frequencyType === 'specificDays' && (
        <Stack spacing={1}>
          <FormLabel>Selecione os dias da semana:</FormLabel>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {dayLabels.map(({ d, l }) => {
              const isSelected = weekdays.includes(d);
              return (
                <Chip
                  key={d}
                  label={l}
                  clickable
                  color={isSelected ? 'primary' : 'default'}
                  onClick={() => toggleWeekday(d)}
                />
              );
            })}
          </Stack>
        </Stack>
      )}

      {frequencyType === 'flexibleWeekly' && (
        <TextField
          fullWidth
          type="number"
          label="Quantas vezes por semana?"
          placeholder="Ex: 3"
          {...register('timesPerPeriod', { valueAsNumber: true })}
          helperText="Qualquer combinação de 3 dias na semana satisfará o hábito."
        />
      )}

      {frequencyType === 'flexibleMonthly' && (
        <TextField
          fullWidth
          type="number"
          label="Quantas vezes por mês?"
          placeholder="Ex: 10"
          {...register('timesPerPeriod', { valueAsNumber: true })}
        />
      )}

      {frequencyType === 'interval' && (
        <TextField
          fullWidth
          type="number"
          label="Repetir a cada quantos dias?"
          placeholder="Ex: 2 (dia sim, dia não)"
          {...register('intervalDays', { valueAsNumber: true })}
        />
      )}
    </Stack>
  );
}

export function Step6TimeOfDay({ form }: StepProps) {
  const { register, watch, setValue } = form;
  const timeOfDay = watch('timeOfDay');

  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
        Quando isso se encaixa melhor no seu dia?
      </Typography>

      <RadioGroup
        value={timeOfDay}
        onChange={(e) => setValue('timeOfDay', e.target.value as HabitTimeOfDay)}
      >
        <FormControlLabel value="morning" control={<Radio />} label="Manhã" />
        <FormControlLabel value="afternoon" control={<Radio />} label="Tarde" />
        <FormControlLabel value="evening" control={<Radio />} label="Noite" />
        <FormControlLabel value="anytime" control={<Radio />} label="Qualquer horário" />
        <FormControlLabel value="specific" control={<Radio />} label="Horário específico" />
      </RadioGroup>

      <TextField
        fullWidth
        label="Horário de preferência (opcional)"
        placeholder="Ex: 07:30"
        {...register('preferredTime')}
      />
    </Stack>
  );
}

export function Step7Reminders({ form }: StepProps) {
  const { register, watch, setValue } = form;

  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
        Lembretes
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Configure notificações para ajudar na consistência deste hábito.
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={watch('reminderEnabled') ?? false}
            onChange={(e) => setValue('reminderEnabled', e.target.checked)}
          />
        }
        label="Ativar lembrete inteligente"
      />

      {watch('reminderEnabled') && (
        <TextField
          fullWidth
          type="time"
          label="Horário do lembrete"
          {...register('reminderTime')}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      )}
    </Stack>
  );
}

export function Step8Integration({ form }: StepProps) {
  const { watch, setValue } = form;
  const source = watch('source');

  const sources = [
    { id: 'manual', label: 'Manual (Acompanhado por você no Kokyu)', icon: CheckCircleRoundedIcon },
    { id: 'training', label: 'Treinamento (Atualizado quando registrar treinos)', icon: FitnessCenterRoundedIcon },
    { id: 'nutrition', label: 'Nutrição (Atualizado pelo planejamento e água)', icon: RestaurantRoundedIcon },
    { id: 'leisure', label: 'Tempo Livre (Atualizado por sessões de leitura)', icon: MenuBookRoundedIcon },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
        O Kokyu pode acompanhar isso automaticamente?
      </Typography>

      <Stack spacing={2}>
        {sources.map((s) => {
          const isSelected = source === s.id;
          const Icon = s.icon;
          return (
            <Card
              key={s.id}
              variant="outlined"
              onClick={() => setValue('source', s.id as HabitProgressSource)}
              sx={(theme) => ({
                cursor: 'pointer',
                borderRadius: 2.5,
                borderColor: isSelected
                  ? themePalette(theme).kokyu.action.primary
                  : themePalette(theme).kokyu.border.default,
                backgroundColor: isSelected
                  ? themePalette(theme).kokyu.surface.secondary
                  : themePalette(theme).kokyu.background.paper,
              })}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Radio checked={isSelected} value={s.id} />
                <Icon sx={(theme) => ({ color: themePalette(theme).kokyu.action.primary })} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{s.label}</Typography>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
}

export function Step9Motivation({ form }: StepProps) {
  const { register } = form;

  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
        Contexto e Habit Stacking
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={2}
        label="Por que esse hábito é importante para você? (opcional)"
        placeholder="Sua motivação central para este hábito..."
        {...register('motivation')}
      />

      <TextField
        fullWidth
        label="Gatilho / Depois de... (Habit Stacking opcional)"
        placeholder="Ex: Depois de tomar o primeiro café da manhã..."
        {...register('cue')}
        helperText="Vincule este hábito a uma ação que você já realiza no dia a dia."
      />

      <TextField
        fullWidth
        label="Recompensa (opcional)"
        placeholder="Ex: 5 minutos de pausa com café gostoso..."
        {...register('reward')}
      />
    </Stack>
  );
}

export function Step10GoalConnection({ form }: StepProps) {
  void form;
  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
        Conexão com Metas
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Hábitos conectados a Metas alimentam o progresso automaticamente no Kokyu.
      </Typography>

      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="body2">
          Você poderá vincular este hábito a qualquer uma de suas Metas a qualquer momento pelo
          painel de detalhes.
        </Typography>
      </Card>
    </Stack>
  );
}
