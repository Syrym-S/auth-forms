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
import { registerRequest } from "../../api/auth";
import { useRegister } from "../context/InviteContext";
import { useForm } from "react-hook-form";

export default function Register() {
  const { invite } = useRegister();

  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      company_name: "",
      bin: "",
      email: "",
      password: "",
      password_confirm: "",
    },
  });

  const password = watch("password");

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
