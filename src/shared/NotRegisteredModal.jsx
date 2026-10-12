import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Box,
  Typography,
  Link as MuiLink,
} from "@mui/material";

export function NotRegisteredModal({ open, support }) {
  const { phone = "", email = "" } = support || {};

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      disableEscapeKeyDown
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Регистрация не подтверждена</DialogTitle>

      <DialogContent>
        <DialogContentText>
          Ваша регистрация ожидает подтверждения. Для завершения проверки
          обратитесь к менеджеру.
        </DialogContentText>

        <Box mt={2}>
          {phone && (
            <Typography variant="body2">
              Телефон: <MuiLink href={`tel:${phone}`}>{phone}</MuiLink>
            </Typography>
          )}

          {email && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Email: <MuiLink href={`mailto:${email}`}>{email}</MuiLink>
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
