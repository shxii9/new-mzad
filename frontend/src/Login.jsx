// src/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { FaSignInAlt, FaLock, FaEnvelope } from 'react-icons/fa';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();
    const { email, password } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            // الاتصال بـ Backend (المنفذ 3000)
            const res = await axios.post('http://localhost:5001/api/users/login', { email, password });
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userRole', res.data.role);
            toast.success('تم تسجيل الدخول بنجاح!');
            
            // التوجيه بناءً على الدور
            navigate(res.data.role === 'admin' ? '/admin/categories' : '/');
            window.location.reload(); 
        } catch (error) {
            const message = error.response?.data?.message || 'فشل تسجيل الدخول';
            toast.error(message);
        }
    };

    return (
        <div className="row justify-content-center main-content" dir="rtl">
            <div className="col-md-6 col-lg-5">
                <div className="card shadow-lg mt-5">
                    <div className="card-header bg-primary text-white text-center rounded-top">
                        <FaSignInAlt size={30} className="me-2" />
                        <h2 className="d-inline">تسجيل الدخول</h2>
                    </div>
                    <div className="card-body p-4">
                        <form onSubmit={onSubmit}>
                            <div className="input-group mb-3">
                                <span className="input-group-text"><FaEnvelope /></span>
                                <input type="email" className="form-control" name="email" value={email} onChange={onChange} placeholder="البريد الإلكتروني" required />
                            </div>
                            <div className="input-group mb-3">
                                <span className="input-group-text"><FaLock /></span>
                                <input type="password" className="form-control" name="password" value={password} onChange={onChange} placeholder="كلمة المرور" required />
                            </div>
                            <button type="submit" className="btn btn-primary w-100 mt-3">
                                <FaSignInAlt className="me-1" /> تسجيل الدخول
                            </button>
                        </form>
                        <hr className="mt-4" />
                        <p className="text-center mb-0">
                            ليس لديك حساب؟ <Link to="/register" className="text-success fw-bold">سجل الآن</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
