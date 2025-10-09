const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// استيراد دوال التحكم والـ Middleware
const {
    createAuction,
    getAuctions,
    getAuctionById,
    placeBid,
    getUserAuctions,
    closeAuction
} = require('../controllers/auctionController');
const { protect } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware'); // 1. استيراد middleware الرفع

// تعريف قواعد التحقق
const createAuctionValidationRules = [
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
    body('startingPrice', 'Starting price must be a positive number').isFloat({ gt: 0 }),
    body('deadline', 'Please provide a valid end date').isISO8601().toDate()
];

const placeBidValidationRules = [
    body('amount', 'Bid amount must be a valid number').isFloat({ gt: 0 })
];

// --- المسارات (Routes) ---

// جلب كل المزادات وإنشاء مزاد جديد
router.route('/')
    .get(getAuctions)
    .post(
        protect,
        upload.single('image'), // 2. إضافة middleware معالجة الصورة هنا
        createAuctionValidationRules,
        handleValidationErrors,
        createAuction
    );

// جلب مزادات المستخدم الحالي
router.route('/my-auctions')
    .get(protect, getUserAuctions);

// جلب مزاد معين حسب الـ ID
router.route('/:id')
    .get(getAuctionById);

// المزايدة على مزاد
router.route('/:id/bid')
    .post(protect, placeBidValidationRules, handleValidationErrors, placeBid);

// إغلاق المزاد
router.route('/:id/close')
    .put(protect, closeAuction);

module.exports = router;
