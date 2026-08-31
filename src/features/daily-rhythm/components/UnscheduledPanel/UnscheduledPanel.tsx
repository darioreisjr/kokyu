'use client';

import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { themePalette } from '@/design-system/theme/useThemePalette';
import type { ScheduleEntry } from '@/shared/scheduling/types';
import { formatDurationDisplay } from '@/shared/scheduling/utils/timeHelpers';

export interface UnscheduledPanelProps {
  items: ScheduleEntry[];
  onScheduleItem: (item: ScheduleEntry) => void;
}

export function UnscheduledPanel({ items, onScheduleItem }: UnscheduledPanelProps) {
  return (
    <Box
      sx={(theme) => {
        const palette = themePalette(theme);
        return {
          p: 2,
          borderRadius: 2,
          backgroundColor: palette.kokyu.surface.primary,
          border: `1px solid ${palette.kokyu.border.subtle}`,
          height: '100%',
        };
      }}
    >
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Para encaixar
          </Typography>
          <Chip label={items.length} size="small" sx={{ fontWeight: 600, height: 20 }} />
        </Stack>
      </Stack>

      {items.length === 0 ? (
        <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 4, textAlign: 'center' }}>
          <InboxRoundedIcon
            sx={(theme) => ({
              fontSize: 36,
              color: themePalette(theme).kokyu.text.disabled,
              mb: 1,
            })}
          />
          <Typography
            variant="caption"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Tudo o que está planejado para hoje já possui horário definido!
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={(theme) => {
                const palette = themePalette(theme);
                return {
                  p: 1.5,
                  borderRadius: 1.5,
                  backgroundColor: palette.kokyu.background.subtle,
                  border: `1px solid ${palette.kokyu.border.subtle}`,
                  transition: 'all 0.15s ease-in-out',
                  '&:hover': {
                    borderColor: palette.kokyu.border.default,
                  },
                };
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {item.title}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mt: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                >
                  {formatDurationDisplay(item.duration)} • {item.sourceType}
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AccessTimeRoundedIcon />}
                  onClick={() => onScheduleItem(item)}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.25 }}
                >
                  Agendar
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

