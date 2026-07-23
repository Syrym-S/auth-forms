import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/password/ForgotPassword';
import ResetPassword from './pages/password/ResetPassword';

function getAppData() {
  return window.APP_DATA || window.app_data || {};
}

function getIsStaging() {
  return (
    getAppData().mode === 'staging' ||
    window.location.pathname.startsWith('/staging/')
  );
}

function getAuthBasename() {
  return getIsStaging() ? '/staging/auth' : '/auth';
}

export default function FactorRouter() {
  const basename = getAuthBasename();

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}
