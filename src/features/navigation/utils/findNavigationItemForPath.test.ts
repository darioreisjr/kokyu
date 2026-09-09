import { describe, expect, it } from 'vitest';
import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';

import type { NavigationItemConfig } from '@/design-system/components';

import { findNavigationItemForPath } from './findNavigationItemForPath';

const icon = (() => null) as unknown as ComponentType<SvgIconProps>;

const items: NavigationItemConfig[] = [
  { id: 'respiracao', label: 'Respiração', href: '/app', icon },
  { id: 'nutricao', label: 'Nutrição', href: '/app/nutricao', icon },
];

describe('findNavigationItemForPath', () => {
  it('matches the exact home path to "respiracao" only', () => {
    expect(findNavigationItemForPath('/app', items)?.id).toBe('respiracao');
  });

  it('matches a sub-route to its parent item via prefix', () => {
    expect(findNavigationItemForPath('/app/nutricao/receitas', items)?.id).toBe('nutricao');
  });

  it('never treats every /app/** path as "respiracao" via prefix', () => {
    expect(findNavigationItemForPath('/app/nutricao', items)?.id).toBe('nutricao');
  });

  it('returns undefined for a path with no configured item', () => {
    expect(findNavigationItemForPath('/app/nao-existe', items)).toBeUndefined();
  });
});
