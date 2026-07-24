import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useState, useEffect } from 'react';
import { getClaimInfoApi, registerRequest } from '../../api/auth';
import { useRegister } from '../context/InviteContext';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { isStaging } from '../../api/client';

const REGISTRATION_DOCUMENT_NAME = 'Документ о регистрации юридического лица';

const EMPLOYER_DOCUMENT_NAME =
  'Документ о трудоустройстве сотрудника с правом подписи или приказ о назначении первого руководителя';

function getSelectedFile(value) {
  if (!value) {
    return null;
  }

  return value?.[0] || null;
}

function formatFileSize(size) {
  if (!size && size !== 0) {
    return '';
  }

  const sizeInMb = size / 1024 / 1024;

  return `${sizeInMb.toFixed(2)} MB`;
}

function SelectedFilePreview({ file, onRemove }) {
  if (!file) {
    return null;
  }

  return (
    <Box
      sx={{
        mt: 1.25,
        p: 1.25,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
          flexShrink: 0,
        }}
      >
        <DescriptionOutlinedIcon color="primary" fontSize="large" />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          noWrap
          title={file.name}
          sx={{
            fontWeight: 500,
          }}
        >
          {file.name}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {formatFileSize(file.size)}
        </Typography>
      </Box>

      <IconButton
        color="error"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRemove();
        }}
      >
        <DeleteOutlineRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

