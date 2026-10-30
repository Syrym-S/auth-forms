import FormButton from '../../shared/FormButton';
import FormInput from '../../shared/FormInput';
import {
  Box,
  Divider,
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

        <FormInput
          fullWidth
          label="ИИН"
          placeholder="900115300123"
          margin="normal"
          error={!!errors.iin}
          helperText={errors.iin?.message}
          {...register('iin', {
            required: 'Введите ИИН',
          })}
        />

        <FormInput
          fullWidth
          label="Номер документа"
          placeholder="012345678"
          margin="normal"
          disabled={isForeign}
          {...register('docNumber')}
        />

        <FormInput
          fullWidth
          label="Страна документа"
          placeholder="KZ"
          margin="normal"
          disabled={isForeign}
          {...register('issueCountry')}
        />

        <FormInput
          fullWidth
          type="date"
          label="Когда выдан документ"
          margin="normal"
          disabled={isForeign}
          InputLabelProps={{ shrink: true }}
          {...register('docDate')}
        />

        <FormInput
          fullWidth
          label="Кем выдан документ"
          placeholder="МВД РК"
          margin="normal"
          disabled={isForeign}
          {...register('docIssuer')}
        />

        <Box mt={2} display="flex" gap={2}>
          <FormButton fullWidth variant="contained" type="submit">
            Дальше
          </FormButton>

          <Divider sx={{ mb: 2 }} />

          <FormButton
            fullWidth
            variant="outlined"
            onClick={() => navigate('/register')}
          >
            Назад
          </FormButton>
        </Box>
      </form>
    </AuthLayout>
  );
}
