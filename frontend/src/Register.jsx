// src/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaLock, FaEnvelope, FaUser } from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const navigate = useNavigate();
    const { name, email, password, confirmPassword } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('كلمة المرور وتأكيد كلمة المرور غير متطابقان.');
            return;
        }

        try {
            // الاتصال بـ Backend (المنفذ 3000)
            const res = await axios.post('http://localhost:5001/api/users', { name, email, password });
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userRole', res.data.role);
            toast.success('تم التسجيل وتسجيل الدخول بنجاح!');
            navigate('/');
            window.location.reload(); 
            
        } catch (error) {
            const message = error.response?.data?.message || 'فشل التسجيل';
            toast.error(message);
        }
    };

    return (
        <div className="row justify-content-center main-content" dir="rtl">
            <div className="col-md-6 col-lg-5">
                <div className="card shadow-lg mt-5">
                    <div className="card-header bg-success text-white text-center rounded-top">
                        <FaUserPlus size={30} className="me-2" />
                        <h2 className="d-inline">تسجيل مستخدم جديد</h2>
                    </div>
                    <div className="card-body p-4">
                        <form onSubmit={onSubmit}>
                            
                            <div className="input-group mb-3">
                                <span className="input-group-text"><FaUser /></span>
                                <input type="text" className="form-control" name="name" value={name} onChange={onChange} placeholder="الاسم الكامل" required />
                            </div>

                            <div className="input-group mb-3">
                                <span className="input-group-text"><FaEnvelope /></span>
                                <input type="email" className="form-control" name="email" value={email} onChange={onChange} placeholder="البريد الإلكتروني" required />
                            </div>
                            
                            <div className="input-group mb-3">
                                <span className="input-group-text"><FaLock /></span>
                                <input type="password" className="form-control" name="password" value={password} onChange={onChange} placeholder="كلمة المرور" required />
                            </div>
                            
                            <div className="input-group mb-3">
                                <span className="input-group-text"><FaLock /></span>
                                <input type="password" className="form-control" name="confirmPassword" value={confirmPassword} onChange={onChange} placeholder="تأكيد كلمة المرور" required />
                            </div>

                            <button type="submit" className="btn btn-success w-100 mt-3">
                                <FaUserPlus className="me-1" /> تسجيل جديد
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
