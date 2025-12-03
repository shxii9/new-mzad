# استخدام Node.js 18 كصورة أساسية
FROM node:18-alpine AS builder

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملفات package
COPY package*.json ./

# تثبيت التبعيات
RUN npm ci

# نسخ باقي الملفات
COPY . .

# بناء التطبيق
RUN npm run build

# مرحلة الإنتاج - استخدام nginx
FROM nginx:alpine

# نسخ الملفات المبنية إلى nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# نسخ إعدادات nginx المخصصة
COPY nginx.conf /etc/nginx/conf.d/default.conf

# كشف المنفذ
EXPOSE 80

# تشغيل nginx
CMD ["nginx", "-g", "daemon off;"]
