/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Cấu hình ứng dụng Express (Express Application Configuration).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là trung tâm điều phối mọi Request đi vào hệ thống Backend.
 *    - Thiết lập các "lớp lọc" (Middleware) như bảo mật CORS, đọc dữ liệu JSON, quản lý Cookie và File Upload.
 *    - Gắn kết các Endpoint (Route) với logic xử lý tương ứng (Product, User, Order...).
 *    - Thiết lập hệ thống xử lý lỗi tập trung cho toàn bộ ứng dụng.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Hệ thống Core / Routing / Middleware.
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Express.js Framework.
 *    - CORS (Cross-Origin Resource Sharing): Cho phép Frontend (React) giao tiếp với Backend.
 *    - Passport.js: Thư viện hỗ trợ nhiều chiến lược xác thực (JWT, Google, v.v.).
 *    - Middleware Pattern: Cách Express xử lý request qua các hàm trung gian.
 *    - Error Handling Middleware: Hàm bắt lỗi cuối cùng trong chuỗi xử lý.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Các Request HTTP thô từ Client (thông qua server.js).
 *    - Output: Instance `app` chứa đầy đủ cấu hình để server.js có thể chạy được.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không áp dụng trực tiếp.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `configurePassport()`: Khởi tạo các cấu hình bảo mật/xác thực.
 *    - `isAllowedOrigin()`: Logic kiểm tra xem Client nào (URL nào) được phép gọi API.
 *    - `app.use()`: Các câu lệnh đăng ký middleware và route.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Load biến môi trường.
 *    - Bước 2: Khởi tạo ứng dụng Express.
 *    - Bước 3: Cấu hình CORS (Bảo mật truy cập giữa các domain).
 *    - Bước 4: Cấu hình Parsers (Đọc JSON, URL-encoded, Cookies).
 *    - Bước 5: Đăng ký các Route API chính (tiền tố `/api/v1`).
 *    - Bước 6: Đăng ký `errorHandleMiddleware` ở cuối cùng để bắt mọi lỗi phát sinh.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Request -> server.js -> app.js -> CORS Check -> Parsers -> API Route -> Controller -> Database.
 *    - Response trả ngược lại qua các lớp middleware và về Client.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Có phân quyền API theo route (ví dụ: các route admin được tách riêng).
 *    - Các header quan trọng như Authorization được cấu hình cho phép qua CORS.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Bản thân file này chạy đồng bộ để thiết lập cấu hình, các xử lý bất đồng bộ nằm sâu bên trong các route/controller.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Thứ tự của `app.use` rất quan trọng! Error handler luôn phải ở dưới cùng.
 *    - Nếu muốn thêm một module mới (ví dụ: Chatbot, Voucher), bạn phải đăng ký route ở đây.
 *    - Phần `limit: '50mb'` là để hỗ trợ upload ảnh/file dung lượng lớn, hãy cẩn thận với bảo mật.
 */
import { loadEnvironment } from "./config/loadEnv.js";

loadEnvironment();

import express from 'express';
import product from './routes/productRoutes.js';
import user from './routes/userRoutes.js';
import order from './routes/orderRoutes.js';
import admin from './routes/adminRoutes.js';
import settings from './routes/settingsRoutes.js';
import address from './routes/addressRoute.js';
import payment from './routes/paymentRoutes.js';
import cart from './routes/cartRoutes.js';
import aiAssistant from './routes/aiRoute.js';
import vouchers from './routes/promoRoutes.js';
import notifications from './routes/notificationRoutes.js';
import userVouchers from './routes/userVoucherRoutes.js';

import errorHandleMiddleware from './middleware/error.js';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import passport from 'passport';
import { configurePassport } from './config/passportConfig.js';
const app = express();

configurePassport();
app.use(passport.initialize());

app.set('trust proxy', 1);
app.set('query parser', 'extended');

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
].filter(Boolean);

// Allow any localhost port in development
const isAllowedOrigin = (origin) => {
    if (allowedOrigins.includes(origin)) return true;
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) return true;
    return false;
};

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && isAllowedOrigin(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
        res.header('Access-Control-Allow-Credentials', 'true');
    }

    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running'
  });
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(fileUpload());

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1/admin", admin);
app.use("/api/v1", settings);
app.use("/api/v1/address", address);
app.use("/api/v1", payment);
app.use("/api/v1/cart", cart);
app.use("/api/v1/ai", aiAssistant);
app.use("/api/v1/vouchers", vouchers);
app.use("/api/v1/user-vouchers", userVouchers);
app.use("/api/v1/notifications", notifications);

app.use(errorHandleMiddleware);

export default app;
