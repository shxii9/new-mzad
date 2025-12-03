const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user.id })
        .populate('auction', 'title image')
        .sort({ createdAt: -1 })
        .limit(50);

    const unreadCount = await Notification.countDocuments({ 
        user: req.user.id, 
        isRead: false 
    });

    res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        data: notifications
    });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('الإشعار غير موجود');
    }

    if (notification.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('غير مصرح لك بالوصول لهذا الإشعار');
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
        success: true,
        data: notification
    });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user.id, isRead: false },
        { isRead: true }
    );

    res.status(200).json({
        success: true,
        message: 'تم تحديد جميع الإشعارات كمقروءة'
    });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('الإشعار غير موجود');
    }

    if (notification.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('غير مصرح لك بحذف هذا الإشعار');
    }

    await notification.deleteOne();

    res.status(200).json({
        success: true,
        message: 'تم حذف الإشعار بنجاح'
    });
});

// Helper function to create notification
exports.createNotification = async (userId, type, title, message, auctionId = null) => {
    try {
        await Notification.create({
            user: userId,
            type,
            title,
            message,
            auction: auctionId
        });
    } catch (error) {
        console.error('خطأ في إنشاء الإشعار:', error);
    }
};
