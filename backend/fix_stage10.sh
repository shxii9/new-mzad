#!/bin/bash

echo "بدء المرحلة العاشرة (الإصلاح): تصحيح مسار الاستيراد في User.js..."

# 1. تحديث محتوى app/Models/User/User.js لتصحيح المسار
echo "تحديث app/Models/User/User.js..."
cat > app/Models/User/User.js << EOL
// app/Models/User/User.js - نموذج المستخدم

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { securityConfig } = require('../../config/security'); // تم تصحيح المسار ليكون '../../config/security'

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'الرجاء إدخال بريد إلكتروني صالح'
        ]
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0, min: 0 } // رصيد المحفظة للمزايدة
    
}, { timestamps: true });

// تشفير كلمة المرور قبل الحفظ
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// توقيع رمز JWT وإعادته (Generate JWT and return)
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, securityConfig.JWT_SECRET, {
        expiresIn: securityConfig.JWT_EXPIRE
    });
};

// مقارنة كلمة المرور المدخلة مع كلمة المرور المشفرة في قاعدة البيانات
UserSchema.methods.matchPassword = async function (enteredPassword) {
    // يجب استدعاء select: true على حقل كلمة المرور في المتحكم
    return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', UserSchema);
EOL
echo "✅ تم تحديث app/Models/User/User.js بنجاح."

echo "تم الإصلاح. الآن يجب أن يعمل npm run seed."
