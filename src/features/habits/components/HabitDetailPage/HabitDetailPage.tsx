'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

import { KokyuButton } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { getHabitAreaLabel } from '../../constants/habitAreas';
import { habitRoutes } from '../../constants/habitRoutes';
import { useConfirmAction } from '../../hooks/useConfirmAction';
import { useHabit } from '../../hooks/useHabit';
import { habitService } from '../../services/habitService';
import { HabitAreaIcon } from '../HabitAreaIcon/HabitAreaIcon';
import { HabitHeatmap } from '../HabitHeatmap/HabitHeatmap';
import { HabitQuickNoteDialog } from '../HabitQuickNoteDialog/HabitQuickNoteDialog';
import { HabitTimerDialog } from '../HabitTimerDialog/HabitTimerDialog';
import { PlannedPauseDialog } from '../PlannedPauseDialog/PlannedPauseDialog';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';

export interface HabitDetailPageProps {
  habitId: string;
}

export function HabitDetailPage({ habitId }: HabitDetailPageProps) {
  const router = useRouter();
  const {
    habit,
    logs,
    streak,
    consistency,
    periodProgress,
    todayOccurrence,
    isLoading,
    refresh,
  } = useHabit(habitId);

  const { confirm, pendingAction, handleConfirm, handleCancel, isOpen: isConfirmOpen } = useConfirmAction();

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isPauseOpen, setIsPauseOpen] = useState(false);

  if (isLoading || !habit) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const isCompletedToday = todayOccurrence?.status === 'completed';

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setMenuAnchorEl(e.currentTarget);
  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleQuickLog = async () => {
    const today = new Date().toISOString().split('T')[0]!;
    await habitService.createHabitLog({
      habitId,
      date: today,
      timestamp: new Date().toISOString(),
      status: 'completed',
      value: ('targetValue' in habit.target && habit.target.targetValue) ? habit.target.targetValue : 1,
      source: 'manual',
    });
    await refresh();
  };

  const handleDuplicate = async () => {
    handleMenuClose();
    const dup = await habitService.duplicateHabit(habitId);
    if (dup) {
      router.push(habitRoutes.detail(dup.id));
    }
  };

  const handleTogglePause = async () => {
    handleMenuClose();
    if (habit.status === 'paused') {
      await habitService.resumeHabit(habitId);
      await refresh();
    } else {
      setIsPauseOpen(true);
    }
  };

  const handleArchive = () => {
    handleMenuClose();
    confirm({
      title: 'Arquivar hábito?',
      description: 'O hábito não aparecerá mais no dia a dia, mas seu histórico será preservado.',
      confirmLabel: 'Arquivar',
      onConfirm: async () => {
        await habitService.archiveHabit(habitId);
        router.push(habitRoutes.all);
      },
    });
  };

  const handleDelete = () => {
    handleMenuClose();
    confirm({
      title: 'Excluir hábito definitivamente?',
      description: 'Esta ação não pode ser desfeita. Todos os registros serão removidos.',
      confirmLabel: 'Excluir',
      isDestructive: true,
      onConfirm: async () => {
        await habitService.deleteHabit(habitId);
        router.push(habitRoutes.all);
      },
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Button component={NextLink} href={habitRoutes.all} startIcon={<ArrowBackRoundedIcon />}>
            Todos os hábitos
          </Button>

          <Stack direction="row" spacing={1}>
            <Button
              component={NextLink}
              href={habitRoutes.edit(habitId)}
              startIcon={<EditRoundedIcon />}
              variant="outlined"
              size="small"
            >
              Editar
            </Button>

            <IconButton onClick={handleMenuOpen} aria-label="Mais opções">
              <MoreVertRoundedIcon />
            </IconButton>

            <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleTogglePause}>
                {habit.status === 'paused' ? (
                  <>
                    <PlayCircleOutlineRoundedIcon sx={{ mr: 1.5 }} /> Retomar hábito
                  </>
                ) : (
                  <>
                    <PauseCircleOutlineRoundedIcon sx={{ mr: 1.5 }} /> Pausar hábito
                  </>
                )}
              </MenuItem>
              <MenuItem onClick={handleDuplicate}>
                <ContentCopyRoundedIcon sx={{ mr: 1.5 }} /> Duplicar hábito
              </MenuItem>
              <MenuItem onClick={handleArchive}>
                <ArchiveRoundedIcon sx={{ mr: 1.5 }} /> Arquivar
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <DeleteOutlineRoundedIcon sx={{ mr: 1.5 }} /> Excluir
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>

        <Card variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2.5}
                sx={{ alignItems: 'flex-start' }}
              >
                <HabitAreaIcon area={habit.area} size="large" />

                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                      {habit.name}
                    </Typography>
                    <Chip label={getHabitAreaLabel(habit.area)} size="small" variant="outlined" />
                    {habit.status === 'paused' && (
                      <Chip label="Em pausa" size="small" color="warning" />
                    )}
                  </Stack>

                  {habit.description && (
                    <Typography variant="body1" color="text.secondary">
                      {habit.description}
                    </Typography>
                  )}

                  {habit.cue && (
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      Gatilho: &ldquo;{habit.cue}&rdquo;
                    </Typography>
                  )}
                </Stack>

                <Stack direction="row" spacing={1}>
                  {habit.trackingType === 'duration' ? (
                    <KokyuButton
                      variant="contained"
                      size="large"
                      startIcon={<TimerRoundedIcon />}
                      onClick={() => setIsTimerOpen(true)}
                    >
                      Iniciar Timer
                    </KokyuButton>
                  ) : (
                    <KokyuButton
                      variant={isCompletedToday ? 'outlined' : 'contained'}
                      size="large"
                      startIcon={<CheckCircleRoundedIcon />}
                      onClick={handleQuickLog}
                    >
                      {isCompletedToday ? 'Concluído hoje' : 'Registrar agora'}
                    </KokyuButton>
                  )}
                  <IconButton
                    onClick={() => setIsNoteOpen(true)}
                    color="primary"
                    aria-label="Adicionar nota"
                  >
                    <EditNoteRoundedIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
              <CardContent>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Score de Consistência
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {consistency?.score ?? 100}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Últimos 30 dias (ponderado)
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
              <CardContent>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Sequência Atual
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <LocalFireDepartmentRoundedIcon sx={{ color: 'warning.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {streak?.currentStreak ?? 0}{' '}
                      <Typography component="span" variant="body2" color="text.secondary">
                        {streak?.periodUnit === 'weeks' ? 'semanas' : 'dias'}
                      </Typography>
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Melhor: {streak?.bestStreak ?? 0} {streak?.periodUnit === 'weeks' ? 'semanas' : 'dias'}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
              <CardContent>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Progresso no Período
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {periodProgress?.percent ?? 0}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {periodProgress?.currentValue ?? 0} / {periodProgress?.targetValue ?? 1}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
              <CardContent>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Total de Registros
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {logs.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Histórico completo ativo
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Mapa de Consistência
              </Typography>
              <HabitHeatmap logs={logs} habit={habit} />
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  Histórico e Notas
                </Typography>
                <Button
                  startIcon={<EditNoteRoundedIcon />}
                  onClick={() => setIsNoteOpen(true)}
                  size="small"
                >
                  Adicionar Nota
                </Button>
              </Stack>

              {logs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum registro encontrado ainda.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {logs.slice(0, 10).map((log) => (
                    <Box
                      key={log.id}
                      sx={(theme) => ({
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: themePalette(theme).kokyu.surface.secondary,
                      })}
                    >
                      <Stack spacing={0.5}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {log.date}
                          </Typography>
                          <Chip
                            label={
                              log.status === 'completed'
                                ? 'Concluído'
                                : log.status === 'skipped'
                                  ? 'Pulado'
                                  : 'Parcial'
                            }
                            size="small"
                            color={log.status === 'completed' ? 'primary' : 'default'}
                          />
                        </Stack>
                        {log.note && (
                          <Typography variant="body2">{log.note}</Typography>
                        )}
                        {log.context?.trigger && (
                          <Typography variant="caption" color="text.secondary">
                            Gatilho: {log.context.trigger}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <HabitTimerDialog
        open={isTimerOpen}
        habit={habit}
        onClose={() => setIsTimerOpen(false)}
        onComplete={async (mins, note) => {
          const today = new Date().toISOString().split('T')[0]!;
          await habitService.createHabitLog({
            habitId,
            date: today,
            timestamp: new Date().toISOString(),
            status: 'completed',
            value: mins,
            note,
            source: 'manual',
          });
          await refresh();
        }}
      />

      <HabitQuickNoteDialog
        open={isNoteOpen}
        habit={habit}
        onClose={() => setIsNoteOpen(false)}
        onSave={async (noteText, context) => {
          const today = new Date().toISOString().split('T')[0]!;
          await habitService.createHabitLog({
            habitId,
            date: today,
            timestamp: new Date().toISOString(),
            status: 'completed',
            value: 1,
            note: noteText,
            context,
            source: 'manual',
          });
          await refresh();
        }}
      />

      <PlannedPauseDialog
        open={isPauseOpen}
        habit={habit}
        onClose={() => setIsPauseOpen(false)}
        onConfirm={async (start, end, reason) => {
          await habitService.pauseHabit(habitId, {
            plannedPause: { startDate: start, endDate: end, reason },
          });
          await refresh();
        }}
      />

      {pendingAction && (
        <ConfirmActionDialog
          open={isConfirmOpen}
          title={pendingAction.title}
          description={pendingAction.description}
          confirmLabel={pendingAction.confirmLabel}
          isDestructive={pendingAction.isDestructive}
          onConfirm={handleConfirm}
          onClose={handleCancel}
        />
      )}
    </Container>
  );
}
