'use client';

import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';

import { themePalette } from '@/design-system/theme/useThemePalette';

import { useExercises } from '../../hooks/useExercises';
import { usePersonalRecords } from '../../hooks/usePersonalRecords';
import { formatWeight } from '../../utils/weightUnit';

export interface PersonalRecordTableProps {
  weightUnit: 'kg' | 'lb';
}

/** Recordes por faixa de repetições (1, 3, 5, 8, 10...) — one row per exercise, one column per rep count actually recorded. */
export function PersonalRecordTable({ weightUnit }: PersonalRecordTableProps) {
  const { records } = usePersonalRecords();
  const { exercises } = useExercises();

  const exerciseNameById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise.name] as const)),
    [exercises],
  );

  const rows = useMemo(() => {
    const repPRs = records.filter(
      (record) => record.recordType === 'repPR' && record.reps !== undefined,
    );
    const byExercise = new Map<string, Map<number, number>>();
    for (const record of repPRs) {
      const repMap = byExercise.get(record.exerciseId) ?? new Map<number, number>();
      repMap.set(record.reps!, record.value);
      byExercise.set(record.exerciseId, repMap);
    }
    return [...byExercise.entries()].map(([exerciseId, repMap]) => ({
      exerciseId,
      exerciseName: exerciseNameById.get(exerciseId) ?? exerciseId,
      reps: [...repMap.entries()].sort((a, b) => a[0] - b[0]),
    }));
  }, [records, exerciseNameById]);

  if (rows.length === 0) {
    return (
      <Typography
        variant="body2"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        Ainda sem recordes por faixa de repetições.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="labelLarge" component="h2">
        Recordes por repetições
      </Typography>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Exercício</TableCell>
              <TableCell>Recordes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.exerciseId}>
                <TableCell>{row.exerciseName}</TableCell>
                <TableCell>
                  {row.reps
                    .map(
                      ([reps, value]) =>
                        `${reps} rep${reps > 1 ? 's' : ''}: ${formatWeight(value, weightUnit)}`,
                    )
                    .join(' · ')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
