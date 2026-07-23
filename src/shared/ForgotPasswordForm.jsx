import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { forgotPasswordRequest } from '../api/auth';

export function ForgotPasswordForm({ loginPath = '/login' }) {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setError('');
    setSuccessMessage('');

    try {
      const response = await forgotPasswordRequest({
        email: data.email,
      });

      setSuccessMessage(
        response?.data?.message ||
          'Ссылка для сброса пароля была отправлена на указанную почту',
      );
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
        Восстановление пароля
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Введите email, указанный при регистрации. Мы отправим ссылку для сброса
        пароля.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Email"
          type="email"
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

        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Отправляем...' : 'Отправить ссылку'}
        </Button>
      </Box>

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />

        <Button component={Link} to={loginPath} fullWidth variant="outlined">
          Вернуться ко входу
        </Button>
      </Box>
    </>
  );
}
