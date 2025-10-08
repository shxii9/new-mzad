// src/pages/CreateAuction.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaPlusCircle, FaDollarSign, FaFileAlt, FaTags, FaCalendarAlt } from 'react-icons/fa';

const CreateAuction = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        startingPrice: '',
        deadline: '',
    });

    const token = localStorage.getItem('token');
    const { title, description, category, startingPrice, deadline } = formData;

    // 1. جلب قائمة الفئات
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/categories');
                setCategories(res.data.data);
            } catch (error) {
                toast.error('فشل في جلب الفئات.');
            }
        };

        if (token) {
            fetchCategories();
        } else {
            toast.error('الرجاء تسجيل الدخول كتاجر لإضافة مزاد.');
            navigate('/login');
        }
    }, [token, navigate]);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        // فحص مبدئي لتاريخ الانتهاء
        if (new Date(deadline) <= new Date()) {
            toast.error('يجب أن يكون تاريخ انتهاء المزاد في المستقبل.');
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
            
            await axios.post('http://localhost:5001/api/auctions', formData, config);
            
            toast.success('تم إنشاء المزاد بنجاح! سيتم مراجعته.');
            navigate('/vendor/dashboard');
        } catch (error) {
            const message = error.response?.data?.message || 'فشل في إنشاء المزاد.';
            toast.error(message);
        }
    };

    return (
        <div className="row justify-content-center main-content" dir="rtl">
            <div className="col-lg-8">
                <div className="card shadow-lg mt-5">
                    <div className="card-header bg-info text-dark text-center rounded-top">
                        <FaPlusCircle size={30} className="me-2" />
                        <h2 className="d-inline">إضافة مزاد جديد</h2>
                    </div>
                    <div className="card-body p-4">
                        <form onSubmit={onSubmit}>
                            
                            {/* العنوان */}
                            <div className="input-group mb-3">
                                <span className="input-group-text"><FaFileAlt /></span>
                                <input type="text" className="form-control" name="title" value={title} onChange={onChange} placeholder="عنوان المزاد (مثال: سيارة مرسيدس موديل 2024)" required />
                            </div>

                            {/* الوصف */}
                            <div className="mb-3">
                                <textarea className="form-control" name="description" value={description} onChange={onChange} placeholder="وصف تفصيلي للمنتج..." rows="4" required />
                            </div>

                            {/* الفئة والسعر (في سطر واحد) */}
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text"><FaTags /></span>
                                        <select className="form-select" name="category" value={category} onChange={onChange} required>
                                            <option value="">اختر الفئة...</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text"><FaDollarSign /></span>
                                        <input type="number" className="form-control" name="startingPrice" value={startingPrice} onChange={onChange} placeholder="سعر البداية" min="1" required />
                                    </div>
                                </div>
                            </div>

                            {/* تاريخ الانتهاء */}
                            <div className="input-group mb-3">
                                <span className="input-group-text"><FaCalendarAlt /></span>
                                {/* استخدام 'datetime-local' لإدخال التاريخ والوقت */}
                                <input type="datetime-local" className="form-control" name="deadline" value={deadline} onChange={onChange} required />
                            </div>

                            {/* حقل الصورة (سيتم تطويره لرفع الملفات لاحقًا، الآن مجرد حقل نصي) */}
                            <div className="mb-3">
                                <label className="form-label text-muted">رابط/مسار الصورة (مؤقت)</label>
                                <input type="text" className="form-control" name="image" onChange={onChange} placeholder="أدخل مسار الصورة هنا (مثال: /uploads/car.jpg)" />
                            </div>

                            <button type="submit" className="btn btn-info text-dark w-100 mt-3">
                                <FaPlusCircle className="me-1" /> إنشاء المزاد الآن
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateAuction;
