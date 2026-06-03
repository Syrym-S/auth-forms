import { Box, Paper } from "@mui/material";

export default function AuthLayout({ children }) {
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
