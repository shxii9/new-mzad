// models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'الرجاء إضافة اسم الفئة'],
        unique: true,
        trim: true,
        maxlength: [50, 'يجب ألا يتجاوز اسم الفئة 50 حرفًا']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
