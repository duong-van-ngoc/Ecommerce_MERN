# Kế hoạch sửa lỗi 404 Vercel Backend

Dự án hiện đang gặp lỗi 404 khi truy cập vào root domain của backend trên Vercel. Qua phân tích, nguyên nhân khả thi nhất là do cấu hình `vercel.json` chưa tương thích hoàn toàn với cách Vercel xử lý thư mục `api/` hiện nay.

## Thay đổi đề xuất

### 1. Cấu hình Vercel (`vercel.json`)
Thay thế cấu hình `builds` và `routes` cũ bằng `rewrites` hiện đại hơn để ánh xạ tất cả request về entry point `api/index.js`.

### 2. Tối ưu Entry Point (`api/index.js`)
Đảm bảo việc kết nối Database và khởi tạo app diễn ra trơn tru trong môi trường Serverless.

---

## Chi tiết thay đổi

### [Component] Vercel Configuration

#### [MODIFY] [vercel.json](file:///d:/Projects/E_Commerce_MERN/vercel.json)
Cập nhật nội dung file để sử dụng `rewrites`.

#### [MODIFY] [api/index.js](file:///d:/Projects/E_Commerce_MERN/api/index.js)
Tối ưu hóa cách export và xử lý request.

---

## Kế hoạch xác minh

### Kiểm tra tự động
- Không áp dụng cho cấu hình Vercel (cần deploy thật).

### Kiểm tra thủ công
1. Đẩy code lên GitHub để Vercel tự động redeploy.
2. Truy cập `https://backend-tobishop.vercel.app/` để kiểm tra thông báo "Backend API is running 🚀".
3. Truy cập `https://backend-tobishop.vercel.app/api/v1/products` để kiểm tra API routes.

> [!IMPORTANT]
> Đảm bảo các biến môi trường như `DB_URI`, `FRONTEND_URL` đã được thiết lập chính xác trong Vercel Dashboard.
