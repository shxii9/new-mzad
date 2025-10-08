// controllers/categoryController.js
const Category = require('../app/Models/Category');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    الحصول على جميع الفئات
// @route   GET /api/categories
// @access  عام (Public)
exports.getCategories = asyncHandler(async (req, res, next) => {
    const categories = await Category.find();
    res.status(200).json({ success: true, count: categories.length, data: categories });
});

// @desc    الحصول على فئة واحدة
// @route   GET /api/categories/:id
// @access  عام (Public)
exports.getCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(
            new ErrorResponse(`لم يتم العثور على فئة بالمعرف ${req.params.id}`, 404)
        );
    }

    res.status(200).json({ success: true, data: category });
});

// @desc    إنشاء فئة جديدة
// @route   POST /api/categories
// @access  خاص/مدير (Private/Admin)
exports.createCategory = asyncHandler(async (req, res, next) => {
    // التحقق من دور المستخدم (يفترض أن middleware/auth.js يفعل ذلك)
    if (req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`المستخدم ${req.user.id} غير مصرح له بإنشاء فئة`, 403)
        );
    }
    
    const category = await Category.create(req.body);

    res.status(201).json({ success: true, data: category });
});

// @desc    تحديث فئة
// @route   PUT /api/categories/:id
// @access  خاص/مدير (Private/Admin)
exports.updateCategory = asyncHandler(async (req, res, next) => {
    let category = await Category.findById(req.params.id);

    if (!category) {
        return next(
            new ErrorResponse(`لم يتم العثور على فئة بالمعرف ${req.params.id}`, 404)
        );
    }

    // التأكد من دور المستخدم
    if (req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`المستخدم ${req.user.id} غير مصرح له بتحديث فئة`, 403)
        );
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: category });
});

// @desc    حذف فئة
// @route   DELETE /api/categories/:id
// @access  خاص/مدير (Private/Admin)
exports.deleteCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(
            new ErrorResponse(`لم يتم العثور على فئة بالمعرف ${req.params.id}`, 404)
        );
    }

    // التأكد من دور المستخدم
    if (req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`المستخدم ${req.user.id} غير مصرح له بحذف فئة`, 403)
        );
    }

    await category.deleteOne();

    res.status(200).json({ success: true, data: {} });
});
