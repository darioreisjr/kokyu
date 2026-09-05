import SelfImprovementRoundedIcon from '@mui/icons-material/SelfImprovementRounded';
import Stack from '@mui/material/Stack';
import { EmptyState, KokyuButton } from '@/design-system/components';

export interface RespirationEmptyStateProps {
  onNavigate: (href: string) => void;
}

/**
 * A brand-new account with nothing planned yet gets this instead of
 * seven empty domain cards (see spec's "EMPTY HOME"/"ONBOARDING
 * PROGRESSIVO") — one focused prompt, not every module's setup at once.
 */
export function RespirationEmptyState({ onNavigate }: RespirationEmptyStateProps) {
  return (
    <EmptyState
      icon={SelfImprovementRoundedIcon}
      title="Comece definindo o ritmo do seu dia."
      description="Adicione sua primeira Missão, Hábito ou Treino para ver a Respiração ganhar vida."
      action={
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 1.5 }}>
          <KokyuButton variant="contained" onClick={() => onNavigate('/app/missoes')}>
            Criar primeira Missão
          </KokyuButton>
          <KokyuButton variant="outlined" onClick={() => onNavigate('/app/habitos')}>
            Criar Hábito
          </KokyuButton>
          <KokyuButton variant="outlined" onClick={() => onNavigate('/app/treinamento')}>
            Planejar Treino
          </KokyuButton>
          <KokyuButton variant="text" onClick={() => onNavigate('/app/ritmo-diario')}>
            Explorar Kokyu
          </KokyuButton>
        </Stack>
      }
    />
  );
}
