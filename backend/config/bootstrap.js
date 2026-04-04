/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Application Bootstrap (File khởi tạo ứng dụng).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là "nút nguồn" tổng hợp để kích hoạt đồng thời nhiều dịch vụ khác nhau khi bắt đầu chạy Sever.
 *    - Kết nối Cơ sở dữ liệu (MongoDB).
 *    - Cấu hình dịch vụ lưu trữ hình ảnh đám mây (Cloudinary).
 *    - Đảm bảo việc khởi tạo chỉ diễn ra một lần duy nhất (Pattern Singleton) để tránh tạo nhiều kết nối thừa thãi.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Hệ thống Config / Khởi tạo (Setup).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Cloudinary SDK: Dùng để quản lý ảnh.
 *    - Singleton Pattern thông qua `bootstrapPromise`: Đảm bảo dù gọi `initializeApp` nhiều lần thì logic khởi tạo cũng chỉ chạy một lần.
 *    - Async/Await: Xử lý các tác vụ chờ (wait) kết nối ngoại vi.
 *    - IIFE (Immediately Invoked Function Expression) bất đồng bộ.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Các biến môi trường liên quan đến Cloudinary (NAME, API_KEY, SECRET).
 *    - Output: Một Promise (`bootstrapPromise`). Khi Promise này hoàn thành thành công, toàn bộ ứng dụng đã sẵn sàng chạy.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `bootstrapPromise`: Lưu trữ trạng thái của quá trình khởi tạo để các bên khác (như server.js) có thể chờ.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `configureCloudinary()`: Đọc biến môi trường và nạp vào cấu hình của Cloudinary.
 *    - `initializeApp()`: Hàm trung tâm điều phối việc nạp môi trường, cấu hình dịch vụ và kết nối DB.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Nạp biến môi trường bằng `loadEnvironment()`.
 *    - Bước 2: Kiểm tra xem `bootstrapPromise` đã tồn tại chưa.
 *    - Bước 3: Nếu chưa, tạo một chuỗi xử lý (Promise) gồm: Config Cloudinary và Connect MongoDB.
 *    - Bước 4: Trả về Promise để bên gọi (server.js) có thể `await`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Là "tiền đồn" trước khi bắt đầu nhận request. Nó gọi trực tiếp tới `db.js`.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Chú ý có xử lý lỗi `.catch()` để reset promise về null nếu khởi tạo thất bại.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Hầu hết các thao tác chính (`connectMongoDatabase`, logic khởi tạo) đều là bất đồng bộ.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Tên biến môi trường Cloudinary có thể bị viết sai chính tả thành `CLOUNDINARY_NAME` (thêm chữ 'N'), file này có logic để chấp nhận cả hai cách viết.
 *    - Nếu bạn thêm một dịch vụ thứ 3 (như Redis, Stripe, Mailer), hãy đăng ký khởi tạo nó ở hàm `initializeApp` trong file này.
 */
import { v2 as cloudinary } from "cloudinary";
import connectMongoDatabase from "./db.js";
import { loadEnvironment } from "./loadEnv.js";

let bootstrapPromise = null;

const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUNDINARY_NAME || process.env.CLOUDINARY_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET
    });
};

export const initializeApp = async () => {
    loadEnvironment();

    if (!bootstrapPromise) {
        bootstrapPromise = (async () => {
            configureCloudinary();
            await connectMongoDatabase();
        })().catch((error) => {
            bootstrapPromise = null;
            throw error;
        });
    }

    return bootstrapPromise;
};
