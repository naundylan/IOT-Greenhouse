// src/auth/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('userToken');
    if (!token) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}

export default ProtectedRoute;