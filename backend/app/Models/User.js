const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { appConfig } = require('../../config/app'); // المسار الصحيح (خطوتان للخلف)

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'الرجاء إضافة الاسم الأول']
    },
    lastName: {
        type: String,
        required: [true, 'الرجاء إضافة الاسم الأخير']
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
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'الرجاء إضافة كلمة مرور'],
        minlength: 6,
        select: false 
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// تشفير كلمة المرور قبل حفظها
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// إنشاء توكن JWT وتوقيعه
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, appConfig.JWT_SECRET, {
        expiresIn: appConfig.JWT_EXPIRE
    });
};

// مطابقة كلمة المرور المدخلة مع كلمة المرور المشفرة في قاعدة البيانات
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// <--- السطر الحاسم لمنع الخطأ --->
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
