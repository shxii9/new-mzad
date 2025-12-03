const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// دالة مساعدة لإرسال التوكن في الـ Response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                email: user.email,
                role: user.role
            }
        });
};


// @desc    تسجيل المستخدم (Admin)
// @route   POST /api/auth/register
// @access  عام (لأول مرة)
exports.register = asyncHandler(async (req, res, next) => {
    // هذه الوظيفة يمكن استخدامها لإنشاء مدير (Admin) افتراضي لأول مرة
    const { firstName, lastName, email, password } = req.body;

    // افتراض أن أول مستخدم يتم تسجيله هو المدير
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role 
    });

    sendTokenResponse(user, 200, res);
});


// @desc    تسجيل الدخول
// @route   POST /api/auth/login
// @access  عام
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // التحقق من وجود البريد وكلمة المرور
    if (!email || !password) {
        return next(new ErrorResponse('الرجاء توفير بريد إلكتروني وكلمة مرور', 400));
    }

    // التحقق من المستخدم في قاعدة البيانات
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('بيانات اعتماد غير صالحة', 401));
    }

    // مطابقة كلمة المرور
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('بيانات اعتماد غير صالحة', 401));
    }

    sendTokenResponse(user, 200, res);
});


// @desc    الحصول على المستخدم الحالي (Fetch Current User)
// @route   GET /api/auth/me
// @access  خاص (Private)
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    
    if (!user) {
        return next(new ErrorResponse('المستخدم غير موجود', 404));
    }
    
    res.status(200).json({
        success: true,
        data: {
            id: user._id,
            firstName: user.firstName,
            email: user.email,
            role: user.role
        }
    });
});
