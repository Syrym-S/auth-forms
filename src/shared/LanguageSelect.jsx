import { MenuItem } from "@mui/material";
import { useContext, useEffect } from "react";
import { useAuthTranslation } from "../i18n/useAuthTranslation";
import { AuthLanguagesContext } from "./auth-languages.context";
import FormInput from "./FormInput";

export default function LanguageSelect({ value, onChange, name, ...props }) {
  const { t, i18n } = useAuthTranslation();
  const { languages, loading, error } = useContext(AuthLanguagesContext);
  const currentLanguage = value ?? i18n.language;
  const selectedLanguage = languages.some(({ code }) => code === currentLanguage)
    ? currentLanguage
    : languages.find(({ code }) => code === i18n.language)?.code ||
      languages[0]?.code || "";
  const statusMessage = loading
    ? "Загрузка языков..."
    : error
      ? "Не удалось загрузить языки"
      : languages.length === 0
        ? "Нет доступных языков"
        : "";

  useEffect(() => {
    if (!selectedLanguage) return;

    if (value !== undefined && value !== selectedLanguage) {
      onChange?.({ target: { name, value: selectedLanguage } });
    }
    if (i18n.language !== selectedLanguage) {
      i18n.changeLanguage(selectedLanguage);
    }
  }, [selectedLanguage, value, onChange, name, i18n]);

  return (
    <FormInput
      {...props}
      name={name}
      value={selectedLanguage}
      disabled={props.disabled || loading || error || languages.length === 0}
      error={props.error || error}
      helperText={props.helperText || (statusMessage && t(statusMessage))}
      onChange={(event) => {
        onChange?.(event);
        i18n.changeLanguage(event.target.value);
      }}
      select
      fullWidth={false}
      size="small"
      sx={{
        width: "fit-content",
        display: "flex",
        ml: "auto",
        "& .MuiOutlinedInput-root": { borderRadius: 3 },
        "& .MuiSelect-select.MuiInputBase-input": {
          minWidth: 0,
          pl: 1,
          pr: 3,
        },
        "& .MuiSelect-icon": { right: 2 },
      }}
      slotProps={{
        select: {
          inputProps: { "aria-label": t("Язык") },
          renderValue: (language) => language.toUpperCase(),
          MenuProps: {
            slotProps: {
              paper: { sx: { borderRadius: 2 } },
              list: {
                sx: {
                  "& .MuiMenuItem-root": {
                    borderRadius: 1.5,
                    mx: 0.5,
                    my: 0.25,
                  },
                },
              },
            },
          },
        },
      }}
    >
      {languages.map(({ id, code, name }) => (
        <MenuItem key={id ?? code} value={code}>{name}</MenuItem>
      ))}
    </FormInput>
  );
}
