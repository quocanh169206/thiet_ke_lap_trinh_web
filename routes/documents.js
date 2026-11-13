const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

// 1. LẤY DANH SÁCH TÀI LIỆU (Có hỗ trợ lọc theo subject_id, category_id, search)
router.get('/', async (req, res) => {
    const { subject_id, category_id, search } = req.query;

    let query = `
        SELECT d.*, s.subject_name, c.category_name, u.full_name AS uploader_name
        FROM Documents d
        JOIN Subjects s ON d.subject_id = s.subject_id
        JOIN DocumentCategories c ON d.category_id = c.category_id
        JOIN Users u ON d.uploaded_by = u.user_id
        WHERE d.status = 'APPROVED'
    `;
    const params = [];

    if (subject_id) {
        query += ' AND d.subject_id = ?';
        params.push(subject_id);
    }
    if (category_id) {
        query += ' AND d.category_id = ?';
        params.push(category_id);
    }
    if (search) {
        query += ' AND d.title LIKE ?';
        params.push(`%${search}%`);
    }

    query += ' ORDER BY d.created_at DESC';

    try {
        const [documents] = await db.query(query, params);
        res.json({ success: true, total: documents.length, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. XEM CHI TIẾT 1 TÀI LIỆU
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [documents] = await db.query(
            `SELECT d.*, s.subject_name, c.category_name, u.full_name AS uploader_name
             FROM Documents d
             JOIN Subjects s ON d.subject_id = s.subject_id
             JOIN DocumentCategories c ON d.category_id = c.category_id
             JOIN Users u ON d.uploaded_by = u.user_id
             WHERE d.document_id = ?`,
            [id]
        );

        if (documents.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài liệu!' });
        }

        res.json({ success: true, data: documents[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. ĐĂNG TÀI LIỆU MỚI (Yêu cầu đăng nhập - verifyToken)
router.post('/', verifyToken, async (req, res) => {
    const { title, description, file_url, file_size, file_type, subject_id, category_id } = req.body;
    const uploaded_by = req.user.user_id; // Lấy user_id từ Token JWT

    if (!title || !file_url || !subject_id || !category_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' });
    }

    try {
        await db.query(
            `INSERT INTO Documents (title, description, file_url, file_size, file_type, subject_id, category_id, uploaded_by, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
            [title, description, file_url, file_size, file_type, subject_id, category_id, uploaded_by]
        );

        res.status(201).json({
            success: true,
            message: 'Tải lên tài liệu thành công! Tài liệu đang chờ Ban cán sự / Admin duyệt.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Nạp thêm roleMiddleware ở đầu file routes/documents.js
const checkRole = require('../middleware/roleMiddleware');

// 4. LẤY DANH SÁCH TÀI LIỆU CHỜ DUYỆT (Dành cho Admin / Moderator)
router.get('/pending/all', verifyToken, checkRole(['ADMIN', 'MODERATOR']), async (req, res) => {
    try {
        const [documents] = await db.query(
            `SELECT d.*, s.subject_name, c.category_name, u.full_name AS uploader_name
             FROM Documents d
             JOIN Subjects s ON d.subject_id = s.subject_id
             JOIN DocumentCategories c ON d.category_id = c.category_id
             JOIN Users u ON d.uploaded_by = u.user_id
             WHERE d.status = 'PENDING'
             ORDER BY d.created_at ASC`
        );
        res.json({ success: true, total: documents.length, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. DUYỆT HOẶC TỪ CHỐI TÀI LIỆU (Dành cho Admin / Moderator)
router.patch('/:id/status', verifyToken, checkRole(['ADMIN', 'MODERATOR']), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' hoặc 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ! (Chỉ chấp nhận APPROVED hoặc REJECTED)' });
    }

    try {
        const [result] = await db.query(
            'UPDATE Documents SET status = ? WHERE document_id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài liệu!' });
        }

        res.json({ 
            success: true, 
            message: `Tài liệu ID ${id} đã được chuyển trạng thái thành: ${status}` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;