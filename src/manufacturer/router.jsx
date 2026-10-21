import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isStaging } from "../api/client";
import Register from "./pages/Register";
import Login from "./pages/Login";

export default function ManufacturerRouter() {
  return (
    <BrowserRouter basename={isStaging ? "/staging/auth" : "/auth"}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
