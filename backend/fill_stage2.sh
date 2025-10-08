#!/bin/bash

echo "بدء ملء ملفات المرحلة الثانية: المصادقة والمسارات..."

# 1. إنشاء ملف app/Controllers/Api/UserController.js
echo "إنشاء app/Controllers/Api/UserController.js..."
cat > app/Controllers/Api/UserController.js << EOL
// app/Controllers/Api/UserController.js - معالجة تسجيل المستخدم والمصادقة

const User = require('../../Models/User/User');
const { securityConfig } = require('../../../config/security'); 

class UserController {
    /**
     * @desc    تسجيل مستخدم جديد
     * @route   POST /api/auth/register
     * @access  Public
     */
    async register(req, res) {
        const { firstName, lastName, email, password } = req.body;

        try {
            // التحقق من وجود المستخدم مسبقاً
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ success: false, error: 'هذا البريد الإلكتروني مستخدم بالفعل.' });
            }

            // إنشاء المستخدم الجديد.
            user = await User.create({
                firstName,
                lastName,
                email,
                password,
                walletBalance: 0,
                role: 'user'
            });

            // إنشاء رمز JWT وإرساله
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

    /**
     * @desc    تسجيل دخول المستخدم
     * @route   POST /api/auth/login
     * @access  Public
     */
    async login(req, res) {
        const { email, password } = req.body;

        // التحقق من وجود البريد وكلمة المرور
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.' });
        }

        try {
            // البحث عن المستخدم وتضمين حقل كلمة المرور
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                return res.status(401).json({ success: false, error: 'بيانات الاعتماد غير صحيحة.' });
            }

            // مقارنة كلمة المرور
            const isMatch = await user.matchPassword(password);

            if (!isMatch) {
                return res.status(401).json({ success: false, error: 'بيانات الاعتماد غير صحيحة.' });
            }

            // تحديث سجل آخر دخول
            user.lastLogin = Date.now();
            await user.save();
            
            // إنشاء رمز JWT وإرساله
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
}

module.exports = new UserController();
EOL
echo "✅ تم إنشاء app/Controllers/Api/UserController.js"


# 2. إنشاء ملف routes/api.js
echo "إنشاء routes/api.js..."
cat > routes/api.js << EOL
// routes/api.js - تعريف مسارات الـ API (للمستخدمين العاديين والمزايدة)

const express = require('express');
const router = express.Router();

// استدعاء المتحكمات
const UserController = require('./../app/Controllers/Api/UserController');
// const AuctionController = require('./../app/Controllers/Api/AuctionController'); 

// 1. مسارات المصادقة (Auth Routes)
// (نستخدم مسار أساسي /auth لتنظيم المسارات المتعلقة بتسجيل الدخول/التسجيل)
router.post('/auth/register', UserController.register);
router.post('/auth/login', UserController.login);


// 2. مسارات المزادات (يتطلب مصادقة JWT)
/*
router.get('/auction/live', protect, AuctionController.getLiveAuctions);
router.post('/auction/:id/bid', protect, AuctionController.placeBid);
*/


module.exports = router;
EOL
echo "✅ تم إنشاء routes/api.js"

echo "انتهت المرحلة الثانية: إعداد المصادقة الأساسية."
