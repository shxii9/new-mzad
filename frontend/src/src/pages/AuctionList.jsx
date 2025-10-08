// src/pages/AuctionList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// ملاحظة: لم نقم بإنشاء مسارات API للمزادات بعد، هذا هو الهيكل المستقبلي
const API_URL = 'http://localhost:5001/api/auctions'; 

const AuctionList = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(false);

    // جلب قائمة المزادات
    const fetchAuctions = async () => {
        setLoading(true);
        try {
            // بيانات وهمية مؤقتة للعرض، حتى يتم بناء مسار الـ API
            setAuctions([
                { _id: 'a1', title: 'سيارة تويوتا كامري 2020', currentBid: 15000, deadline: new Date(Date.now() + 86400000).toLocaleString(), category: 'سيارات' },
                { _id: 'a2', title: 'شقة فاخرة في الرياض', currentBid: 500000, deadline: new Date(Date.now() + 172800000).toLocaleString(), category: 'عقارات' },
            ]);
            
            setLoading(false);
        } catch (error) {
            toast.error('فشل في جلب قائمة المزادات.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions();
    }, []);

    return (
        <div className="container mt-4" dir="rtl">
            <h2 className="mb-4 text-primary">المزادات المتاحة حاليًا للمزايدة</h2>
            
            {loading && <p className="text-info">جاري تحميل المزادات...</p>}
            
            <div className="row">
                {auctions.map((auction) => (
                    <div key={auction._id} className="col-md-4 mb-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="card-title text-success">{auction.title}</h5>
                                <p className="card-text">
                                    <strong>الفئة:</strong> {auction.category}
                                </p>
                                <p className="card-text">
                                    <strong>المزايدة الحالية:</strong> {auction.currentBid} ريال
                                </p>
                                <p className="card-text text-danger">
                                    <strong>الموعد النهائي:</strong> {auction.deadline}
                                </p>
                                <button className="btn btn-sm btn-primary w-100">
                                    اذهب للمزايدة
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {!loading && auctions.length === 0 && (
                <div className="alert alert-info text-center">
                    لا توجد مزادات نشطة حاليًا.
                </div>
            )}
        </div>
    );
};

export default AuctionList;
