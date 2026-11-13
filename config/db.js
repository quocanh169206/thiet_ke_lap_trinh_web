const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Kết nối CSDL MySQL thất bại:', err.message);
    } else {
        console.log('✅ Kết nối thành công đến Database: ued_document_management!');
        connection.release();
    }
});

module.exports = pool.promise();