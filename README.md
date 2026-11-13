# 📚 Hệ thống Quản lý Tài liệu Học tập theo Học phần (UED Document Management System)

Dự án Backend RESTful API phục vụ đồ án học phần **Thiết kế và Lập trình Web** — xây dựng nền tảng chia sẻ, lưu trữ, phân quyền và đánh giá tài liệu học tập theo từng học phần dành cho sinh viên Khoa Công nghệ Thông tin, Trường Đại học Sư phạm – Đại học Đà Nẵng (UED).

---

## 🚀 Tính năng chính

* **Xác thực & Phân quyền (Authentication & Authorization):**
  * Đăng ký, đăng nhập tài khoản sử dụng **JWT (JSON Web Token)**.
  * Phân quyền người dùng chặt chẽ qua Middleware (`authMiddleware`, `roleMiddleware`) cho các vai trò: Sinh viên, Giảng viên / Quản trị viên.
* **Quản lý Tài liệu Học tập (Documents):**
  * Tải lên, tìm kiếm, lọc và xem chi tiết tài liệu theo từng học phần / môn học.
  * Kiểm duyệt và quản lý trạng thái tài liệu.
* **Đánh giá & Bình luận (Reviews):**
  * Cho phép sinh viên đánh giá chất lượng và để lại nhận xét cho từng tài liệu.

---

## 🛠️ Công nghệ sử dụng

* **Runtime & Framework:** Node.js, Express.js
* **Cơ sở dữ liệu:** PostgreSQL / MySQL *(cấu hình tại `config/db.js`)*
* **Bảo mật & Xác thực:** JSON Web Token (JWT), bcrypt, dotenv
* **Kiểm thử API:** REST Client (`test_api.http`)

---

## 📁 Cấu trúc thư mục

```text
thiet_ke_lap_trinh_web/
├── config/
│   └── db.js                 # Cấu hình kết nối cơ sở dữ liệu
├── middleware/
│   ├── authMiddleware.js     # Xác thực token người dùng (JWT)
│   └── roleMiddleware.js     # Kiểm tra phân quyền theo vai trò
├── routes/
│   ├── auth.js               # Các endpoint đăng ký, đăng nhập, thông tin user
│   ├── documents.js          # Các endpoint CRUD & quản lý tài liệu học phần
│   └── reviews.js            # Các endpoint đánh giá, bình luận tài liệu
├── .env                      # Biến môi trường (không đẩy lên GitHub)
├── package.json              # Khai báo thư viện và scripts dự án
├── server.js                 # File khởi chạy chính của ứng dụng Express
└── test_api.http             # File kịch bản kiểm thử các API endpoints
