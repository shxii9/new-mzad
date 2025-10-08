import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    // هذه الوظيفة تفترض أنك تخزن دور المستخدم في localStorage أو Context
    const getUserRole = () => {
        // يجب أن تقوم بتفكيك (decode) التوكن للحصول على دور المستخدم
        // حاليًا، سنفترض أن المستخدم قام بتسجيل الدخول كـ "admin"
        // في مشروع حقيقي، يجب استخدام مكتبة مثل jwt-decode
        const token = localStorage.getItem('token');
        if (!token) return 'guest';
        
        // **لأغراض الاختبار والتطبيق الحالي:**
        // بما أننا نعلم أنك سجلت الدخول كـ admin بالفعل، سنفترض دور "admin" مؤقتًا
        // يجب تطوير هذه الجزئية لاحقًا للاعتماد على فك تشفير التوكن
        
        // إذا كان هناك توكن، سنفترض أنه تم تسجيل الدخول.
        // يجب استبدال هذا بمنطق قراءة الدور من التوكن
        const userRole = localStorage.getItem('userRole') || 'user'; 
        return userRole;
    };

    const role = getUserRole();
    
    // إذا كان الدور هو 'admin'، اسمح بالمرور إلى المكون (Outlet)
    // وإلا، أعد توجيهه إلى صفحة تسجيل الدخول
    return role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;
