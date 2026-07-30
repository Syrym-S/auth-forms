import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { useRegister } from '../context/RegisterContext';
import { useForm } from 'react-hook-form';
import { registerRequestDriver } from '../../api/auth';
import { saveAuthData } from '../services/authStorage';

export default function RegisterLegal() {
  const navigate = useNavigate();
  const { form, updateStep } = useRegister();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch } = useForm({
    defaultValues: form,
  });

  const isIP = watch('isIP');

  const onSubmit = async (data) => {
    setError('');

    updateStep(data);

    if (data.isIP) {
      navigate('/register/documents');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fio: form.fullName,
        email: form.email,
        password: form.password,
        password_confirm: form.confirmPassword,
        is_foreigner: form.isForeign,
        is_ip: data.isIP,
      };

      if (form.docNumber) payload.document_number = form.docNumber;
      if (form.issueCountry) payload.issue_country = form.issueCountry;
      if (form.iin) payload.iin = form.iin;
      if (form.docIssuer) payload.docIssuer = form.docIssuer;
      if (form.docDate) payload.docDate = form.docDate;
      if (form.invite) payload.invite = form.invite;

      const res = await registerRequestDriver(payload);

      if (res.data?.error) {
        throw new Error(res.data.error);
      }

      saveAuthData(res.data);

      window.location.href = '/driver';
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Typography
        variant="h5"
        mb={1}
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

      <Typography variant="subtitle1" mb={2}>
        ИП
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControlLabel
          control={<Checkbox {...register('isIP')} />}
          label="ИП?"
        />

        <TextField
          fullWidth
          label="Название ИП"
          margin="normal"
          disabled={!isIP}
          {...register('ipName')}
        />

        <TextField
          fullWidth
          label="ИИН"
          margin="normal"
          disabled={!isIP}
          {...register('ipIIN')}
        />

        <Button fullWidth variant="contained" sx={{ mt: 2 }} type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : (isIP ? 'Дальше' : 'Зарегистрироваться')}
        </Button>
      </form>

      <Box mt={2}>
        <Divider sx={{ mb: 2 }} />

        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate('/register/citizen')}
        >
          Назад
        </Button>
      </Box>
    </AuthLayout>
  );
}
