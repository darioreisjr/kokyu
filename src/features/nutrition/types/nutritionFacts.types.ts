/**
 * Prepared for a future implementation — never computed or guessed by
 * Kokyu itself. Every field is optional and only ever populated from
 * data the user entered or a trustworthy external source supplies.
 * Not medical guidance; not a source of truth until that future work
 * lands.
 */
export interface NutritionFacts {
  calories?: number;
  proteinGrams?: number;
  carbohydrateGrams?: number;
  fatGrams?: number;
  fiberGrams?: number;
  sodiumMilligrams?: number;
}
