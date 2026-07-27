import {
  Alert,
  Box,
  Button,
  Divider,
  Typography,
} from '@mui/material';
import {
  DocumentUploadField
} from '../../shared/DocumentUploadField';
import { getSelectedFile } from '../../shared/document-upload-file.helpers'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import AuthLayout from '../components/AuthLayout';
import { useRegister } from '../context/RegisterContext';
import { registerRequest } from '../../api/auth';

const REGISTRATION_DOCUMENT_NAME =
  'Документ о регистрации юридического лица';

const EMPLOYER_DOCUMENT_NAME =
  'Документ о трудоустройстве сотрудника с правом подписи или приказ о назначении первого руководителя';

export default function RegisterDocuments() {
  const navigate = useNavigate();
  const { form } = useRegister();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [fileInputKeys, setFileInputKeys] = useState({
    legalRegistrationDocument: 0,
    signerAuthorityDocument: 0,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      legalRegistrationDocument: null,
      signerAuthorityDocument: null,
    },
  });

  const legalRegistrationDocument = watch('legalRegistrationDocument');
  const signerAuthorityDocument = watch('signerAuthorityDocument');

  const legalRegistrationDocumentFile = getSelectedFile(
    legalRegistrationDocument,
  );
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
    setLoading(true);
    setError('');

    try {
      const registrationDocumentFile = getSelectedFile(
        data.legalRegistrationDocument,
      );

      const employerDocumentFile = getSelectedFile(
        data.signerAuthorityDocument,
      );

      const payload = new FormData();

      payload.append('fio', form.fullName);
      payload.append('email', form.email);
      payload.append('password', form.password);
      payload.append('password_confirm', form.confirmPassword);
      payload.append('is_foreigner', form.isForeign ? '1' : '0');
      payload.append('is_ip', form.isIP ? '1' : '0');

      if (form.docNumber) {
        payload.append('document_number', form.docNumber);
      }

      if (form.issueCountry) {
        payload.append('issue_country', form.issueCountry);
      }

      if (form.iin) {
        payload.append('iin', form.iin);
      }

      if (form.docIssuer) {
        payload.append('docIssuer', form.docIssuer);
      }

      if (form.docDate) {
        payload.append('docDate', form.docDate);
      }

      if (form.ipName) {
        payload.append('ipName', form.ipName);
      }

      if (form.ipIIN) {
        payload.append('ipIIN', form.ipIIN);
      }

      if (form.invite) {
        payload.append('invite', form.invite);
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
        Документы
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <DocumentUploadField
          label={REGISTRATION_DOCUMENT_NAME}
          file={legalRegistrationDocumentFile}
          inputKey={fileInputKeys.legalRegistrationDocument}
          error={errors.legalRegistrationDocument?.message}
          inputProps={register('legalRegistrationDocument', {
            required: 'Загрузите документ о регистрации юридического лица',
          })}
          onRemove={() => handleRemoveFile('legalRegistrationDocument')}
        />

        <DocumentUploadField
          label={EMPLOYER_DOCUMENT_NAME}
          file={signerAuthorityDocumentFile}
          inputKey={fileInputKeys.signerAuthorityDocument}
          error={errors.signerAuthorityDocument?.message}
          inputProps={register('signerAuthorityDocument', {
            required: 'Загрузите документ о праве подписи или приказ о назначении',
          })}
          onRemove={() => handleRemoveFile('signerAuthorityDocument')}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Загрузка...' : 'Регистрация'}
        </Button>
      </form>

      <Box mt={2}>
        <Divider sx={{ mb: 2 }} />

        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate('/register/legal')}
        >
          Назад
        </Button>
      </Box>
    </AuthLayout>
  );
}
