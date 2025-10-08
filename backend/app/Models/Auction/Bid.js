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
