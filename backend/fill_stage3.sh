#!/bin/bash

echo "بدء ملء ملفات المرحلة الثالثة: إنشاء Middleware المصادقة وتحديث المسارات..."

# 1. إنشاء مجلد middleware
mkdir -p app/middleware

# 2. إنشاء ملف app/middleware/auth.js
echo "إنشاء app/middleware/auth.js..."
cat > app/middleware/auth.js << EOL
// app/middleware/auth.js - دالة التحقق من رمز JWT (الحماية)

const jwt = require('jsonwebtoken');
const User = require('../Models/User/User'); 
const { securityConfig } = require('../../config/security');

/**
 * دالة حماية المسارات (Middleware)
 * تتحقق من وجود وصحة رمز JWT في رأس الطلب (Authorization Header).
 */
exports.protect = async (req, res, next) => {
    let token;

    // التحقق مما إذا كان هناك رمز في رأس 'Authorization' بصيغة 'Bearer TOKEN'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    // إذا لم يكن هناك رمز (Token)
    if (!token) {
        return res.status(401).json({ success: false, error: 'غير مصرح: لا يوجد رمز وصول (Token).' });
    }

    try {
        // فك تشفير الرمز والتحقق من صلاحيته
        const decoded = jwt.verify(token, securityConfig.JWT_SECRET);
        
        // البحث عن المستخدم باستخدام الـ ID المضمن في الرمز
        // (نستخدم .select('-password') لعدم جلب كلمة المرور)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, error: 'غير مصرح: المستخدم غير موجود.' });
        }

        next(); // الاستمرار إلى المتحكم (Controller)
    } catch (err) {
        // في حال فشل فك التشفير أو انتهاء صلاحية الرمز
        return res.status(401).json({ success: false, error: 'غير مصرح: رمز الوصول غير صالح أو منتهي الصلاحية.' });
    }
};


/**
 * دالة التحقق من دور المستخدم (Authorization)
 * تقبل مصفوفة من الأدوار (مثل ['admin', 'seller']).
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: \`غير مصرح: لا تملك صلاحية الوصول (\${req.user.role}).\` });
        }
        next();
    };
};
EOL
echo "✅ تم إنشاء app/middleware/auth.js"

# 3. تحديث ملف routes/api.js (لإضافة دالة الحماية وتجربة أول مسار محمي)
echo "تحديث routes/api.js..."
cat > routes/api.js << EOL
// routes/api.js - تعريف مسارات الـ API (للمستخدمين العاديين والمزايدة)

const express = require('express');
const router = express.Router();

// استدعاء المتحكمات
const UserController = require('./../app/Controllers/Api/UserController');
const { protect } = require('../app/middleware/auth'); // استدعاء دالة الحماية

// 1. مسارات المصادقة (Auth Routes)
router.post('/auth/register', UserController.register);
router.post('/auth/login', UserController.login);


// 2. مسارات محمية تتطلب رمز JWT
// @route   GET /api/user/me
// @desc    الحصول على بيانات المستخدم المصادق عليه
// @access  Private
router.get('/user/me', protect, UserController.getMe);


// 3. مسارات المزادات
/*
const AuctionController = require('./../app/Controllers/Api/AuctionController'); 
router.get('/auction/live', AuctionController.getLiveAuctions); // قد لا تحتاج لحماية
router.post('/auction/:id/bid', protect, AuctionController.placeBid); // تتطلب حماية
*/


module.exports = router;
EOL
echo "✅ تم تحديث routes/api.js"

# 4. تحديث ملف app/Controllers/Api/UserController.js (لإضافة دالة getMe)
echo "تحديث app/Controllers/Api/UserController.js لإضافة دالة getMe..."
cat > app/Controllers/Api/UserController.js << EOL
// app/Controllers/Api/UserController.js - معالجة تسجيل المستخدم والمصادقة

const User = require('../../Models/User/User');
const { securityConfig } = require('../../../config/security'); 

class UserController {
    // ... (دالة register موجودة مسبقاً) ...
    async register(req, res) {
        const { firstName, lastName, email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ success: false, error: 'هذا البريد الإلكتروني مستخدم بالفعل.' });
            }

            user = await User.create({
                firstName,
                lastName,
                email,
                password,
                walletBalance: 0,
                role: 'user'
            });

            const token = user.getSignedJwtToken();

            res.status(201).json({ 
                success: true, 
                token, 
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'خطأ في الخادم أثناء التسجيل.' });
        }
    }
    
    // ... (دالة login موجودة مسبقاً) ...
    async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.' });
        }

        try {
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                return res.status(401).json({ success: false, error: 'بيانات الاعتماد غير صحيحة.' });
            }

            const isMatch = await user.matchPassword(password);

            if (!isMatch) {
                return res.status(401).json({ success: false, error: 'بيانات الاعتماد غير صحيحة.' });
            }

            user.lastLogin = Date.now();
            await user.save();
            
            const token = user.getSignedJwtToken();

            res.status(200).json({ 
                success: true, 
                token, 
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'خطأ في الخادم أثناء تسجيل الدخول.' });
        }
    }


    /**
     * @desc    الحصول على بيانات المستخدم المصادق عليه
     * @route   GET /api/user/me
     * @access  Private
     */
    async getMe(req, res) {
        // يتم وضع كائن المستخدم (req.user) بواسطة دالة الحماية (protect middleware)
        res.status(200).json({
            success: true,
            user: req.user
        });
    }
}

module.exports = new UserController();
EOL
echo "✅ تم تحديث app/Controllers/Api/UserController.js"

echo "انتهت المرحلة الثالثة: إعداد Middleware المصادقة."
