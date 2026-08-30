import type { Unit, UnitDefinition, UnitGroup } from '../types/units.types';

/** The single source of truth for every unit's label/group — no component writes a unit string of its own. */
export const unitDefinitions: UnitDefinition[] = [
  { id: 'g', group: 'weight', label: 'Grama', abbreviation: 'g' },
  { id: 'kg', group: 'weight', label: 'Quilograma', abbreviation: 'kg' },
  { id: 'ml', group: 'volume', label: 'Mililitro', abbreviation: 'ml' },
  { id: 'l', group: 'volume', label: 'Litro', abbreviation: 'l' },
  { id: 'unidade', group: 'count', label: 'Unidade', abbreviation: 'un' },
  { id: 'pacote', group: 'count', label: 'Pacote', abbreviation: 'pct' },
  { id: 'caixa', group: 'count', label: 'Caixa', abbreviation: 'cx' },
  { id: 'lata', group: 'count', label: 'Lata', abbreviation: 'lata' },
  { id: 'garrafa', group: 'count', label: 'Garrafa', abbreviation: 'garrafa' },
  { id: 'pote', group: 'count', label: 'Pote', abbreviation: 'pote' },
  { id: 'colher-cha', group: 'culinary', label: 'Colher de chá', abbreviation: 'col. chá' },
  { id: 'colher-sopa', group: 'culinary', label: 'Colher de sopa', abbreviation: 'col. sopa' },
  { id: 'xicara', group: 'culinary', label: 'Xícara', abbreviation: 'xíc.' },
];

const unitById = new Map(unitDefinitions.map((unit) => [unit.id, unit]));

export function getUnitDefinition(unit: Unit): UnitDefinition {
  const definition = unitById.get(unit);
  if (!definition) throw new Error(`Unknown unit: ${unit}`);
  return definition;
}

export function getUnitGroup(unit: Unit): UnitGroup {
  return getUnitDefinition(unit).group;
}

export function getUnitLabel(unit: Unit): string {
  return getUnitDefinition(unit).label;
}

export function getUnitAbbreviation(unit: Unit): string {
  return getUnitDefinition(unit).abbreviation;
}

export const unitsByGroup: Record<UnitGroup, UnitDefinition[]> = {
  weight: unitDefinitions.filter((unit) => unit.group === 'weight'),
  volume: unitDefinitions.filter((unit) => unit.group === 'volume'),
  count: unitDefinitions.filter((unit) => unit.group === 'count'),
  culinary: unitDefinitions.filter((unit) => unit.group === 'culinary'),
};
