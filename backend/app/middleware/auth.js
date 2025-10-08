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
            return res.status(403).json({ success: false, error: `غير مصرح: لا تملك صلاحية الوصول (${req.user.role}).` });
        }
        next();
    };
};
