// routes/categoryRoutes.js
const express = require('express');
const { 
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

const { protect, authorize } = require('../middleware/auth'); 

const router = express.Router();

router.route('/')
    .get(getCategories) // الجميع يمكنه رؤية الفئات
    .post(protect, authorize('admin'), createCategory); // فقط المدير يمكنه الإنشاء

router.route('/:id')
    .get(getCategory) // الجميع يمكنه رؤية فئة معينة
    .put(protect, authorize('admin'), updateCategory) // فقط المدير يمكنه التحديث
    .delete(protect, authorize('admin'), deleteCategory); // فقط المدير يمكنه الحذف

module.exports = router;
