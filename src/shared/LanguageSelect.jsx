import { MenuItem } from "@mui/material";
import { useAuthTranslation } from "../i18n/useAuthTranslation";
import FormInput from "./FormInput";

export default function LanguageSelect({ value, onChange, ...props }) {
  const { t, i18n } = useAuthTranslation();

  return (
    <FormInput
      {...props}
      value={value ?? i18n.language}
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
          renderValue: (language) => ({ en: "EN", kk: "KZ", ru: "RU" })[language],
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
      <MenuItem value="en">English</MenuItem>
      <MenuItem value="kk">Қазақша</MenuItem>
      <MenuItem value="ru">Русский</MenuItem>
    </FormInput>
  );
}
