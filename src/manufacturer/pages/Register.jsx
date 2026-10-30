import FormButton from "../../shared/FormButton";
import RegistrationLanguageSelect from "../../shared/RegistrationLanguageSelect";
import {
  Box,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Autocomplete,
  MenuItem,
} from "@mui/material";

import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import {
  registerRequest,
  getClaimInfoApi,
  searchCustomersRequest,
} from "../api/auth";
import { isStaging } from "../../api/client";
import { normalizeBackendParams } from "../../shared/backend-validation-error.helpers";
import { formatPhoneInput } from "../../shared/phone-format.helpers";
import { passwordPatternRule } from "../../shared/password-validation.helpers";
import FormInput from "../../shared/FormInput";
import { NotRegisteredModal } from "../../shared/NotRegisteredModal";
import {
  getVerifyRegistered,
  getSupportContacts,
  getRegistrationNotVerifiedError,
} from "../../shared/verify-registered.helpers";
import {
  DOCUMENT_ISSUED_BY_OPTIONS,
  getTodayDateInputValue,
  validateNotAfterToday,
} from "../../shared/identity-document.helpers";

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
    companyAddress: claimInfo.company_address || claimInfo.companyAddress || "",
    companyAccount: claimInfo.company_account || claimInfo.companyAccount || "",
    companyBik: claimInfo.company_bik || claimInfo.companyBik || "",

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
    language: "ru",
  };
}

