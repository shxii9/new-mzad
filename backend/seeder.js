// seeder.js - لملء قاعدة البيانات بالبيانات الأولية (مثل مستخدمي المدير)

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path'); // لإضافة المسار المطلق

// تحميل الموديل باستخدام المسار المطلق
const User = require('./app/Models/User/User'); 

// قم بتحميل متغيرات البيئة قبل كل شيء
dotenv.config();

// الاتصال بقاعدة البيانات مباشرةً
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {});
        console.log(`MongoDB connected successfully!`);
    } catch (error) {
        console.error(`❌ خطأ في الاتصال بقاعدة البيانات: ${error.message}`);
        process.exit(1);
    }
};

const adminUser = {
    firstName: "System",
    lastName: "Admin",
    email: "shxii9rt@gmail.com", 
    password: "password123", 
    role: "admin",
    isVerified: true,
    walletBalance: 1000 
};

/**
 * وظيفة ملء قاعدة البيانات
 */
const importData = async () => {
    await connectDB(); // تأكيد الاتصال قبل البدء

    try {
        await User.deleteMany({ role: 'admin' });
        await User.create(adminUser);

        console.log('✅ تم إنشاء مستخدم المدير بنجاح.');
        console.log(`   البريد الإلكتروني: ${adminUser.email}`);
        console.log(`   كلمة المرور الافتراضية: password123`);

        process.exit();
    } catch (err) {
        console.error('❌ خطأ في عملية ملء البيانات:', err);
        process.exit(1);
    }
};

/**
 * وظيفة حذف جميع البيانات
 */
const destroyData = async () => {
    await connectDB();

    try {
        await User.deleteMany();
        console.log('🗑️ تم حذف جميع المستخدمين بنجاح.');
        process.exit();
    } catch (err) {
        console.error('❌ خطأ في عملية حذف البيانات:', err);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
