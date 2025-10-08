// routes/api.js - تعريف مسارات الـ API (للمستخدمين العاديين والمزايدة)

const express = require('express');
const router = express.Router();

// استدعاء المتحكمات والـ Middleware
const UserController = require('./../app/Controllers/Api/UserController');
const AuctionController = require('./../app/Controllers/Api/AuctionController'); 
const { protect, authorize } = require('../app/middleware/auth'); 

// 1. مسارات المصادقة (Auth Routes)
router.post('/auth/register', UserController.register);
router.post('/auth/login', UserController.login);
router.get('/user/me', protect, UserController.getMe);


// 2. مسارات المزادات والمنتجات
// @route   POST /api/auction/products
// @desc    إنشاء منتج جديد (يتطلب صلاحية بائع)
// @access  Private (Seller/Admin)
router.post('/auction/products', protect, authorize('seller', 'admin'), AuctionController.createProduct);

// @route   GET /api/auction/live
// @desc    جلب المزادات الحية
// @access  Public
router.get('/auction/live', AuctionController.getLiveAuctions);

// @route   POST /api/auction/:id/bid
// @desc    وضع عرض مزايدة جديد (Real-Time)
// @access  Private (User/Seller/Admin)
router.post('/auction/:id/bid', protect, AuctionController.placeBid);


module.exports = router;
