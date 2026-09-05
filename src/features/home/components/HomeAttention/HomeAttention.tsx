import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { AlertColor } from '@mui/material/Alert';
import type { HomeAttentionItem, HomeAttentionSeverity } from '@/shared/home/types';

export interface HomeAttentionProps {
  items: HomeAttentionItem[];
  onOpen: (href: string) => void;
}

const SEVERITY_TO_ALERT_COLOR: Record<HomeAttentionSeverity, AlertColor> = {
  info: 'info',
  attention: 'warning',
  important: 'error',
};

const MAX_VISIBLE = 5;

/**
 * "Precisa de atenção" — only rendered when there's something to show
 * (`RespirationPage` skips this section entirely otherwise, see spec's
 * "NO ALERT"). Informative, never a panic UI: `outlined` alerts, no
 * severity defaults to red (see spec's "NÃO CRIAR PANIC UI"/"Evitar
 * vermelho para tudo").
 */
export function HomeAttention({ items, onOpen }: HomeAttentionProps) {
  if (items.length === 0) return null;

  return (
    <Stack spacing={1.5}>
      <Typography variant="h6" component="h2">
        Precisa de atenção
      </Typography>
      {items.slice(0, MAX_VISIBLE).map((item) => (
        <Alert
          key={item.id}
          severity={SEVERITY_TO_ALERT_COLOR[item.severity]}
          variant="outlined"
          sx={{ borderRadius: 2 }}
          action={
            item.actionLabel && item.actionHref ? (
              <Typography
                component="button"
                variant="labelMedium"
                onClick={() => onOpen(item.actionHref!)}
                sx={{
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  fontWeight: 700,
                  textDecoration: 'underline',
                }}
              >
                {item.actionLabel}
              </Typography>
            ) : undefined
          }
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {item.title}
          </Typography>
          {item.description ? <Typography variant="caption">{item.description}</Typography> : null}
        </Alert>
      ))}
    </Stack>
  );
}
