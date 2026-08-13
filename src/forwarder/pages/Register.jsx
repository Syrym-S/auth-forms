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
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import { registerRequest, getClaimInfoApi } from "../../api/auth";
import { isStaging } from "../../api/client";
import { normalizeBackendParams } from "../../shared/backend-validation-error.helpers";
import { formatPhoneInput } from "../../shared/phone-format.helpers";

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
    companyAddress:
      claimInfo.company_address || claimInfo.companyAddress || "",

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
  const [error, setErrorMessage] = useState("");
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const claim = getClaimFromUrl();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      bin: "",
      companyName: "",
      companyAddress: "",
      managerName: "",
      phone: "",
      iin: "",
      documentNumber: "",
      issueCountry: "",
      email: "",
      password: "",
      confirmPassword: "",
      registration_document: null,
      employer_document: null,
    },
  });

  const BACKEND_FIELD_MAP = {
    bin: { field: "bin", message: "БИН указан некорректно" },
    company_name: {
      field: "companyName",
      message: "Проверьте название компании",
    },
    company_address: {
      field: "companyAddress",
      message: "Проверьте адрес компании",
    },
    fio: {
      field: "managerName",
      message: "Проверьте корректность ФИО",
    },
    phone: { field: "phone", message: "Проверьте номер телефона" },
    iin: { field: "iin", message: "ИИН указан некорректно" },
    document_number: {
      field: "documentNumber",
      message: "Проверьте номер документа",
    },
    issue_country: {
      field: "issueCountry",
      message: "Укажите страну выдачи документа",
    },
    email: { field: "email", message: "Проверьте правильность email" },
    password: { field: "password", message: "Проверьте пароль" },
    password_confirm: {
      field: "confirmPassword",
      message: "Проверьте подтверждение пароля",
    },
    registration_document: {
      field: "registration_document",
      message: "Проверьте загруженный документ о регистрации",
    },
    employer_document: {
      field: "employer_document",
      message: "Проверьте загруженный документ о праве подписи",
    },
  };

  const password = watch("password");
  const registration_document = watch("registration_document");
  const employer_document = watch("employer_document");

  useEffect(() => {
    if (!claim) {
      return;
    }

    let isCancelled = false;

    async function loadClaimInfo() {
      try {
        setIsClaimLoading(true);
        setErrorMessage("");

        const response = await getClaimInfoApi(claim);
        const claimInfo = getClaimData(response);

        console.log("FORWARDER CLAIM INFO:", claimInfo);

        if (!isCancelled) {
          reset(mapClaimInfoToForm(claimInfo));
        }
      } catch (requestError) {
        if (!isCancelled) {
          setErrorMessage(
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
    setErrorMessage("");

    console.log(data);

    try {
      const payload = new FormData();

      payload.append("bin", data.bin);
      payload.append("company_name", data.companyName);
      payload.append("company_address", data.companyAddress);
      payload.append("fio", data.managerName);
      payload.append("phone", data.phone);
      payload.append("iin", data.iin);
      payload.append("document_number", data.documentNumber);
      payload.append("issue_country", data.issueCountry);
      payload.append("email", data.email);
      payload.append("password", data.password);
      payload.append("password_confirm", data.confirmPassword);

      if (claim) {
        payload.append("invite", claim);
      }

      payload.append("registration_document", data.registration_document[0]);

      payload.append(
        "registration_document_name",
        "Документ о регистрации юридического лица",
      );

      payload.append("employer_document", data.employer_document[0]);

      payload.append(
        "employer_document_name",
        "Документ о трудоустройстве сотрудника",
      );

      const res = await registerRequest(payload);

      const redirectUrl = res?.redirect_url || res?.data?.redirect_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      window.location.href = isStaging ? "/staging/auth/login" : "/auth/login";
    } catch (e) {
      const ulStatus = e?.response?.data?.ul_status;

      if (ulStatus) {
        if (ulStatus === "pending") {
          setErrorMessage(
            'Не удалось найти организацию по указанному БИН. Проверьте правильность БИН и повторите попытку.',
          );
        } else if (ulStatus === "unknown") {
          setErrorMessage(
            "Сервис проверки документов временно недоступен. Попробуйте позже.",
          );
        } else {
          setErrorMessage(
            "Не удалось проверить организацию. Попробуйте позже.",
          );
        }
        return;
      }

      if (e?.response?.data?.error === "Company exists") {
        setError("bin", {
          type: "server",
          message: "Компания с таким БИН уже зарегистрирована",
        });
        setErrorMessage("Проверьте БИН — компания уже зарегистрирована");
        return;
      }

      if (e?.response?.data?.error === "User exists") {
        setErrorMessage("Пользователь с таким email уже зарегистрирован");
        return;
      }

      if (
        e?.response?.data?.error ===
        "Registration document (file + name) is required"
      ) {
        setError(BACKEND_FIELD_MAP.registration_document.field, {
          type: "server",
          message: "Загрузите документ",
        });
        setError(BACKEND_FIELD_MAP.employer_document.field, {
          type: "server",
          message: "Загрузите документ",
        });
        setErrorMessage("Необходимо загрузить документ о регистрации");
        return;
      }

      const params = e?.response?.data?.data?.params;
      const paramEntries = normalizeBackendParams(params);

      const unmatchedMessages = [];
      let matchedAny = false;

      paramEntries.forEach(({ fieldName, backendMessage }) => {
        const mapping = BACKEND_FIELD_MAP[fieldName];
        if (mapping) {
          matchedAny = true;
          setError(mapping.field, {
            type: "server",
            message: mapping.message,
          });
        } else {
          unmatchedMessages.push(backendMessage || fieldName);
        }
      });

      if (matchedAny && unmatchedMessages.length === 0) {
        setErrorMessage("Проверьте выделенные поля");
      } else if (matchedAny) {
        setErrorMessage(
          `Проверьте выделенные поля. Также: ${unmatchedMessages.join(", ")}`,
        );
      } else if (unmatchedMessages.length > 0) {
        setErrorMessage(unmatchedMessages.join(", "));
      } else {
        setErrorMessage(
          e.response?.data?.message || e?.message || "Ошибка регистрации",
        );
      }
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
            label="Адрес компании"
            margin="normal"
            error={!!errors.companyAddress}
            helperText={errors.companyAddress?.message}
            {...register("companyAddress", {
              required: "Введите адрес компании",
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

          <Controller
            name="phone"
            control={control}
            rules={{
              required: "Введите телефон",
              pattern: {
                value: /^\+?[0-9]{10,15}$/,
                message: "Некорректный номер телефона",
              },
            }}
            render={({ field }) => (
              <TextField
                fullWidth
                label="Телефон"
                margin="normal"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                inputRef={field.ref}
                name={field.name}
                onBlur={field.onBlur}
                value={formatPhoneInput(field.value).display}
                onChange={(e) => {
                  field.onChange(
                    formatPhoneInput(e.target.value, field.value).value,
                  );
                }}
              />
            )}
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
              borderColor: errors.registration_document
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
                {...register("registration_document", {
                  required:
                    "Документ о регистрации юридического лица обязателен",
                })}
              />
            </Button>

            {registration_document?.[0] && (
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
                {registration_document[0].type.startsWith("image/") ? (
                  <Box
                    component="img"
                    src={URL.createObjectURL(registration_document[0])}
                    alt={registration_document[0].name}
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
                    title={registration_document[0].name}
                  >
                    {registration_document[0].name}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {(registration_document[0].size / 1024 / 1024).toFixed(2)}{" "}
                    MB
                  </Typography>
                </Box>

                <IconButton
                  color="error"
                  onClick={() => setValue("registration_document", null)}
                >
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </Box>
            )}

            {errors.registration_document && (
              <FormHelperText error>
                {errors.registration_document.message}
              </FormHelperText>
            )}
          </Box>

          <Box
            sx={{
              border: "1px solid",
              my: 1,
              borderColor: errors.employer_document ? "error.main" : "divider",
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
                {...register("employer_document", {
                  required: "Документ о трудоустройстве сотрудника обязателен",
                })}
              />
            </Button>

            {employer_document?.[0] && (
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
                {employer_document[0].type.startsWith("image/") ? (
                  <Box
                    component="img"
                    src={URL.createObjectURL(employer_document[0])}
                    alt={employer_document[0].name}
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
                    title={employer_document[0].name}
                  >
                    {employer_document[0].name}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {(employer_document[0].size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>

                <IconButton
                  color="error"
                  onClick={() => setValue("employer_document", null)}
                >
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </Box>
            )}

            {errors.employer_document && (
              <FormHelperText error>
                {errors.employer_document.message}
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
