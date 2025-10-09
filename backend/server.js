const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const auctionRoutes = require('./routes/auctionRoutes');

dotenv.config();
connectDB();
const app = express();

// تأكد من أن الواجهة الأمامية تستخدم المنفذ 5173
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auctions', auctionRoutes);

// المنفذ هو 5002 (من .env أو احتياطي)
const PORT = process.env.PORT || 5002; 
app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
