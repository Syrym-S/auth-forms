import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import AuthLayout from '../components/AuthLayout';
import { useRegister } from '../context/RegisterContext';
import { registerRequest } from '../../api/auth';

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

  const onSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        fio: form.fullName,
        email: form.email,
        password: form.password,
        password_confirm: form.confirmPassword,
        is_foreigner: form.isForeign,
        is_ip: form.isIP,
      };

      if (form.docNumber) payload.document_number = form.docNumber;
      if (form.issueCountry) payload.issue_country = form.issueCountry;
      if (form.iin) payload.iin = form.iin;
      if (form.docIssuer) payload.docIssuer = form.docIssuer;
      if (form.docDate) payload.docDate = form.docDate;
      if (form.ipName) payload.ipName = form.ipName;
      if (form.ipIIN) payload.ipIIN = form.ipIIN;
      if (form.invite) payload.invite = form.invite;

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
          label="Документ о регистрации юридического лица"
          file={legalRegistrationDocumentFile}
          inputKey={fileInputKeys.legalRegistrationDocument}
          error={errors.legalRegistrationDocument?.message}
          inputProps={register('legalRegistrationDocument', {
            required: 'Загрузите документ о регистрации юридического лица',
          })}
          onRemove={() => handleRemoveFile('legalRegistrationDocument')}
        />

        <DocumentUploadField
          label="Документ о трудоустройстве сотрудника с правом подписи или приказ о назначении первого руководителя"
          file={signerAuthorityDocumentFile}
          inputKey={fileInputKeys.signerAuthorityDocument}
          error={errors.signerAuthorityDocument?.message}
          inputProps={register('signerAuthorityDocument', {
            required:
              'Загрузите документ о праве подписи или приказ о назначении',
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
