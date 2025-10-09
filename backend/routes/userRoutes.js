const express = require('express');
const router = express.Router();
const { body } = require('express-validator'); // 1. استيراد body للتحقق

// استيراد الدوال من الكونترولر والـ Middleware
const { registerUser, loginUser, getMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware'); // 2. استيراد معالج أخطاء التحقق

// 3. تعريف قواعد التحقق
const registerValidationRules = [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 })
];

const loginValidationRules = [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
];


// --- المسارات (Routes) ---

// @route   POST /api/users/register (تم تغيير المسار من '/' إلى '/register')
// @desc    تسجيل مستخدم جديد (Public)
// 4. تطبيق قواعد التحقق على مسار التسجيل
router.post('/register', registerValidationRules, handleValidationErrors, registerUser);

// @route   POST /api/users/login
// @desc    تسجيل دخول مستخدم (Public)
// 5. تطبيق قواعد التحقق على مسار تسجيل الدخول
router.post('/login', loginValidationRules, handleValidationErrors, loginUser);

// @route   GET /api/users/me
// @desc    الحصول على بيانات المستخدم (Protected)
router.get('/me', protect, getMe);


module.exports = router;
