import {
  Alert,
  Box,
  Button,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

import AuthLayout from '../components/AuthLayout';
import { loginRequest } from '../../api/auth';
import { isStaging } from '../../api/client';
import { getLoginErrorMessage } from '../../shared/login-error.helpers';
import { PasswordField } from '../../shared/PasswordField';

export default function Login() {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  });

  async function onSubmit(data) {
    try {
      setIsSubmitting(true);
      setError('');

      const payload = {
        email: data.email,
        password: data.password,
      };

      const res = await loginRequest(payload);

      const redirectUrl = res?.redirect_url || res?.data?.redirect_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      } else {
        window.location.href = isStaging ? '/staging/factor' : '/factor';
      }
    } catch (error) {
      setError(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <Typography
        variant="h5"
        mb={2}
        sx={{
          fontSize: {
            xs: '2rem',
            md: '1.5rem',
          },
          fontWeight: {
            xs: 600,
            md: 500,
          },
        }}
      >
        Вход
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          autoComplete="email"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register('email', {
            required: 'Введите email',
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: 'Некорректный email',
            },
          })}
        />

        <PasswordField
          fullWidth
          label="Пароль"
          margin="normal"
          autoComplete="current-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register('password', {
            required: 'Введите пароль',
            minLength: {
              value: 6,
              message: 'Минимум 6 символов',
            },
          })}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            component={Link}
            to="/forgot-password"
            size="small"
            sx={{ px: 0 }}
          >
            Забыли пароль?
          </Button>
        </Box>

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Вход...' : 'Войти'}
        </Button>
      </form>

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />

        <Button component={Link} to="/register" fullWidth variant="outlined">
          Регистрация
        </Button>
      </Box>
    </AuthLayout>
  );
}
