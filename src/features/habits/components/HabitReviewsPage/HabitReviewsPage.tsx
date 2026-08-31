'use client';

import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { habitService } from '../../services/habitService';
import type { HabitReview } from '../../types/review.types';
import { HabitReviewDialog } from '../HabitReviewDialog/HabitReviewDialog';

export function HabitReviewsPage() {
  const [reviews, setReviews] = useState<HabitReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    habitService.getHabitReviews().then((data) => {
      if (!cancelled) {
        setReviews(data);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Revisões Periódicas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Reflexões semanais e mensais para calibrar seus hábitos e adaptar sua rotina.
            </Typography>
          </Stack>

          <KokyuButton
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            Nova revisão
          </KokyuButton>
        </Stack>

        {isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={RateReviewRoundedIcon}
            title="Nenhuma revisão realizada"
            description="Faça sua primeira revisão periódica para avaliar o que funcionou e o que pode ser calibrado."
            action={
              <KokyuButton
                variant="contained"
                onClick={() => setIsDialogOpen(true)}
              >
                Iniciar primeira revisão
              </KokyuButton>
            }
          />
        ) : (
          <Stack spacing={2}>
            {reviews.map((rev) => (
              <Card key={rev.id} variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 1,
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Chip
                          label={rev.type === 'weekly' ? 'Semanal' : 'Mensal'}
                          size="small"
                          color="primary"
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {rev.periodStart} até {rev.periodEnd}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack spacing={1.5} sx={{ pt: 1 }}>
                      {rev.reflections.whatWorked && (
                        <Box>
                          <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 600 }}>
                            O que funcionou:
                          </Typography>
                          <Typography variant="body2">{rev.reflections.whatWorked}</Typography>
                        </Box>
                      )}

                      {rev.reflections.whatWasHard && (
                        <Box>
                          <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 600 }}>
                            O que foi difícil:
                          </Typography>
                          <Typography variant="body2">{rev.reflections.whatWasHard}</Typography>
                        </Box>
                      )}

                      {rev.reflections.changesPlanned && (
                        <Box>
                          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600 }}>
                            Mudanças planejadas:
                          </Typography>
                          <Typography variant="body2">{rev.reflections.changesPlanned}</Typography>
                        </Box>
                      )}

                      {rev.reflections.notes && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Notas:
                          </Typography>
                          <Typography variant="body2">{rev.reflections.notes}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      <HabitReviewDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={refresh}
      />
    </Container>
  );
}
