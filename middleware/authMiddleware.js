const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Định dạng: "Bearer <TOKEN>"

    if (!token) {
        return res.status(401).json({ success: false, message: 'Truy cập bị từ chối! Chưa cung cấp Token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ued_secret_key_2026');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

module.exports = verifyToken;