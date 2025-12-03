# استخدام Node.js 18 كصورة أساسية
FROM node:18-alpine

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملفات package
COPY package*.json ./

# تثبيت التبعيات
RUN npm ci --only=production

# نسخ باقي الملفات
COPY . .

# كشف المنفذ
EXPOSE 5002

# تشغيل التطبيق
CMD ["node", "server.js"]
