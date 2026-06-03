import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { useRegister } from "../context/RegisterContext";
import { useForm } from "react-hook-form";

export default function Register() {
  const navigate = useNavigate();
  const { form, updateStep } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: form,
  });

  const onSubmit = (data) => {
    if (data.password !== data.confirmPassword) {
      return;
    }

    updateStep(data);
    navigate("/register/citizen");
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="ФИО"
          margin="normal"
          error={!!errors.fullName}
          helperText={errors.fullName?.message}
          {...register("fullName", {
            required: "Введите ФИО",
          })}
        />

        <TextField
          fullWidth
          label="Email"
          margin="normal"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register("email", {
            required: "Введите Email",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Некорректный Email",
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
            validate: (value) =>
              value === watch("password") || "Пароли не совпадают",
          })}
        />

        <Button fullWidth variant="contained" sx={{ mt: 2 }} type="submit">
          Дальше
        </Button>
      </form>
    </AuthLayout>
  );
}
