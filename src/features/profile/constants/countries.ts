export interface Country {
  code: string;
  label: string;
}

/**
 * Deliberately small starter list, structured as `{code, label}` so a
 * future full i18n country list can replace this array without any
 * consuming component changing — see `ProfilePersonalInfoForm`.
 */
export const countries: Country[] = [
  { code: 'BR', label: 'Brasil' },
  { code: 'PT', label: 'Portugal' },
  { code: 'US', label: 'Estados Unidos' },
  { code: 'AR', label: 'Argentina' },
  { code: 'ES', label: 'Espanha' },
];

export const DEFAULT_COUNTRY_CODE = 'BR';
