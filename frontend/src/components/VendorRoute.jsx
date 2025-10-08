// src/components/VendorRoute.jsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const VendorRoute = () => {
    const role = localStorage.getItem('userRole');
    // السماح للتاجر (user) أو المدير (admin)
    return role === 'user' || role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default VendorRoute;
