// src/pages/CategoryManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const token = localStorage.getItem('token');

    // جلب الفئات
    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/categories');
            setCategories(res.data.data);
        } catch (error) {
            toast.error('فشل جلب الفئات.');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // إضافة فئة جديدة
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            toast.error('الرجاء إدخال اسم الفئة.');
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
            
            await axios.post('http://localhost:3000/api/categories', { name: newCategoryName }, config);
            toast.success('تمت إضافة الفئة بنجاح!');
            setNewCategoryName('');
            fetchCategories(); // إعادة جلب القائمة
        } catch (error) {
            const message = error.response?.data?.message || 'فشل إضافة الفئة.';
            toast.error(message);
        }
    };

    // حذف فئة
    const handleDeleteCategory = async (id) => {
        if (window.confirm('هل أنت متأكد أنك تريد حذف هذه الفئة؟')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };
                await axios.delete(`http://localhost:3000/api/categories/${id}`, config);
                toast.success('تم حذف الفئة بنجاح!');
                fetchCategories(); // إعادة جلب القائمة
            } catch (error) {
                const message = error.response?.data?.message || 'فشل حذف الفئة.';
                toast.error(message);
            }
        }
    };

    return (
        <div dir="rtl" className="mt-4">
            <h2 className="text-center mb-4">لوحة تحكم المدير - إدارة الفئات</h2>
            
            {/* نموذج إضافة فئة جديدة */}
            <div className="card shadow-sm p-4 mb-4">
                <h4>إضافة فئة جديدة</h4>
                <form onSubmit={handleAddCategory}>
                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="اسم الفئة"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            required
                        />
                        <button className="btn btn-success" type="submit">
                            إضافة الفئة
                        </button>
                    </div>
                </form>
            </div>

            {/* قائمة الفئات الحالية */}
            <div className="card shadow-sm p-4">
                <h4>قائمة الفئات الحالية ({categories.length})</h4>
                {categories.length === 0 ? (
                    <p className="text-muted">لا توجد فئات حاليًا.</p>
                ) : (
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>اسم الفئة</th>
                                <th>تاريخ الإنشاء</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category, index) => (
                                <tr key={category._id}>
                                    <td>{index + 1}</td>
                                    <td>{category.name}</td>
                                    <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button 
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeleteCategory(category._id)}
                                        >
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CategoryManagement;
