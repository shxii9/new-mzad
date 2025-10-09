// src/pages/VendorDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { FaTachometerAlt, FaPlusCircle, FaDollarSign, FaClock, FaCheckCircle, FaTimesCircle, FaHammer } from 'react-icons/fa';

const VendorDashboard = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    // تذكر أن API يعمل على المنفذ 5002 الآن
    const API_URL = 'http://localhost:5002/api/auctions/my-auctions'; 

    useEffect(() => {
        if (!token) {
            toast.error('الرجاء تسجيل الدخول للوصول إلى لوحة التحكم.');
            navigate('/login');
            return;
        }

        const fetchMyAuctions = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const res = await axios.get(API_URL, config);
                setAuctions(res.data.data);
            } catch (error) {
                toast.error('فشل في جلب مزاداتك.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyAuctions();
    }, [token, navigate]);

    const getStatusInfo = (auction) => {
        const isExpired = new Date(auction.deadline) < new Date();
        
        if (auction.isClosed) {
            return {
                icon: <FaCheckCircle className="text-success" />,
                text: 'مغلق (تم تحديد الفائز)',
                color: 'bg-success'
            };
        } else if (isExpired) {
             return {
                icon: <FaTimesCircle className="text-warning" />,
                text: 'انتهى (بانتظار الإغلاق)',
                color: 'bg-warning'
            };
        } else {
            return {
                icon: <FaClock className="text-info" />,
                text: 'نشط',
                color: 'bg-info'
            };
        }
    };

    if (loading) {
        return <div className="text-center mt-5">جاري تحميل لوحة التحكم...</div>;
    }

    return (
        <div dir="rtl" className="mt-5 container">
            <h2 className="text-center mb-5 d-flex align-items-center justify-content-center">
                <FaTachometerAlt className="me-2 text-primary" />
                لوحة تحكم التاجر: مزاداتي
            </h2>

            <Link to="/vendor/create-auction" className="btn btn-primary mb-4 shadow">
                <FaPlusCircle className="me-1" /> إضافة مزاد جديد
            </Link>

            {auctions.length === 0 ? (
                <div className="alert alert-info text-center">لم تقم بإنشاء أي مزادات بعد.</div>
            ) : (
                <div className="row">
                    {auctions.map(auction => {
                        const status = getStatusInfo(auction);
                        return (
                        <div key={auction._id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card shadow-lg h-100">
                                <div className={`card-header text-white ${status.color}`}>
                                    {status.icon} <strong className="me-2">الحالة: {status.text}</strong>
                                </div>
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title text-primary">{auction.title}</h5>
                                    
                                    <p className="card-text mb-1">
                                        <FaDollarSign className="me-1 text-success" /> 
                                        **العرض الحالي:** {auction.currentPrice.toLocaleString()} $
                                    </p>
                                    <p className="card-text mb-1">
                                        <FaHammer className="me-1 text-primary" /> 
                                        **عدد المزايدات:** {auction.bids.length} مزايدة
                                    </p>
                                    <p className="card-text flex-grow-1">
                                        <FaClock className="me-1 text-danger" /> 
                                        **ينتهي في:** {new Date(auction.deadline).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                    
                                    <Link to={`/auctions/${auction._id}`} className="btn btn-outline-primary w-100 mt-3">
                                        عرض التفاصيل والمزايدات
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;
