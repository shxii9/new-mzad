// app/Controllers/Api/AuctionController.js - المتحكم الخاص بمسارات المزاد والمنتجات

const Product = require('../../Models/Auction/Product');
const AuctionService = require('../../Services/AuctionService');

class AuctionController {
    
    /**
     * @desc    إنشاء منتج جديد لعرضه في المزاد (من قِبل البائع)
     * @route   POST /api/auction/products
     * @access  Private (يجب أن يكون Role: Seller أو Admin)
     */
    async createProduct(req, res) {
        // يتم الحصول على ID المستخدم من دالة protect middleware
        req.body.seller = req.user.id; 
        
        try {
            // التحقق من صلاحيات البائع (يمكن إضافتها هنا أو في دالة authorize)
            if (req.user.role !== 'seller' && req.user.role !== 'admin') {
                 return res.status(403).json({ success: false, error: 'غير مصرح: يجب أن تكون بائعاً لإنشاء منتج.' });
            }

            const product = await Product.create(req.body);

            res.status(201).json({ success: true, data: product });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'فشل في إنشاء المنتج.' });
        }
    }

    /**
     * @desc    الحصول على قائمة المزادات الحية والمنتظرة
     * @route   GET /api/auction/live
     * @access  Public
     */
    async getLiveAuctions(req, res) {
        try {
            const auctions = await Product.find({ status: { $in: ['live', 'pending'] } })
                .sort({ startTime: 1 })
                .select('-\_\_v')
                .populate('seller', 'firstName lastName');

            res.status(200).json({ success: true, count: auctions.length, data: auctions });
        } catch (error) {
            res.status(500).json({ success: false, error: 'فشل في جلب المزادات.' });
        }
    }

    /**
     * @desc    وضع عرض مزايدة جديد (Core Functionality)
     * @route   POST /api/auction/:id/bid
     * @access  Private (يتطلب مصادقة)
     */
    async placeBid(req, res) {
        const productId = req.params.id;
        const userId = req.user.id;
        const amount = parseFloat(req.body.amount);

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: 'المبلغ غير صالح.' });
        }
        
        // استدعاء منطق الخدمة المعقد
        const result = await AuctionService.placeBid(productId, userId, amount);

        if (result.success) {
            res.status(200).json({ success: true, message: 'تم وضع العرض بنجاح.', bid: result.bid });
        } else {
            res.status(result.status || 500).json({ success: false, error: result.message });
        }
    }
}

module.exports = new AuctionController();
