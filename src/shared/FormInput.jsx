import { useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function FormInput({
  ref,
  inputRef,
  type = "text",
  fullWidth = true,
  margin = "normal",
  slotProps,
  sx,
  ...props
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const fieldRef = inputRef ?? ref;
  const isPassword = type === "password";

  return (
    <TextField
      {...props}
      type={isPassword && passwordVisible ? "text" : type}
      fullWidth={fullWidth}
      margin={margin}
      inputRef={fieldRef}
      sx={[
        {
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "14px",
            "&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgb(24, 87, 196)",
            },
          },
          "& .MuiInputLabel-root": { fontSize: "14px" },
          "& .MuiInputLabel-root.Mui-focused:not(.Mui-error)": {
            color: "rgb(24, 87, 196)",
          },
          "& input": { caretColor: "rgb(24, 87, 196)" },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      slotProps={{
        ...slotProps,
        input: {
          ...slotProps?.input,
          ...(isPassword && {
            endAdornment: (
              <InputAdornment position="end">
                {slotProps?.input?.endAdornment}
                <IconButton
                  type="button"
                  edge="end"
                  tabIndex={-1}
                  aria-label={
                    passwordVisible ? "Скрыть пароль" : "Показать пароль"
                  }
                  onClick={() => setPasswordVisible((visible) => !visible)}
                >
                  {passwordVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }),
        },
      }}
    />
  );
}
