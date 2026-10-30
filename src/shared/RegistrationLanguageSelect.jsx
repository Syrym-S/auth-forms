import { MenuItem } from "@mui/material";
import { Controller } from "react-hook-form";
import FormInput from "./FormInput";

export default function RegistrationLanguageSelect({ control }) {
  return (
    <Controller
      name="language"
      control={control}
      defaultValue="ru"
      render={({ field, fieldState: { error } }) => (
        <FormInput
          {...field}
          value={field.value ?? "ru"}
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
              inputProps: { "aria-label": "Язык" },
              renderValue: (value) => ({ en: "EN", kk: "KZ", ru: "RU" })[value],
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
          error={!!error}
          helperText={error?.message}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="kk">Қазақша</MenuItem>
          <MenuItem value="ru">Русский</MenuItem>
        </FormInput>
      )}
    />
  );
}
