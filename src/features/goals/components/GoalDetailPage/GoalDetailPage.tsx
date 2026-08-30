'use client';

import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { getGoalAreaLabel } from '../../constants/goalAreas';
import { goalRoutes } from '../../constants/goalRoutes';
import { getGoalUnitLabel } from '../../constants/goalUnits';
import { useConfirmAction } from '../../hooks/useConfirmAction';
import { useGoal } from '../../hooks/useGoal';
import { useGoalProgress } from '../../hooks/useGoalProgress';
import type { CheckInFormValues } from '../../schemas/checkInSchema';
import {
  getGoalContributions,
  type GoalContribution,
} from '../../services/goalContributionsService';
import { goalService } from '../../services/goalService';
import type { GoalActivity, GoalCheckIn, GoalNote } from '../../types';
import { formatShortDate } from '../../utils/dateHelpers';
import { formatGoalDeadline } from '../../utils/goalFormatting';
import { getGoalProgressCaption } from '../../utils/goalProgressCaption';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';
import { EndGoalDialog, type EndGoalOutcome } from '../EndGoalDialog/EndGoalDialog';
import { GoalActivityTimeline } from '../GoalActivityTimeline/GoalActivityTimeline';
import { GoalAreaIcon } from '../GoalAreaIcon/GoalAreaIcon';
import { GoalCheckInDialog } from '../GoalCheckInDialog/GoalCheckInDialog';
import { GoalCheckInHistoryList } from '../GoalCheckInHistoryList/GoalCheckInHistoryList';
import {
  GoalCompletionDialog,
  type GoalCompletionValues,
} from '../GoalCompletionDialog/GoalCompletionDialog';
import { GoalContributionsList } from '../GoalContributionsList/GoalContributionsList';
import { GoalKeyResultsList } from '../GoalKeyResultsList/GoalKeyResultsList';
import { GoalMilestonesList } from '../GoalMilestonesList/GoalMilestonesList';
import { GoalNotesList } from '../GoalNotesList/GoalNotesList';
import { GoalProgressRing } from '../GoalProgressRing/GoalProgressRing';
import {
  GoalProgressUpdateDialog,
  type GoalProgressUpdateValues,
} from '../GoalProgressUpdateDialog/GoalProgressUpdateDialog';
import { GoalStatusChip } from '../GoalStatusChip/GoalStatusChip';
import { ReplanGoalDialog } from '../ReplanGoalDialog/ReplanGoalDialog';

export interface GoalDetailPageProps {
  goalId: string;
}

function getNextStepText(goal: {
  type: string;
  milestones?: { title: string; completed: boolean; order: number }[];
  keyResults?: { title: string; status: string }[];
  progressMode: string;
}): string | null {
  if (goal.type === 'milestone') {
    const next = [...(goal.milestones ?? [])]
      .filter((milestone) => !milestone.completed)
      .sort((a, b) => a.order - b.order)[0];
    return next ? `Próximo marco: ${next.title}` : null;
  }
  if (goal.type === 'keyResult') {
    const next = (goal.keyResults ?? []).find((keyResult) => keyResult.status !== 'completed');
    return next ? `Próximo resultado: ${next.title}` : null;
  }
  if (goal.progressMode === 'manual') return 'Atualizar progresso quando avançar.';
  return null;
}

