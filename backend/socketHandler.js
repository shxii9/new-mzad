// socketHandler.js - إدارة اتصالات Socket.IO للتحديثات الفورية

const Auction = require('./models/Auction');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`✅ مستخدم متصل: ${socket.id}`);

        // الانضمام إلى غرفة مزاد معين
        socket.on('join-auction', (auctionId) => {
            socket.join(`auction-${auctionId}`);
            console.log(`🔔 المستخدم ${socket.id} انضم إلى المزاد: ${auctionId}`);
        });

        // مغادرة غرفة المزاد
        socket.on('leave-auction', (auctionId) => {
            socket.leave(`auction-${auctionId}`);
            console.log(`👋 المستخدم ${socket.id} غادر المزاد: ${auctionId}`);
        });

        // عند وضع مزايدة جديدة
        socket.on('new-bid', async (data) => {
            const { auctionId, userId, amount, userName } = data;
            
            try {
                // إرسال التحديث لجميع المستخدمين في غرفة المزاد
                io.to(`auction-${auctionId}`).emit('bid-update', {
                    auctionId,
                    currentPrice: amount,
                    lastBidder: userName,
                    timestamp: new Date()
                });
            } catch (error) {
                console.error('خطأ في معالجة المزايدة:', error);
            }
        });

        // عند إغلاق المزاد
        socket.on('auction-closed', (data) => {
            const { auctionId, winner } = data;
            io.to(`auction-${auctionId}`).emit('auction-ended', {
                auctionId,
                winner,
                message: 'تم إغلاق المزاد'
            });
        });

        // عند قطع الاتصال
        socket.on('disconnect', () => {
            console.log(`❌ مستخدم قطع الاتصال: ${socket.id}`);
        });
    });
};
