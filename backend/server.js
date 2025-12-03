const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const socketHandler = require('./socketHandler');
const rateLimiter = require('./middleware/rateLimiter');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// إعداد Socket.IO مع CORS
const io = socketIO(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// تمرير io إلى التطبيق ليكون متاحًا في المتحكمات
app.set('io', io);

// إعداد Socket.IO
socketHandler(io);

// Middleware
app.use(cors({ 
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting
app.use(rateLimiter(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// Routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'Server is running',
        timestamp: new Date()
    });
});

const PORT = process.env.PORT || 5002;
server.listen(
    PORT,
    () => console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
