import {
  Box,
  TextField,
  Divider,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { useRegister } from '../context/RegisterContext';
import { useForm } from 'react-hook-form';

export default function RegisterCitizen() {
  const navigate = useNavigate();
  const { form, updateStep } = useRegister();

  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: form,
  });

  const isForeign = watch('isForeign');

  const onSubmit = (data) => {
    setError('');

    if (!data.iin) {
      return setError('Введите ИИН');
    }

    updateStep(data);
    navigate('/register/legal');
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
        Гражданство
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControlLabel
          control={<Checkbox {...register('isForeign')} />}
          label="Иностранец?"
        />

        <TextField
          fullWidth
          label="ИИН"
          margin="normal"
          error={!!errors.iin}
          helperText={errors.iin?.message}
          {...register('iin', {
            required: 'Введите ИИН',
          })}
        />

        <TextField
          fullWidth
          label="Номер уд. личности"
          margin="normal"
          disabled={isForeign}
          {...register('docNumber')}
        />

        <TextField
          fullWidth
          label="Страна документа"
          margin="normal"
          disabled={isForeign}
          {...register('issueCountry')}
        />

        <TextField
          fullWidth
          label="Кем выдан"
          margin="normal"
          disabled={isForeign}
          {...register('docIssuer')}
        />

        <TextField
          fullWidth
          type="date"
          margin="normal"
          disabled={isForeign}
          InputLabelProps={{ shrink: true }}
          {...register('docDate')}
        />

        <Box mt={2} display="flex" gap={2}>
          <Button fullWidth variant="contained" type="submit">
            Дальше
          </Button>

          <Divider sx={{ mb: 2 }} />

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/register')}
          >
            Назад
          </Button>
        </Box>
      </form>
    </AuthLayout>
  );
}
