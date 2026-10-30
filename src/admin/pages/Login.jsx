import FormButton from '../../shared/FormButton';
import FormInput from '../../shared/FormInput';
import {
  Box,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { loginRequest } from "../../api/auth";
import { isStaging } from "../../api/client";
import { getLoginErrorMessage } from "../../shared/login-error.helpers";

export default function Login() {
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setError("");

    try {
      const payload = {
        email: data.email,
        password: data.password,
      };

      // сюда потом вставишь API
      const res = await loginRequest(payload);

      const redirectUrl =
        res?.redirect_url ||
        res?.data?.redirect_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      } else {
         window.location.href = isStaging ? "/staging/admin" : "/admin";
      }
    } catch (e) {
      setError(getLoginErrorMessage(e));
    }
  };

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
        Вход
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput
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
        />

        <FormInput
          type="password"
          fullWidth
          label="Password"
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

        <FormButton fullWidth variant="contained" sx={{ mt: 2 }} type="submit">
          Войти
        </FormButton>
      </form>

      {/* <Box mt={3}>
        <Divider sx={{ mb: 2 }} />
        <FormButton component={Link} to="/register" fullWidth variant="outlined">
          Регистрация
        </FormButton>
      </Box> */}
    </AuthLayout>
  );
}
