const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// 1. API ĐĂNG KÝ TÀI KHOẢN (POST /api/auth/register)
router.post('/register', async (req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
    }

    try {
        // Kiểm tra email trùng lặp
        const [existingUsers] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Email này đã được đăng ký!' });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Mặc định tài khoản mới có role_id = 1 (STUDENT)
        const defaultRoleId = 1;

        // Lưu vào CSDL chuẩn theo cột role_id
        await db.query(
            'INSERT INTO Users (full_name, email, password, role_id) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, defaultRoleId]
        );

        res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. API ĐĂNG NHẬP (POST /api/auth/login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập Email và Mật khẩu!' });
    }

    try {
        // Join bảng Users và Roles để lấy tên quyền
        const [users] = await db.query(
            `SELECT u.*, r.role_name 
             FROM Users u 
             JOIN Roles r ON u.role_id = r.role_id 
             WHERE u.email = ?`, 
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Email hoặc mật khẩu không chính xác!' });
        }

        const user = users[0];

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Email hoặc mật khẩu không chính xác!' });
        }

        // Tạo JWT Token
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role_name },
            process.env.JWT_SECRET || 'ued_secret_key_2026',
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: 'Đăng nhập thành công!',
            token: token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role_name
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// API tự động Reset Mật khẩu cho admin@ued.udn.vn về "admin123" chuẩn Bcrypt
router.get('/reset-admin-password', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const [result] = await db.query(
            'UPDATE Users SET password = ? WHERE email = ?',
            [hashedPassword, 'admin@ued.udn.vn']
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản admin@ued.udn.vn trong Database!' });
        }

        res.json({ success: true, message: 'Đã cập nhật mật khẩu admin@ued.udn.vn thành admin123 chuẩn mã hóa!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;