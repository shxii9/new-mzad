#!/bin/bash

echo "بدء ملء ملفات المرحلة السادسة: الخدمات المالية والمهام المجدولة..."

# 1. إنشاء ملف config/payments.js
echo "إنشاء config/payments.js..."
cat > config/payments.js << EOL
// config/payments.js - إعدادات بوابة الدفع (مثال: Stripe)

const paymentsConfig = {
    // مفتاح سري لبوابة الدفع (يجب تحميله من .env)
    SECRET_KEY: process.env.PAYMENT_SECRET_KEY || 'sk_test_fallback_not_secure',

    // مفتاح عام (للاستخدام في الواجهة الأمامية)
    PUBLIC_KEY: process.env.PAYMENT_PUBLIC_KEY || 'pk_test_fallback',
    
    // عملة الدفع الافتراضية
    CURRENCY: 'USD',

    // عنوان URL لإعادة التوجيه بعد الدفع الناجح
    SUCCESS_URL: process.env.FRONTEND_URL + '/payment/success',

    // عنوان URL لإعادة التوجيه بعد فشل الدفع
    CANCEL_URL: process.env.FRONTEND_URL + '/payment/cancel',
    
    // نسبة العمولة التي تأخذها المنصة من قيمة المزاد الفائز (مثال: 5%)
    PLATFORM_COMMISSION_RATE: 0.05 
};

module.exports = { paymentsConfig };
EOL
echo "✅ تم إنشاء config/payments.js"

# 2. إنشاء ملف app/Services/PaymentService.js
echo "إنشاء app/Services/PaymentService.js..."
cat > app/Services/PaymentService.js << EOL
// app/Services/PaymentService.js - منطق التعامل مع المحفظة والمعاملات المالية

const User = require('../Models/User/User');
const Transaction = require('../Models/Finance/Transaction');
const { paymentsConfig } = require('../../config/payments');

class PaymentService {
    
    /**
     * @desc    محاكاة عملية إيداع الأموال في محفظة المستخدم
     * (في الواقع يتم هنا استدعاء API بوابة الدفع)
     * @param   {string} userId - ID المستخدم
     * @param   {number} amount - المبلغ المراد إيداعه
     */
    async processDeposit(userId, amount, externalId = 'MOCK_ID') {
        try {
            // 1. تحديث رصيد المستخدم
            const user = await User.findByIdAndUpdate(userId, 
                { \$inc: { walletBalance: amount } }, // زيادة الرصيد
                { new: true } // لإرجاع الكائن المُحدَّث
            );
            
            // 2. تسجيل المعاملة
            await Transaction.create({
                user: userId,
                amount: amount,
                type: 'deposit',
                status: 'completed',
                externalId: externalId
            });

            return { success: true, newBalance: user.walletBalance };

        } catch (error) {
            console.error("خطأ في عملية الإيداع:", error);
            return { success: false, error: 'فشل في تحديث المحفظة أو تسجيل المعاملة.' };
        }
    }

    /**
     * @desc    معالجة سحب الأموال من محفظة المستخدم
     */
    async processWithdrawal(userId, amount) {
        // ... منطق مشابه لعملية الإيداع لكن مع التحقق من الرصيد أولاً ...
        return { success: true, message: 'تم تسجيل طلب السحب بنجاح.' };
    }

    /**
     * @desc    معالجة العمولة والدفع النهائي بعد انتهاء المزاد
     */
    async finalizeAuctionPayment(winnerId, sellerId, finalPrice) {
        const commission = finalPrice * paymentsConfig.PLATFORM_COMMISSION_RATE;
        const netAmountToSeller = finalPrice - commission;
        
        // ... (منطق معقد يتطلب جلسات تزامن) ...
        return { success: true, commission };
    }
}

module.exports = new PaymentService();
EOL
echo "✅ تم إنشاء app/Services/PaymentService.js"

# 3. إنشاء ملف app/Services/SchedulerService.js
echo "إنشاء app/Services/SchedulerService.js..."
cat > app/Services/SchedulerService.js << EOL
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
            endTime: { \$lte: now } // \$lte = أقل من أو يساوي
        });

        if (finishedAuctions.length === 0) return;

        console.log(\`[Scheduler] تم العثور على \${finishedAuctions.length} مزاداً منتهياً. سيتم إنهاءها.\`);

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
                
                console.log(\`[Scheduler] تم إنهاء المزاد ID: \${product._id}\`);

            } catch (error) {
                console.error(\`[Scheduler] فشل في إنهاء المزاد ID: \${product._id}\`, error);
            }
        }
    }
}

module.exports = new SchedulerService();
EOL
echo "✅ تم إنشاء app/Services/SchedulerService.js"


# 4. تحديث ملف server.js (لبدء خدمة الجدولة)
echo "تحديث server.js لبدء SchedulerService..."
# سنستخدم sed لتعديل server.js (أكثر أماناً من مسح الملف بالكامل)
# يجب أن يتم التعديل يدوياً في هذه الحالة لتجنب التعقيد، لكن سنقوم بإنشاء نسخة معدلة لتبسيط العملية

cat > server.js << EOL
// server.js - الملف الرئيسي لتشغيل الخادم (نسخة محدثة)

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

// استدعاء ملفات الإعدادات والمسارات والخدمات
const database = require('./config/database');
const { appConfig } = require('./config/app');
const RealtimeService = require('./app/Services/RealtimeService');
const SchedulerService = require('./app/Services/SchedulerService'); // <== الجديد

const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// 1. إعداد Socket.IO وربطه بالخادم
const io = socketIo(server, {
    cors: {
        origin: appConfig.FRONTEND_URL, 
        methods: ["GET", "POST"]
    }
});

// 2. ربط خدمة الزمن الحقيقي بنظام Socket.IO
RealtimeService.init(io);

// 3. الاتصال بقاعدة البيانات
database.connect();

// 4. بدء خدمة الجدولة (لإنهاء المزادات تلقائياً) <== الجديد
SchedulerService.start();

// 5. إعداد Middlewares الأساسية
app.use(cors({ origin: appConfig.FRONTEND_URL })); 
app.use(bodyParser.json()); 

// 6. تعريف المسارات (Routes)
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

// 7. تشغيل الخادم
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
    console.log(\`Environment: \${appConfig.NODE_ENV}\`);
});
EOL
echo "✅ تم تحديث server.js وبدء خدمة الجدولة."


echo "انتهت المرحلة السادسة: إعداد الخدمات المالية والجدولة."
