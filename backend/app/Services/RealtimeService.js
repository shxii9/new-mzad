// app/Services/RealtimeService.js - إدارة اتصالات Socket.IO (WebSockets)

let io; // متغير لتخزين كائن Socket.IO (يتم تهيئته في server.js)

class RealtimeService {
    /**
     * تهيئة RealtimeService وربطه بخادم HTTP
     * @param {object} socketIOInstance - كائن Socket.IO المُنشأ في server.js
     */
    init(socketIOInstance) {
        io = socketIOInstance;
        
        io.on('connection', (socket) => {
            console.log(`[Socket.IO] User connected: ${socket.id}`);
            
            // عند انضمام المستخدم لغرفة مزاد محددة
            socket.on('joinAuction', (auctionId) => {
                socket.join(auctionId);
                console.log(`[Socket.IO] User ${socket.id} joined room ${auctionId}`);
            });

            // عند مغادرة المستخدم لغرفة مزاد محددة
            socket.on('leaveAuction', (auctionId) => {
                socket.leave(auctionId);
                console.log(`[Socket.IO] User ${socket.id} left room ${auctionId}`);
            });
            
            // عند قطع الاتصال
            socket.on('disconnect', () => {
                console.log(`[Socket.IO] User disconnected: ${socket.id}`);
            });
        });
    }

    /**
     * إرسال تحديث المزايدة الفورية لجميع المشاركين في المزاد
     * @param {string} auctionId - ID المزاد
     * @param {object} bidData - بيانات العرض الجديد
     */
    sendNewBid(auctionId, bidData) {
        if (!io) return console.error("Socket.IO لم يتم تهيئته بعد.");
        
        // إرسال البيانات إلى غرفة المزاد المحددة فقط
        io.to(auctionId).emit('newBid', bidData);
    }
    
    /**
     * إرسال إشعار انتهاء المزاد
     * @param {string} auctionId - ID المزاد
     * @param {object} result - بيانات النتيجة النهائية
     */
    sendAuctionEnd(auctionId, result) {
        if (!io) return;
        io.to(auctionId).emit('auctionEnded', result);
    }
    
    /**
     * دالة مساعدة للحصول على كائن Socket.IO (للاستخدام الداخلي)
     */
    getIO() {
        return io;
    }
}

module.exports = new RealtimeService();
