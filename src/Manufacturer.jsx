import ManufacturerRouter from "./manufacturer/router";
import AuthLocaleProvider from "./i18n/AuthLocaleProvider";

export default function ManufacturerApp() {
  return (
    <AuthLocaleProvider>
      <ManufacturerRouter />
    </AuthLocaleProvider>
  );
}
