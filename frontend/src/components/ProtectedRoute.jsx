import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// هذا المكون هو "الحارس"
// يقبل 'children' كـ prop، وهو يمثل المكون الذي نريد حمايته
const ProtectedRoute = ({ children }) => {
    // 1. الوصول إلى حالة المستخدم من الـ Context
    const { user } = useContext(AuthContext);

    // 2. التحقق مما إذا كان المستخدم مسجلاً دخوله
    if (!user) {
        // 3. إذا لم يكن مسجلاً، قم بإعادة توجيهه إلى صفحة تسجيل الدخول
        // استخدام مكون <Navigate> هو الطريقة الحديثة لإعادة التوجيه في React Router v6
        return <Navigate to="/login" replace />;
    }

    // 4. إذا كان المستخدم مسجلاً، قم بعرض المكون المحمي (children)
    return children;
};

export default ProtectedRoute;
