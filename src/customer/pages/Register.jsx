import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useState, useEffect } from "react";
import { getClaimInfoApi, registerRequest } from "../../api/auth";
import { useRegister } from "../context/InviteContext";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";

export default function Register() {
  const { invite } = useRegister();
  const { search } = useLocation();

  const claimCode = new URLSearchParams(search).get("claim");

  // const [valuesFromInviteLink, setValuesFromInviteLink] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      company_name: "",
      bin: "",
      document_number: "",
      issue_country: "",
      email: "",
      password: "",
      password_confirm: "",
    },
  });

  const password = watch("password");
  const company_name = watch("company_name");
  const bin = watch("bin");
  const email = watch("email");

  const onSubmit = async (data) => {
    setError("");

    try {
      const payload = {
        ...data,
        ...(invite ? { invite } : {}),
      };

      const res = await registerRequest(payload);

      if (res.data?.error) {
        throw new Error(res.data.error);
      }

      console.log("REGISTER SUCCESS", res.data);

      window.location.href = "/customer";
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Ошибка регистрации");
    }
  };

  const fetchClaimInfo = async () => {
    try {
      setIsLoading(true);

      const response = await getClaimInfoApi(claimCode);

      const data = response.data;

      reset({
        company_name: data.full_name ?? "",
        bin: data.bin ?? "",
        document_number: "",
        issue_country: data.issue_country ?? "",
        email: data?.person?.email ?? "",
        password: "",
        password_confirm: "",
      });

      setIsLoading(false);
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.message ||
          "Ошибка c получением claim code",
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimInfo();
  }, []);

  return (
    <AuthLayout>
      <Typography
        variant="h5"
        mb={2}
        sx={{
          fontSize: {
            xs: "2rem",
            md: "1.5rem",
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
          {...register("company_name", {
            required: "Введите название компании",
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
          {...register("bin", {
            required: "Введите БИН",
            minLength: {
              value: 12,
              message: "БИН должен содержать 12 цифр",
            },
            maxLength: {
              value: 12,
              message: "БИН должен содержать 12 цифр",
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
          label="Номер документа"
          margin="normal"
          error={!!errors.document_number}
          helperText={errors.document_number?.message}
          {...register("document_number", {
            required: "Введите номер документа",
          })}
        />

        <TextField
          fullWidth
          label="Страна документа"
          margin="normal"
          error={!!errors.issue_country}
          helperText={errors.issue_country?.message}
          {...register("issue_country", {
            required: "Введите страну документа",
          })}
        />

        <TextField
          fullWidth
          label="Email"
          margin="normal"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register("email", {
            required: "Введите email",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Некорректный email",
            },
          })}
          slotProps={{
            inputLabel: {
              shrink: !!email,
            },
          }}
        />

        <TextField
          fullWidth
          label="Пароль"
          type="password"
          margin="normal"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register("password", {
            required: "Введите пароль",
            minLength: {
              value: 6,
              message: "Минимум 6 символов",
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
          {...register("password_confirm", {
            required: "Подтвердите пароль",
            validate: (value) => value === password || "Пароли не совпадают",
          })}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Загрузка..." : "Зарегистрировать"}
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
