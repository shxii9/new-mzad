// src/components/AdminRoute.jsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const AdminRoute = () => {
    const role = localStorage.getItem('userRole');
    // السماح للمدير فقط
    return role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
