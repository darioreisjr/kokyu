'use client';

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { dayTemplateService } from '@/shared/scheduling/services/dayTemplateService';
import type { DayTemplate } from '@/shared/scheduling/types';
import { dailyRhythmService } from '../../services/dailyRhythmService';

export function RoutinesView() {
  const [templates, setTemplates] = useState<DayTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DayTemplate | null>(null);
  const [targetDate, setTargetDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    dayTemplateService.getTemplates().then(setTemplates);
  }, []);

  const handleOpenApply = (template: DayTemplate) => {
    setSelectedTemplate(template);
    setApplyDialogOpen(true);
  };

  const handleApply = async () => {
    if (!selectedTemplate) return;
    setIsApplying(true);
    try {
      const entries = dayTemplateService.convertTemplateToEntries(selectedTemplate, targetDate);
      for (const entry of entries) {
        await dailyRhythmService.createScheduleEntry(entry);
      }
      setApplyDialogOpen(false);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 960, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
        Rotinas e Modelos de Dia
      </Typography>
      <Typography
        variant="body2"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, mb: 4 })}
      >
        Estruture modelos para dias típicos (trabalho presencial, home office, fim de semana) e aplique com um clique.
      </Typography>

      <Grid container spacing={3}>
        {templates.map((tpl) => (
          <Grid size={{ xs: 12, md: 4 }} key={tpl.id}>
            <Box
              sx={(theme) => ({
                p: 2.5,
                borderRadius: 2,
                backgroundColor: themePalette(theme).kokyu.surface.primary,
                border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              })}
            >
              <Box>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {tpl.name}
                  </Typography>
                  <Chip
                    label={tpl.context || 'geral'}
                    size="small"
                    sx={{ textTransform: 'capitalize', height: 20 }}
                  />
                </Stack>

                <Typography
                  variant="caption"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, mb: 2, display: 'block' })}
                >
                  {tpl.description}
                </Typography>

                <Stack spacing={1} sx={{ mb: 2 }}>
                  {tpl.items.map((item) => (
                    <Box
                      key={item.id}
                      sx={(theme) => ({
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: themePalette(theme).kokyu.background.subtle,
                        fontSize: '0.75rem',
                      })}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                        {item.startAt ? `${item.startAt} - ` : ''}
                        {item.title}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<PlayArrowRoundedIcon />}
                onClick={() => handleOpenApply(tpl)}
                sx={{ textTransform: 'none', mt: 2 }}
              >
                Aplicar Modelo
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Apply Dialog */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Aplicar &quot;{selectedTemplate?.name}&quot;
        </DialogTitle>
        <DialogContent>
          <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
            Escolha a data em que deseja aplicar este modelo. Compromissos já existentes nesta data serão preservados.
          </Typography>
          <TextField
            type="date"
            label="Data de aplicação"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" disabled={isApplying} onClick={handleApply}>
            {isApplying ? 'Aplicando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

