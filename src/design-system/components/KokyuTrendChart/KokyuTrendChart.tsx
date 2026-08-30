'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useMemo } from 'react';

import { useEffectiveReducedMotion } from '../../providers/MotionPreferenceProvider';
import { themePalette } from '../../theme/useThemePalette';

export interface TrendChartPoint {
  label: string;
  value: number;
}

export interface KokyuTrendChartProps {
  points: TrendChartPoint[];
  /** Pixel height of the plotted area — width always fills the container. */
  height?: number;
  valueFormatter?: (value: number) => string;
  /** Full accessible description read by screen readers — the SVG itself is `aria-hidden`. */
  ariaLabel: string;
  /** Optional reference line, e.g. a goal or target value. */
  targetValue?: number;
}

const VIEWBOX_WIDTH = 300;

/**
 * A minimal, dependency-free line chart — no charting library exists in this repo and adding one
 * for a handful of trend screens would be disproportionate (see `docs/training.md`). Never a bare
 * decorative chart: the SVG is `aria-hidden`, and a sibling `Typography` caption always states the
 * trend in words, same rule `GoalProgressBar` already follows for progress bars.
 */
export function KokyuTrendChart({
  points,
  height = 120,
  valueFormatter = String,
  ariaLabel,
  targetValue,
}: KokyuTrendChartProps) {
  const theme = useTheme();
  const shouldReduceMotion = useEffectiveReducedMotion();

  const { polylinePoints, targetY } = useMemo(() => {
    if (points.length === 0) return { polylinePoints: '', targetY: null as number | null };
    const values = points.map((point) => point.value);
    const allValues = targetValue !== undefined ? [...values, targetValue] : values;
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min || 1;
    const stepX = points.length > 1 ? VIEWBOX_WIDTH / (points.length - 1) : 0;
    const toY = (value: number) => height - ((value - min) / range) * height;
    const coords = points.map((point, index) => `${index * stepX},${toY(point.value)}`).join(' ');
    return { polylinePoints: coords, targetY: targetValue !== undefined ? toY(targetValue) : null };
  }, [points, height, targetValue]);

  if (points.length === 0) {
    return (
      <Typography
        variant="body2"
        sx={(innerTheme) => ({ color: themePalette(innerTheme).kokyu.text.secondary })}
      >
        Sem dados suficientes ainda.
      </Typography>
    );
  }

  const first = points[0]!;
  const last = points[points.length - 1]!;
  const trendDescription = `${ariaLabel}: de ${valueFormatter(first.value)} em ${first.label} para ${valueFormatter(last.value)} em ${last.label}.`;

  return (
    <Stack spacing={0.5}>
      <Box
        component="svg"
        aria-hidden="true"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}
        preserveAspectRatio="none"
        sx={{ width: '100%', height, display: 'block' }}
      >
        {targetY !== null ? (
          <line
            x1={0}
            y1={targetY}
            x2={VIEWBOX_WIDTH}
            y2={targetY}
            stroke={themePalette(theme).kokyu.border.subtle}
            strokeDasharray="4 4"
          />
        ) : null}
        <motion.polyline
          points={polylinePoints}
          fill="none"
          stroke={themePalette(theme).kokyu.action.primary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={shouldReduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 0.6, ease: 'easeOut' }}
        />
      </Box>
      <Typography
        variant="labelSmall"
        sx={(innerTheme) => ({ color: themePalette(innerTheme).kokyu.text.secondary })}
      >
        {trendDescription}
      </Typography>
    </Stack>
  );
}
