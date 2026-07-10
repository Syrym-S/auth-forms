import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";

function getAppData() {
  return window.APP_DATA || window.app_data || {};
}

function getIsStaging() {
  return (
    getAppData().mode === "staging" ||
    window.location.pathname.startsWith("/staging/")
  );
}

function getAuthBasename() {
  return getIsStaging() ? "/staging/auth" : "/auth";
}

export default function AdminRouter() {
  const basename = getAuthBasename();

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
