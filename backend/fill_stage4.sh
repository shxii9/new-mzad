#!/bin/bash

echo "بدء ملء ملفات المرحلة الرابعة: نماذج المزاد والتمويل..."

# 1. إنشاء ملف app/Models/Auction/Product.js
echo "إنشاء app/Models/Auction/Product.js..."
cat > app/Models/Auction/Product.js << EOL
// app/Models/Auction/Product.js - نموذج المنتج والمزاد

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    // معلومات المنتج
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: [{ type: String }], // مصفوفة من مسارات صور المنتج
    
    // معلومات المزاد
    seller: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }, // البائع (من نموذج المستخدم)
    startingPrice: { type: Number, required: true, min: 0 },
    
    // حالة المزاد
    currentPrice: { type: Number, default: 0 },
    highestBidder: { type: mongoose.Schema.ObjectId, ref: 'User', default: null },
    
    // توقيت المزاد
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    
    // حالة المنتج
    status: {
        type: String,
        enum: ['pending', 'live', 'finished', 'cancelled'],
        default: 'pending' // في انتظار موافقة المدير
    },
    
    // نتائج المزاد
    winner: { type: mongoose.Schema.ObjectId, ref: 'User', default: null },
    isPaid: { type: Boolean, default: false } // هل دفع الفائز المبلغ كاملاً؟

}, { timestamps: true });

// إضافة فهرس (Index) لسرعة البحث بناءً على وقت النهاية والحالة
ProductSchema.index({ endTime: 1, status: 1 });

module.exports = mongoose.model('Product', ProductSchema);
EOL
echo "✅ تم إنشاء app/Models/Auction/Product.js"

# 2. إنشاء ملف app/Models/Auction/Bid.js
echo "إنشاء app/Models/Auction/Bid.js..."
cat > app/Models/Auction/Bid.js << EOL
// app/Models/Auction/Bid.js - نموذج سجل المزايدات

const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
    bidder: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.ObjectId, ref: 'Product', required: true },
    amount: { type: Number, required: true, min: 0 },
    
    // لمعرفة ما إذا كان هذا هو العرض الأعلى حالياً
    isCurrentHighest: { type: Boolean, default: true },

}, { timestamps: true });

// إضافة فهرس لسرعة البحث عن العروض الخاصة بمنتج معين (مهم جداً للتحقق من العروض)
BidSchema.index({ product: 1, amount: -1 }); // فهرسة حسب المنتج والمبلغ (تنازلياً)

module.exports = mongoose.model('Bid', BidSchema);
EOL
echo "✅ تم إنشاء app/Models/Auction/Bid.js"

# 3. إنشاء ملف app/Models/Finance/Transaction.js
echo "إنشاء app/Models/Finance/Transaction.js..."
cat > app/Models/Finance/Transaction.js << EOL
// app/Models/Finance/Transaction.js - نموذج المعاملات المالية

const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    
    // نوع الحركة: إيداع (deposit)، سحب (withdrawal)، دفع نهائي (final_payment)، عمولة (commission)، استرداد (refund)
    type: {
        type: String,
        enum: ['deposit', 'withdrawal', 'final_payment', 'commission', 'refund', 'bid_hold'], 
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    
    // ربط المعاملة بكيانات أخرى (إذا كانت مرتبطة بمزاد أو منتج)
    relatedProduct: { type: mongoose.Schema.ObjectId, ref: 'Product', default: null },
    
    // معرف الدفع الخارجي (من بوابة الدفع مثل Stripe ID)
    externalId: { type: String, trim: true },

}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
EOL
echo "✅ تم إنشاء app/Models/Finance/Transaction.js"

echo "انتهت المرحلة الرابعة: بناء نماذج البيانات للمزايدة والتمويل."
