import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Sửa key từ 'userToken' -> 'accessToken' để khớp với LoginPage
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
