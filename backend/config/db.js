/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Bộ kết nối cơ sở dữ liệu (Database Connector).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Thiết lập kết nối giữa ứng dụng Node.js và cơ sở dữ liệu MongoDB.
 *    - Quản lý trạng thái kết nối để đảm bảo tính ổn định của ứng dụng.
 *    - Sử dụng cơ chế Cache kết nối (Singleton) để tối ưu hiệu suất, đặc biệt quan trọng khi triển khai trên các nền tảng Serverless như Vercel (tránh việc tạo quá nhiều kết nối dư thừa tới MongoDB).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Hệ thống Core / Database.
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Mongoose: ODM (Object Data Modeling) dành cho MongoDB và Node.js.
 *    - Caching Pattern: Sử dụng đối tượng `global` để lưu trữ kết nối.
 *    - Async/Await: Xử lý quá trình kết nối mạng tới server database.
 *    - Environment Variables: Lấy địa chỉ kết nối từ `process.env.DB_URI`.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Biến môi trường `DB_URI` (Địa chỉ kết nối MongoDB).
 *    - Output: Một đối tượng kết nối `mongoose` đã sẵn sàng để thực hiện các truy vấn dữ liệu.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `globalThis.mongooseCache`: Một kho lưu trữ tạm thời nằm ngoài vòng đời thông thường của file, giúp giữ lại kết nối khi file được nạp lại.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `connectMongoDatabase()`: Hàm xử lý chính. Nó kiểm tra nếu có kết nối cũ thì dùng lại, nếu không mới tiến hành tạo kết nối mới.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Kiểm tra cache xem đã có kết nối (`cached.conn`) chưa. Nếu có, trả về ngay.
 *    - Bước 2: Kiểm tra xem biến `DB_URI` có tồn tại không. Nếu không, báo lỗi ngay lập tức.
 *    - Bước 3: Nếu chưa có tiến trình kết nối nào đang chạy, khởi tạo `mongoose.connect()`.
 *    - Bước 4: Chờ kết nối hoàn tất, lưu vào cache và log thông báo thành công.
 *    - Bước 5: Nếu thất bại, xóa cache promise để các lần gọi sau có thể thử lại.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - File này là "cầu nối" trực tiếp đưa dữ liệu từ ứng dụng xuống Database MongoDB. Các Model sẽ cần kết nối này để hoạt động.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Có validate biến môi trường `DB_URI`.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Toàn bộ hàm `connectMongoDatabase` là bất đồng bộ vì việc kết nối Internet tới Database tốn thời gian.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Tại sao dùng `globalThis`? Để tránh lỗi "kết nối quá tải" khi dùng công cụ phát triển như Webpack/Vite hoặc chạy trên môi trường Serverless.
 *    - Khi triển khai thực tế, hãy đảm bảo bạn đã "Whitelist" địa chỉ IP của Server trên bảng điều khiển MongoDB Atlas, nếu không kết nối sẽ bị từ chối (Timeout).
 */
import mongoose from "mongoose";

const globalMongoose = globalThis;

if (!globalMongoose.mongooseCache) {
    globalMongoose.mongooseCache = {
        conn: null,
        promise: null
    };
}

const cached = globalMongoose.mongooseCache;

const connectMongoDatabase = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!process.env.DB_URI) {
        throw new Error("DB_URI is not defined");
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.DB_URI).then((data) => {
            console.log(`Database connected successfully to ${data.connection.host}`);
            return data;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
};

export default connectMongoDatabase;
