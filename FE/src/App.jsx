import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 🧩 Các trang
import LoginPage from "./pages/LogInPage";
import SignUpPage from "./pages/SignUpPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import VerifyEmailSuccess from "./pages/VerifyEmailSuccess";
import DashBoardPage from "./pages/DashBoard";
import ForgotPasswordPage from "./pages/ForgotPassWord";
import ResetPasswordPage from "./pages/ResetPassWord";
import NotFoundPage from "./pages/ErrorPage/404";
import InternalServerError from "./pages/ErrorPage/500";
import SettingPage from "./pages/SettingPage";
import HistoryPage from "./pages/History";

// 🧱 Route bảo vệ
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    // <BrowserRouter>
      <Routes>
        {/* 🔹 Mặc định chuyển về trang đăng nhập */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 🔓 Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/password/forgot" element={<ForgotPasswordPage />} />
        <Route path="/password/reset" element={<ResetPasswordPage />} />
        <Route path="account/verification" element={<VerifyEmailSuccess />} />
        {/* 🔐 Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashBoardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />

        {/* ⚠️ Trang lỗi */}
        <Route path="/500" element={<InternalServerError />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    // </BrowserRouter>
  );
}

export default App;
