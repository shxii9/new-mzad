// app/Services/SchedulerService.js - المهام المجدولة (Cron Jobs) لإنهاء المزادات

// في الواقع، ستحتاج إلى npm install node-cron
// const cron = require('node-cron');
const Product = require('../Models/Auction/Product');
const AuctionService = require('./AuctionService'); 
const RealtimeService = require('./RealtimeService'); 

class SchedulerService {
    
    /**
     * @desc    بدء مهمة CRON Job للتحقق من انتهاء المزادات كل دقيقة.
     */
    start() {
        console.log("[Scheduler] مهمة جدولة المزادات بدأت.");
        
        // (نستخدم setTimeout لمحاكاة مهمة التشغيل المتكرر)
        // في الكود الفعلي: cron.schedule('* * * * *', this.checkFinishedAuctions); 
        setInterval(() => {
            this.checkFinishedAuctions();
        }, 60000); // التحقق كل 60 ثانية (دقيقة واحدة)
    }

    /**
     * @desc    التحقق من المزادات التي انتهى وقتها ولم يتم إنهاؤها
     */
    async checkFinishedAuctions() {
        const now = new Date();
        
        // 1. البحث عن المزادات "الحية" التي تجاوز وقت انتهائها
        const finishedAuctions = await Product.find({
            status: 'live',
            endTime: { $lte: now } // $lte = أقل من أو يساوي
        });

        if (finishedAuctions.length === 0) return;

        console.log(`[Scheduler] تم العثور على ${finishedAuctions.length} مزاداً منتهياً. سيتم إنهاءها.`);

        for (const product of finishedAuctions) {
            try {
                // 2. تحديث حالة المزاد
                product.status = 'finished';
                product.winner = product.highestBidder;
                await product.save();
                
                // 3. إرسال إشعار انتهاء المزاد عبر Socket.IO
                RealtimeService.sendAuctionEnd(product._id.toString(), {
                    winnerId: product.winner,
                    finalPrice: product.currentPrice
                });
                
                // 4. بدء منطق تصفية الدفع (تستدعي PaymentService)
                // await AuctionService.finalizeAuctionPayment(product.winner, product.seller, product.currentPrice);
                
                console.log(`[Scheduler] تم إنهاء المزاد ID: ${product._id}`);

            } catch (error) {
                console.error(`[Scheduler] فشل في إنهاء المزاد ID: ${product._id}`, error);
            }
        }
    }
}

module.exports = new SchedulerService();
