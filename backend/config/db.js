// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // استخدام الخيارات الموصى بها في الإصدارات الحديثة من Mongoose
            // هذه الخيارات غالبًا ما تكون افتراضية الآن، لكن يتم تضمينها للوضوح
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
