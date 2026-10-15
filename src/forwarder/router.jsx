import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import { LoginRedirect } from '../shared/LoginRedirect';
import Register from './pages/Register';
import { isStaging } from '../api/client';
import ForgotPassword from './pages/password/ForgotPassword';
import ResetPassword from './pages/password/ResetPassword';

export default function ForwarderRouter() {
  return (
    <BrowserRouter basename={isStaging ? '/staging/auth' : '/auth'}>
      <Routes>
        <Route path="/" element={<LoginRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}
