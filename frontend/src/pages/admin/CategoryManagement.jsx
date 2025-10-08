// src/pages/admin/CategoryManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:3000/api/categories'; // تأكد من مطابقة هذا المسار للخادم الخلفي

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. جلب الفئات
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_URL);
            setCategories(res.data.data);
            setLoading(false);
        } catch (error) {
            // يمكن أن يحدث هذا الخطأ إذا كان الخادم غير متصل
            toast.error('فشل في جلب الفئات.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // 2. معالجة الإرسال (إضافة/تعديل)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return toast.error('اسم الفئة مطلوب.');

        setLoading(true);

        // يجب عليك تخزين التوكن في مكان آمن، أو تمريره من سياق (Context) المصادقة
        const token = localStorage.getItem('token'); 
        if (!token) {
            toast.error('الرجاء تسجيل الدخول كمدير أولاً.');
            setLoading(false);
            return;
        }

        try {
            if (editingCategory) {
                // تعديل
                await axios.put(`${API_URL}/${editingCategory._id}`, { name }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('تم تحديث الفئة بنجاح!');
                setEditingCategory(null);
            } else {
                // إضافة
                await axios.post(API_URL, { name }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('تم إضافة الفئة بنجاح!');
            }
            setName('');
            fetchCategories(); // إعادة جلب البيانات
        } catch (error) {
            // رسالة خطأ من الخادم (مثل: غير مصرح لك، أو خطأ في التحقق)
            toast.error(error.response?.data?.error || 'حدث خطأ أثناء حفظ الفئة.');
        } finally {
            setLoading(false);
        }
    };

    // 3. معالجة الحذف
    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('الرجاء تسجيل الدخول كمدير أولاً.');
            return;
        }
        
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('تم حذف الفئة بنجاح!');
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.error || 'حدث خطأ أثناء حذف الفئة.');
        }
    };

    // 4. تعيين وضع التعديل
    const handleEdit = (category) => {
        setEditingCategory(category);
        setName(category.name);
    };

    return (
        <div className="container mt-4" dir="rtl">
            <h2 className="mb-4 text-primary">لوحة تحكم المدير - إدارة الفئات</h2>
            
            {/* نموذج الإضافة والتعديل */}
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <h5 className="card-title text-success">{editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="categoryName" className="form-label">اسم الفئة</label>
                            <input
                                type="text"
                                className="form-control"
                                id="categoryName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        <button type="submit" className={`btn btn-${editingCategory ? 'warning' : 'primary'} me-2`} disabled={loading}>
                            {loading ? 'جاري الحفظ...' : (editingCategory ? 'تحديث الفئة' : 'إضافة الفئة')}
                        </button>
                        {editingCategory && (
                            <button type="button" className="btn btn-secondary" onClick={() => { setEditingCategory(null); setName(''); }}>
                                إلغاء التعديل
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* جدول عرض الفئات */}
            <div className="card shadow-sm">
                <div className="card-body">
                    <h5 className="card-title">قائمة الفئات الحالية ({categories.length})</h5>
                    {loading && <p className="text-info">جاري تحميل البيانات...</p>}
                    {!loading && categories.length === 0 && <p className="text-muted">لا توجد فئات حاليًا.</p>}
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>اسم الفئة</th>
                                    <th>تاريخ الإنشاء</th>
                                    <th>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category, index) => (
                                    <tr key={category._id}>
                                        <td>{index + 1}</td>
                                        <td>{category.name}</td>
                                        <td>{new Date(category.createdAt).toLocaleDateString('ar-EG')}</td>
                                        <td>
                                            <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(category)}>
                                                تعديل
                                            </button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(category._id)}>
                                                حذف
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryManagement;
