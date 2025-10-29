import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashBoardPage from './pages/DashBoard';
import ForgotPasswordPage from './pages/ForgotPassWord';
import ResetPasswordPage from './pages/ResetPassword';
import NotFoundPage from './pages/ErrorPage/404';  
import InternalServerError from './pages/ErrorPage/500';
import SettingPage from './pages/SettingPage';
import HistoryPage from './pages/History';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />   
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />  
        <Route path="/dashboard" element={<DashBoardPage />} />
        <Route path="/password/forgot" element={<ForgotPasswordPage />} />
        <Route path="/password/reset" element={<ResetPasswordPage />} />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/500" element={<InternalServerError />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;