import type { AvailableTimeSuggestionInput, RankedSuggestion } from '../types/suggestion.types';
import { getSuggestionsForAvailableTime as calculateSuggestions } from '../utils/suggestionEngine';
import { leisureItemService } from './leisureItemService';

/** The service-layer entry point to the suggestion engine - loads the current library from the backend and hands it to the pure `getSuggestionsForAvailableTime`, so a component never assembles that list itself. */
export async function getSuggestionsForAvailableTime(
  input: AvailableTimeSuggestionInput,
): Promise<RankedSuggestion[]> {
  const items = await leisureItemService.getLeisureItems();
  return calculateSuggestions(items, input);
}
