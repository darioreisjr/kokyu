'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { useHabitAnalytics } from '../../hooks/useHabitAnalytics';
import { HabitAreaIcon } from '../HabitAreaIcon/HabitAreaIcon';

export function HabitProgressPage() {
  const { analytics, isLoading } = useHabitAnalytics();

  if (isLoading || !analytics) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Progresso & Análise de Consistência
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Métricas de longo prazo, ritmo semanal, distribuição por áreas e insights de
            comportamento.
          </Typography>
        </Stack>

        {/* Top KPI Cards */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
              <CardContent>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Consistência Geral (30d)
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <TrendingUpRoundedIcon color="primary" />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {analytics.overallConsistency}%
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Média móvel ponderada
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
                    Hábitos no Trilho
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {analytics.habitsOnTrackCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Consistência ≥ 70%
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
                    Hábitos Ativos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {analytics.activeHabitsCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {analytics.completedRoutinesCount} rotinas ativas
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
                    Total de Execuções
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {analytics.totalExecutionsInPeriod}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Check-ins concluídos
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Weekly Rhythm */}
        <Card variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
          <CardContent>
            <Stack spacing={2.5}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Ritmo Semanal</Typography>
              <Typography variant="body2" color="text.secondary">
                Percentual médio de cumprimento dos hábitos em cada dia da semana nas últimas 4 semanas:
              </Typography>

              <Grid container spacing={2}>
                {analytics.weeklyRhythm.map((day) => (
                  <Grid key={day.weekday} size={{ xs: 12, sm: 6, md: 1.71 }}>
                    <Box
                      sx={(theme) => ({
                        p: 2,
                        borderRadius: 2,
                        textAlign: 'center',
                        backgroundColor: themePalette(theme).kokyu.surface.secondary,
                      })}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {day.label}
                      </Typography>
                      <Typography variant="h5" sx={{ my: 1, fontWeight: 700 }}>
                        {day.completionRate}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {day.totalCompleted}/{day.totalScheduled}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        {/* Area Distribution */}
        <Card variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
          <CardContent>
            <Stack spacing={2.5}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Distribuição por Áreas da Vida</Typography>

              <Grid container spacing={2}>
                {analytics.areaDistribution.map((item) => (
                  <Grid key={item.area} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box
                      sx={(theme) => ({
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${themePalette(theme).kokyu.border.default}`,
                        backgroundColor: themePalette(theme).kokyu.background.paper,
                      })}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <HabitAreaIcon area={item.area} size="small" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {item.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.count} {item.count === 1 ? 'hábito' : 'hábitos'}
                            </Typography>
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {item.percentage}%
                          </Typography>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={item.percentage}
                          sx={{ borderRadius: 1, height: 6 }}
                        />
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
