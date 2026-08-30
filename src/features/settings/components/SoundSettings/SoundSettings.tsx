'use client';

import { useEffect, useState } from 'react';

import { usePreferences } from '../../providers/PreferencesProvider';
import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsRow } from '../SettingsRow/SettingsRow';
import { SettingsSection } from '../SettingsSection/SettingsSection';
import { SettingsToggle } from '../SettingsToggle/SettingsToggle';

/** Settings → Sons e feedback. No sound assets ship with Kokyu yet — these preferences exist ahead of that, off by default, so nothing plays that shouldn't. */
export function SoundSettings() {
  const { preferences, updateSection } = usePreferences();
  const { interfaceSounds, completionSound } = preferences.sound;

  const [hapticsSupported, setHapticsSupported] = useState(false);
  useEffect(() => {
    queueMicrotask(() => {
      setHapticsSupported(typeof navigator !== 'undefined' && 'vibrate' in navigator);
    });
  }, []);

  return (
    <SettingsSection
      title="Sons e feedback"
      description="Sinais sonoros e táteis — discretos, e desligados até você ligá-los."
      autosaves
    >
      <SettingsGroup>
        <SettingsRow
          anchorId="setting-sons-interface"
          title="Sons da interface"
          description="Sons curtos para ações como concluir, avançar ou receber um aviso."
          control={
            <SettingsToggle
              label="Sons da interface"
              checked={interfaceSounds}
              onChange={(checked) => updateSection('sound', { interfaceSounds: checked })}
            />
          }
        />
        <SettingsRow
          anchorId="setting-sons-conclusao"
          title="Som ao concluir"
          description="Reservado para quando missões, hábitos e treinos tiverem um som de conclusão."
          control={
            <SettingsToggle
              label="Som ao concluir"
              checked={completionSound}
              onChange={(checked) => updateSection('sound', { completionSound: checked })}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          anchorId="setting-sons-haptico"
          title="Feedback tátil"
          description={
            hapticsSupported
              ? 'Uma pequena vibração ao confirmar ações, quando o dispositivo suporta.'
              : 'Não disponível neste dispositivo — reservado para uso futuro em PWA/mobile.'
          }
          disabled={!hapticsSupported}
        />
      </SettingsGroup>
    </SettingsSection>
  );
}
