/** Weight and volume convert losslessly within their own group; count/culinary units never auto-convert (see `unitConversion.ts`). */
export type WeightUnit = 'g' | 'kg';
export type VolumeUnit = 'ml' | 'l';
export type CountUnit = 'unidade' | 'pacote' | 'caixa' | 'lata' | 'garrafa' | 'pote';
export type CulinaryUnit = 'colher-cha' | 'colher-sopa' | 'xicara';

export type Unit = WeightUnit | VolumeUnit | CountUnit | CulinaryUnit;

export type UnitGroup = 'weight' | 'volume' | 'count' | 'culinary';

export interface UnitDefinition {
  id: Unit;
  group: UnitGroup;
  label: string;
  /** Short form for compact displays (shopping list rows, pantry cards). */
  abbreviation: string;
}
