// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// هذا هيكل حماية وهمي مؤقت لتجنب خطأ الاستيراد
exports.protect = (req, res, next) => {
    // ملاحظة: المنطق الكامل للحماية سيتم بناؤه هنا
    // حاليًا، نمرر الطلب مباشرة لتجنب الانهيار
    
    // في بيئة تطوير حقيقية: يجب التحقق من التوكن هنا
    
    // تجاوز مؤقت:
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // نفترض أن التوكن صالح مؤقتًا لإكمال الـ flow
        // في مشروعنا الحقيقي، سنقوم بفك تشفير التوكن هنا
        req.user = { id: 'tempUserId', role: 'admin' }; // بيانات مستخدم وهمية
    }

    next();
};

// هيكل وسيط لاختبار دور المدير
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'غير مصرح لك - تحتاج لدور المدير.' });
    }
};
