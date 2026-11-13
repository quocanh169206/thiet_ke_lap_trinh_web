const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

// 1. LẤY TẤT CẢ ĐÁNH GIÁ CỦA 1 TÀI LIỆU (Public)
router.get('/document/:document_id', async (req, res) => {
    const { document_id } = req.params;

    try {
        const [reviews] = await db.query(
            `SELECT r.*, u.full_name AS reviewer_name
             FROM Reviews r
             JOIN Users u ON r.user_id = u.user_id
             WHERE r.document_id = ?
             ORDER BY r.created_at DESC`,
            [document_id]
        );

        // Tính điểm trung bình đánh giá
        const [avgResult] = await db.query(
            `SELECT AVG(rating) AS average_rating, COUNT(*) AS total_reviews 
             FROM Reviews WHERE document_id = ?`,
            [document_id]
        );

        res.json({
            success: true,
            average_rating: parseFloat(avgResult[0].average_rating || 0).toFixed(1),
            total_reviews: avgResult[0].total_reviews,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. GỬI ĐÁNH GIÁ MỚI (Yêu cầu đăng nhập - verifyToken)
router.post('/', verifyToken, async (req, res) => {
    const { document_id, rating, comment } = req.body;
    const user_id = req.user.user_id;

    if (!document_id || !rating) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn số sao đánh giá!' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Số sao đánh giá phải từ 1 đến 5!' });
    }

    try {
        await db.query(
            `INSERT INTO Reviews (document_id, user_id, rating, comment)
             VALUES (?, ?, ?, ?)`,
            [document_id, user_id, rating, comment || '']
        );

        res.status(201).json({ success: true, message: 'Gửi đánh giá thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;