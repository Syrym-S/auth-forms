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
import { loginRequest } from '../../api/auth';
import { isStaging } from '../../api/client';
import { getLoginErrorMessage } from '../../shared/login-error.helpers';
import { PasswordField } from '../../shared/PasswordField';
import { NotRegisteredModal } from '../../shared/NotRegisteredModal';
import { EcpLoginButton } from '../../shared/EcpLoginButton';
import {
  getEcpRedirectErrorMessage,
  isEcpPendingRegistration,
} from '../../shared/ecp-login.helpers';
import {
  getVerifyRegistered,
  getSupportContacts,
  getRegistrationNotVerifiedError,
  getAppDataSupportContacts,
} from '../../shared/verify-registered.helpers';

export default function Login() {
  const [error, setError] = useState(getEcpRedirectErrorMessage);
  const [isNotRegisteredOpen, setIsNotRegisteredOpen] = useState(
    isEcpPendingRegistration,
  );
  const [support, setSupport] = useState(() =>
    isEcpPendingRegistration() ? getAppDataSupportContacts() : null,
  );

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
      };

      // сюда потом вставишь API
      const res = await loginRequest(payload);

      if (!getVerifyRegistered(res)) {
        setSupport(getSupportContacts(res));
        setIsNotRegisteredOpen(true);
        return;
      }

      const redirectUrl = res?.redirect_url || res?.data?.redirect_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      } else {
        window.location.href = isStaging ? '/staging/forwarder' : '/forwarder';
      }
    } catch (e) {
      const notVerifiedSupport = getRegistrationNotVerifiedError(e);

      if (notVerifiedSupport) {
        setSupport(notVerifiedSupport);
        setIsNotRegisteredOpen(true);
        return;
      }

      setError(getLoginErrorMessage(e));
    }
  };

  return (
    <AuthLayout>
      <NotRegisteredModal
        open={isNotRegisteredOpen}
        support={support}
      />

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

        <Button fullWidth variant="contained" sx={{ mt: 2 }} type="submit">
          Войти
        </Button>
      </form>

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />

        <EcpLoginButton onError={setError} sx={{ mb: 2 }} />

        <Button component={Link} to="/register" fullWidth variant="outlined">
          Регистрация
        </Button>
      </Box>
    </AuthLayout>
  );
}
