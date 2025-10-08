// config/security.js - إعدادات الأمان وقيم JWT

const securityConfig = {
    // المفتاح السري لتشفير وفك تشفير رموز JWT (يتم تحميله من .env)
    JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret', 
    
    // مدة صلاحية رمز JWT (مثال: 30 يوم)
    JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',

    // مدة صلاحية الكوكي (يجب أن تكون بالأيام)
    JWT_COOKIE_EXPIRE: 30
};

module.exports = { securityConfig };
