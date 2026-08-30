import type { AvailableTimeSuggestionInput, RankedSuggestion } from '../types/suggestion.types';
import { getSuggestionsForAvailableTime as calculateSuggestions } from '../utils/suggestionEngine';
import { leisureDb } from './leisureMockDb';

/** The service-layer entry point to the suggestion engine — pulls live items from the mock store and hands them to the pure `getSuggestionsForAvailableTime`, so a component never assembles that list itself. */
export async function getSuggestionsForAvailableTime(
  input: AvailableTimeSuggestionInput,
): Promise<RankedSuggestion[]> {
  return calculateSuggestions(leisureDb.items, input);
}
