import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Citizen from "./pages/RegisterCitizen";
import Legal from "./pages/RegisterLegal";

// для сохранение данных invite
function RedirectWithQuery() {
  const location = useLocation();

  return <Navigate to={`/login${location.search}`} replace />;
}

export default function DriverRouter() {
  return (
    <BrowserRouter basename="/staging/auth">
      <Routes>
        <Route path="/" element={<RedirectWithQuery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/citizen" element={<Citizen />} />
        <Route path="/register/legal" element={<Legal />} />
      </Routes>
    </BrowserRouter>
  );
}
