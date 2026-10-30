import { useAuthTranslation } from "../i18n/useAuthTranslation";
import { useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export function PasswordField({ slotProps, ...props }) {
  const { t } = useAuthTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      slotProps={{
        ...slotProps,
        input: {
          ...slotProps?.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                edge="end"
                tabIndex={-1}
                aria-label={visible ? t('Скрыть пароль') : t('Показать пароль')}
                onClick={() => setVisible((v) => !v)}
              >
                {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
