'use client';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useId, useState } from 'react';

import { KokyuTextField, type KokyuTextFieldProps } from '../KokyuTextField/KokyuTextField';

export interface KokyuPasswordFieldProps extends Omit<KokyuTextFieldProps, 'type'> {
  /** Accessible label for the toggle when the password is hidden. @default 'Mostrar senha' */
  showLabel?: string;
  /** Accessible label for the toggle when the password is visible. @default 'Ocultar senha' */
  hideLabel?: string;
}

/**
 * Password input with a show/hide toggle. The toggle is a real button
 * with a correct `aria-label`, reachable and operable by keyboard.
 */
export function KokyuPasswordField({
  showLabel = 'Mostrar senha',
  hideLabel = 'Ocultar senha',
  id,
  ...props
}: KokyuPasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <KokyuTextField
      id={inputId}
      type={visible ? 'text' : 'password'}
      autoComplete="current-password"
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={visible ? hideLabel : showLabel}
                aria-pressed={visible}
                onClick={() => setVisible((current) => !current)}
                edge="end"
                size="small"
              >
                {visible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
}
