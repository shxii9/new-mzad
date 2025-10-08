// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'الرجاء إضافة اسم']
    },
    email: {
        type: String,
        required: [true, 'الرجاء إضافة بريد إلكتروني'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'الرجاء إضافة بريد إلكتروني صالح'
        ]
    },
    password: {
        type: String,
        required: [true, 'الرجاء إضافة كلمة مرور'],
        minlength: 6,
        select: false // لا يتم إرجاع كلمة المرور في الاستعلامات
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // 'user' يمثل التاجر/المستخدم العادي
        default: 'user'
    }
}, {
    timestamps: true
});

// تشفير كلمة المرور قبل حفظها
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);
