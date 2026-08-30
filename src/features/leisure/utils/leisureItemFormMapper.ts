import type { LeisureItemInput } from '../services/leisureItemService';
import type { LeisureItemFormValues } from '../schemas/leisureItemSchema';
import type { LeisureItem, LeisureItemStatus } from '../types/leisureItem.types';

/** The type-specific data slice each `LeisureItemForm`'s type actually uses — everything else in the flat form is ignored for that type, matching what `LeisureItemDialog` itself renders. */
function buildTypeData(values: LeisureItemFormValues): Record<string, unknown> {
  if (values.type === 'book') return { author: values.author || undefined, pages: values.pages };
  if (values.type === 'audiobook') return { author: values.author || undefined };
  if (values.type === 'game') return { platform: values.platform || undefined };
  if (values.type === 'place' || values.type === 'event')
    return {
      category: values.category,
      address: values.address || undefined,
      city: values.city || undefined,
    };
  return {};
}

/**
 * The single place a flat `LeisureItemFormValues` becomes a real,
 * type-discriminated `LeisureItemInput` — every page that creates or
 * edits an item (Hoje's Quick Add, Para depois's "Organizar",
 * Biblioteca/Lugares/Hobbies' own "Adicionar") goes through this
 * instead of re-deriving the mapping itself.
 */
export function mapFormValuesToLeisureItemInput(values: LeisureItemFormValues): LeisureItemInput {
  return {
    title: values.title,
    type: values.type,
    description: values.description || undefined,
    status: values.status as LeisureItemStatus,
    tags: values.tags,
    priority: values.priority,
    durationType: values.durationType,
    estimatedDuration: values.durationType === 'fixed' ? values.estimatedDuration : undefined,
    minimumUsefulDuration:
      values.durationType === 'flexible' ? values.minimumUsefulDuration : undefined,
    sourceUrl: values.sourceUrl || undefined,
    recommendedBy: values.recommendedBy || undefined,
    favorite: false,
    [values.type]: buildTypeData(values),
  } as unknown as LeisureItemInput;
}

/** Same mapping, but preserves the item's existing `favorite`/id-adjacent fields for an edit — only the form-owned fields are overwritten. */
export function mapFormValuesToLeisureItemPatch(
  values: LeisureItemFormValues,
  existing: LeisureItem,
): LeisureItemInput {
  return {
    ...mapFormValuesToLeisureItemInput(values),
    favorite: existing.favorite,
  } as LeisureItemInput;
}

/**
 * The reverse direction — prefills `LeisureItemDialog` when editing an
 * existing item. `unsorted` items never reach this (they're
 * "organized" instead, never "edited"), but falls back to `custom` if
 * one ever does, so the form still renders something sane.
 */
export function mapLeisureItemToFormValues(item: LeisureItem): LeisureItemFormValues {
  const typeData = (item as unknown as Record<string, Record<string, unknown> | undefined>)[
    item.type
  ];
  return {
    title: item.title,
    type: item.type === 'unsorted' ? 'custom' : item.type,
    description: item.description ?? '',
    status: item.status,
    tags: item.tags,
    priority: item.priority,
    durationType: item.durationType,
    estimatedDuration: item.estimatedDuration,
    minimumUsefulDuration: item.minimumUsefulDuration,
    sourceUrl: item.sourceUrl ?? '',
    recommendedBy: item.recommendedBy ?? '',
    author: (typeData?.author as string | undefined) ?? '',
    pages: typeData?.pages as number | undefined,
    platform: (typeData?.platform as string | undefined) ?? '',
    category: (typeData?.category as string | undefined) ?? '',
    address: (typeData?.address as string | undefined) ?? '',
    city: (typeData?.city as string | undefined) ?? '',
  };
}
