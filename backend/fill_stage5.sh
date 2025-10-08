#!/bin/bash

echo "بدء ملء ملفات المرحلة الخامسة: منطق المزادات والخدمات الأساسية..."

# 1. إنشاء ملف app/Services/RealtimeService.js
echo "إنشاء app/Services/RealtimeService.js..."
cat > app/Services/RealtimeService.js << EOL
// app/Services/RealtimeService.js - إدارة اتصالات Socket.IO (WebSockets)

let io; // متغير لتخزين كائن Socket.IO (يتم تهيئته في server.js)

class RealtimeService {
    /**
     * تهيئة RealtimeService وربطه بخادم HTTP
     * @param {object} socketIOInstance - كائن Socket.IO المُنشأ في server.js
     */
    init(socketIOInstance) {
        io = socketIOInstance;
        
        io.on('connection', (socket) => {
            console.log(\`[Socket.IO] User connected: \${socket.id}\`);
            
            // عند انضمام المستخدم لغرفة مزاد محددة
            socket.on('joinAuction', (auctionId) => {
                socket.join(auctionId);
                console.log(\`[Socket.IO] User \${socket.id} joined room \${auctionId}\`);
            });

            // عند مغادرة المستخدم لغرفة مزاد محددة
            socket.on('leaveAuction', (auctionId) => {
                socket.leave(auctionId);
                console.log(\`[Socket.IO] User \${socket.id} left room \${auctionId}\`);
            });
            
            // عند قطع الاتصال
            socket.on('disconnect', () => {
                console.log(\`[Socket.IO] User disconnected: \${socket.id}\`);
            });
        });
    }

    /**
     * إرسال تحديث المزايدة الفورية لجميع المشاركين في المزاد
     * @param {string} auctionId - ID المزاد
     * @param {object} bidData - بيانات العرض الجديد
     */
    sendNewBid(auctionId, bidData) {
        if (!io) return console.error("Socket.IO لم يتم تهيئته بعد.");
        
        // إرسال البيانات إلى غرفة المزاد المحددة فقط
        io.to(auctionId).emit('newBid', bidData);
    }
    
    /**
     * إرسال إشعار انتهاء المزاد
     * @param {string} auctionId - ID المزاد
     * @param {object} result - بيانات النتيجة النهائية
     */
    sendAuctionEnd(auctionId, result) {
        if (!io) return;
        io.to(auctionId).emit('auctionEnded', result);
    }
    
    /**
     * دالة مساعدة للحصول على كائن Socket.IO (للاستخدام الداخلي)
     */
    getIO() {
        return io;
    }
}

module.exports = new RealtimeService();
EOL
echo "✅ تم إنشاء app/Services/RealtimeService.js"


# 2. إنشاء ملف app/Services/AuctionService.js
echo "إنشاء app/Services/AuctionService.js..."
cat > app/Services/AuctionService.js << EOL
// app/Services/AuctionService.js - منطق الأعمال (Business Logic) للمزادات

const Product = require('../Models/Auction/Product');
const Bid = require('../Models/Auction/Bid');
const RealtimeService = require('./RealtimeService');
const User = require('../Models/User/User');
const Transaction = require('../Models/Finance/Transaction');
const mongoose = require('mongoose'); // لإدارة جلسات التزامن

const REQUIRED_DEPOSIT = 100; // مثال: مبلغ التأمين المطلوب للمشاركة في مزاد

class AuctionService {

    /**
     * التحقق من صلاحية المستخدم للمزايدة (تأمين كافٍ)
     */
    async checkEligibility(userId) {
        const user = await User.findById(userId);
        if (!user || user.walletBalance < REQUIRED_DEPOSIT) {
            return { 
                eligible: false, 
                message: \`الرجاء إيداع \${REQUIRED_DEPOSIT} في المحفظة للمزايدة.\` 
            };
        }
        return { eligible: true };
    }

    /**
     * @desc    تنفيذ عملية المزايدة في الوقت الفعلي
     * @param   {string} productId - ID المنتج
     * @param   {string} userId - ID المزايد
     * @param   {number} amount - المبلغ المعروض
     */
    async placeBid(productId, userId, amount) {
        const product = await Product.findById(productId);

        // 1. التحقق من حالة المزاد
        if (!product || product.status !== 'live' || product.endTime < new Date()) {
            return { success: false, status: 400, message: 'المزاد غير نشط أو انتهى.' };
        }
        
        // 2. التحقق من الحد الأدنى للمبلغ
        const minBid = product.currentPrice > 0 ? product.currentPrice + 1 : product.startingPrice;
        if (amount < minBid) {
            return { success: false, status: 400, message: \`يجب أن يكون العرض أكبر من \${minBid}.\` };
        }

        // 3. التحقق من الأهلية (التأمين/الرصيد)
        const eligibility = await this.checkEligibility(userId);
        if (!eligibility.eligible) {
            return { success: false, status: 403, message: eligibility.message };
        }

        // 4. معالجة العرض الجديد (Transaction/Database Logic)
        const session = await mongoose.startSession(); // بدء جلسة لتجنب مشاكل التزامن
        session.startTransaction();

        try {
            // أ. تحديد العرض السابق كعرض غير أعلى
            if (product.highestBidder) {
                await Bid.updateOne(
                    { product: productId, isCurrentHighest: true },
                    { \$set: { isCurrentHighest: false } },
                    { session }
                );
            }

            // ب. إنشاء سجل المزايدة الجديد
            const newBid = await Bid.create([{
                bidder: userId,
                product: productId,
                amount: amount,
                isCurrentHighest: true
            }], { session });

            // ج. تحديث المنتج
            product.currentPrice = amount;
            product.highestBidder = userId;
            await product.save({ session });

            await session.commitTransaction();
            session.endSession();
            
            // 5. إرسال إشعار الوقت الفعلي (Real-Time Notification)
            // ملاحظة: يجب أن تكون عملية البحث عن اسم المستخدم سريعة
            const bidData = {
                price: amount,
                bidderId: userId,
                bidderName: (await User.findById(userId)).firstName, 
                time: new Date()
            };
            RealtimeService.sendNewBid(productId.toString(), bidData);

            return { success: true, bid: newBid[0] };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("خطأ في معالجة المزايدة:", error);
            return { success: false, status: 500, message: 'فشل في إتمام عملية المزايدة (خطأ في قاعدة البيانات).' };
        }
    }
}

module.exports = new AuctionService();
EOL
echo "✅ تم إنشاء app/Services/AuctionService.js"


# 3. إنشاء ملف app/Controllers/Api/AuctionController.js
echo "إنشاء app/Controllers/Api/AuctionController.js..."
cat > app/Controllers/Api/AuctionController.js << EOL
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
            const auctions = await Product.find({ status: { \$in: ['live', 'pending'] } })
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
EOL
echo "✅ تم إنشاء app/Controllers/Api/AuctionController.js"

# 4. تحديث ملف routes/api.js (لربط متحكم المزادات الجديد)
echo "تحديث routes/api.js لربط AuctionController..."
cat > routes/api.js << EOL
// routes/api.js - تعريف مسارات الـ API (للمستخدمين العاديين والمزايدة)

const express = require('express');
const router = express.Router();

// استدعاء المتحكمات والـ Middleware
const UserController = require('./../app/Controllers/Api/UserController');
const AuctionController = require('./../app/Controllers/Api/AuctionController'); 
const { protect, authorize } = require('../app/middleware/auth'); 

// 1. مسارات المصادقة (Auth Routes)
router.post('/auth/register', UserController.register);
router.post('/auth/login', UserController.login);
router.get('/user/me', protect, UserController.getMe);


// 2. مسارات المزادات والمنتجات
// @route   POST /api/auction/products
// @desc    إنشاء منتج جديد (يتطلب صلاحية بائع)
// @access  Private (Seller/Admin)
router.post('/auction/products', protect, authorize('seller', 'admin'), AuctionController.createProduct);

// @route   GET /api/auction/live
// @desc    جلب المزادات الحية
// @access  Public
router.get('/auction/live', AuctionController.getLiveAuctions);

// @route   POST /api/auction/:id/bid
// @desc    وضع عرض مزايدة جديد (Real-Time)
// @access  Private (User/Seller/Admin)
router.post('/auction/:id/bid', protect, AuctionController.placeBid);


module.exports = router;
EOL
echo "✅ تم تحديث routes/api.js"


echo "انتهت المرحلة الخامسة: تنفيذ منطق المزايدة في الوقت الفعلي."
