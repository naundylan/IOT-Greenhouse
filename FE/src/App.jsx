import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUpPage from './pages/SignUpPage';
import LogInPage from './pages/LogInPage';
import ForgotPasswordPage from './pages/ForgotPassWord';
import DashboardPage from './pages/DashBoard';
import SettingPage from './pages/SettingPage';
import MainLayout from './layouts/MainLayout';
import { Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Các route cần đăng nhập và có layout chung */}
        <Route element={<MainLayout />}>
          <Route path="/settings" element={<SettingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;