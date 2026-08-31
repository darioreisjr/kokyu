'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { KokyuButton } from '@/design-system/components';
import {
  habitReviewSchema,
  type HabitReviewFormValues,
} from '../../schemas/reviewSchema';
import { habitService } from '../../services/habitService';

export interface HabitReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function HabitReviewDialog({ open, onClose, onSuccess }: HabitReviewDialogProps) {
  const today = new Date().toISOString().split('T')[0]!;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HabitReviewFormValues>({
    resolver: zodResolver(habitReviewSchema),
    defaultValues: {
      type: 'weekly',
      periodStart: today,
      periodEnd: today,
      whatWorked: '',
      whatWasHard: '',
      changesPlanned: '',
      notes: '',
    },
  });

  const { register, handleSubmit, setValue, watch } = form;

  const onSubmit = async (values: HabitReviewFormValues) => {
    setIsSubmitting(true);
    try {
      await habitService.createHabitReview({
        type: values.type,
        periodStart: values.periodStart,
        periodEnd: values.periodEnd,
        reflections: {
          whatWorked: values.whatWorked,
          whatWasHard: values.whatWasHard,
          changesPlanned: values.changesPlanned,
          notes: values.notes,
        },
        adjustmentsMade: [],
      });
      onSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="review-dialog-title">
      <DialogTitle id="review-dialog-title">
        <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
          Nova Revisão Periódica
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Tipo de período</FormLabel>
              <Select
                value={watch('type')}
                onChange={(e) => setValue('type', e.target.value as 'weekly' | 'monthly')}
              >
                <MenuItem value="weekly">Semanal</MenuItem>
                <MenuItem value="monthly">Mensal</MenuItem>
              </Select>
            </FormControl>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="date"
                label="Início do período"
                {...register('periodStart')}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                type="date"
                label="Fim do período"
                {...register('periodEnd')}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>

            <TextField
              fullWidth
              multiline
              rows={2}
              label="O que funcionou muito bem?"
              placeholder="Ex: A leitura antes de dormir foi impecável..."
              {...register('whatWorked')}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="O que foi difícil ou precisa de ajuste?"
              placeholder="Ex: Treinos na sexta à tarde ficaram difíceis..."
              {...register('whatWasHard')}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Mudanças planejadas para o próximo ciclo"
              placeholder="Ex: Mudar treino para sábado de manhã..."
              {...register('changesPlanned')}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notas gerais (opcional)"
              placeholder="Outras percepções..."
              {...register('notes')}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
            Cancelar
          </Button>
          <KokyuButton type="submit" variant="contained" disabled={isSubmitting}>
            Salvar Revisão
          </KokyuButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
