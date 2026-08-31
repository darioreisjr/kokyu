'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { themePalette } from '@/design-system/theme/useThemePalette';
import {
  DailyReviewDialog,
  ScheduleAnalyticsCard,
  useDailyRhythm,
} from '@/features/daily-rhythm';
import { scheduleAnalyticsService } from '@/shared/scheduling/services/scheduleAnalyticsService';

export default function RevisaoPage() {
  const [todayStr] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const { entries, refreshSchedule } = useDailyRhythm(todayStr);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const analytics = useMemo(
    () => scheduleAnalyticsService.calculateAnalytics(entries),
    [entries],
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Revisão e Fechamento
          </Typography>
          <Typography
            variant="body2"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Reflita sobre o uso do seu tempo e encerre o dia com clareza.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setReviewDialogOpen(true)}
          sx={{ textTransform: 'none', px: 3, fontWeight: 700 }}
        >
          Iniciar Fechamento
        </Button>
      </Stack>

      <ScheduleAnalyticsCard analytics={analytics} />

      <DailyReviewDialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        date={todayStr}
        onReviewSubmitted={() => {
          setReviewDialogOpen(false);
          refreshSchedule();
        }}
      />
    </Box>
  );
}
