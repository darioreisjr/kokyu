'use client';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CoffeeRoundedIcon from '@mui/icons-material/CoffeeRounded';
import DirectionsWalkRoundedIcon from '@mui/icons-material/DirectionsWalkRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { SCHEDULE_SOURCE_METAS, SCHEDULE_STATUS_METAS } from '@/shared/scheduling/constants/schedulingConstants';
import type { ScheduleEntry, ScheduleSourceType } from '@/shared/scheduling/types';
import { formatDurationDisplay } from '@/shared/scheduling/utils/timeHelpers';
import { createScheduleEntryActionProvider } from '../../adapters/actionProviders';

export interface ScheduleEntryCardProps {
  entry: ScheduleEntry;
  onComplete?: (entry: ScheduleEntry) => Promise<void>;
  onStartFocus?: (entry: ScheduleEntry) => void;
  onReschedule?: (entry: ScheduleEntry) => void;
  onEdit?: (entry: ScheduleEntry) => void;
  onDelete?: (entry: ScheduleEntry) => Promise<void>;
  onNavigate?: (href: string) => void;
  compact?: boolean;
}

const SOURCE_ICONS: Record<ScheduleSourceType, React.ComponentType<{ fontSize?: 'small' | 'inherit' }>> = {
  mission: AssignmentRoundedIcon,
  habit: AutorenewRoundedIcon,
  training: FitnessCenterRoundedIcon,
  nutrition: RestaurantRoundedIcon,
  leisure: MovieRoundedIcon,
  goal: TrackChangesRoundedIcon,
  routine: WbSunnyRoundedIcon,
  calendar: EventRoundedIcon,
  manual: ScheduleRoundedIcon,
  focus: CenterFocusStrongRoundedIcon,
  break: CoffeeRoundedIcon,
  travel: DirectionsWalkRoundedIcon,
  blockedTime: BlockRoundedIcon,
};

export function ScheduleEntryCard({
  entry,
  onComplete,
  onStartFocus,
  onReschedule,
  onEdit,
  onDelete,
  onNavigate,
  compact = false,
}: ScheduleEntryCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const meta = SCHEDULE_SOURCE_METAS[entry.sourceType] ?? SCHEDULE_SOURCE_METAS.manual;
  const statusMeta = SCHEDULE_STATUS_METAS[entry.status] ?? SCHEDULE_STATUS_METAS.planned;
  const IconComponent = SOURCE_ICONS[entry.sourceType] ?? ScheduleRoundedIcon;

  const actionProvider = createScheduleEntryActionProvider({
    onComplete,
    onStartFocus,
    onReschedule,
    onEdit,
    onDelete,
    onNavigate,
  });

  const actions = actionProvider.getActionsForEntry(entry);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const timeRangeText = entry.startAt
    ? `${entry.startAt}${entry.endAt ? ` - ${entry.endAt}` : ''}`
    : 'Sem horário';

  const ariaLabelText = `${meta.label}: ${entry.title}, ${timeRangeText}, duração ${formatDurationDisplay(entry.duration)}, status ${statusMeta.label}.`;

  const isCompleted = entry.status === 'completed';

  return (
    <Box
      role="article"
      aria-label={ariaLabelText}
      tabIndex={0}
      sx={(theme) => {
        const palette = themePalette(theme);

        let accentColor = palette.kokyu.action.primary;
        if (entry.sourceType === 'training') accentColor = palette.kokyu.feedback.error;
        else if (entry.sourceType === 'habit') accentColor = palette.kokyu.action.secondary;
        else if (entry.sourceType === 'nutrition') accentColor = palette.kokyu.feedback.success;
        else if (entry.sourceType === 'leisure') accentColor = palette.kokyu.feedback.info;
        else if (entry.sourceType === 'mission') accentColor = palette.kokyu.feedback.warning;
        else if (entry.sourceType === 'focus') accentColor = palette.kokyu.action.primary;
        else if (entry.sourceType === 'blockedTime') accentColor = palette.kokyu.text.disabled;

        return {
          position: 'relative',
          p: compact ? 1 : 1.5,
          borderRadius: 2,
          backgroundColor: isCompleted
            ? palette.kokyu.background.subtle
            : palette.kokyu.surface.primary,
          border: `1px solid ${palette.kokyu.border.subtle}`,
          borderLeft: `4px solid ${accentColor}`,
          opacity: isCompleted ? 0.7 : 1,
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            borderColor: palette.kokyu.border.default,
            boxShadow: theme.shadows[1],
          },
          '&:focus-visible': {
            outline: `2px solid ${palette.kokyu.border.focus}`,
            outlineOffset: 2,
          },
        };
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}>
          <Box
            sx={(theme) => ({
              color: isCompleted
                ? themePalette(theme).kokyu.text.disabled
                : themePalette(theme).kokyu.text.primary,
              display: 'flex',
              alignItems: 'center',
            })}
          >
            <IconComponent fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{
                fontWeight: 600,
                textDecoration: isCompleted ? 'line-through' : 'none',
              }}
            >
              {entry.title}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.25 }}>
              <Typography
                variant="caption"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
              >
                {timeRangeText} ({formatDurationDisplay(entry.duration)})
              </Typography>

              <Chip
                label={meta.badgeLabel}
                size="small"
                variant="outlined"
                sx={{ height: 18, fontSize: '0.65rem' }}
              />

              {entry.locked && (
                <Box
                  component="span"
                  title="Compromisso Fixo"
                  sx={(theme) => ({
                    display: 'inline-flex',
                    color: themePalette(theme).kokyu.text.disabled,
                  })}
                >
                  <LockRoundedIcon sx={{ fontSize: 13 }} />
                </Box>
              )}

              {entry.energyRequirement && (
                <Chip
                  icon={<BoltRoundedIcon sx={{ fontSize: '10px !important' }} />}
                  label={entry.energyRequirement}
                  size="small"
                  sx={{ height: 16, fontSize: '0.6rem' }}
                />
              )}
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          {entry.status !== 'completed' && onComplete && (
            <IconButton
              size="small"
              aria-label={`Concluir ${entry.title}`}
              onClick={(e) => {
                e.stopPropagation();
                onComplete(entry);
              }}
              color="primary"
            >
              <CheckCircleRoundedIcon fontSize="small" />
            </IconButton>
          )}

          <IconButton
            size="small"
            aria-label={`Ações para ${entry.title}`}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
            onClick={handleMenuOpen}
          >
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {actions.map((act) => (
          <MenuItem
            key={act.id}
            onClick={async () => {
              handleMenuClose();
              await act.perform(entry);
            }}
          >
            <ListItemText>{act.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

