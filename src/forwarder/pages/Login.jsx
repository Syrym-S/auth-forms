import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { loginRequest } from "../../api/auth";

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
      await loginRequest(payload);

      window.location.href = "/staging/forwarder";
    } catch (e) {
      setError(e?.message || "Ошибка входа");
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
        />

        <TextField
          fullWidth
          label="Password"
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

        <Button fullWidth variant="contained" sx={{ mt: 2 }} type="submit">
          Зайти
        </Button>
      </form>

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />
        <Button component={Link} to="/register" fullWidth variant="outlined">
          Регистрация
        </Button>
      </Box>
    </AuthLayout>
  );
}
