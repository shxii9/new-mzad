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
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
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
