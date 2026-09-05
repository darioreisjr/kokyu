'use client';

import { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { missionAreaDefinitions } from '../../constants/missionAreas';
import { missionDurationPresets } from '../../constants/missionDurationPresets';
import { missionPriorityDefinitions } from '../../constants/missionPriorities';
import { missionFormDefaultValues, missionSchema, type MissionFormValues } from '../../schemas/missionSchema';
import type { MissionProject } from '../../types';

export interface MissionFormProps {
  defaultValues?: Partial<MissionFormValues>;
  projects: MissionProject[];
  onSubmit: (values: MissionFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}

/**
 * "Criação completa" (spec): title/description/project/planned/deadline/priority/duration are
 * always visible; everything else sits behind one "Avançado" accordion (spec "PROGRESSIVE
 * DISCLOSURE OBRIGATÓRIO") — never a multi-step wizard like `HabitFormPage`'s, which the spec
 * explicitly doesn't ask for here.
 */
export function MissionForm({ defaultValues, projects, onSubmit, onCancel, submitLabel = 'Salvar missão' }: MissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, watch } = useForm<MissionFormValues>({
    resolver: zodResolver(missionSchema),
    defaultValues: { ...missionFormDefaultValues, ...defaultValues },
    mode: 'onChange',
  });

  const splittable = watch('splittable');

  async function submit(values: MissionFormValues) {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack component="form" spacing={3} onSubmit={handleSubmit(submit)}>
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <KokyuTextField {...field} label="Título" required error={!!fieldState.error} helperText={fieldState.error?.message} />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => <KokyuTextField {...field} label="Descrição" multiline minRows={2} />}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Controller
          control={control}
          name="projectId"
          render={({ field }) => (
            <KokyuTextField {...field} select label="Projeto" sx={{ flex: 1 }} value={field.value ?? ''}>
              <MenuItem value="">Sem projeto</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </KokyuTextField>
          )}
        />

        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <KokyuTextField {...field} select label="Prioridade" sx={{ flex: 1 }} value={field.value ?? 'none'}>
              {missionPriorityDefinitions.map((definition) => (
                <MenuItem key={definition.id} value={definition.id}>
                  {definition.label}
                </MenuItem>
              ))}
            </KokyuTextField>
          )}
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Controller
          control={control}
          name="plannedDate"
          render={({ field }) => (
            <KokyuTextField {...field} type="date" label="Planejar para" sx={{ flex: 1 }} slotProps={{ inputLabel: { shrink: true } }} />
          )}
        />
        <Controller
          control={control}
          name="deadline"
          render={({ field }) => (
            <KokyuTextField {...field} type="date" label="Prazo (deadline)" sx={{ flex: 1 }} slotProps={{ inputLabel: { shrink: true } }} />
          )}
        />
        <Controller
          control={control}
          name="estimatedDuration"
          render={({ field }) => (
            <KokyuTextField
              {...field}
              select
              label="Duração estimada"
              sx={{ flex: 1 }}
              value={field.value ?? ''}
              onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : undefined)}
            >
              <MenuItem value="">Sem estimativa</MenuItem>
              {missionDurationPresets.map((preset) => (
                <MenuItem key={preset.minutes} value={preset.minutes}>
                  {preset.label}
                </MenuItem>
              ))}
            </KokyuTextField>
          )}
        />
      </Stack>

      <Accordion disableGutters variant="outlined" sx={{ borderRadius: 2, '&::before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
          <Typography variant="subtitle2">Avançado</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Controller
              control={control}
              name="availableFrom"
              render={({ field }) => (
                <KokyuTextField {...field} type="date" label="Disponível a partir de" slotProps={{ inputLabel: { shrink: true } }} />
              )}
            />

            <Controller
              control={control}
              name="areaId"
              render={({ field }) => (
                <KokyuTextField {...field} select label="Área" value={field.value ?? ''}>
                  <MenuItem value="">Sem área</MenuItem>
                  {missionAreaDefinitions.map((definition) => (
                    <MenuItem key={definition.id} value={definition.id}>
                      {definition.label}
                    </MenuItem>
                  ))}
                </KokyuTextField>
              )}
            />

            <Controller
              control={control}
              name="energyRequirement"
              render={({ field }) => (
                <KokyuTextField {...field} select label="Energia necessária" value={field.value ?? ''}>
                  <MenuItem value="">Não especificado</MenuItem>
                  <MenuItem value="low">Baixa</MenuItem>
                  <MenuItem value="medium">Média</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                </KokyuTextField>
              )}
            />

            <Controller
              control={control}
              name="splittable"
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value ?? false} onChange={(event) => field.onChange(event.target.checked)} />}
                  label="Pode ser dividida em partes menores"
                />
              )}
            />

            {splittable && (
              <Controller
                control={control}
                name="minimumChunkDuration"
                render={({ field }) => (
                  <KokyuTextField
                    {...field}
                    type="number"
                    label="Duração mínima por parte (min)"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : undefined)}
                  />
                )}
              />
            )}

            <Controller
              control={control}
              name="waitingFor"
              render={({ field }) => <KokyuTextField {...field} label="Aguardando (o quê/de quem)" />}
            />

            <Controller
              control={control}
              name="followUpAt"
              render={({ field }) => (
                <KokyuTextField {...field} type="date" label="Follow-up em" slotProps={{ inputLabel: { shrink: true } }} />
              )}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        {onCancel && (
          <KokyuButton variant="outlined" onClick={onCancel} type="button">
            Cancelar
          </KokyuButton>
        )}
        <KokyuButton type="submit" variant="contained" disabled={isSubmitting}>
          {submitLabel}
        </KokyuButton>
      </Stack>
    </Stack>
  );
}
