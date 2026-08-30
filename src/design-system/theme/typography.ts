import type { TypographyVariantsOptions } from '@mui/material/styles';

import { fontFamily, typeScale } from '../tokens/primitives/typography';

function variant(token: (typeof typeScale)[keyof typeof typeScale]) {
  return {
    fontFamily: token.fontFamily,
    fontWeight: token.fontWeight,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    letterSpacing: token.letterSpacing,
  };
}

export const kokyuTypography: TypographyVariantsOptions = {
  fontFamily: fontFamily.sans,
  displayLarge: variant(typeScale.displayLarge),
  displayMedium: variant(typeScale.displayMedium),
  displaySmall: variant(typeScale.displaySmall),
  h1: variant(typeScale.heading1),
  h2: variant(typeScale.heading2),
  h3: variant(typeScale.heading3),
  h4: variant(typeScale.heading4),
  h5: variant(typeScale.heading5),
  h6: variant(typeScale.heading6),
  body1: variant(typeScale.bodyMedium),
  body2: variant(typeScale.bodySmall),
  subtitle1: variant(typeScale.bodyLarge),
  subtitle2: variant(typeScale.labelLarge),
  labelLarge: variant(typeScale.labelLarge),
  labelMedium: variant(typeScale.labelMedium),
  labelSmall: variant(typeScale.labelSmall),
  caption: variant(typeScale.caption),
  button: {
    ...variant(typeScale.labelLarge),
    textTransform: 'none',
  },
  overline: {
    ...variant(typeScale.labelSmall),
    textTransform: 'uppercase',
  },
};
