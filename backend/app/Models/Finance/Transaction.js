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
