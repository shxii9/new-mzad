// app/Controllers/Api/UserController.js - معالجة تسجيل المستخدم والمصادقة

const User = require('../../Models/User/User');
const { securityConfig } = require('../../../config/security'); 

class UserController {
    // ... (دالة register موجودة مسبقاً) ...
    async register(req, res) {
        const { firstName, lastName, email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ success: false, error: 'هذا البريد الإلكتروني مستخدم بالفعل.' });
            }

            user = await User.create({
                firstName,
                lastName,
                email,
                password,
                walletBalance: 0,
                role: 'user'
            });

            const token = user.getSignedJwtToken();

            res.status(201).json({ 
                success: true, 
                token, 
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'خطأ في الخادم أثناء التسجيل.' });
        }
    }
    
    // ... (دالة login موجودة مسبقاً) ...
    async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.' });
        }

        try {
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                return res.status(401).json({ success: false, error: 'بيانات الاعتماد غير صحيحة.' });
            }

            const isMatch = await user.matchPassword(password);

            if (!isMatch) {
                return res.status(401).json({ success: false, error: 'بيانات الاعتماد غير صحيحة.' });
            }

            user.lastLogin = Date.now();
            await user.save();
            
            const token = user.getSignedJwtToken();

            res.status(200).json({ 
                success: true, 
                token, 
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'خطأ في الخادم أثناء تسجيل الدخول.' });
        }
    }


    /**
     * @desc    الحصول على بيانات المستخدم المصادق عليه
     * @route   GET /api/user/me
     * @access  Private
     */
    async getMe(req, res) {
        // يتم وضع كائن المستخدم (req.user) بواسطة دالة الحماية (protect middleware)
        res.status(200).json({
            success: true,
            user: req.user
        });
    }
}

module.exports = new UserController();
