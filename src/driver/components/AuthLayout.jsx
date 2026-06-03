import { Box, Paper } from "@mui/material";
import { useEffect } from "react";
import { useRegister } from "../context/RegisterContext";
import { useLocation } from "react-router-dom";

export default function AuthLayout({ children }) {
  const { form, setInvite } = useRegister();
  const location = useLocation();

  // получаем invite и сохраняем код в контексте
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const invite = params.get("invite");

    console.log(invite);
    console.log(params);

    if (invite) {
      setInvite(invite);
    }
  }, [location.search]);

  // сохраняем invite из контекста в локалку
  useEffect(() => {
    if (form.invite) {
      localStorage.setItem("invite", form.invite);
    }
  }, [form.invite]);

  // установка значение invite из локалки в контекст
  useEffect(() => {
    const saved = localStorage.getItem("invite");
    if (saved) {
      setInvite(saved);
    }
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: {
            xs: 320,
            md: 380,
          },
          p: 4,
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          bgcolor: "#fff",
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
