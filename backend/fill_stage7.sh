#!/bin/bash

echo "بدء ملء ملفات المرحلة السابعة: مسارات المدير وتفعيل الصلاحيات..."

# 1. إنشاء ملف app/Controllers/Admin/DashboardController.js
echo "إنشاء app/Controllers/Admin/DashboardController.js..."
cat > app/Controllers/Admin/DashboardController.js << EOL
// app/Controllers/Admin/DashboardController.js - وظائف لوحة تحكم المدير

const User = require('../../Models/User/User');
const Product = require('../../Models/Auction/Product');
const Transaction = require('../../Models/Finance/Transaction');

class DashboardController {
    
    /**
     * @desc    جلب إحصائيات لوحة القيادة العامة
     * @route   GET /admin/dashboard/stats
     * @access  Private (Admin only)
     */
    async getStats(req, res) {
        try {
            const totalUsers = await User.countDocuments();
            const totalAuctions = await Product.countDocuments();
            const liveAuctions = await Product.countDocuments({ status: 'live' });
            
            // مجموع قيمة جميع المعاملات المكتملة
            const totalRevenue = await Transaction.aggregate([
                { \$match: { status: 'completed' } },
                { \$group: { _id: null, total: { \$sum: '\$amount' } } }
            ]);

            res.status(200).json({
                success: true,
                stats: {
                    totalUsers,
                    totalAuctions,
                    liveAuctions,
                    totalRevenue: totalRevenue[0] ? totalRevenue[0].total : 0
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: 'فشل في جلب الإحصائيات.' });
        }
    }

    /**
     * @desc    مراجعة وقبول / رفض المنتجات المعلقة
     * @route   PUT /admin/products/:id/status
     * @access  Private (Admin only)
     */
    async reviewProduct(req, res) {
        const { status, startTime, endTime } = req.body;
        const productId = req.params.id;

        // يجب أن تكون الحالة إما 'live' أو 'cancelled'
        if (!['live', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, error: 'حالة المنتج غير صالحة للمراجعة.' });
        }
        
        try {
            const updateData = { status };

            // إذا تم قبول المنتج ليكون 'live'، يجب تحديد أوقات البدء والانتهاء
            if (status === 'live') {
                updateData.startTime = startTime || new Date(); // إذا لم يُحدد وقت، ابدأ الآن
                updateData.endTime = endTime || new Date(Date.now() + 86400000); // تنتهي بعد يوم
            }

            const product = await Product.findByIdAndUpdate(productId, updateData, { new: true });
            
            if (!product) {
                return res.status(404).json({ success: false, error: 'المنتج غير موجود.' });
            }

            res.status(200).json({ success: true, data: product });
        } catch (error) {
            res.status(500).json({ success: false, error: 'فشل في تحديث حالة المنتج.' });
        }
    }
}

module.exports = new DashboardController();
EOL
echo "✅ تم إنشاء app/Controllers/Admin/DashboardController.js"


# 2. إنشاء ملف routes/admin.js
echo "إنشاء routes/admin.js..."
cat > routes/admin.js << EOL
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
EOL
echo "✅ تم إنشاء routes/admin.js"


echo "انتهت المرحلة السابعة: إعداد مسارات المدير."
