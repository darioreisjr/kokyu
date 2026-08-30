/** Small, centralized magic numbers — never re-typed inline in a component. */
export const leisureConfig = {
  /** Fallback `minimumUsefulDuration` (minutes) for a flexible item whose type has no default in `leisureItemTypeDefinitions` and no value of its own. */
  fallbackMinimumUsefulDuration: 20,
  /** Star-rating scale, used everywhere a personal rating is shown or edited. */
  maxRating: 5,
} as const;
