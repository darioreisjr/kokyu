'use client';

import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { scheduleTokens } from '@/design-system/tokens/component/schedule';
import { minutesToTime } from '@/shared/scheduling/utils/timeHelpers';

export interface NowIndicatorProps {
  dayStartMinutes?: number; // default e.g. 360 (06:00)
  hourHeight?: number;      // default 64px
}

export function NowIndicator({
  dayStartMinutes = 360,
  hourHeight = scheduleTokens.timeline.hourHeight,
}: NowIndicatorProps) {
  const [currentMinutes, setCurrentMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 30000); // update every 30s

    return () => clearInterval(interval);
  }, []);

  const offsetMinutes = currentMinutes - dayStartMinutes;
  const topPosition = (offsetMinutes / 60) * hourHeight;
  const timeText = minutesToTime(currentMinutes);

  return (
    <Box
      role="status"
      aria-label={`Horário atual: ${timeText}`}
      sx={{
        position: 'absolute',
        top: `${topPosition}px`,
        left: 0,
        right: 0,
        zIndex: 4,
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
        transition: 'top 0.3s ease-in-out',
      }}
    >
      {/* Time Pill Badge */}
      <Box
        sx={(theme) => ({
          backgroundColor: themePalette(theme).kokyu.action.primary,
          color: themePalette(theme).kokyu.action.primaryContrast,
          borderRadius: '4px',
          px: 0.75,
          py: 0.25,
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: 0.5,
          boxShadow: theme.shadows[1],
          zIndex: 2,
        })}
      >
        {timeText}
      </Box>

      {/* Pulse Dot */}
      <Box
        sx={(theme) => ({
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: themePalette(theme).kokyu.action.primary,
          ml: 0.5,
          boxShadow: `0 0 0 3px ${themePalette(theme).kokyu.action.primary}40`,
        })}
      />

      {/* Indicator Line */}
      <Box
        sx={(theme) => ({
          flex: 1,
          height: '2px',
          backgroundColor: themePalette(theme).kokyu.action.primary,
          opacity: 0.9,
        })}
      />
    </Box>
  );
}

