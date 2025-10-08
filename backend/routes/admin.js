// routes/admin.js - تعريف مسارات لوحة تحكم المدير

const express = require('express');
const router = express.Router();

// استدعاء المتحكمات والـ Middleware
const DashboardController = require('./../app/Controllers/Admin/DashboardController');
const { protect, authorize } = require('../app/middleware/auth'); 

// جميع المسارات هنا تتطلب مصادقة (protect) وصلاحية مدير (authorize('admin'))

// @route   GET /admin/dashboard/stats
// @desc    جلب إحصائيات لوحة القيادة
router.get('/dashboard/stats', protect, authorize('admin'), DashboardController.getStats);

// @route   PUT /admin/products/:id/status
// @desc    مراجعة وتغيير حالة منتج (قبول أو رفض)
router.put('/products/:id/status', protect, authorize('admin'), DashboardController.reviewProduct);

// يمكن إضافة مسارات أخرى للإدارة هنا (مثل: إدارة المستخدمين، حظر الحسابات...)

module.exports = router;
