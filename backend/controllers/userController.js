// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// وظيفة مساعدة لإنشاء رمز JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    تسجيل مستخدم جديد
// @route   POST /api/users
// @access  Public
exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    // 1. التحقق من وجود جميع الحقول المطلوبة
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'الرجاء إدخال جميع الحقول المطلوبة.' });
    }

    // 2. التحقق مما إذا كان المستخدم موجودًا بالفعل
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل.' });
    }

    try {
        // 3. إنشاء المستخدم (كلمة المرور سيتم تشفيرها عبر middleware في نموذج User)
        const user = await User.create({
            name,
            email,
            password,
            // تحديد الدور الافتراضي كـ 'user' ما لم يتم تمريره كـ 'admin' (للتسجيل الأولي للمدير)
            role: role === 'admin' ? 'admin' : 'user', 
        });

        if (user) {
            // 4. إرسال الاستجابة الناجحة
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400).json({ message: 'بيانات مستخدم غير صالحة.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ في الخادم أثناء التسجيل.' });
    }
};

// @desc    تسجيل دخول المستخدم / الحصول على التوكن
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    // 1. التحقق من وجود المستخدم
    const user = await User.findOne({ email }).select('+password'); // استرجاع كلمة المرور

    if (user && (await bcrypt.compare(password, user.password))) {
        // 2. نجاح تسجيل الدخول - إرسال التوكن
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } else {
        // 3. فشل تسجيل الدخول
        res.status(401).json({ message: 'بيانات اعتماد غير صالحة (بريد إلكتروني أو كلمة مرور خاطئة).' });
    }
};

// @desc    الحصول على بيانات المستخدم الحالي
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
    // req.user يأتي من وسيط الحماية (authMiddleware)
    res.status(200).json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
    });
};
