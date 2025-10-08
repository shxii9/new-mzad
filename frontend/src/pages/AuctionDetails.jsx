// src/pages/AuctionDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaDollarSign, FaClock, FaTags, FaUserTie, FaHistory, FaPlus } from 'react-icons/fa';

const AuctionDetails = () => {
    const { id } = useParams();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // دالة لجلب تفاصيل المزاد
    const fetchAuctionDetails = async () => {
        try {
            const res = await axios.get(`http://localhost:5001/api/auctions/${id}`);
            setAuction(res.data.data);
            setLoading(false);
        } catch (error) {
            toast.error('فشل في جلب تفاصيل المزاد.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctionDetails();
    }, [id]);

    // دالة لوضع مزايدة جديدة
    const handlePlaceBid = async (e) => {
        e.preventDefault();
        const amount = parseFloat(bidAmount);

        if (!token) {
            toast.error('يجب تسجيل الدخول للمزايدة.');
            return;
        }

        if (amount <= auction.currentPrice) {
            toast.error(`يجب أن تكون المزايدة أكبر من السعر الحالي: ${auction.currentPrice.toLocaleString()} $`);
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
            
            await axios.post(`http://localhost:5001/api/auctions/${id}/bid`, { amount }, config);
            
            toast.success('تم وضع مزايدة جديدة بنجاح!');
            setBidAmount('');
            fetchAuctionDetails(); // إعادة جلب البيانات لتحديث السعر والسجل
        } catch (error) {
            const message = error.response?.data?.message || 'فشل وضع المزايدة.';
            toast.error(message);
        }
    };

    if (loading) {
        return <div className="text-center mt-5">جاري تحميل تفاصيل المزاد...</div>;
    }

    if (!auction) {
        return <div className="alert alert-danger text-center mt-5">المزاد المطلوب غير موجود.</div>;
    }

    // فرز المزايدات من الأحدث إلى الأقدم
    const sortedBids = auction.bids.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div dir="rtl" className="mt-5 container">
            <h1 className="mb-4 text-center text-primary">{auction.title}</h1>
            
            <div className="row">
                {/* عمود الصورة والتفاصيل */}
                <div className="col-lg-6 mb-4">
                    <div className="card shadow-lg p-3">
                        <img 
                            src={auction.image || '/images/default.jpg'} 
                            className="img-fluid rounded" 
                            alt={auction.title} 
                            style={{ maxHeight: '450px', objectFit: 'cover' }}
                        />
                        <h4 className="mt-4 mb-2">الوصف:</h4>
                        <p className="text-muted">{auction.description}</p>
                        
                        <ul className="list-group list-group-flush mt-3">
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                <FaTags className="me-2 text-info" />
                                الفئة: <strong>{auction.category.name}</strong>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                <FaUserTie className="me-2 text-success" />
                                مقدم المزاد: <strong>{auction.user.name}</strong>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* عمود المزايدة والسجل */}
                <div className="col-lg-6 mb-4">
                    <div className="card shadow-lg p-4 mb-4 bg-light">
                        <h3 className="text-center text-success mb-3">تفاصيل المزايدة</h3>
                        
                        <div className="alert alert-warning text-center">
                            <strong><FaDollarSign /> السعر الحالي:</strong> {auction.currentPrice.toLocaleString()} $
                        </div>
                        <div className="alert alert-danger text-center">
                            <strong><FaClock /> ينتهي في:</strong> {new Date(auction.deadline).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                        
                        {/* نموذج المزايدة */}
                        {token ? (
                            <form onSubmit={handlePlaceBid} className="mt-4">
                                <h4>وضع مزايدة جديدة:</h4>
                                <div className="input-group mb-3">
                                    <span className="input-group-text"><FaPlus /> $</span>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        placeholder={`أدخل مبلغ أكبر من ${auction.currentPrice}`} 
                                        value={bidAmount}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                        min={auction.currentPrice + 1}
                                        required
                                    />
                                    <button className="btn btn-success" type="submit">
                                        المزايدة الآن
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="alert alert-info text-center mt-4">
                                الرجاء <Link to="/login">تسجيل الدخول</Link> لوضع مزايدة.
                            </div>
                        )}
                    </div>
                    
                    {/* سجل المزايدات */}
                    <div className="card shadow-lg p-4">
                        <h4><FaHistory className="me-2" /> سجل المزايدات ({auction.bids.length})</h4>
                        {sortedBids.length === 0 ? (
                            <p className="text-muted text-center">لا توجد مزايدات بعد. كن أول مزايد!</p>
                        ) : (
                            <ul className="list-group list-group-flush">
                                {sortedBids.slice(0, 5).map((bid, index) => (
                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span className="fw-bold">{bid.user.name}</span>
                                        <span className="badge bg-primary rounded-pill">
                                            {bid.amount.toLocaleString()} $
                                        </span>
                                        <small className="text-muted">
                                            قبل: {new Date(bid.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                        </small>
                                    </li>
                                ))}
                                {sortedBids.length > 5 && (
                                    <li className="list-group-item text-center text-info">... والمزيد ({sortedBids.length - 5})</li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuctionDetails;