export default function Register() {
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerOptions, setCustomerOptions] = useState([]);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState("");
  const [error, setErrorMessage] = useState("");
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const [isNotRegisteredOpen, setIsNotRegisteredOpen] = useState(false);
  const [support, setSupport] = useState(null);
  const claim = getClaimFromUrl();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      bin: "",
      companyName: "",
      companyAddress: "",
      companyAccount: "",
      companyBik: "",
      managerName: "",
      phone: "",
      iin: "",
      documentNumber: "",
      issueCountry: "",
      email: "",
      password: "",
      confirmPassword: "",
      language: "ru",
      // registration_document: null,
      // employer_document: null,
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
    company_account: {
      field: "companyAccount",
      message: "Проверьте расчётный счёт",
    },
    company_bik: {
      field: "companyBik",
      message: "Проверьте БИК",
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
    // registration_document: {
    //   field: "registration_document",
    //   message: "Проверьте загруженный документ о регистрации",
    // },
    // employer_document: {
    //   field: "employer_document",
    //   message: "Проверьте загруженный документ о праве подписи",
    // },
  };

  const password = watch("password");

  useEffect(() => {
    const query = customerQuery.trim();
    if (!query) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        if (!(window?.APP_DATA?.nonce || window?.app_data?.nonce)) {
          throw new Error("Не удалось получить WP nonce. Обновите страницу.");
        }

        const response = await searchCustomersRequest(query, controller.signal);
        if (!controller.signal.aborted) {
          setCustomerOptions(response.data.items || []);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setCustomerSearchError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Не удалось загрузить заказчиков. Повторите поиск.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsCustomerLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [customerQuery]);

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

    console.log(data);

    try {
      const payload = {
        bin: data.bin,
        company_name: data.companyName,
        company_address: data.companyAddress,
        company_account: data.companyAccount,
        company_bik: data.companyBik,
        fio: data.fio,
        phone: data.phone,
        iin: data.iin,
        document_number: data.documentNumber,
        issue_country: data.issueCountry,
        email: data.email,
        language: data.language,
        password: data.password,
        password_confirm: data.confirmPassword,
        document_issue_date: data.document_issue_date,
        document_issued_by: data.document_issued_by,
        customerIds: selectedCustomers.map((customer) => customer.id),
      };

      if (claim) {
        payload.invite = claim;
      }

      // payload.append("registration_document", data.registration_document[0]);

      // payload.append(
      //   "registration_document_name",
      //   "Документ о регистрации юридического лица",
      // );

      // payload.append("employer_document", data.employer_document[0]);

      // payload.append(
      //   "employer_document_name",
      //   "Документ о трудоустройстве сотрудника",
      // );

      const nonce = window?.APP_DATA?.nonce || window?.app_data?.nonce;

      if (!nonce) {
        setErrorMessage("Не удалось получить WP nonce. Обновите страницу.");
        return;
      }

      const res = await registerRequest(payload, nonce);

      if (!getVerifyRegistered(res)) {
        setSupport(getSupportContacts(res));
        setIsNotRegisteredOpen(true);
        return;
      }

      const redirectUrl = res?.redirect_url || res?.data?.redirect_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      window.location.href = isStaging ? "/staging/auth/login" : "/auth/login";
    } catch (e) {
      const notVerifiedSupport = getRegistrationNotVerifiedError(e);

      if (notVerifiedSupport) {
        setSupport(notVerifiedSupport);
        setIsNotRegisteredOpen(true);
        return;
      }

      const ulStatus = e?.response?.data?.ul_status;

      if (ulStatus) {
        if (ulStatus === "pending") {
          setErrorMessage(
            "Не удалось найти организацию по указанному БИН. Проверьте правильность БИН и повторите попытку.",
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
      <NotRegisteredModal open={isNotRegisteredOpen} support={support} />

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
          <FormInput
            fullWidth
            label="ФИО"
            placeholder="210540012345"
            margin="normal"
            error={!!errors.fio}
            helperText={errors.fio?.message}
            {...register("fio", {
              required: "ФИО обязателен",
            })}
          />

          <FormInput
            fullWidth
            label="БИН"
            placeholder="210540012345"
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

          <FormInput
            fullWidth
            label="Название компании"
            placeholder="ТОО «Алтын Жол Логистик»"
            margin="normal"
            error={!!errors.companyName}
            helperText={errors.companyName?.message}
            {...register("companyName", {
              required: "Введите название компании",
            })}
          />

          <FormInput
            fullWidth
            label="Юридический адрес"
            placeholder="г. Алматы, ул. Абая, д. 10, оф. 5"
            margin="normal"
            error={!!errors.companyAddress}
            helperText={errors.companyAddress?.message}
            {...register("companyAddress", {
              required: "Введите адрес компании",
            })}
          />

          <FormInput
            fullWidth
            label="БИК"
            placeholder="BANKKZKX"
            margin="normal"
            error={!!errors.companyBik}
            helperText={errors.companyBik?.message}
            {...register("companyBik")}
          />

          <FormInput
            fullWidth
            label="ИИК (расчётный счёт)"
            placeholder="KZ123456789012345678"
            margin="normal"
            error={!!errors.companyAccount}
            helperText={errors.companyAccount?.message}
            {...register("companyAccount")}
          />

          <FormInput
            fullWidth
            label="ИИН"
            placeholder="900115300123"
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

          <FormInput
            fullWidth
            type="date"
            label="Когда выдан документ"
            margin="normal"
            error={!!errors.document_issue_date}
            helperText={errors.document_issue_date?.message}
            {...register("document_issue_date", {
              required: "Укажите дату выдачи документа",
              validate: validateNotAfterToday,
            })}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              htmlInput: {
                max: getTodayDateInputValue(),
              },
            }}
          />

          <Controller
            name="document_issued_by"
            control={control}
            rules={{ required: "Укажите, кем выдан документ" }}
            render={({ field }) => (
              <FormInput
                select
                fullWidth
                label="Кем выдан документ"
                margin="normal"
                error={!!errors.document_issued_by}
                helperText={errors.document_issued_by?.message}
                inputRef={field.ref}
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
              >
                {DOCUMENT_ISSUED_BY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </FormInput>
            )}
          />

          <FormInput
            fullWidth
            label="Номер документа"
            placeholder="012345678"
            margin="normal"
            error={!!errors.documentNumber}
            helperText={errors.documentNumber?.message}
            {...register("documentNumber", {
              required: "Введите номер документа",
            })}
          />

          <FormInput
            fullWidth
            label="Страна документа"
            placeholder="KZ"
            margin="normal"
            error={!!errors.issueCountry}
            helperText={errors.issueCountry?.message}
            {...register("issueCountry", {
              required: "Введите страну документа",
            })}
          />

          <Autocomplete
            multiple
            options={customerOptions}
            value={selectedCustomers}
            onChange={(_, newValue) => setSelectedCustomers(newValue)}
            inputValue={customerQuery}
            onInputChange={(_, value) => {
              if (value === customerQuery) return;
              setCustomerQuery(value);
              setCustomerOptions([]);
              setCustomerSearchError("");
              setIsCustomerLoading(Boolean(value.trim()));
            }}
            filterOptions={(options) => options}
            filterSelectedOptions
            loading={isCustomerLoading}
            loadingText="Поиск заказчиков..."
            noOptionsText={
              customerSearchError ||
              (customerQuery.trim()
                ? "Заказчики не найдены"
                : "Введите название или БИН заказчика")
            }
            getOptionLabel={(option) => option?.fullName ?? ""}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <Box
                key={option.id}
                component="li"
                {...props}
                sx={{
                  px: "16px !important",
                  py: "10px !important",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex !important",
                  flexDirection: "column !important",
                  alignItems: "flex-start !important",
                  gap: "5px !important",
                  "&:last-child": {
                    borderBottom: "none",
                  },
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "text.primary",
                      lineHeight: 1.3,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {option.fullName || "Без названия"}
                  </Typography>
                  {option.type && (
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "primary.main",
                        bgcolor: "primary.50",
                        borderRadius: 1,
                        px: 0.75,
                        py: 0.2,
                      }}
                    >
                      {option.type}
                    </Typography>
                  )}
                </Box>
                {option.bin && (
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "text.secondary",
                    }}
                  >
                    БИН:{" "}
                    <Box
                      component="span"
                      sx={{ color: "text.primary", fontWeight: 500 }}
                    >
                      {option.bin}
                    </Box>
                  </Typography>
                )}
                {option.persons?.map((person, index) =>
                  person &&
                  (person.fio || person.iin || person.phone || person.email) ? (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      {person.fio && (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "text.secondary",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {person.fio}
                        </Typography>
                      )}
                      {person.iin && (
                        <Typography
                          sx={{ fontSize: 12, color: "text.secondary" }}
                        >
                          ИИН:{" "}
                          <Box
                            component="span"
                            sx={{ color: "text.primary", fontWeight: 500 }}
                          >
                            {person.iin}
                          </Box>
                        </Typography>
                      )}
                      {person.phone && (
                        <Typography
                          sx={{ fontSize: 12, color: "text.secondary" }}
                        >
                          Тел:{" "}
                          <Box
                            component="span"
                            sx={{ color: "text.primary", fontWeight: 500 }}
                          >
                            +{String(person.phone).replace(/^\+/, "")}
                          </Box>
                        </Typography>
                      )}
                      {person.email && (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "text.secondary",
                            overflowWrap: "anywhere",
                          }}
                        >
                          Email:{" "}
                          <Box
                            component="span"
                            sx={{ color: "text.primary", fontWeight: 500 }}
                          >
                            {person.email}
                          </Box>
                        </Typography>
                      )}
                    </Box>
                  ) : null,
                )}
              </Box>
            )}
            renderInput={(params) => (
              <FormInput
                {...params}
                label="Выберите заказчиков"
                error={!!customerSearchError}
                helperText={customerSearchError}
              />
            )}
            sx={{
              "& .MuiAutocomplete-tag": {
                border: "1px solid",
                borderColor: "#1976d2",
                backgroundColor: "#fefefe",
                color: "#1976d2",
                fontWeight: 500,
              },
              "& .MuiAutocomplete-tag .MuiChip-deleteIcon": {
                color: "#1976d2",
              },
            }}
          />

          {/* <Box
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

            <FormButton
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
            </FormButton>

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

            <FormButton
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
            </FormButton>

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
          </Box> */}

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
              <FormInput
                fullWidth
                label="Телефон"
                placeholder="+7 (700) 123-45-67"
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

          <FormInput
            fullWidth
            label="Email"
            placeholder="nurlanov.erlan@gmail.com"
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
            label="Пароль"
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register("password", {
              required: "Введите пароль",
              minLength: {
                value: 6,
                message: "Минимум 6 символов",
              },
              pattern: passwordPatternRule,
            })}
          />

          <FormInput
            type="password"
            fullWidth
            label="Повторите пароль"
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Повторите пароль",
              validate: (value) => value === password || "Пароли не совпадают",
            })}
          />

          <RegistrationLanguageSelect control={control} />

          <FormButton
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Регистрация..." : "Регистрация"}
          </FormButton>
        </form>
      )}

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />
        <FormButton component={Link} to="/login" fullWidth variant="outlined">
          Войти
        </FormButton>
      </Box>
    </AuthLayout>
  );
}
