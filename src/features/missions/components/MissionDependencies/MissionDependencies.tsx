import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';

export interface MissionDependencyRef {
  id: string;
  title: string;
  isOpen: boolean;
}

export interface MissionDependenciesProps {
  blockedBy: MissionDependencyRef[];
  blocks: MissionDependencyRef[];
  onRemove?: (missionId: string) => void;
}

/** Never hides the mission itself — a blocked mission stays fully accessible (spec "NÃO IMPEDIR VISUALIZAÇÃO"). */
export function MissionDependencies({ blockedBy, blocks, onRemove }: MissionDependenciesProps) {
  if (blockedBy.length === 0 && blocks.length === 0) return null;

  const openBlockers = blockedBy.filter((ref) => ref.isOpen);

  return (
    <Stack spacing={1.5}>
      {blockedBy.length > 0 && (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">
            {openBlockers.length > 0
              ? `Bloqueada por ${openBlockers.length} missõe${openBlockers.length > 1 ? 's' : ''}`
              : 'Depende de'}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {blockedBy.map((ref) => (
              <Chip
                key={ref.id}
                icon={ref.isOpen ? <BlockRoundedIcon fontSize="small" /> : <LinkRoundedIcon fontSize="small" />}
                label={ref.title}
                color={ref.isOpen ? 'error' : 'default'}
                variant={ref.isOpen ? 'filled' : 'outlined'}
                onDelete={onRemove ? () => onRemove(ref.id) : undefined}
              />
            ))}
          </Stack>
        </Stack>
      )}

      {blocks.length > 0 && (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Bloqueia</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {blocks.map((ref) => (
              <Chip key={ref.id} icon={<LinkRoundedIcon fontSize="small" />} label={ref.title} variant="outlined" />
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
