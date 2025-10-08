const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../app/Models/User');
const { appConfig } = require('../config/app');

// حماية المسارات (التحقق من التوكن)
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // تعيين التوكن من الهيدر (Bearer Token)
        token = req.headers.authorization.split(' ')[1];
    } 
    // يمكنك أيضاً التحقق من الكوكيز إذا كنت تستخدمها
    // else if (req.cookies.token) {
    //    token = req.cookies.token;
    // }

    // التأكد من وجود التوكن
    if (!token) {
        return next(new ErrorResponse('غير مصرح لك بالوصول لهذا المسار', 401));
    }

    try {
        // التحقق من التوكن
        const decoded = jwt.verify(token, appConfig.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
             return next(new ErrorResponse('المستخدم غير موجود', 401));
        }

        next();
    } catch (err) {
        return next(new ErrorResponse('التوكن غير صالح', 401));
    }
});

// منح الوصول لأدوار محددة
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `دور المستخدم (${req.user.role}) غير مصرح له بالوصول`,
                    403
                )
            );
        }
        next();
    };
};
