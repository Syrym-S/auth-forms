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
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { registerRequest } from '../../api/auth';

export default function Register() {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setError('');

    try {
      const payload = {
        email: data.email,
        password: data.password,
        company_name: data.companyName,
        company_bin: data.companyBin,
        company_bik: data.companyBik,
        company_account: data.companyAccount,
        company_address: data.companyAddress,
        fio: data.fio,
        phone: data.phone,
        document_number: data.documentNumber,
        issue_country: data.issueCountry,
      };

      await registerRequest(payload);
    } catch (e) {
      setError(e?.message || 'Ошибка регистрации');
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
        Регистрация
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
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

        <TextField
          fullWidth
          label="Password"
          type="password"
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

        <TextField
          fullWidth
          label="Название компании"
          margin="normal"
          error={!!errors.companyName}
          helperText={errors.companyName?.message}
          {...register('companyName', {
            required: 'Введите название компании',
          })}
        />

        <TextField
          fullWidth
          label="БИН компании"
          margin="normal"
          error={!!errors.companyBin}
          helperText={errors.companyBin?.message}
          {...register('companyBin', {
            required: 'Введите БИН компании',
            minLength: {
              value: 12,
              message: 'БИН должен содержать минимум 12 символов',
            },
          })}
        />

        <TextField
          fullWidth
          label="БИК компании"
          margin="normal"
          error={!!errors.companyBik}
          helperText={errors.companyBik?.message}
          {...register('companyBik', {
            required: 'Введите БИК компании',
          })}
        />

        <TextField
          fullWidth
          label="Расчетный счет"
          margin="normal"
          error={!!errors.companyAccount}
          helperText={errors.companyAccount?.message}
          {...register('companyAccount', {
            required: 'Введите расчетный счет',
          })}
        />

        <TextField
          fullWidth
          label="Адрес компании"
          margin="normal"
          error={!!errors.companyAddress}
          helperText={errors.companyAddress?.message}
          {...register('companyAddress', {
            required: 'Введите адрес компании',
          })}
        />

        <TextField
          fullWidth
          label="ФИО"
          margin="normal"
          error={!!errors.fio}
          helperText={errors.fio?.message}
          {...register('fio', {
            required: 'Введите ФИО',
          })}
        />

        <TextField
          fullWidth
          label="Телефон"
          margin="normal"
          error={!!errors.phone}
          helperText={errors.phone?.message}
          {...register('phone', {
            required: 'Введите телефон',
            pattern: {
              value: /^\+?[0-9]{10,15}$/,
              message: 'Некорректный номер телефона',
            },
          })}
        />

        <TextField
          fullWidth
          label="Номер документа"
          margin="normal"
          error={!!errors.documentNumber}
          helperText={errors.documentNumber?.message}
          {...register('documentNumber', {
            required: 'Введите номер документа',
          })}
        />

        <TextField
          fullWidth
          label="Страна выдачи"
          margin="normal"
          error={!!errors.issueCountry}
          helperText={errors.issueCountry?.message}
          {...register('issueCountry', {
            required: 'Введите страну выдачи',
          })}
        />

        <Button fullWidth variant="contained" sx={{ mt: 2 }} type="submit">
          Регистрация
        </Button>
      </form>

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />
        <Button component={Link} to="/login" fullWidth variant="outlined">
          Войти
        </Button>
      </Box>
    </AuthLayout>
  );
}
