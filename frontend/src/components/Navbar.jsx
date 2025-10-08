// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaGavel, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaTachometerAlt, FaPlusCircle, FaListAlt } from 'react-icons/fa';

const Navbar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('userRole');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        toast.info('تم تسجيل الخروج بنجاح!');
        navigate('/login');
        window.location.reload(); 
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow" dir="rtl">
            <div className="container-fluid">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <FaGavel className="me-2 text-warning" size={24} />
                    نظام المزادات الإلكتروني
                </Link>
                
                <button type="button" className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                <FaListAlt className="me-1" /> المزادات الحالية
                            </Link>
                        </li>

                        {(role === 'user' || role === 'admin') && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/vendor/dashboard">
                                        <FaTachometerAlt className="me-1" /> لوحة تحكم التاجر
                                    </Link>
                                </li>
                                {role === 'admin' && (
                                    <li className="nav-item">
                                        <Link className="nav-link text-warning" to="/admin/categories">
                                            إدارة الفئات
                                        </Link>
                                    </li>
                                )}
                                <li className="nav-item">
                                    <Link className="btn btn-sm btn-info text-dark ms-3" to="/vendor/create-auction">
                                        <FaPlusCircle className="me-1" /> إضافة مزاد
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

                    <ul className="navbar-nav ms-auto">
                        {role ? (
                            <li className="nav-item">
                                <button className="btn btn-danger" onClick={handleLogout}>
                                    <FaSignOutAlt className="me-1" /> تسجيل خروج
                                </button>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item me-2">
                                    <Link className="btn btn-outline-primary" to="/login">
                                        <FaSignInAlt className="me-1" /> تسجيل الدخول
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-success" to="/register">
                                        <FaUserPlus className="me-1" /> تسجيل جديد
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
