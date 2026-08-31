'use client';

import { useMemo } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import UnarchiveRoundedIcon from '@mui/icons-material/UnarchiveRounded';

import { EmptyState } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { getHabitAreaLabel } from '../../constants/habitAreas';
import { useHabits } from '../../hooks/useHabits';
import { habitService } from '../../services/habitService';
import { HabitAreaIcon } from '../HabitAreaIcon/HabitAreaIcon';

export function ArchivedHabitsPage() {
  const { habits, isLoading, refresh } = useHabits();

  const archivedHabits = useMemo(() => {
    return habits.filter((h) => h.status === 'archived');
  }, [habits]);

  const handleUnarchive = async (id: string) => {
    await habitService.unarchiveHabit(id);
    await refresh();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Hábitos Arquivados
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hábitos que você concluiu ou decidiu pausar por tempo indeterminado. O histórico é
            preservado.
          </Typography>
        </Stack>

        {isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : archivedHabits.length === 0 ? (
          <EmptyState
            icon={ArchiveRoundedIcon}
            title="Nenhum hábito arquivado"
            description="Quando você não quiser mais acompanhar um hábito no dia a dia, poderá arquivá-lo com segurança."
          />
        ) : (
          <Stack spacing={2}>
            {archivedHabits.map((habit) => (
              <Card
                key={habit.id}
                variant="outlined"
                sx={(theme) => ({
                  borderRadius: 3,
                  backgroundColor: themePalette(theme).kokyu.background.paper,
                })}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 2,
                    }}
                  >
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                      <HabitAreaIcon area={habit.area} size="medium" />
                      <Stack spacing={0.5}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>{habit.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getHabitAreaLabel(habit.area)}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Button
                      variant="outlined"
                      startIcon={<UnarchiveRoundedIcon />}
                      onClick={() => handleUnarchive(habit.id)}
                    >
                      Desarquivar
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
