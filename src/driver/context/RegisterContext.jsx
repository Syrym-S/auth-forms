import { createContext, useContext, useState } from "react";

const RegisterContext = createContext();

export const useRegister = () => useContext(RegisterContext);

export function RegisterProvider({ children }) {
  const [form, setForm] = useState({
    // step 1
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",

    // step 2
    isForeign: false,
    iin: "",
    docNumber: "",
    docIssuer: "",
    docDate: "",

    // step 3
    isIP: false,
    ipName: "",
    ipIIN: "",

    // invite code
    invite: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateStep = (data) => {
    setForm((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const setInvite = (invite) => {
    setForm((prev) => ({
      ...prev,
      invite,
    }));
  };

  return (
    <RegisterContext.Provider
      value={{ form, updateField, setInvite, updateStep }}
    >
      {children}
    </RegisterContext.Provider>
  );
}
