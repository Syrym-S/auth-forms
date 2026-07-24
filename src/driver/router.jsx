import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Citizen from './pages/RegisterCitizen';
import Legal from './pages/RegisterLegal';
import ForgotPassword from './pages/password/ForgotPassword';
import ResetPassword from './pages/password/ResetPassword';
import Documents from './pages/RegisterDocuments';

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

// для сохранение данных invite
function RedirectWithQuery() {
  const location = useLocation();

  return <Navigate to={`/login${location.search}`} replace />;
}

export default function DriverRouter() {
  const basename = getAuthBasename();

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<RedirectWithQuery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/citizen" element={<Citizen />} />
        <Route path="/register/legal" element={<Legal />} />
        <Route path="/register/documents" element={<Documents />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}
