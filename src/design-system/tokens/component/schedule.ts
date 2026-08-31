import { borderRadius } from '../primitives/borders';
import { spacing } from '../primitives/spacing';

export const scheduleTokens = {
  timeline: {
    hourHeight: 64,
    minHourHeight: 48,
    timeColumnWidth: 64,
    compactTimeColumnWidth: 48,
    gridLineWidth: 1,
  },
  entry: {
    radius: borderRadius.lg,
    paddingX: spacing[3],
    paddingY: spacing[2],
    minHeight: 28,
    borderWidth: 1,
    leftAccentWidth: 4,
  },
  nowIndicator: {
    dotSize: 10,
    lineWidth: 2,
  },
  snapGridMinutes: 15,
} as const;

