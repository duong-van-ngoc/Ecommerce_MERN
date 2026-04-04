/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Entry Point (Điểm khởi đầu) của toàn bộ ứng dụng Backend.
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là nơi "khai hỏa" server Node.js.
 *    - Đảm bảo các cấu hình quan trọng (biến môi trường, kết nối DB) được sẵn sàng trước khi lắng nghe request.
 *    - Quản lý các lỗi hệ thống (Global Error Handling) để server không bị sập đột ngột.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Hệ thống Core / Infrastructure của dự án.
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - ES Modules (import/export).
 *    - Async/await: Xử lý các tác vụ khởi tạo không đồng bộ.
 *    - Process Event Listeners: `uncaughtException` và `unhandledRejection` để bắt lỗi runtime.
 *    - Environment Variables: Sử dụng `process.env`.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Biến môi trường (PORT), file cấu hình `app.js` và `bootstrap.js`.
 *    - Output: Một instance Server đang chạy (Listening) trên cổng chỉ định (ví dụ: Port 3000).
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không áp dụng.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `startServer`: Hàm chính điều phối việc khởi tạo ứng dụng và mở cổng lắng nghe.
 *    - `process.on("uncaughtException")`: Xử lý lỗi khi code bị crash mà không nằm trong try/catch.
 *    - `process.on("unhandledRejection")`: Xử lý lỗi khi một Promise bị reject mà không có .catch().
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Load biến môi trường.
 *    - Bước 2: Đăng ký lắng nghe lỗi `uncaughtException`.
 *    - Bước 3: Chạy hàm `startServer`.
 *    - Bước 4: Trong `startServer`, đợi `initializeApp` (kết nối DB, config khác) hoàn tất.
 *    - Bước 5: Thực thi `app.listen` để mở cổng server.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - File này gọi `initializeApp()`, bên trong đó sẽ thực hiện kết nối tới MongoDB.
 *    - Khi server chạy thành công, nó sẽ bắt đầu nhận request và đẩy vào `app.js`.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Không áp dụng.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Toàn bộ hàm `startServer` là bất đồng bộ (Async) vì phải đợi kết nối Database.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Nếu server không chạy, hãy kiểm tra file `.env` (PORT).
 *    - Thử tự gây ra lỗi để xem các trình lắng nghe lỗi `process.on` hoạt động như thế nào.
 */
import app from "./app.js";
import { initializeApp } from "./config/bootstrap.js";
import { loadEnvironment } from "./config/loadEnv.js";

loadEnvironment();

process.on("uncaughtException", (err) => {
    console.log(`Loi: ${err.message}`);
    console.log("May chu dang tat vi loi ngoai le");
    process.exit(1);
});

const port = process.env.PORT || 3000;
let server;

const startServer = async () => {
    try {
        await initializeApp();
        server = app.listen(port, () => {
            console.log(`Server hoat dong tren may chu: ${port}`);
        });
    } catch (err) {
        console.log(`Loi: ${err.message}`);
        process.exit(1);
    }
};

startServer();

process.on("unhandledRejection", (err) => {
    console.log(`Loi: ${err.message}`);
    console.log("May chu dang tat vi loi khong mong muon");

    if (server) {
        server.close(() => {
            process.exit(1);
        });
        return;
    }

    process.exit(1);
});
