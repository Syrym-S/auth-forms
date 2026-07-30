import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthLayout from "../components/AuthLayout";
import { useRegister } from "../context/RegisterContext";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { getClaimInfoApi } from "../../api/auth";

export default function Register() {
  const navigate = useNavigate();
  const { form, updateStep } = useRegister();
  const { search } = useLocation();

  const claimCode = new URLSearchParams(search).get("claim");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: form,
  });

  const fio = watch("fullName");
  const email = watch("email");

  const onSubmit = (data) => {
    if (data.password !== data.confirmPassword) {
      return;
    }

    updateStep(data);
    navigate("/register/citizen");
  };

  const fetchClaimInfo = async () => {
    try {
      setIsLoading(true);

      const response = await getClaimInfoApi(claimCode);

      const data = response.data;

      console.log(data);

      reset({
        fullName: data.fio ?? "",
        email: data.email ?? "",
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
          slotProps={{
            inputLabel: {
              shrink: !!fio,
            },
          }}
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
          slotProps={{
            inputLabel: {
              shrink: !!email,
            },
          }}
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

        <Box mt={3}>
          <Divider sx={{ mb: 2 }} />

          <Button component={Link} to="/login" fullWidth variant="outlined">
            Войти
          </Button>
        </Box>
      </form>
    </AuthLayout>
  );
}
