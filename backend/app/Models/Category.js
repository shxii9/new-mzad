// app/Models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'الرجاء إضافة اسم الفئة'],
        unique: true,
        trim: true,
        maxlength: [50, 'اسم الفئة لا يمكن أن يتجاوز 50 حرفًا']
    },
    slug: String, // سيتم توليده تلقائياً من الاسم
    description: {
        type: String,
        maxlength: [500, 'الوصف لا يمكن أن يتجاوز 500 حرفًا']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// إنشاء slug من الاسم قبل الحفظ
CategorySchema.pre('save', function(next) {
    this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    next();
});

module.exports = mongoose.model('Category', CategorySchema);
