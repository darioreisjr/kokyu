'use client';

import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { themePalette } from '@/design-system/theme/useThemePalette';
import type { FreeTimeSlot } from '@/shared/scheduling/types';
import { formatDurationDisplay } from '@/shared/scheduling/utils/timeHelpers';

export interface FreeTimeSlotCardProps {
  slot: FreeTimeSlot;
  onFillSlot: (slot: FreeTimeSlot) => void;
  compact?: boolean;
}

export function FreeTimeSlotCard({ slot, onFillSlot, compact = false }: FreeTimeSlotCardProps) {
  return (
    <Box
      sx={(theme) => {
        const palette = themePalette(theme);
        return {
          p: compact ? 0.75 : 1.25,
          borderRadius: 2,
          border: `1px dashed ${palette.kokyu.border.default}`,
          backgroundColor: palette.kokyu.background.subtle,
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            borderColor: palette.kokyu.action.primary,
            backgroundColor: palette.kokyu.surface.primary,
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
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography
            variant="caption"
            sx={(theme) => ({
              fontWeight: 600,
              color: themePalette(theme).kokyu.text.secondary,
            })}
          >
            {slot.startAt} - {slot.endAt} ({formatDurationDisplay(slot.duration)} livres)
          </Typography>
        </Stack>

        <Button
          size="small"
          variant="text"
          color="primary"
          startIcon={<AddCircleOutlineRoundedIcon />}
          onClick={() => onFillSlot(slot)}
          sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.25 }}
        >
          Preencher este tempo
        </Button>
      </Stack>
    </Box>
  );
}

