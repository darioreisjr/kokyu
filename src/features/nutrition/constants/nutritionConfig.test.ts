import { describe, expect, it } from 'vitest';

import { nutritionConfig } from './nutritionConfig';

describe('nutritionConfig', () => {
  it('defines the "expiring soon" window in days', () => {
    expect(nutritionConfig.expiringSoonDays).toBe(3);
  });
});
