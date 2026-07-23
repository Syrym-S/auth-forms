import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { isStaging } from '../api/client';
import ForgotPassword from './pages/password/ForgotPassword';
import ResetPassword from './pages/password/ResetPassword';

export default function ForwarderRouter() {
  return (
    <BrowserRouter basename={isStaging ? '/staging/auth' : '/auth'}>
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
