const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();

// Nạp các Router
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents'); // <-- Mới thêm
const reviewRoutes = require('./routes/reviews');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. Đăng ký các Route API Nghiệp vụ
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes); // <-- Mới thêm
app.use('/api/reviews', reviewRoutes);

// 2. API Test trạng thái Server
app.get('/', (req, res) => {
    res.send('🚀 Backend Hệ thống Quản lý tài liệu UED đang hoạt động!');
});

// 3. API Lấy danh sách Môn học từ MySQL
app.get('/api/subjects', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Subjects');
        res.json({ success: true, total: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. API Lấy danh sách Loại tài liệu từ MySQL
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM DocumentCategories');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Khởi tạo Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Server Backend đang chạy tại: http://localhost:${PORT}`);
    console.log(`====================================================`);
});