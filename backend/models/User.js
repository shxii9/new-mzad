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

// توقيع رمز JWT وإعادته
UserSchema.methods.getSignedJwtToken = function () {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// مقارنة كلمة المرور المدخلة مع كلمة المرور المشفرة
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
