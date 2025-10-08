import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    // ----------------------------------------------------------------------
    // NOTE: THIS IS A TEMPORARY ROLE CHECK FOR DEV. 
    // IN PRODUCTION, THIS MUST READ THE ROLE FROM THE DECODED JWT TOKEN.
    // ----------------------------------------------------------------------
    const getUserRole = () => {
        // نتحقق من وجود التوكن
        const token = localStorage.getItem('token');
        if (!token) return 'guest';
        
        // **لغرض التطبيق الحالي:** سنفترض أن المستخدم قام بتسجيل الدخول كـ "admin"
        // قم بتخزين الدور في localStorage أثناء تسجيل الدخول
        const userRole = localStorage.getItem('userRole'); 

        // إذا لم نجد دورًا واضحًا، نعود لـ 'user'
        return userRole === 'admin' ? 'admin' : 'user';
    };

    const role = getUserRole();
    
    // إذا كان الدور هو 'admin'، اسمح بالمرور إلى المكون (Outlet)
    // وإلا، أعد التوجيه إلى الصفحة الرئيسية
    return role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
