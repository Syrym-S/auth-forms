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
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import {
  DocumentUploadField
} from '../../shared/DocumentUploadField';
import { getSelectedFile } from '../../shared/document-upload-file.helpers'
import { normalizeBackendParams } from '../../shared/backend-validation-error.helpers';
import { useState, useEffect } from 'react';
import { getClaimInfoApi, registerRequest } from '../../api/auth';
import { useRegister } from '../context/InviteContext';
import { useForm, Controller } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { isStaging } from '../../api/client';
import { formatPhoneInput } from '../../shared/phone-format.helpers';

const REGISTRATION_DOCUMENT_NAME = 'Документ о регистрации юридического лица';

const EMPLOYER_DOCUMENT_NAME =
  'Документ о трудоустройстве сотрудника с правом подписи или приказ о назначении первого руководителя';

export default function Register() {
  const { invite } = useRegister();
  const { search } = useLocation();

  const claimCode = new URLSearchParams(search).get('claim');

  // const [valuesFromInviteLink, setValuesFromInviteLink] = useState(null);
  const [error, setErrorMessage] = useState('');
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
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      company_name: '',
      bin: '',
      bik: '',
      bank_name: '',
      iik: '',
      legal_address: '',
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

  const BACKEND_FIELD_MAP = {
    company_name: { field: 'company_name', message: 'Проверьте название компании' },
    bin: { field: 'bin', message: 'БИН указан некорректно' },
    bik: { field: 'bik', message: 'БИК указан некорректно' },
    bank_name: { field: 'bank_name', message: 'Проверьте название банка' },
    iik: { field: 'iik', message: 'Проверьте правильность ИИК' },
    legal_address: { field: 'legal_address', message: 'Проверьте адрес компании' },
    fio: { field: 'fio', message: 'Проверьте корректность ФИО' },
    phone: { field: 'phone', message: 'Проверьте номер телефона' },
    iin: { field: 'iin', message: 'ИИН указан некорректно' },
    document_number: { field: 'document_number', message: 'Проверьте номер документа' },
    issue_country: { field: 'issue_country', message: 'Укажите страну выдачи документа' },
    email: { field: 'email', message: 'Проверьте правильность email' },
    password: { field: 'password', message: 'Проверьте пароль' },
    password_confirm: { field: 'password_confirm', message: 'Проверьте подтверждение пароля' },
    registration_document: {
      field: 'registration_document',
      message: 'Проверьте загруженный документ о регистрации',
    },
    employer_document: {
      field: 'signer_authority_document',
      message: 'Проверьте загруженный документ о праве подписи',
    },
  };

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
    setErrorMessage('');

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
      payload.append('legal_address', data.legal_address);
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

      if (data.bik) {
        payload.append('bik', data.bik);
      }

      if (data.bank_name) {
        payload.append('bank_name', data.bank_name);
      }

      if (data.iik) {
        payload.append('iik', data.iik);
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
      const ulStatus = e?.response?.data?.ul_status;

      if (ulStatus) {
        setErrorMessage(
          'Не удалось найти организацию по указанному БИН. Проверьте правильность БИН и повторите попытку.',
        );
        return;
      }

      if (e?.response?.data?.error === 'Company exists') {
        setError('bin', {
          type: 'server',
          message: 'Компания с таким БИН уже зарегистрирована',
        });
        setErrorMessage('Проверьте БИН — компания уже зарегистрирована');
        return;
      }

      const params = e?.response?.data?.data?.params;
      const paramEntries = normalizeBackendParams(params);

      const unmatchedMessages = [];
      let matchedAny = false;

      paramEntries.forEach(({ fieldName, backendMessage }) => {
        const mapping = BACKEND_FIELD_MAP[fieldName];
        if (mapping) {
          matchedAny = true;
          setError(mapping.field, {
            type: 'server',
            message: mapping.message,
          });
        } else {
          unmatchedMessages.push(backendMessage || fieldName);
        }
      });

      if (matchedAny && unmatchedMessages.length === 0) {
        setErrorMessage('Проверьте выделенные поля');
      } else if (matchedAny) {
        setErrorMessage(
          `Проверьте выделенные поля. Также: ${unmatchedMessages.join(', ')}`,
        );
      } else if (unmatchedMessages.length > 0) {
        setErrorMessage(unmatchedMessages.join(', '));
      } else {
        setErrorMessage(
          e?.response?.data?.message ||
            e?.response?.data?.error ||
            e?.message ||
            'Ошибка регистрации',
        );
      }
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
        bik: data.bik ?? '',
        bank_name: data.bank_name ?? '',
        iik: data.iik ?? '',
        legal_address: data.legal_address ?? '',
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
      setErrorMessage(
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
          label="БИК компании"
          margin="normal"
          error={!!errors.bik}
          helperText={errors.bik?.message}
          {...register('bik')}
        />

        <TextField
          fullWidth
          label="Банк компании"
          margin="normal"
          error={!!errors.bank_name}
          helperText={errors.bank_name?.message}
          {...register('bank_name')}
        />

        <TextField
          fullWidth
          label="ИИК"
          margin="normal"
          error={!!errors.iik}
          helperText={errors.iik?.message}
          {...register('iik')}
        />

        <TextField
          fullWidth
          label="Юридический адрес"
          margin="normal"
          error={!!errors.legal_address}
          helperText={errors.legal_address?.message}
          {...register('legal_address', {
            required: 'Введите юридический адрес',
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

        <Controller
          name="phone"
          control={control}
          rules={{
            required: 'Введите телефон',
            pattern: {
              value: /^\+?[0-9]{10,15}$/,
              message: 'Некорректный номер телефона',
            },
          }}
          render={({ field }) => (
            <TextField
              fullWidth
              label="Телефон"
              margin="normal"
              error={!!errors.phone}
              helperText={errors.phone?.message}
              inputRef={field.ref}
              name={field.name}
              onBlur={field.onBlur}
              value={formatPhoneInput(field.value).display}
              onChange={(e) => {
                field.onChange(
                  formatPhoneInput(e.target.value, field.value).value,
                );
              }}
            />
          )}
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
