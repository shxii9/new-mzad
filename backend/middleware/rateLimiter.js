// middleware/rateLimiter.js - حماية من الهجمات عبر تحديد معدل الطلبات

const rateLimit = {};

// تحديد معدل الطلبات لكل IP
const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!rateLimit[ip]) {
            rateLimit[ip] = {
                count: 1,
                resetTime: now + windowMs
            };
            return next();
        }
        
        if (now > rateLimit[ip].resetTime) {
            rateLimit[ip] = {
                count: 1,
                resetTime: now + windowMs
            };
            return next();
        }
        
        if (rateLimit[ip].count >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقًا.'
            });
        }
        
        rateLimit[ip].count++;
        next();
    };
};

module.exports = rateLimiter;
