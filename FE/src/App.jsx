import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashBoard'; // Sửa lại tên import
import ForgotPasswordPage from './pages/ForgotPassWord';
import ResetPasswordPage from './pages/ResetPassWord';
import NotFoundPage from './pages/ErorPage/404';
import InternalServerErrorPage from './pages/ErorPage/500';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Các route công khai */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/password/forgot" element={<ForgotPasswordPage />} />
        <Route path="/password/reset" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/500" element ={<InternalServerErrorPage />} />
        <Route path="*" element ={<NotFoundPage />} />

       </Routes>
    </BrowserRouter>
  );
}

export default App;