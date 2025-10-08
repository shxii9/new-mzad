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
