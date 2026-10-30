import AdminRouter from "./admin/router";
import AuthLocaleProvider from "./i18n/AuthLocaleProvider";

export default function AdminApp() {
  return (
    <AuthLocaleProvider>
      <AdminRouter />
    </AuthLocaleProvider>
  );
}
