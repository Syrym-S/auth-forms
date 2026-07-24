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

export default function RegisterLegal() {
  const navigate = useNavigate();
  const { form, updateStep } = useRegister();

  const [error, setError] = useState('');

  const { register, handleSubmit, watch } = useForm({
    defaultValues: form,
  });

  const isIP = watch('isIP');

  const onSubmit = (data) => {
    setError('');

    updateStep(data);
    navigate('/register/documents');
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

        <Button fullWidth variant="contained" sx={{ mt: 2 }} type="submit">
          Дальше
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
