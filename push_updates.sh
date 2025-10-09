#!/bin/bash

# --- إعدادات الألوان ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}==   سكربت رفع التحديثات الشامل إلى GitHub   ==${NC}"
echo -e "${BLUE}=====================================================${NC}"

# --- المرحلة 1: التنظيف (إزالة الملفات غير الضرورية) ---
echo -e "\n${YELLOW}--- المرحلة 1: تنظيف المشروع... ---${NC}"
# البحث عن مجلدات node_modules وحذفها (سيتم إعادة تثبيتها لاحقًا)
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
# البحث عن ملفات .DS_Store وحذفها (خاصة بنظام macOS)
find . -name ".DS_Store" -type f -delete
echo -e "${GREEN}>> تم حذف مجلدات node_modules والملفات غير الضرورية.${NC}"

# --- المرحلة 2: إنشاء ملف .gitignore قوي ---
echo -e "\n${YELLOW}--- المرحلة 2: التأكد من وجود ملف .gitignore قوي... ---${NC}"
# إنشاء ملف .gitignore شامل إذا لم يكن موجودًا أو استبداله
cat << 'EOF' > .gitignore
# التبعيات
/node_modules
/frontend/node_modules
/backend/node_modules

# ملفات البيئة (مهم جدًا للأمان)
.env
/frontend/.env
/backend/.env
*.env.local
*.env.*.local

# ملفات الإنتاج (Build files)
/dist
/build
/frontend/dist
/frontend/build

# ملفات السجلات (Logs)
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# ملفات النظام
.DS_Store
Thumbs.db
EOF
echo -e "${GREEN}>> تم إنشاء/تحديث ملف .gitignore بنجاح.${NC}"

# --- المرحلة 3: إضافة التغييرات إلى Git ---
echo -e "\n${YELLOW}--- المرحلة 3: إضافة جميع التغييرات إلى Git... ---${NC}"
git add .
echo -e "${GREEN}>> تم إضافة جميع الملفات والتغييرات إلى منطقة التجهيز (Staging).${NC}"

# --- المرحلة 4: كتابة رسالة الـ Commit ---
echo -e "\n${YELLOW}--- المرحلة 4: كتابة رسالة الـ Commit... ---${NC}"
# رسالة commit واضحة تصف التحديثات الرئيسية
COMMIT_MESSAGE="feat: Major UI overhaul with Shadcn/UI and new design philosophy"
git commit -m "$COMMIT_MESSAGE"
echo -e "${GREEN}>> تم عمل Commit بنجاح مع الرسالة: '$COMMIT_MESSAGE'${NC}"

# --- المرحلة 5: رفع التحديثات إلى GitHub ---
echo -e "\n${YELLOW}--- المرحلة 5: رفع التحديثات إلى GitHub... ---${NC}"
# افتراض أن الفرع الرئيسي اسمه 'main'. إذا كان 'master'، قم بتغييره.
git push origin main
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}=====================================================${NC}"
    echo -e "${GREEN}==     تم رفع جميع التحديثات إلى GitHub بنجاح!     ==${NC}"
    echo -e "${GREEN}=====================================================${NC}"
else
    echo -e "\n\033[0;31m فشل الرفع. يرجى التحقق من اتصالك بالإنترنت وصلاحيات الوصول إلى المستودع.${NC}"
fi
