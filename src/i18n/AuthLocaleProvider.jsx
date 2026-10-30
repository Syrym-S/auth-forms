import { AuthLocaleContext } from "./auth-locale.context";

export default function AuthLocaleProvider({ children }) {
  return (
    <AuthLocaleContext.Provider value={true}>
      {children}
    </AuthLocaleContext.Provider>
  );
}
