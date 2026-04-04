/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Middleware xác thực Quyền quản trị (Admin Authentication Middleware).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là "chốt chặn" cho mọi API liên quan đến quản lý (Admin Dashboard).
 *    - Đảm bảo chỉ những tài khoản có vai trò (Role) là `admin` mới được phép truy cập hoặc thay đổi dữ liệu nhạy cảm (Sản phẩm, Người dùng, Đơn hàng).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Bảo mật (Security) & Quản trị hệ thống (Admin Management).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - JSON Web Token (JWT): Giải mã mã định danh từ Cookie.
 *    - Mongoose Queries: Tìm kiếm thông tin Admin trong cơ sở dữ liệu.
 *    - Custom Error Handling: Sử dụng lớp `HandleError` để tạo thông báo lỗi chuẩn hóa.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Request chứa `token` gửi từ trình duyệt qua Cookies.
 *    - Output: Nếu là Admin hợp quy, gọi `next()` để đi tiếp. Nếu không, trả về lỗi 401 (Chưa đăng nhập), 404 (Không thấy user) hoặc 403 (Không đủ quyền).
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `req.user`: Được gán giá trị sau khi tìm thấy Admin trong DB, dùng cho các xử lý tiếp theo.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `isAuthenticatedAdmin`: Middleware duy nhất xử lý quy trình xác thực Admin 3 bước (Token -> User -> Role).
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Trích xuất `token` từ `req.cookies`.
 *    - Bước 2: Kiểm tra nếu không có token thì ném lỗi 401.
 *    - Bước 3: Dùng `jwt.verify` để lấy ID người dùng từ token.
 *    - Bước 4: Tìm User trong Database theo ID đó.
 *    - Bước 5: Kiểm tra nếu `req.user.role` khác "admin" thì ném lỗi 403 (Forbidden).
 *    - Bước 6: Nếu tất cả đều đạt, gọi `next()` để thực thi Controller.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Request -> Middleware này -> Database (Tìm User) -> [Lỗi / Next].
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Chặn cứng mọi Role không phải là `admin`.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Toàn bộ middleware dùng `async/await` và được bọc bởi `asyncErrorHandler` để bắt lỗi tiềm ẩn (như lỗi kết nối DB hoặc Token sai định dạng).
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Khác với `userAuth.js`, file này hiện tại chỉ lấy token từ Cookies. Nếu bạn muốn dùng tool như Postman với Header Authorization, bạn cần cập nhật logic lấy token giống bên `userAuth.js`.
 *    - Hãy cẩn thận khi sửa role string "admin", vì nó là giá trị cứng (hardcoded) để so sánh.
 */
// Middleware kiểm tra user có phải admin không
import HandleError from "../utils/handleError.js";
import asyncErrorHandler from "./handleAsyncError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/**
 * isAuthenticatedAdmin - Middleware bảo vệ routes admin
 * - Kiểm tra user đã đăng nhập chưa
 * - Kiểm tra user có role admin không
 */
export const isAuthenticatedAdmin = asyncErrorHandler(async (req, res, next) => {
    const { token } = req.cookies;

    // Support both Cookie and Bearer token
    let authToken = token;
    if (!authToken && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        authToken = req.headers.authorization.split(" ")[1];
    }

    if (!authToken) {
        return next(new HandleError("Vui lòng đăng nhập để truy cập", 401));
    }

    // Verify token and populate role_id to get role name
    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decodedData.id).populate("role_id", "name");

    if (!req.user) {
        return next(new HandleError("Người dùng không tồn tại", 404));
    }

    // Security Gate: Block deactivated accounts
    if (req.user.isActive === false) {
        return next(new HandleError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin để biết thêm chi tiết.", 403));
    }

    // Role Resolution & Normalization: Support both legacy 'role' and new 'role_id'
    const legacyRole = req.user.role ? String(req.user.role).toLowerCase() : "";
    const newRole = req.user.role_id?.name ? String(req.user.role_id.name).toLowerCase() : "";
    
    const roleName = newRole || legacyRole;
    
    // Strict Admin Check
    if (roleName !== "admin") {
        return next(new HandleError("Bạn không có quyền truy cập trang này", 403));
    }

    next();
});
