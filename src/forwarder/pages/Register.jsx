import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  FormHelperText,
  IconButton,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { registerRequest, getClaimInfoApi } from "../../api/auth";
import { isStaging } from "../../api/client";

function getClaimFromUrl() {
  const searchParams = new URLSearchParams(window.location.search);

  return searchParams.get("claim") || "";
}

function getClaimData(response) {
  return response?.data?.data || response?.data || response || {};
}

function mapClaimInfoToForm(claimInfo) {
  const person = claimInfo.person || {};

  return {
    bin: claimInfo.company_bin || claimInfo.bin || "",
    companyName: claimInfo.company_name || claimInfo.companyName || "",

    managerName:
      person.fio ||
      claimInfo.fio ||
      claimInfo.fullName ||
      claimInfo.full_name ||
      claimInfo.name ||
      "",

    phone: person.phone || claimInfo.phone || "",

    email: person.email || claimInfo.email || "",

    iin: person.iin || claimInfo.iin || "",

    documentNumber:
      person.document_number ||
      claimInfo.document_number ||
      claimInfo.documentNumber ||
      "",

    issueCountry:
      person.issue_country ||
      claimInfo.issue_country ||
      claimInfo.issueCountry ||
      "",

    password: "",
    confirmPassword: "",
  };
}

