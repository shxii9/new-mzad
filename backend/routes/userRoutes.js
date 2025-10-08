// routes/userRoutes.js
const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// مسار التسجيل (Public)
router.post('/', registerUser); 

// مسار تسجيل الدخول (Public)
router.post('/login', loginUser); 

// مسار جلب بياناتي (Protected)
router.get('/me', protect, getMe);

module.exports = router;
