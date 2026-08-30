'use client';

import Rating from '@mui/material/Rating';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { leisureConfig } from '../../constants/leisureConfig';

export interface RatingInputProps {
  value: number | null;
  onChange?: (value: number | null) => void;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/** A personal 1–5 rating — MUI's `Rating` already gives full keyboard support and per-value accessible names via `getLabelText`, so "Componente de estrelas deve possuir nome acessível" needs no extra work here. */
export function RatingInput({ value, onChange, readOnly, size = 'medium' }: RatingInputProps) {
  return (
    <Rating
      value={value}
      max={leisureConfig.maxRating}
      readOnly={readOnly}
      size={size}
      onChange={(_event, newValue) => onChange?.(newValue)}
      getLabelText={(rating) => `${rating} de ${leisureConfig.maxRating} estrelas`}
      sx={(theme) => ({
        color: themePalette(theme).kokyu.feedback.warning,
        '& .MuiRating-iconEmpty': { color: themePalette(theme).kokyu.text.disabled },
      })}
    />
  );
}
