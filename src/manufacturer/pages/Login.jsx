import FormButton from "../../shared/FormButton";
import FormInput from "../../shared/FormInput";
import { Alert, Box, Divider, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";

import AuthLayout from "../components/AuthLayout";
import { loginRequest } from "../../api/auth";
import { api, isStaging } from "../../api/client";
import { getLoginErrorMessage } from "../../shared/login-error.helpers";
import { NotRegisteredModal } from "../../shared/NotRegisteredModal";
import {
  getVerifyRegistered,
  getSupportContacts,
  getRegistrationNotVerifiedError,
} from "../../shared/verify-registered.helpers";
import axios from "axios";

export default function Login() {
  console.log("Hello,world!");
  console.log(api.baseURL);
  console.log(axios.baseURL);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotRegisteredOpen, setIsNotRegisteredOpen] = useState(false);
  const [support, setSupport] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  async function onSubmit(data) {
    try {
      setIsSubmitting(true);
      setError("");

      const payload = {
        email: data.email,
        password: data.password,
      };

      const nonce = window?.APP_DATA?.nonce || window?.app_data?.nonce;

      if (!nonce) {
        setError("Не удалось получить WP nonce. Обновите страницу.");
        return;
      }

      const res = await loginRequest(payload, nonce);

      console.log(res);

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
        window.location.href = isStaging
          ? "/staging/manufacturer"
          : "/manufacturer";
      }
    } catch (error) {
      const notVerifiedSupport = getRegistrationNotVerifiedError(error);

      if (notVerifiedSupport) {
        setSupport(notVerifiedSupport);
        setIsNotRegisteredOpen(true);
        return;
      }

      setError(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <NotRegisteredModal open={isNotRegisteredOpen} support={support} />

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
            md: 500,
          },
        }}
      >
        Вход
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          fullWidth
          label="Email"
          margin="normal"
          autoComplete="email"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register("email", {
            required: "Введите email",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Некорректный email",
            },
          })}
        />

        <FormInput
          type="password"
          fullWidth
          label="Пароль"
          margin="normal"
          autoComplete="current-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register("password", {
            required: "Введите пароль",
            minLength: {
              value: 6,
              message: "Минимум 6 символов",
            },
          })}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <FormButton
            variant="text"
            component={Link}
            to="/forgot-password"
            size="small"
            sx={{ px: 0 }}
          >
            Забыли пароль?
          </FormButton>
        </Box>

        <FormButton
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Вход..." : "Войти"}
        </FormButton>
      </form>

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />

        <FormButton
          component={Link}
          to="/register"
          fullWidth
          variant="outlined"
        >
          Регистрация
        </FormButton>
      </Box>
    </AuthLayout>
  );
}
