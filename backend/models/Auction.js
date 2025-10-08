// models/Auction.js
const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'الرجاء إضافة عنوان للمزاد'],
        trim: true,
        maxlength: [100, 'يجب أن لا يتجاوز العنوان 100 حرف'],
    },
    description: {
        type: String,
        required: [true, 'الرجاء إضافة وصف للمزاد'],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'الرجاء اختيار فئة للمزاد'],
    },
    startingPrice: {
        type: Number,
        required: [true, 'الرجاء تحديد سعر البداية'],
        min: [0, 'يجب أن يكون سعر البداية موجباً'],
    },
    currentPrice: {
        type: Number,
        default: 0, 
    },
    image: {
        type: String,
        default: '/uploads/default-auction.jpg', 
    },
    deadline: {
        type: Date,
        required: [true, 'الرجاء تحديد تاريخ ووقت انتهاء المزاد'],
    },
    isClosed: {
        type: Boolean,
        default: false,
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    bids: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        amount: {
            type: Number,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Auction', AuctionSchema);
