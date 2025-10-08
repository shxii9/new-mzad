// config/app.js
// هذا الملف يقوم بتوفير الثوابت العامة للمشروع من متغيرات البيئة (process.env)

const appConfig = {
    // إعدادات الخادم
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

    // إعدادات JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your-very-secret-key-123',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
};

module.exports = {
    appConfig
};