export default function Register() {
  const [error, setError] = useState("");
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const claim = getClaimFromUrl();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      bin: "",
      companyName: "",
      managerName: "",
      phone: "",
      iin: "",
      documentNumber: "",
      issueCountry: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const legalEntityRegistrationDocument = watch(
    "legalEntityRegistrationDocument",
  );
  const employeeEmploymentDocument = watch("employeeEmploymentDocument");

  useEffect(() => {
    if (!claim) {
      return;
    }

    let isCancelled = false;

    async function loadClaimInfo() {
      try {
        setIsClaimLoading(true);
        setError("");

        const response = await getClaimInfoApi(claim);
        const claimInfo = getClaimData(response);

        console.log("FORWARDER CLAIM INFO:", claimInfo);

        if (!isCancelled) {
          reset(mapClaimInfoToForm(claimInfo));
        }
      } catch (requestError) {
        if (!isCancelled) {
          setError(
            requestError.response?.data?.message ||
              requestError.response?.data?.error ||
              requestError.message ||
              "Не удалось загрузить данные приглашения",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsClaimLoading(false);
        }
      }
    }

    loadClaimInfo();

    return () => {
      isCancelled = true;
    };
  }, [claim, reset]);

  const onSubmit = async (data) => {
    setError("");

    try {
      const payload = {
        bin: data.bin,
        company_name: data.companyName,
        fio: data.managerName,
        phone: data.phone,
        iin: data.iin,
        document_number: data.documentNumber,
        issue_country: data.issueCountry,
        email: data.email,
        password: data.password,
        password_confirm: data.confirmPassword,
        ...(claim ? { invite: claim } : {}),
      };

      const res = await registerRequest(payload);

      const redirectUrl = res?.redirect_url || res?.data?.redirect_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      window.location.href = isStaging ? "/staging/auth/login" : "/auth/login";
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

      {isClaimLoading && (
        <Box
          sx={{
            py: 4,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {!isClaimLoading && (
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
            label="ИИН"
            margin="normal"
            error={!!errors.iin}
            helperText={errors.iin?.message}
            {...register("iin", {
              required: "Введите ИИН",
              minLength: {
                value: 12,
                message: "ИИН должен содержать 12 цифр",
              },
              maxLength: {
                value: 12,
                message: "ИИН должен содержать 12 цифр",
              },
            })}
          />

          <TextField
            fullWidth
            label="Номер документа"
            margin="normal"
            error={!!errors.documentNumber}
            helperText={errors.documentNumber?.message}
            {...register("documentNumber", {
              required: "Введите номер документа",
            })}
          />

          <TextField
            fullWidth
            label="Страна документа"
            margin="normal"
            error={!!errors.issueCountry}
            helperText={errors.issueCountry?.message}
            {...register("issueCountry", {
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

          <Box
            sx={{
              border: "1px solid",
              my: 1,
              borderColor: errors.legalEntityRegistrationDocument
                ? "error.main"
                : "divider",
              borderRadius: 2,
              p: 2,
              transition: "0.2s",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "action.hover",
              },
            }}
          >
            <Typography
              sx={{
                color: "rgba(0, 0, 0, 0.6)",
                fontSize: "1rem",
                lineHeight: 1.4375,
                letterSpacing: "0.00938em",
                fontWeight: 400,
              }}
            >
              Документ о регистрации юридического лица
            </Typography>

            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}
            >
              Выбрать файл
              <input
                hidden
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                {...register("legalEntityRegistrationDocument", {
                  required:
                    "Документ о регистрации юридического лица обязателен",
                })}
              />
            </Button>

            {legalEntityRegistrationDocument?.[0] && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  backgroundColor: "background.paper",
                }}
              >
                {legalEntityRegistrationDocument[0].type.startsWith(
                  "image/",
                ) ? (
                  <Box
                    component="img"
                    src={URL.createObjectURL(
                      legalEntityRegistrationDocument[0],
                    )}
                    alt={legalEntityRegistrationDocument[0].name}
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 1,
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1,
                      backgroundColor: "action.hover",
                    }}
                  >
                    <InsertDriveFileOutlinedIcon
                      color="primary"
                      fontSize="large"
                    />
                  </Box>
                )}

                <Box
                  sx={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    noWrap
                    title={legalEntityRegistrationDocument[0].name}
                  >
                    {legalEntityRegistrationDocument[0].name}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {(
                      legalEntityRegistrationDocument[0].size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </Typography>
                </Box>

                <IconButton
                  color="error"
                  onClick={() =>
                    setValue("legalEntityRegistrationDocument", null)
                  }
                >
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </Box>
            )}

            {errors.legalEntityRegistrationDocument && (
              <FormHelperText error>
                {errors.legalEntityRegistrationDocument.message}
              </FormHelperText>
            )}
          </Box>

          <Box
            sx={{
              border: "1px solid",
              my: 1,
              borderColor: errors.employeeEmploymentDocument
                ? "error.main"
                : "divider",
              borderRadius: 2,
              p: 2,
              transition: "0.2s",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "action.hover",
              },
            }}
          >
            <Typography
              sx={{
                color: "rgba(0, 0, 0, 0.6)",
                fontSize: "1rem",
                lineHeight: 1.4375,
                letterSpacing: "0.00938em",
                fontWeight: 400,
              }}
            >
              Документ о трудоустройстве сотрудника
            </Typography>

            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}
            >
              Выбрать файл
              <input
                hidden
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                {...register("employeeEmploymentDocument", {
                  required: "Документ о трудоустройстве сотрудника обязателен",
                })}
              />
            </Button>

            {employeeEmploymentDocument?.[0] && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  backgroundColor: "background.paper",
                }}
              >
                {employeeEmploymentDocument[0].type.startsWith("image/") ? (
                  <Box
                    component="img"
                    src={URL.createObjectURL(employeeEmploymentDocument[0])}
                    alt={employeeEmploymentDocument[0].name}
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 1,
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1,
                      backgroundColor: "action.hover",
                    }}
                  >
                    <InsertDriveFileOutlinedIcon
                      color="primary"
                      fontSize="large"
                    />
                  </Box>
                )}

                <Box
                  sx={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    noWrap
                    title={employeeEmploymentDocument[0].name}
                  >
                    {employeeEmploymentDocument[0].name}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {(employeeEmploymentDocument[0].size / 1024 / 1024).toFixed(
                      2,
                    )}{" "}
                    MB
                  </Typography>
                </Box>

                <IconButton
                  color="error"
                  onClick={() => setValue("employeeEmploymentDocument", null)}
                >
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </Box>
            )}

            {errors.employeeEmploymentDocument && (
              <FormHelperText error>
                {errors.employeeEmploymentDocument.message}
              </FormHelperText>
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Регистрация..." : "Регистрация"}
          </Button>
        </form>
      )}

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />
        <Button component={Link} to="/login" fullWidth variant="outlined">
          Войти
        </Button>
      </Box>
    </AuthLayout>
  );
}
