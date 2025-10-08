// middleware/errorMiddleware.js

// 1. معالج خطأ "لم يتم العثور على المسار" (404 Not Found)
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// 2. معالج الأخطاء العامة
const errorHandler = (err, req, res, next) => {
    // تحديد كود الحالة (Status Code) للاستجابة
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; 
    res.status(statusCode);
    
    // إرسال استجابة الخطأ بتنسيق JSON
    res.json({
        message: err.message,
        // عرض تتبع الخطأ (Stack Trace) فقط في بيئة التطوير (Development)
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    notFound,
    errorHandler,
};
