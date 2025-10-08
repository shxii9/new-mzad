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
                message: `الرجاء إيداع ${REQUIRED_DEPOSIT} في المحفظة للمزايدة.` 
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
            return { success: false, status: 400, message: `يجب أن يكون العرض أكبر من ${minBid}.` };
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
                    { $set: { isCurrentHighest: false } },
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
