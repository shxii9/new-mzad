// config/payments.js - إعدادات بوابة الدفع (مثال: Stripe)

const paymentsConfig = {
    // مفتاح سري لبوابة الدفع (يجب تحميله من .env)
    SECRET_KEY: process.env.PAYMENT_SECRET_KEY || 'sk_test_fallback_not_secure',

    // مفتاح عام (للاستخدام في الواجهة الأمامية)
    PUBLIC_KEY: process.env.PAYMENT_PUBLIC_KEY || 'pk_test_fallback',
    
    // عملة الدفع الافتراضية
    CURRENCY: 'USD',

    // عنوان URL لإعادة التوجيه بعد الدفع الناجح
    SUCCESS_URL: process.env.FRONTEND_URL + '/payment/success',

    // عنوان URL لإعادة التوجيه بعد فشل الدفع
    CANCEL_URL: process.env.FRONTEND_URL + '/payment/cancel',
    
    // نسبة العمولة التي تأخذها المنصة من قيمة المزاد الفائز (مثال: 5%)
    PLATFORM_COMMISSION_RATE: 0.05 
};

module.exports = { paymentsConfig };
