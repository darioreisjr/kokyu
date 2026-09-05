import { dailyRhythmHomeProvider } from './dailyRhythmHomeProvider';
import { goalHomeProvider } from './goalHomeProvider';
import { habitHomeProvider } from './habitHomeProvider';
import { leisureHomeProvider } from './leisureHomeProvider';
import { missionHomeProvider } from './missionHomeProvider';
import { nutritionHomeProvider } from './nutritionHomeProvider';
import { trainingHomeProvider } from './trainingHomeProvider';

export {
  dailyRhythmHomeProvider,
  goalHomeProvider,
  habitHomeProvider,
  leisureHomeProvider,
  missionHomeProvider,
  nutritionHomeProvider,
  trainingHomeProvider,
};

/** Every Home Provider — `HomeSnapshotService` orchestrates exactly this list, nothing hardcoded twice. */
export const allHomeProviders = [
  missionHomeProvider,
  habitHomeProvider,
  trainingHomeProvider,
  nutritionHomeProvider,
  goalHomeProvider,
  leisureHomeProvider,
  dailyRhythmHomeProvider,
];
