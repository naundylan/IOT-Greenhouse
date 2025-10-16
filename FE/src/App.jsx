// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Import "Người Bảo Vệ"
import ProtectedRoute from './auth/ProtectedRoute';

// 2. Import Layout Chung
import MainLayout from './layouts/MainLayout';

// 3. Import Tất Cả Các Trang
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashBoardPage from './pages/DashBoard';
import SettingPage from './pages/SettingPage';
import ForgotPasswordPage from './pages/ForgotPassWord';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === CÁC ROUTE CÔNG KHAI (AI CŨNG XEM ĐƯỢC) === */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        
        {/* === CÁC ROUTE ĐƯỢC BẢO VỆ (CẦN ĐĂNG NHẬP) === */}
        <Route 
          path="/*" // Bất kỳ đường dẫn nào khác không khớp ở trên
          element={
            // "Người bảo vệ" sẽ kiểm tra token trước
            <ProtectedRoute>
              {/* Nếu qua được, "Khung nhà" sẽ được hiển thị */}
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Các trang con này sẽ được render bên trong <Outlet /> của MainLayout */}
          <Route path="dashboard" element={<DashBoardPage />} />
          <Route path="setting" element={<SettingPage />} />
          {/* Bạn có thể thêm các trang được bảo vệ khác ở đây, ví dụ: <Route path="history" element={<HistoryPage />} /> */}
        </Route>

        {/* Route mặc định: nếu người dùng truy cập vào trang chủ ('/'), tự động chuyển hướng họ đến trang login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;