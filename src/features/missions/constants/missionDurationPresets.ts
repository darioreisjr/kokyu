export interface MissionDurationPreset {
  minutes: number;
  label: string;
}

export const missionDurationPresets: MissionDurationPreset[] = [
  { minutes: 15, label: '15 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 45, label: '45 min' },
  { minutes: 60, label: '1h' },
  { minutes: 90, label: '1h30' },
  { minutes: 120, label: '2h' },
];

/** Used by the duration filter (spec "DURATION FILTER") — `undefined` max means "1h+". */
export const missionDurationFilterPresets: { label: string; max?: number }[] = [
  { label: 'Até 15 min', max: 15 },
  { label: 'Até 30 min', max: 30 },
  { label: 'Até 1h', max: 60 },
  { label: '1h+' },
];

export function formatMissionDuration(minutes?: number): string {
  if (!minutes || minutes <= 0) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h${remainder}` : `${hours}h`;
}