function DocumentUploadField({
  label,
  file,
  inputKey,
  error,
  inputProps,
  onRemove,
}) {
  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        display: 'block',
        border: '1px dashed',
        borderColor: error ? 'error.main' : 'primary.main',
        borderRadius: 2,
        backgroundColor: error
          ? 'rgba(211, 47, 47, 0.04)'
          : 'rgba(25, 118, 210, 0.04)',
        transition: '0.2s ease',
        '&:hover': {
          backgroundColor: error
            ? 'rgba(211, 47, 47, 0.08)'
            : 'rgba(25, 118, 210, 0.08)',
        },
      }}
    >
      <Typography
        sx={{
          mb: 1,
          fontWeight: 500,
          color: 'text.secondary',
        }}
      >
        {label}
      </Typography>

      {file ? (
        <SelectedFilePreview file={file} onRemove={onRemove} />
      ) : (
        <Button
          variant="outlined"
          component="label"
          startIcon={<DescriptionOutlinedIcon />}
        >
          Выбрать файл
          <input
            key={inputKey}
            hidden
            accept=".pdf,.jpg,.jpeg,.png"
            type="file"
            {...inputProps}
          />
        </Button>
      )}

      {error && (
        <Typography
          sx={{
            mt: 1,
            fontSize: 12,
            color: 'error.main',
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default function Register() {
  const { invite } = useRegister();
  const { search } = useLocation();

  const claimCode = new URLSearchParams(search).get('claim');

  // const [valuesFromInviteLink, setValuesFromInviteLink] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileInputKeys, setFileInputKeys] = useState({
    registration_document: 0,
    signer_authority_document: 0,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      company_name: '',
      bin: '',
      fio: '',
      phone: '',
      iin: '',
      document_number: '',
      issue_country: '',
      registration_document: null,
      signer_authority_document: null,
      email: '',
      password: '',
      password_confirm: '',
    },
  });

  const password = watch('password');
  const company_name = watch('company_name');
  const bin = watch('bin');
  const email = watch('email');
  const registrationDocument = watch('registration_document');
  const signerAuthorityDocument = watch('signer_authority_document');
  const registrationDocumentFile = getSelectedFile(registrationDocument);
  const signerAuthorityDocumentFile = getSelectedFile(signerAuthorityDocument);

  function handleRemoveFile(fieldName) {
    setValue(fieldName, null, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setFileInputKeys((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName] + 1,
    }));
  }

  const onSubmit = async (data) => {
    setError('');

    try {
      const registrationDocumentFile = getSelectedFile(
        data.registration_document,
      );

      const employerDocumentFile = getSelectedFile(
        data.signer_authority_document,
      );

      const payload = new FormData();

      payload.append('company_name', data.company_name);
      payload.append('bin', data.bin);
      payload.append('fio', data.fio);
      payload.append('phone', data.phone);
      payload.append('iin', data.iin);
      payload.append('document_number', data.document_number);
      payload.append('issue_country', data.issue_country);
      payload.append('email', data.email);
      payload.append('password', data.password);
      payload.append('password_confirm', data.password_confirm);

      if (invite) {
        payload.append('invite', invite);
      }

      if (registrationDocumentFile) {
        payload.append(
          'registration_document',
          registrationDocumentFile,
          registrationDocumentFile.name,
        );
        payload.append(
          'registration_document_name',
          REGISTRATION_DOCUMENT_NAME,
        );
      }

      if (employerDocumentFile) {
        payload.append(
          'employer_document',
          employerDocumentFile,
          employerDocumentFile.name,
        );
        payload.append('employer_document_name', EMPLOYER_DOCUMENT_NAME);
      }

      const res = await registerRequest(payload);

      if (res.data?.error) {
        throw new Error(res.data.error);
      }

      console.log('REGISTER SUCCESS', res.data);

      window.location.href = isStaging ? '/staging/customer' : 'customer';
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Ошибка регистрации');
    }
  };

  const fetchClaimInfo = async () => {
    if (!claimCode) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await getClaimInfoApi(claimCode);

      const data = response.data;

      reset({
        company_name: data.full_name ?? '',
        bin: data.bin ?? '',
        fio: data?.person?.fio ?? '',
        phone: data?.person?.phone ?? '',
        iin: data?.person?.iin ?? '',
        document_number: '',
        issue_country: data.issue_country ?? '',
        registration_document: null,
        signer_authority_document: null,
        email: data?.person?.email ?? '',
        password: '',
        password_confirm: '',
      });
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          e?.message ||
          'Ошибка c получением claim code',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimInfo();
  }, [claimCode]);

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
        {isLoading && <CircularProgress size={16} sx={{ pl: 2 }} />}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Название компании"
          margin="normal"
          error={!!errors.company_name}
          helperText={errors.company_name?.message}
          {...register('company_name', {
            required: 'Введите название компании',
          })}
          slotProps={{
            inputLabel: {
              shrink: !!company_name,
            },
          }}
        />

        <TextField
          fullWidth
          label="БИН компании"
          margin="normal"
          error={!!errors.bin}
          helperText={errors.bin?.message}
          {...register('bin', {
            required: 'Введите БИН',
            minLength: {
              value: 12,
              message: 'БИН должен содержать 12 цифр',
            },
            maxLength: {
              value: 12,
              message: 'БИН должен содержать 12 цифр',
            },
          })}
          slotProps={{
            inputLabel: {
              shrink: !!bin,
            },
          }}
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
          label="ИИН"
          margin="normal"
          error={!!errors.iin}
          helperText={errors.iin?.message}
          {...register('iin', {
            required: 'Введите ИИН',
            minLength: {
              value: 12,
              message: 'ИИН должен содержать 12 цифр',
            },
            maxLength: {
              value: 12,
              message: 'ИИН должен содержать 12 цифр',
            },
            pattern: {
              value: /^[0-9]{12}$/,
              message: 'ИИН должен содержать только 12 цифр',
            },
          })}
        />

        <TextField
          fullWidth
          label="Номер документа"
          margin="normal"
          error={!!errors.document_number}
          helperText={errors.document_number?.message}
          {...register('document_number', {
            required: 'Введите номер документа',
          })}
        />

        <TextField
          fullWidth
          label="Страна документа"
          margin="normal"
          error={!!errors.issue_country}
          helperText={errors.issue_country?.message}
          {...register('issue_country', {
            required: 'Введите страну документа',
          })}
        />

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
          slotProps={{
            inputLabel: {
              shrink: !!email,
            },
          }}
        />

        <DocumentUploadField
          label={REGISTRATION_DOCUMENT_NAME}
          file={registrationDocumentFile}
          inputKey={fileInputKeys.registration_document}
          error={errors.registration_document?.message}
          inputProps={register('registration_document', {
            required: 'Загрузите документ о регистрации юридического лица',
          })}
          onRemove={() => handleRemoveFile('registration_document')}
        />

        <DocumentUploadField
          label={EMPLOYER_DOCUMENT_NAME}
          file={signerAuthorityDocumentFile}
          inputKey={fileInputKeys.signer_authority_document}
          error={errors.signer_authority_document?.message}
          inputProps={register('signer_authority_document', {
            required:
              'Загрузите документ о праве подписи или приказ о назначении',
          })}
          onRemove={() => handleRemoveFile('signer_authority_document')}
        />

        <TextField
          fullWidth
          label="Пароль"
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
          label="Повторите пароль"
          type="password"
          margin="normal"
          error={!!errors.password_confirm}
          helperText={errors.password_confirm?.message}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Загрузка...' : 'Зарегистрировать'}
        </Button>
      </Box>

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />

        <Button component={Link} to="/login" fullWidth variant="outlined">
          Войти
        </Button>
      </Box>
    </AuthLayout>
  );
}
