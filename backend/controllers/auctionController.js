// controllers/auctionController.js
const asyncHandler = require('express-async-handler');
const Auction = require('../models/Auction');

exports.createAuction = asyncHandler(async (req, res) => {
    const { title, description, category, startingPrice, deadline, image } = req.body;
    if (!title || !description || !category || !startingPrice || !deadline) {
        res.status(400);
        throw new Error('الرجاء إدخال جميع الحقول المطلوبة للمزاد.');
    }
    const auction = await Auction.create({
        user: req.user.id,
        title, description, category, startingPrice, deadline, image,
        currentPrice: startingPrice, 
    });
    res.status(201).json({ success: true, data: auction });
});

exports.getAuctions = asyncHandler(async (req, res) => {
    const auctions = await Auction.find({ isClosed: false })
        .populate('user', 'name email')
        .populate('category', 'name')
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: auctions.length, data: auctions });
});

exports.getAuctionById = asyncHandler(async (req, res) => {
    const auction = await Auction.findById(req.params.id)
        .populate('user', 'name email')
        .populate('category', 'name')
        .populate('bids.user', 'name');
    if (!auction) {
        res.status(404);
        throw new Error('المزاد غير موجود');
    }
    res.status(200).json({ success: true, data: auction });
});

exports.placeBid = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        res.status(400);
        throw new Error('الرجاء إدخال مبلغ مزايدة صالح');
    }
    const auction = await Auction.findById(req.params.id);
    if (!auction || auction.isClosed || new Date(auction.deadline) < new Date()) {
        res.status(400);
        throw new Error('المزاد مغلق أو غير موجود.');
    }
    if (amount <= auction.currentPrice) {
        res.status(400);
        throw new Error(`يجب أن يكون مبلغ المزايدة أكبر من السعر الحالي: ${auction.currentPrice}`);
    }
    
    if (auction.user.toString() === req.user.id.toString()) {
        res.status(400);
        throw new Error('لا يمكن المزايدة على مزادك الخاص.');
    }

    auction.bids.push({ user: req.user.id, amount });
    auction.currentPrice = amount;
    await auction.save();

    res.status(200).json({ 
        success: true, 
        message: 'تم وضع المزايدة بنجاح!',
        data: auction 
    });
});
