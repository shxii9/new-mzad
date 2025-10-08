// src/pages/AuctionList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaGavel, FaDollarSign, FaClock, FaTags } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AuctionList = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/auctions');
                setAuctions(res.data.data);
                setLoading(false);
            } catch (error) {
                toast.error('فشل في جلب قائمة المزادات.');
                setLoading(false);
            }
        };

        fetchAuctions();
    }, []);

    if (loading) {
        return <div className="text-center mt-5">جاري تحميل المزادات...</div>;
    }

    return (
        <div dir="rtl" className="mt-5 container">
            <h2 className="text-center mb-5 d-flex align-items-center justify-content-center">
                <FaGavel className="me-2 text-primary" />
                المزادات المتاحة حاليًا للمزايدة
            </h2>
            
            {auctions.length === 0 ? (
                <div className="alert alert-info text-center">لا توجد مزادات نشطة حاليًا.</div>
            ) : (
                <div className="row">
                    {auctions.map(auction => (
                        <div key={auction._id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card shadow-lg h-100">
                                <img 
                                    src={auction.image || '/images/default.jpg'} 
                                    className="card-img-top" 
                                    alt={auction.title} 
                                    style={{ height: '200px', objectFit: 'cover' }} 
                                />
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title text-primary">{auction.title}</h5>
                                    
                                    <div className="d-flex justify-content-between my-2">
                                        <small className="text-muted"><FaTags className="me-1" /> الفئة: {auction.category.name}</small>
                                    </div>
                                    
                                    <p className="card-text mb-1">
                                        <strong><FaDollarSign className="me-1 text-success" /> العرض الحالي:</strong> {auction.currentPrice.toLocaleString()} $
                                    </p>
                                    <p className="card-text flex-grow-1">
                                        <strong><FaClock className="me-1 text-danger" /> الموعد النهائي:</strong> {new Date(auction.deadline).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                    
                                    <Link to={`/auctions/${auction._id}`} className="btn btn-primary w-100 mt-3">
                                        عرض المزاد والمزايدة
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AuctionList;
