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
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { registerRequest } from "../../api/auth";
import { normalizeBackendParams } from "../../shared/backend-validation-error.helpers";
import { formatPhoneInput } from "../../shared/phone-format.helpers";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

export default function Register() {
  const [error, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
    control,
  } = useForm();

  const BACKEND_FIELD_MAP = {
    email: { field: "email", message: "Проверьте правильность email" },
    iin: { field: "iin", message: "ИИН указан некорректно" },
    password: { field: "password", message: "Проверьте пароль" },
    company_name: {
      field: "companyName",
      message: "Проверьте название компании",
    },
    company_bin: { field: "companyBin", message: "БИН указан некорректно" },
    company_bik: { field: "companyBik", message: "БИК указан некорректно" },
    company_account: {
      field: "companyAccount",
      message: "Проверьте расчетный счет",
    },
    company_address: {
      field: "companyAddress",
      message: "Проверьте адрес компании",
    },
    fio: { field: "fio", message: "Проверьте корректность ФИО" },
    phone: { field: "phone", message: "Проверьте номер телефона" },
    document_number: {
      field: "documentNumber",
      message: "Проверьте номер документа",
    },
    issue_country: {
      field: "issueCountry",
      message: "Укажите страну выдачи документа",
    },
    registration_document: {
      field: "legalEntityRegistrationDocument",
      message: "Проверьте загруженный документ о регистрации",
    },
    employer_document: {
      field: "employeeEmploymentDocument",
      message: "Проверьте загруженный документ о праве подписи",
    },
  };

  const legalEntityRegistrationDocument = watch(
    "legalEntityRegistrationDocument",
  );
  const employeeEmploymentDocument = watch("employeeEmploymentDocument");

  console.log("туц deplow");
  const onSubmit = async (data) => {
    setErrorMessage("");

    console.log(data);

    try {
      const formData = new FormData();

      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("company_name", data.companyName);
      formData.append("company_bin", data.companyBin);
      formData.append("company_bik", data.companyBik);
      formData.append("company_account", data.companyAccount);
      formData.append("company_address", data.companyAddress);
      formData.append("iin", data.iin);
      formData.append("fio", data.fio);
      formData.append("phone", data.phone);
      formData.append("document_number", data.documentNumber);
      formData.append("issue_country", data.issueCountry);

      formData.append(
        "registration_document",
        data.legalEntityRegistrationDocument[0],
      );

      formData.append(
        "registration_document_name",
        "Документ о регистрации юридического лица",
      );

      formData.append("employer_document", data.employeeEmploymentDocument[0]);

      formData.append(
        "employer_document_name",
        "Документ о трудоустройстве сотрудника с правом подписи или приказ о назначении первого руководителя",
      );

      await registerRequest(formData);
    } catch (e) {
      const ulStatus = e?.response?.data?.ul_status;

      if (ulStatus) {
        setErrorMessage(
          'Не удалось найти организацию по указанному БИН. Проверьте правильность БИН и повторите попытку.',
        );
        return;
      }

      if (e?.response?.data?.error === "Company exists") {
        setError("companyBin", {
          type: "server",
          message: "Компания с таким БИН уже зарегистрирована",
        });
        setErrorMessage("Проверьте БИН — компания уже зарегистрирована");
        return;
      }

      const params = e.response?.data?.data?.params;
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
          label="ИИН"
          margin="normal"
          error={!!errors.iin}
          helperText={errors.iin?.message}
          {...register("iin", {
            required: "Введите ИИН",
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
          label="БИН компании"
          margin="normal"
          error={!!errors.companyBin}
          helperText={errors.companyBin?.message}
          {...register("companyBin", {
            required: "Введите БИН компании",
            minLength: {
              value: 12,
              message: "БИН должен содержать минимум 12 символов",
            },
          })}
        />

        <TextField
          fullWidth
          label="БИК компании"
          margin="normal"
          error={!!errors.companyBik}
          helperText={errors.companyBik?.message}
          {...register("companyBik", {
            required: "Введите БИК компании",
          })}
        />

        <TextField
          fullWidth
          label="Расчетный счет"
          margin="normal"
          error={!!errors.companyAccount}
          helperText={errors.companyAccount?.message}
          {...register("companyAccount", {
            required: "Введите расчетный счет",
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
          label="ФИО"
          margin="normal"
          error={!!errors.fio}
          helperText={errors.fio?.message}
          {...register("fio", {
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
          label="Номер документа"
          margin="normal"
          error={!!errors.documentNumber}
          helperText={errors.documentNumber?.message}
          {...register("documentNumber", {
            required: "Введите номер документа",
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
                required: "Документ о регистрации юридического лица обязателен",
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
              {legalEntityRegistrationDocument[0].type.startsWith("image/") ? (
                <Box
                  component="img"
                  src={URL.createObjectURL(legalEntityRegistrationDocument[0])}
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

        <TextField
          fullWidth
          label="Страна выдачи"
          margin="normal"
          error={!!errors.issueCountry}
          helperText={errors.issueCountry?.message}
          {...register("issueCountry", {
            required: "Введите страну выдачи",
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
