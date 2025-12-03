const asyncHandler = require('express-async-handler');
const Auction = require('../models/Auction');

// @desc    Create a new auction
// @route   POST /api/auctions
// @access  Private
exports.createAuction = asyncHandler(async (req, res) => {
    const { title, description, category, startingPrice, deadline } = req.body;

    // 1. التحقق من أن الصورة تم رفعها بنجاح بواسطة middleware
    if (!req.file) {
        res.status(400);
        throw new Error('صورة المنتج مطلوبة.');
    }

    const auction = await Auction.create({
        user: req.user.id,
        title,
        description,
        category,
        startingPrice,
        deadline,
        image: req.file.path, // 2. الحصول على رابط الصورة الآمن من Cloudinary
        currentPrice: startingPrice,
    });

    res.status(201).json({ success: true, data: auction });
});


// @desc    Place a bid on an auction
// @route   POST /api/auctions/:id/bid
// @access  Private
exports.placeBid = asyncHandler(async (req, res) => {
    const { amount } = req.body;

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

    const populatedAuction = await Auction.findById(auction._id).populate('bids.user', 'name');

    // إرسال تحديث فوري عبر Socket.IO
    const io = req.app.get('io');
    if (io) {
        io.to(`auction-${auction._id}`).emit('bid-update', {
            auctionId: auction._id,
            currentPrice: amount,
            lastBidder: req.user.name,
            timestamp: new Date()
        });
    }

    res.status(200).json({
        success: true,
        message: 'تم وضع المزايدة بنجاح!',
        data: populatedAuction
    });
});


// @desc    Get all active auctions with search and filter
// @route   GET /api/auctions
// @access  Public
exports.getAuctions = asyncHandler(async (req, res) => {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    
    let query = { isClosed: false };
    
    // البحث في العنوان والوصف
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    
    // فلترة حسب الفئة
    if (category) {
        query.category = category;
    }
    
    // فلترة حسب السعر
    if (minPrice || maxPrice) {
        query.currentPrice = {};
        if (minPrice) query.currentPrice.$gte = parseFloat(minPrice);
        if (maxPrice) query.currentPrice.$lte = parseFloat(maxPrice);
    }
    
    // ترتيب النتائج
    let sortOption = { createdAt: -1 }; // الافتراضي: الأحدث
    if (sort === 'price_asc') sortOption = { currentPrice: 1 };
    if (sort === 'price_desc') sortOption = { currentPrice: -1 };
    if (sort === 'ending_soon') sortOption = { deadline: 1 };
    
    const auctions = await Auction.find(query)
        .populate('user', 'name email')
        .populate('category', 'name')
        .sort(sortOption);
        
    res.status(200).json({ success: true, count: auctions.length, data: auctions });
});


// @desc    Get a single auction by ID
// @route   GET /api/auctions/:id
// @access  Public
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


// @desc    Get auctions for the logged-in user
// @route   GET /api/auctions/my-auctions
// @access  Private
exports.getUserAuctions = asyncHandler(async (req, res) => {
    const auctions = await Auction.find({ user: req.user.id })
        .populate('category', 'name')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: auctions.length,
        data: auctions
    });
});


// @desc    Close an auction (Admin only)
// @route   PUT /api/auctions/:id/close
// @access  Private/Admin
exports.closeAuction = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('غير مصرح لك بإغلاق المزادات.');
    }

    const auction = await Auction.findById(req.params.id);

    if (!auction) {
        res.status(404);
        throw new Error('المزاد غير موجود.');
    }

    if (auction.isClosed) {
        res.status(400);
        throw new Error('المزاد مغلق بالفعل.');
    }
    
    if (new Date(auction.deadline) > new Date()) {
        res.status(400);
        throw new Error('لا يمكن إغلاق المزاد قبل انتهاء موعده النهائي.');
    }

    if (auction.bids.length > 0) {
        const winningBid = auction.bids[auction.bids.length - 1];
        auction.winner = winningBid.user;
    } else {
        auction.winner = null;
    }

    auction.isClosed = true;
    await auction.save();

    res.status(200).json({
        success: true,
        message: 'تم إغلاق المزاد بنجاح.',
        data: auction
    });
});
