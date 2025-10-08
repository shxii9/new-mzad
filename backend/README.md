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
    ```bash
    git clone [Your-Repo-Link]
    cd auction-project/backend
    ```
2.  **تثبيت التبعيات:**
    ```bash
    npm install
    ```

### 2. إعداد متغيرات البيئة (`.env`)

أنشئ ملف `.env` في جذر المجلد `backend/` واملأه بالمتغيرات التالية:

```env
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
```

### 3. تشغيل أوامر البيانات الأولية (Seeding)

يجب إنشاء مستخدم المدير (Admin) لتبدأ.

```bash
npm run seed
```
> **ملاحظة:** سيتم إنشاء مستخدم بـ: `admin@auction.com` وكلمة مرور: `password123`.

### 4. تشغيل الخادم

**وضع التطوير (Development):**
```bash
npm run dev
```
**وضع الإنتاج (Production):**
```bash
npm start
```

## 🔐 مسارات API الرئيسية

| الوصف | المسار | الأمان |
| :--- | :--- | :--- |
| تسجيل المستخدم | `POST /api/auth/register` | عام (Public) |
| تسجيل الدخول | `POST /api/auth/login` | عام (Public) |
| إنشاء منتج | `POST /api/auction/products` | خاص (Seller/Admin) |
| جلب المزادات | `GET /api/auction/live` | عام (Public) |
| وضع مزايدة | `POST /api/auction/:id/bid` | خاص (Protected) |
| إحصائيات المدير | `GET /admin/dashboard/stats` | خاص (Admin) |