/** `/app/metas/[id]` — a página mais densa do módulo. Nunca calcula progresso/status sozinha: sempre via `useGoalProgress`/`Goal.status` já hidratado pelo `goalService`. */
export function GoalDetailPage({ goalId }: GoalDetailPageProps) {
  const router = useRouter();
  const { showSuccess } = useSnackbar();
  const { status, goal, reload } = useGoal(goalId);
  const { progress } = useGoalProgress(goal);
  const confirmAction = useConfirmAction();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [progressUpdateOpen, setProgressUpdateOpen] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [endGoalOpen, setEndGoalOpen] = useState(false);
  const [replanOpen, setReplanOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [checkIns, setCheckIns] = useState<GoalCheckIn[]>([]);
  const [activities, setActivities] = useState<GoalActivity[]>([]);
  const [notes, setNotes] = useState<GoalNote[]>([]);
  const [contributions, setContributions] = useState<GoalContribution[]>([]);

  const loadDetails = useCallback(() => {
    if (!goal) return;
    Promise.all([
      goalService.getCheckIns(goal.id),
      goalService.getGoalActivities(goal.id),
      goalService.getGoalNotes(goal.id),
    ]).then(([loadedCheckIns, loadedActivities, loadedNotes]) => {
      setCheckIns(loadedCheckIns);
      setActivities(loadedActivities);
      setNotes(loadedNotes);
      setContributions(getGoalContributions(goal));
    });
  }, [goal]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  if (status === 'loading') {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width={280} height={48} />
        <Skeleton variant="rounded" height={200} />
        <Skeleton variant="rounded" height={200} />
      </Stack>
    );
  }

  if (status === 'error' || !goal) {
    return (
      <Alert severity="error">Não foi possível carregar esta meta agora. Tente novamente.</Alert>
    );
  }

  const unit =
    goal.measurement.type === 'numeric' ||
    goal.measurement.type === 'consistency' ||
    goal.measurement.type === 'average'
      ? goal.measurement.unit
      : 'units';
  const isActive = !['paused', 'completed', 'abandoned', 'archived'].includes(goal.status);
  const nextStep = getNextStepText(goal);

  async function handleSaveCheckIn(values: CheckInFormValues) {
    setIsSubmitting(true);
    try {
      await goalService.createCheckIn(goal!.id, values);
      showSuccess('Check-in registrado.');
      setCheckInOpen(false);
      reload();
      loadDetails();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveProgress(values: GoalProgressUpdateValues) {
    setIsSubmitting(true);
    try {
      await goalService.addProgress(goal!.id, values.value, values.date, values.note);
      showSuccess('Progresso atualizado.');
      setProgressUpdateOpen(false);
      reload();
      loadDetails();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleComplete(reflection?: GoalCompletionValues) {
    setIsSubmitting(true);
    try {
      await goalService.completeGoal(goal!.id, reflection);
      showSuccess('Meta concluída.');
      setCompletionOpen(false);
      reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEndGoal(outcome: EndGoalOutcome, note?: string) {
    setEndGoalOpen(false);
    if (outcome === 'completed') {
      setCompletionOpen(true);
      return;
    }
    setIsSubmitting(true);
    try {
      await goalService.abandonGoal(goal!.id, outcome, note);
      showSuccess('Meta encerrada.');
      reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePauseOrResume() {
    if (goal!.status === 'paused') {
      await goalService.resumeGoal(goal!.id);
      showSuccess('Meta retomada.');
    } else {
      await goalService.pauseGoal(goal!.id);
      showSuccess('Meta pausada.');
    }
    reload();
  }

  async function handleReplan(newTargetDate: string | undefined, note?: string) {
    setIsSubmitting(true);
    try {
      await goalService.replanGoal(goal!.id, newTargetDate, note);
      showSuccess('Prazo replanejado.');
      setReplanOpen(false);
      reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDuplicate() {
    const duplicated = await goalService.duplicateGoal(goal!.id);
    if (duplicated) {
      showSuccess('Meta duplicada.');
      router.push(goalRoutes.detail(duplicated.id));
    }
  }

  async function handleArchive() {
    confirmAction.request({
      title: 'Arquivar meta',
      description: 'A meta sai das visões normais, mas continua no seu histórico.',
      confirmLabel: 'Arquivar',
      onConfirm: async () => {
        await goalService.archiveGoal(goal!.id);
        showSuccess('Meta arquivada.');
        reload();
      },
    });
  }

  function handleDelete() {
    confirmAction.request({
      title: 'Excluir meta',
      description: 'Essa ação não pode ser desfeita — a meta e seu histórico serão apagados.',
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        await goalService.deleteGoal(goal!.id);
        showSuccess('Meta excluída.');
        router.push(goalRoutes.inProgress);
      },
    });
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <GoalAreaIcon
              area={goal.area}
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            />
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="displaySmall" component="h1">
                {goal.title}
              </Typography>
              <Typography
                variant="body2"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                {getGoalAreaLabel(goal.area)} · {formatGoalDeadline(goal.targetDate)}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
            <GoalStatusChip status={goal.status} />
            <IconButton
              aria-label="Mais ações"
              onClick={(event) => setMenuAnchor(event.currentTarget)}
            >
              <MoreVertRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>
        {goal.motivation ? (
          <Typography
            variant="body2"
            sx={(theme) => ({
              color: themePalette(theme).kokyu.text.secondary,
              fontStyle: 'italic',
            })}
          >
            &ldquo;{goal.motivation}&rdquo;
          </Typography>
        ) : null}
        {goal.systemStatus !== goal.status &&
        goal.lastCheckInStatus &&
        goal.lastCheckInStatus !== goal.systemStatus ? (
          <Alert severity="info">
            Sistema indica {goal.systemStatus === 'atRisk' ? 'em risco' : goal.systemStatus}, mas no
            seu último check-in você marcou{' '}
            {goal.lastCheckInStatus === 'atRisk' ? 'em risco' : goal.lastCheckInStatus}.
          </Alert>
        ) : null}
      </Stack>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            router.push(goalRoutes.edit(goal.id));
          }}
        >
          <ListItemIcon>
            <EditRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            handleDuplicate();
          }}
        >
          <ListItemIcon>
            <ContentCopyRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicar</ListItemText>
        </MenuItem>
        {isActive || goal.status === 'paused' ? (
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              handlePauseOrResume();
            }}
          >
            <ListItemIcon>
              {goal.status === 'paused' ? (
                <PlayArrowRoundedIcon fontSize="small" />
              ) : (
                <PauseRoundedIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>{goal.status === 'paused' ? 'Retomar' : 'Pausar'}</ListItemText>
          </MenuItem>
        ) : null}
        {isActive ? (
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              setReplanOpen(true);
            }}
          >
            <ListItemIcon>
              <EventRepeatRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Replanejar</ListItemText>
          </MenuItem>
        ) : null}
        {isActive ? (
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              setCompletionOpen(true);
            }}
          >
            <ListItemIcon>
              <CheckCircleRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Concluir</ListItemText>
          </MenuItem>
        ) : null}
        {isActive || goal.status === 'paused' ? (
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              setEndGoalOpen(true);
            }}
          >
            <ListItemIcon>
              <FlagRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Encerrar</ListItemText>
          </MenuItem>
        ) : null}
        <Divider />
        {goal.status !== 'archived' ? (
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              handleArchive();
            }}
          >
            <ListItemIcon>
              <ArchiveRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Arquivar</ListItemText>
          </MenuItem>
        ) : null}
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            handleDelete();
          }}
        >
          <ListItemIcon>
            <DeleteRoundedIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Excluir</ListItemText>
        </MenuItem>
      </Menu>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'center' }}>
        {progress ? (
          <GoalProgressRing
            current={progress.current}
            target={progress.target}
            percent={progress.percent}
            unit={unit}
            label={getGoalProgressCaption(goal, progress)}
          />
        ) : (
          <Skeleton variant="circular" width={132} height={132} />
        )}
        <Stack spacing={1.5} sx={{ flex: 1, width: '100%' }}>
          {goal.progressMode === 'automatic' ? (
            <Typography
              variant="body2"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              Atualizado automaticamente pelo Kokyu.
            </Typography>
          ) : null}
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
            {goal.progressMode === 'manual' ? (
              <KokyuButton
                variant="outlined"
                size="small"
                onClick={() => setProgressUpdateOpen(true)}
              >
                Atualizar progresso
              </KokyuButton>
            ) : null}
            <KokyuButton variant="text" size="small" onClick={() => setCheckInOpen(true)}>
              Fazer check-in
            </KokyuButton>
          </Stack>
          {nextStep ? (
            <Typography variant="body2">
              <strong>Próximo passo:</strong> {nextStep}
            </Typography>
          ) : null}
          {goal.successCriteria ? (
            <Typography
              variant="body2"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              Critério de sucesso: {goal.successCriteria}
            </Typography>
          ) : null}
          <Typography
            variant="labelSmall"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Início: {formatShortDate(goal.startDate)}
          </Typography>
        </Stack>
      </Stack>

      {goal.type === 'keyResult' ? (
        <GoalKeyResultsList
          keyResults={goal.keyResults ?? []}
          onUpdateCurrent={async (keyResultId, current) => {
            await goalService.updateKeyResult(goal.id, keyResultId, { current });
            reload();
          }}
        />
      ) : null}

      {goal.type === 'milestone' || (goal.milestones && goal.milestones.length > 0) ? (
        <GoalMilestonesList
          milestones={goal.milestones ?? []}
          onToggle={async (milestoneId, completed) => {
            await goalService.completeMilestone(goal.id, milestoneId, completed);
            reload();
          }}
          onAdd={async (title) => {
            await goalService.addMilestone(goal.id, { title });
            reload();
          }}
          onReorder={async (orderedIds) => {
            await goalService.reorderMilestones(goal.id, orderedIds);
            reload();
          }}
        />
      ) : null}

      <GoalContributionsList contributions={contributions} />
      <GoalCheckInHistoryList checkIns={checkIns} />
      <GoalActivityTimeline activities={activities} />
      <GoalNotesList
        notes={notes}
        onAdd={async (text) => {
          await goalService.addGoalNote(goal.id, text);
          loadDetails();
        }}
      />

      <GoalCheckInDialog
        open={checkInOpen}
        goalTitle={goal.title}
        onClose={() => setCheckInOpen(false)}
        onSave={handleSaveCheckIn}
        isSubmitting={isSubmitting}
      />
      {progress ? (
        <GoalProgressUpdateDialog
          open={progressUpdateOpen}
          currentValue={progress.current}
          unitLabel={getGoalUnitLabel(unit, progress.current)}
          onClose={() => setProgressUpdateOpen(false)}
          onSave={handleSaveProgress}
          isSubmitting={isSubmitting}
        />
      ) : null}
      <GoalCompletionDialog
        open={completionOpen}
        goalTitle={goal.title}
        onClose={() => setCompletionOpen(false)}
        onComplete={handleComplete}
        isSubmitting={isSubmitting}
      />
      <EndGoalDialog
        open={endGoalOpen}
        onClose={() => setEndGoalOpen(false)}
        onConfirm={handleEndGoal}
        isSubmitting={isSubmitting}
      />
      <ReplanGoalDialog
        open={replanOpen}
        currentTargetDate={goal.targetDate}
        onClose={() => setReplanOpen(false)}
        onConfirm={handleReplan}
        isSubmitting={isSubmitting}
      />
      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
    </Stack>
  );
}
