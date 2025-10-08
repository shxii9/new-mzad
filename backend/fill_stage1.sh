#!/bin/bash

echo "بدء ملء ملفات المرحلة الأولى: إعدادات التطبيق والأمان ونموذج المستخدم..."

# 1. إنشاء ملف config/app.js
echo "إنشاء config/app.js..."
cat > config/app.js << EOL
// config/app.js - إعدادات التطبيق العامة
const appConfig = {
    // عنوان الواجهة الأمامية (لتجنب مشاكل CORS)
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

    // البيئة (تطوير، إنتاج)
    NODE_ENV: process.env.NODE_ENV || 'development',

    // اسم النظام للعرض في الإشعارات أو السجلات
    SYSTEM_NAME: 'Auction Live Server',

    // إعدادات أخرى قد تحتاج إليها
    // API_VERSION: 'v1',
};

module.exports = { appConfig };
EOL
echo "✅ تم إنشاء config/app.js"

# 2. إنشاء ملف config/security.js
echo "إنشاء config/security.js..."
cat > config/security.js << EOL
// config/security.js - إعدادات الأمان والمصادقة (JWT)
const securityConfig = {
    // مفتاح سري لتوقيع رموز JWT (يجب أن يكون معقداً جداً ومخزناً في .env)
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_should_not_be_used_in_production',

    // مدة صلاحية رمز JWT (مثال: يوم واحد)
    JWT_LIFETIME: '1d',

    // الحد الأدنى لطول كلمة المرور
    MIN_PASSWORD_LENGTH: 8,

    // خوارزمية التشفير (يجب أن تكون ثابتة)
    JWT_ALGORITHM: 'HS256',
};

module.exports = { securityConfig };
EOL
echo "✅ تم إنشاء config/security.js"

# 3. إنشاء ملف app/Models/User/User.js
echo "إنشاء app/Models/User/User.js..."
cat > app/Models/User/User.js << EOL
// app/Models/User/User.js - نموذج المستخدم

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { securityConfig } = require('../../config/security');

const UserSchema = new mongoose.Schema({
    // معلومات المصادقة
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false }, // لا يتم عرض كلمة المرور تلقائياً

    // معلومات شخصية
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true },

    // حالة المستخدم
    role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },

    // محفظة المستخدم (مهمة للمزايدة)
    walletBalance: { type: Number, default: 0, min: 0 },
    
    // سجل آخر دخول (لأغراض الأمان)
    lastLogin: { type: Date },

}, { timestamps: true });

// Middleware لتشفير كلمة المرور قبل الحفظ
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// طريقة لإنشاء رمز JWT
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign(
        { id: this._id, role: this.role },
        securityConfig.JWT_SECRET,
        { expiresIn: securityConfig.JWT_LIFETIME }
    );
};

// طريقة لمقارنة كلمة المرور
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // نستخدم select: false لذلك يجب إضافة 'this.password' عند الاستدعاء
    return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', UserSchema);
EOL
echo "✅ تم إنشاء app/Models/User/User.js"

echo "انتهت المرحلة الأولى من ملء الملفات."
