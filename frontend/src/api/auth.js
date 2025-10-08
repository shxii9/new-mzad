// src/api/auth.js
import api from './axios';

// دالة تسجيل الدخول
export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/auth/login', {
            email,
            password
        });
        
        // حفظ التوكن للطلبات المستقبلية
        localStorage.setItem('authToken', response.data.token);
        return response.data;
    } catch (error) {
        throw error.response.data; 
    }
};

// دالة جلب بيانات المستخدم الحالي (Protected Route)
export const fetchCurrentUser = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        throw new Error('No authentication token found.');
    }

    try {
        // نستخدم المسار الصحيح: /api/user/me
        const response = await api.get('/user/me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        return response.data.user;
    } catch (error) {
        localStorage.removeItem('authToken');
        throw error.response.data;
    }
};
