import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useState } from 'react';
import { loginRequestDriver } from '../../api/auth';
import { useForm } from 'react-hook-form';
import { isStaging } from '../../api/client';
import { saveAuthData } from '../services/authStorage';
import { getLoginErrorMessage } from '../../shared/login-error.helpers';
import { PasswordField } from '../../shared/PasswordField';

export default function Login() {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setError('');

    try {
      const res = await loginRequestDriver(data);

      if (res.data?.error) {
        throw new Error(res.data.error);
      }

      console.log('LOGIN RESPONSE', JSON.stringify(res.data, null, 2));
      saveAuthData(res.data);

      const redirectUrl = res?.redirect_url || res?.data?.redirect_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      } else {
        window.location.href = isStaging ? '/staging/driver' : '/driver';
      }
    } catch (e) {
      setError(getLoginErrorMessage(e));
    }
  };

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
            md: 400,
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

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          error={!!errors.email}
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
          label="Password"
          margin="normal"
          error={!!errors.password}
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
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Загрузка...' : 'Войти'}
        </Button>
      </Box>

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />

        <Button component={Link} to="/register" fullWidth variant="outlined">
          Регистрация
        </Button>
      </Box>
    </AuthLayout>
  );
}
