/** Every Nutrição URL, in one place — components link via these, never a literal `/app/nutricao/...` string. */
export const nutritionRoutes = {
  today: '/app/nutricao',
  planner: '/app/nutricao/planejamento',
  pantry: '/app/nutricao/despensa',
  shopping: '/app/nutricao/compras',
  recipes: '/app/nutricao/receitas',
  newRecipe: '/app/nutricao/receitas/nova',
  recipe: (id: string) => `/app/nutricao/receitas/${id}`,
} as const;

export interface NutritionTabConfig {
  id: string;
  label: string;
  href: string;
}

/** Drives `NutritionTabs` — the internal sub-navigation, kept separate from the app's own `navigationItems`. */
export const nutritionTabs: NutritionTabConfig[] = [
  { id: 'hoje', label: 'Hoje', href: nutritionRoutes.today },
  { id: 'planejamento', label: 'Planejamento', href: nutritionRoutes.planner },
  { id: 'despensa', label: 'Despensa', href: nutritionRoutes.pantry },
  { id: 'compras', label: 'Compras', href: nutritionRoutes.shopping },
  { id: 'receitas', label: 'Receitas', href: nutritionRoutes.recipes },
];
