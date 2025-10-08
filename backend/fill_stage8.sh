#!/bin/bash

echo "بدء ملء ملفات المرحلة الثامنة: تجهيز البيئة والبدء..."

# 1. تحديث ملف package.json (لإضافة سكريبت seed)
echo "تحديث package.json لإضافة سكريبت seed..."
# سنستخدم sed لتعديل package.json
# سنقوم بالاستبدال مباشرة للحصول على محتوى سليم

cat > package.json << EOL
{
  "name": "auction-backend",
  "version": "1.0.0",
  "description": "Backend for Live Online Auction Platform using Node.js, Express, Socket.IO, and MongoDB.",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seeder.js"
  },
  "keywords": [
    "auction",
    "realtime",
    "socketio",
    "express"
  ],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.3.3",
    "socket.io": "^4.7.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
EOL
echo "✅ تم تحديث package.json."


# 2. إنشاء ملف seeder.js
echo "إنشاء seeder.js..."
cat > seeder.js << EOL
// seeder.js - لملء قاعدة البيانات بالبيانات الأولية (مثل مستخدمي المدير)

const dotenv = require('dotenv');
const database = require('./config/database');
const User = require('./app/Models/User/User');

// قم بتحميل متغيرات البيئة قبل كل شيء
dotenv.config();

// الاتصال بقاعدة البيانات
database.connect();

const adminUser = {
    firstName: "System",
    lastName: "Admin",
    email: "admin@auction.com",
    // كلمة المرور هي 'password123' وسيتم تشفيرها تلقائياً عند الحفظ
    password: "password123", 
    role: "admin",
    isVerified: true,
    walletBalance: 1000 
};

/**
 * وظيفة ملء قاعدة البيانات
 */
const importData = async () => {
    try {
        await User.deleteMany({ role: 'admin' }); // حذف المدراء السابقين لمنع التكرار
        await User.create(adminUser);

        console.log('✅ تم إنشاء مستخدم المدير بنجاح.');
        console.log(\`   البريد الإلكتروني: \${adminUser.email}\`);
        console.log(\`   كلمة المرور الافتراضية: password123\`);

        process.exit();
    } catch (err) {
        console.error('❌ خطأ في عملية ملء البيانات:', err);
        process.exit(1);
    }
};

/**
 * وظيفة حذف جميع البيانات (لأغراض الاختبار)
 */
const destroyData = async () => {
    try {
        await User.deleteMany();
        console.log('🗑️ تم حذف جميع المستخدمين بنجاح.');
        process.exit();
    } catch (err) {
        console.error('❌ خطأ في عملية حذف البيانات:', err);
        process.exit(1);
    }
};

// تشغيل الوظيفة المطلوبة بناءً على وسيط سطر الأوامر
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
EOL
echo "✅ تم إنشاء seeder.js."

# 3. إنشاء ملف README.md
echo "إنشاء README.md..."
cat > README.md << EOL
# Auction Live Backend (Node.js/Express/Socket.IO)

هذا هو مشروع الواجهة الخلفية لمنصة المزادات المباشرة.

## التكنولوجيا المستخدمة

* **اللغة/البيئة:** Node.js
* **إطار العمل:** Express.js
* **قاعدة البيانات:** MongoDB (عبر Mongoose)
* **الوقت الفعلي:** Socket.IO
* **الأمان:** JWT Authentication, bcryptjs

## 🚀 دليل التشغيل والبدء

### 1. الإعداد الأولي

1.  **استنساخ المشروع:**
    \`\`\`bash
    git clone [Your-Repo-Link]
    cd auction-project/backend
    \`\`\`
2.  **تثبيت التبعيات:**
    \`\`\`bash
    npm install
    \`\`\`

### 2. إعداد متغيرات البيئة (\`.env\`)

أنشئ ملف \`.env\` في جذر المجلد \`backend/\` واملأه بالمتغيرات التالية:

\`\`\`env
# الإعدادات الأساسية
NODE_ENV=development
PORT=3000

# إعدادات قاعدة البيانات
MONGO_URI=mongodb://localhost:27017/auctionDB

# إعدادات المصادقة
JWT_SECRET=YOUR_VERY_STRONG_SECRET_KEY_HERE
FRONTEND_URL=http://localhost:5173

# إعدادات الدفع (Stripe/Mock)
PAYMENT_SECRET_KEY=sk_test_...
PAYMENT_PUBLIC_KEY=pk_test_...
\`\`\`

### 3. تشغيل أوامر البيانات الأولية (Seeding)

يجب إنشاء مستخدم المدير (Admin) لتبدأ.

\`\`\`bash
npm run seed
\`\`\`
> **ملاحظة:** سيتم إنشاء مستخدم بـ: \`admin@auction.com\` وكلمة مرور: \`password123\`.

### 4. تشغيل الخادم

**وضع التطوير (Development):**
\`\`\`bash
npm run dev
\`\`\`
**وضع الإنتاج (Production):**
\`\`\`bash
npm start
\`\`\`

## 🔐 مسارات API الرئيسية

| الوصف | المسار | الأمان |
| :--- | :--- | :--- |
| تسجيل المستخدم | \`POST /api/auth/register\` | عام (Public) |
| تسجيل الدخول | \`POST /api/auth/login\` | عام (Public) |
| إنشاء منتج | \`POST /api/auction/products\` | خاص (Seller/Admin) |
| جلب المزادات | \`GET /api/auction/live\` | عام (Public) |
| وضع مزايدة | \`POST /api/auction/:id/bid\` | خاص (Protected) |
| إحصائيات المدير | \`GET /admin/dashboard/stats\` | خاص (Admin) |
EOL
echo "✅ تم إنشاء README.md."

echo "انتهت المرحلة الثامنة والأخيرة: تجهيز البيئة والبدء. الواجهة الخلفية مكتملة الآن."
