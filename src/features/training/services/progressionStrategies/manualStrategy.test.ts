import { describe, expect, it } from 'vitest';

import { manualProgressionStrategy } from './manualStrategy';

describe('manualProgressionStrategy', () => {
  it('never suggests a change, regardless of history', () => {
    expect(manualProgressionStrategy.suggestNext({ strategy: 'manual' }, [], [])).toBeNull();
  });
});
