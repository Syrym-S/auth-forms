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
import { useState } from "react";
import { loginRequest } from "../../api/auth";
import { useForm } from "react-hook-form";

export default function Login() {
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setError("");

    try {
      const res = await loginRequest(data);

      if (res.data?.error) {
        throw new Error(res.data.error);
      }

      console.log("LOGIN SUCCESS", res.data);

      window.location.href = "/staging/driver";
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Ошибка авторизации");
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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

        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Загрузка..." : "Зайти"}
        </Button>
      </Box>

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />

        <Button component={Link} to="/register" fullWidth variant="outlined">
          Регистрация
        </Button>
      </Box>
    </AuthLayout>
  );
}
