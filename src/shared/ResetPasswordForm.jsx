import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
} from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { resetPasswordRequest } from '../api/auth';

export function ResetPasswordForm({ loginPath = '/login' }) {
  const [searchParams] = useSearchParams();

  const userId = searchParams.get('user_id');
  const resetToken = searchParams.get('reset_token');

  const hasResetParams = Boolean(userId && resetToken);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      password: '',
      password_confirm: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setError('');
    setSuccessMessage('');

    if (!hasResetParams) {
      setError('Ссылка для сброса пароля некорректна или устарела');
      return;
    }

    try {
      const response = await resetPasswordRequest({
        user_id: Number(userId),
        token: resetToken,
        password: data.password,
        password_confirm: data.password_confirm,
      });

      setSuccessMessage(response?.data?.message || 'Пароль успешно изменён');

      reset({
        password: '',
        password_confirm: '',
      });
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Не удалось отправить ссылку для сброса пароля',
      );
    }
  };

  return (
    <>
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
        Новый пароль
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Придумайте новый пароль для входа в аккаунт.
      </Typography>

      {!hasResetParams && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ссылка для сброса пароля некорректна. Запросите новую ссылку.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Пароль успешно изменён. Теперь можно войти с новым паролем.
        </Alert>
      )}

      {!successMessage && (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            label="Новый пароль"
            type="password"
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={!hasResetParams || isSubmitting}
            {...register('password', {
              required: 'Введите новый пароль',
              minLength: {
                value: 6,
                message: 'Минимум 6 символов',
              },
            })}
          />

          <TextField
            fullWidth
            label="Повторите пароль"
            type="password"
            margin="normal"
            error={!!errors.password_confirm}
            helperText={errors.password_confirm?.message}
            disabled={!hasResetParams || isSubmitting}
            {...register('password_confirm', {
              required: 'Подтвердите пароль',
              validate: (value) => value === password || 'Пароли не совпадают',
            })}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={!hasResetParams || isSubmitting}
          >
            {isSubmitting ? 'Сохраняем...' : 'Сбросить пароль'}
          </Button>
        </Box>
      )}

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />

        <Button component={Link} to={loginPath} fullWidth variant="outlined">
          Вернуться ко входу
        </Button>
      </Box>
    </>
  );
}
