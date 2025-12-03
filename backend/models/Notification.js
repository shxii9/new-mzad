// models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['bid_placed', 'auction_won', 'auction_lost', 'auction_ending_soon', 'new_auction'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    auction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Notification', NotificationSchema);
