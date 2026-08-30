export interface DurationShortcut {
  id: string;
  label: string;
  /** Minutes — `undefined` for "Personalizado", which prompts for a custom value instead. */
  minutes?: number;
}

/** "Quanto tempo você tem?" — the exact shortcuts the spec calls out for "O que cabe agora?". */
export const durationShortcuts: DurationShortcut[] = [
  { id: '15min', label: '15 min', minutes: 15 },
  { id: '30min', label: '30 min', minutes: 30 },
  { id: '45min', label: '45 min', minutes: 45 },
  { id: '1h', label: '1 hora', minutes: 60 },
  { id: '2h', label: '2 horas', minutes: 120 },
  { id: 'noite-livre', label: 'Noite livre', minutes: 240 },
  { id: 'personalizado', label: 'Personalizado' },
];
