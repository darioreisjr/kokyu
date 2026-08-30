import { getUnitDefinition, getUnitGroup } from '../constants/units';
import type { Unit, UnitGroup, VolumeUnit, WeightUnit } from '../types/units.types';

const WEIGHT_TO_GRAMS: Record<WeightUnit, number> = { g: 1, kg: 1000 };
const VOLUME_TO_ML: Record<VolumeUnit, number> = { ml: 1, l: 1000 };

/** The smallest unit of each convertible group — what `calculateShoppingNeeds` consolidates into, so every quantity in one group lands in the same unit before summing. */
export const BASE_UNIT_OF_GROUP: Partial<Record<UnitGroup, Unit>> = {
  weight: 'g',
  volume: 'ml',
};

export function areUnitsCompatible(a: Unit, b: Unit): boolean {
  return getUnitGroup(a) === getUnitGroup(b);
}

/**
 * Converts within `weight` or `volume` only — `count`/`culinary`
 * units never auto-convert (a "colher de sopa" isn't a fixed gram
 * amount without knowing which ingredient it is), so this returns
 * `null` for anything outside a compatible weight/volume pair,
 * including two different count units. Callers must handle `null`
 * rather than assume every pair converts.
 */
export function convertUnit(quantity: number, from: Unit, to: Unit): number | null {
  if (from === to) return quantity;

  const fromGroup = getUnitGroup(from);
  if (fromGroup !== getUnitGroup(to)) return null;

  if (fromGroup === 'weight') {
    const grams = quantity * WEIGHT_TO_GRAMS[from as WeightUnit];
    return grams / WEIGHT_TO_GRAMS[to as WeightUnit];
  }
  if (fromGroup === 'volume') {
    const milliliters = quantity * VOLUME_TO_ML[from as VolumeUnit];
    return milliliters / VOLUME_TO_ML[to as VolumeUnit];
  }
  return null;
}

/** `convertUnit` into that unit's group base (g/ml) — the normalization step `calculateShoppingNeeds` runs every quantity through before consolidating. Returns the original quantity/unit unchanged for `count`/`culinary`, which have no base unit. */
export function toBaseUnit(quantity: number, unit: Unit): { quantity: number; unit: Unit } {
  const base = BASE_UNIT_OF_GROUP[getUnitGroup(unit)];
  if (!base) return { quantity, unit };
  const converted = convertUnit(quantity, unit, base);
  return converted === null ? { quantity, unit } : { quantity: converted, unit: base };
}

/**
 * User-facing formatting only — upgrades a base-unit quantity (grams/
 * milliliters) to kg/l once it reaches 1000, so a 1500g shopping need
 * reads as "1,5 kg" instead of a less legible "1500 g". Never used by
 * the calculation engine itself, which always works in the base unit.
 */
export function formatQuantity(quantity: number, unit: Unit): string {
  const group = getUnitGroup(unit);
  let displayQuantity = quantity;
  let displayUnit = unit;

  if (group === 'weight' && unit === 'g' && quantity >= 1000) {
    displayQuantity = quantity / 1000;
    displayUnit = 'kg';
  } else if (group === 'volume' && unit === 'ml' && quantity >= 1000) {
    displayQuantity = quantity / 1000;
    displayUnit = 'l';
  }

  const rounded = Math.round(displayQuantity * 100) / 100;
  const formattedNumber = rounded.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  return `${formattedNumber} ${getUnitDefinition(displayUnit).abbreviation}`;
}
