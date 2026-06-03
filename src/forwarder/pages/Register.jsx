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

export default function Register() {
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    setError("");

    try {
      console.log("REGISTER COMPANY:", data);

      // await registerCompanyRequest(data)
    } catch (e) {
      setError(e?.message || "Ошибка регистрации");
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

      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="БИН"
          margin="normal"
          error={!!errors.bin}
          helperText={errors.bin?.message}
          {...register("bin", {
            required: "Введите БИН",
            minLength: {
              value: 12,
              message: "БИН должен содержать минимум 12 символов",
            },
          })}
        />

        <TextField
          fullWidth
          label="Название компании"
          margin="normal"
          error={!!errors.companyName}
          helperText={errors.companyName?.message}
          {...register("companyName", {
            required: "Введите название компании",
          })}
        />

        <TextField
          fullWidth
          label="ФИО главного экспедитора"
          margin="normal"
          error={!!errors.managerName}
          helperText={errors.managerName?.message}
          {...register("managerName", {
            required: "Введите ФИО",
          })}
        />

        <TextField
          fullWidth
          label="Телефон"
          margin="normal"
          error={!!errors.phone}
          helperText={errors.phone?.message}
          {...register("phone", {
            required: "Введите телефон",
            pattern: {
              value: /^\+?[0-9]{10,15}$/,
              message: "Некорректный номер телефона",
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

        <TextField
          fullWidth
          label="Re-enter password"
          type="password"
          margin="normal"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Повторите пароль",
            validate: (value) => value === password || "Пароли не совпадают",
          })}
        />

        <Button fullWidth variant="contained" sx={{ mt: 2 }} type="submit">
          Регистрация
        </Button>
      </form>

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />
        <Button component={Link} to="/login" fullWidth variant="outlined">
          Войти
        </Button>
      </Box>
    </AuthLayout>
  );
}
