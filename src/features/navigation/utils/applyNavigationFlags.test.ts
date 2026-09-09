import { describe, expect, it } from 'vitest';
import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';

import type { NavigationItemConfig } from '@/design-system/components';

import { applyNavigationFlags } from './applyNavigationFlags';

const icon = (() => null) as unknown as ComponentType<SvgIconProps>;

function item(id: string): NavigationItemConfig {
  return { id, label: id, href: `/app/${id}`, icon };
}

describe('applyNavigationFlags', () => {
  it('marks an item unlocked only when its flag is exactly true', () => {
    const result = applyNavigationFlags([item('perfil')], { perfil: true });
    expect(result[0]?.locked).toBe(false);
  });

  it('marks an item locked when its flag is false', () => {
    const result = applyNavigationFlags([item('nutricao')], { nutricao: false });
    expect(result[0]?.locked).toBe(true);
  });

  it('defaults to locked when the id is missing from flags entirely', () => {
    const result = applyNavigationFlags([item('metas')], {});
    expect(result[0]?.locked).toBe(true);
  });

  it('never mutates the input items', () => {
    const items = [item('perfil')];
    applyNavigationFlags(items, { perfil: true });
    expect(items[0]).not.toHaveProperty('locked');
  });
});
