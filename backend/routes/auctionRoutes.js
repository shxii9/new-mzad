// routes/auctionRoutes.js
const express = require('express');
const { createAuction, getAuctions, getAuctionById, placeBid } = require('../controllers/auctionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(getAuctions).post(protect, createAuction);
router.route('/:id').get(getAuctionById);
router.route('/:id/bid').post(protect, placeBid);

module.exports = router;
