'use client';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { fromDateKey } from '@/features/leisure/utils/dateHelpers';
import { themePalette } from '@/design-system/theme/useThemePalette';
import type { ScheduleEntry } from '@/shared/scheduling/types';
import { useDailyPlanning } from '../../hooks/useDailyPlanning';

export interface DailyPlanningDialogProps {
  open: boolean;
  onClose: () => void;
  targetDate: string;
  onPlanApplied?: () => void;
}

const STEPS = ['Definir Prioridades', 'Ajustar Alocações', 'Confirmar Plano'];

export function DailyPlanningDialog({
  open,
  onClose,
  targetDate,
  onPlanApplied,
}: DailyPlanningDialogProps) {
  const {
    activeStep,
    priorities,
    unscheduledCandidates,
    planPreview,
    isLoading,
    isApplying,
    addPriority,
    removePriority,
    generatePlan,
    applyPlan,
    nextStep,
    prevStep,
  } = useDailyPlanning(targetDate);

  const handleFinish = async () => {
    await applyPlan();
    onPlanApplied?.();
    onClose();
  };

  const formattedDate = format(fromDateKey(targetDate), 'dd/MM/yyyy');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth aria-labelledby="daily-planning-title">
      <DialogTitle
        id="daily-planning-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Planejar o Dia — {formattedDate}
          </Typography>
          <Typography
            variant="caption"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Defina até 3 focos prioritários e organize os blocos de forma inteligente e sem conflitos.
          </Typography>
        </Box>

        <IconButton size="small" onClick={onClose} aria-label="Fechar">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <Box sx={{ px: 3, py: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Divider />

      <DialogContent sx={{ py: 3, minHeight: 320 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={36} />
          </Box>
        ) : (
          <>
            {/* STEP 0: Top 3 Priorities */}
            {activeStep === 0 && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Suas 3 Prioridades do Dia ({priorities.length}/3)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, mb: 2 })}
                  >
                    Selecione as principais missões, treinos ou hábitos que farão seu dia valer a pena se concluídos.
                  </Typography>

                  {priorities.length === 0 ? (
                    <Box
                      sx={(theme) => ({
                        p: 3,
                        textAlign: 'center',
                        borderRadius: 2,
                        backgroundColor: themePalette(theme).kokyu.surface.primary,
                        border: `1px dashed ${themePalette(theme).kokyu.border.subtle}`,
                      })}
                    >
                      <Typography
                        variant="caption"
                        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                      >
                        Nenhuma prioridade selecionada ainda. Escolha na lista abaixo.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      {priorities.map((p, idx) => (
                        <Box
                          key={p.id}
                          sx={(theme) => ({
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: themePalette(theme).kokyu.surface.primary,
                            border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          })}
                        >
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                            <Chip
                              label={`#${idx + 1}`}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 700 }}
                            />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {p.title}
                            </Typography>
                          </Stack>

                          <IconButton
                            size="small"
                            onClick={() => removePriority(p.id)}
                            aria-label={`Remover prioridade ${p.title}`}
                          >
                            <CloseRoundedIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>

                {/* Candidate selection */}
                {priorities.length < 3 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Adicionar das pendências / itens do dia:
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {unscheduledCandidates.map((candidate: ScheduleEntry) => {
                        const isAlreadyPriority = priorities.some(
                          (p) => p.sourceId === candidate.sourceId,
                        );
                        if (isAlreadyPriority) return null;

                        return (
                          <Chip
                            key={candidate.id}
                            label={`${candidate.title} (${candidate.duration} min)`}
                            clickable
                            onClick={() =>
                              addPriority({
                                sourceType: candidate.sourceType,
                                sourceId: candidate.sourceId,
                                title: candidate.title,
                              })
                            }
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}

            {/* STEP 1: Plan Preview & Auto-Schedule */}
            {activeStep === 1 && (
              <Stack spacing={2.5}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Proposta de Agenda Inteligente
                  </Typography>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AutoAwesomeRoundedIcon />}
                    onClick={generatePlan}
                    sx={{ textTransform: 'none' }}
                  >
                    Recalcular Encaixes
                  </Button>
                </Box>

                <Typography
                  variant="caption"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                >
                  O algoritmo preserva compromissos fixos e encaixa prioridades nos horários de maior energia.
                </Typography>

                {planPreview && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
                      Mudanças propostas ({planPreview.diffs.length}):
                    </Typography>
                    <List disablePadding>
                      {planPreview.diffs.map((diff) => (
                        <ListItem
                          key={diff.entryId}
                          sx={(theme) => ({
                            mb: 1,
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: themePalette(theme).kokyu.surface.primary,
                            border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                          })}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {diff.title}
                              </Typography>
                            }
                            secondary={
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                  alignItems: 'center',
                                  mt: 0.5,
                                }}
                              >
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {diff.previousStartAt || 'Sem horário'}
                                </Typography>
                                <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'primary.main', fontWeight: 700 }}
                                >
                                  {diff.newStartAt || 'Sem horário'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  • {diff.reason}
                                </Typography>
                              </Stack>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Stack>
            )}

            {/* STEP 2: Confirmation & Summary */}
            {activeStep === 2 && (
              <Stack spacing={3} sx={{ textAlign: 'center', py: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'success.light',
                    color: 'success.dark',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                  }}
                >
                  <CheckCircleRoundedIcon sx={{ fontSize: 32 }} />
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Plano Pronto para Execução!
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                  >
                    Ao confirmar, a timeline do dia será atualizada com os horários sugeridos.
                  </Typography>
                </Box>

                {planPreview && (
                  <Box
                    sx={(theme) => ({
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: themePalette(theme).kokyu.surface.primary,
                      border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                      textAlign: 'left',
                    })}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Resumo da Capacidade do Dia:
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      • Tempo planejado: {Math.round(planPreview.capacity.plannedWorkloadMinutes / 60)}h{' '}
                      {planPreview.capacity.plannedWorkloadMinutes % 60}min
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      • Carga de trabalho: {planPreview.capacity.utilizationPercent}% (
                      {planPreview.capacity.status})
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      • Conflitos detectados: {planPreview.conflicts.length}
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          </>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button
          variant="text"
          onClick={activeStep === 0 ? onClose : prevStep}
          sx={{ textTransform: 'none' }}
        >
          {activeStep === 0 ? 'Cancelar' : 'Voltar'}
        </Button>

        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={nextStep}
            sx={{ textTransform: 'none', px: 3 }}
          >
            Próximo
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            disabled={isApplying}
            onClick={handleFinish}
            sx={{ textTransform: 'none', px: 3 }}
          >
            {isApplying ? 'Aplicando...' : 'Confirmar e Aplicar Plano'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

