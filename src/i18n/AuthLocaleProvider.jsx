import { AuthLocaleContext } from "./auth-locale.context";
import AuthLanguagesProvider from "../shared/AuthLanguagesProvider";

export default function AuthLocaleProvider({ role, children }) {
  return (
    <AuthLocaleContext.Provider value={true}>
      <AuthLanguagesProvider role={role}>{children}</AuthLanguagesProvider>
    </AuthLocaleContext.Provider>
  );
}
