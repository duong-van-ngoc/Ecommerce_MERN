/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Middleware xác thực người dùng (Authentication Middleware).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là "người gác cổng" cho các API cần bảo mật.
 *    - Kiểm tra xem người dùng đã đăng nhập chưa bằng cách xác minh tính hợp lệ của Token (JWT).
 *    - Phân quyền (Authorization): Đảm bảo chỉ những người có vai trò phù hợp (vd: Admin) mới được thực hiện các hành động nhạy cảm.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Bảo mật (Security) & Kiểm soát truy cập (Access Control).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - JSON Web Token (JWT): Giải mã và xác thực mã định danh.
 *    - Cookie-based & Header-based Auth: Hỗ trợ lấy Token từ cả Cookie và Header Authorization (Bearer Token).
 *    - Higher-Order Functions: Dùng để tạo ra middleware phân quyền linh hoạt (`roleBasedAccess`).
 *    - Mongoose Queries: Tìm kiếm thông tin người dùng trong DB để xác nhận tài khoản vẫn tồn tại.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Request có chứa mã `token` trong Cookies hoặc Header.
 *    - Output: Nếu hợp lệ, gắn đối tượng `user` vào `req.user` và gọi `next()`. Nếu không, trả về lỗi 401 (Chưa đăng nhập) hoặc 403 (Không đủ quyền).
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `req.user`: Nơi lưu trữ thông tin người dùng đã xác thực để các hàm xử lý phía sau có thể dùng ngay mà không cần truy vấn lại DB.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `verifyUserAuth`: Middleware chính để kiểm tra trạng thái đăng nhập.
 *    - `roleBasedAccess`: Hàm kiểm tra vai trò (Role) của người dùng (ví dụ: `admin`, `user`).
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Lấy Token từ Cookie hoặc Header Authorization.
 *    - Bước 2: Nếu không có Token, báo lỗi yêu cầu đăng nhập.
 *    - Bước 3: Dùng `jwt.verify` để giải mã Token lấy ra ID người dùng.
 *    - Bước 4: Truy vấn Database theo ID để lấy thông tin User mới nhất.
 *    - Bước 5: Nếu User tồn tại, gán vào `req.user` và chuyển tiếp yêu cầu.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Request -> Middleware -> MongoDB (Tìm User) -> [Lỗi / Next].
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Validate tính hợp lệ của Token.
 *    - Chặn các truy cập trái phép bằng mã lỗi 401, 403.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Sử dụng `async/await` khi tìm User trong Database.
 *    - Được bọc bởi `handleAsyncError` để quản lý các lỗi phát sinh trong quá trình xử lý bất đồng bộ.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Hỗ trợ cả hai cách gửi Token giúp API này tương thích cả với trình duyệt (Web) và các ứng dụng bên thứ 3 (Postman, Mobile App).
 *    - Khi thêm Role mới cho hệ thống, bạn chỉ cần truyền thêm Role đó vào hàm `roleBasedAccess('admin', 'mod', 'new_role')`.
 *    - Lưu ý: Token hết hạn sẽ khiến `jwt.verify` quăng lỗi, cần được bắt bởi middleware xử lý lỗi global.
 */
import handleAsyncError from "./handleAsyncError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import HandleError from "../utils/handleError.js";


export const verifyUserAuth = handleAsyncError(async (req, res, next) => {
    let token = req.cookies.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new HandleError("Xác thực thất bại! Vui lòng đăng nhập để tiếp tục", 401));
    }

    // jwt.verify sẽ throw error nếu token sai/hết hạn
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Populate role_id to get the role name for authorization checks
    const user = await User.findById(decodedData.id).populate("role_id", "name");
    if (!user) {
        return next(new HandleError("Tài khoản không tồn tại hoặc đã bị xóa", 404));
    }

    // Security Gate: Block deactivated accounts even with valid token
    if (user.isActive === false) {
        return next(new HandleError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin để biết thêm chi tiết.", 403));
    }

    req.user = user;
    next();
});


export const roleBasedAccess = (...roles) => {
    return (req, res, next) => {
        // Role Resolution & Normalization: Support both legacy 'role' and new 'role_id'
        const legacyRole = req.user.role ? String(req.user.role).toLowerCase() : "";
        const newRole = req.user.role_id?.name ? String(req.user.role_id.name).toLowerCase() : "";
        
        const userRoleName = newRole || legacyRole;
        
        if (!roles.includes(userRoleName)) {
            return next(new HandleError(`Bạn không có quyền thực hiện hành động này`, 403));
        }
        next();
    };
}

