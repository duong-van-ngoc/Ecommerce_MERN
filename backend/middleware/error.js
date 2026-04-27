/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Middleware xử lý lỗi toàn cục (Global Error Handling Middleware).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là "trạm thu gom lỗi" cuối cùng của ứng dụng. Mọi lỗi xảy ra ở Controller, Middleware hay Model đều được đẩy về đây.
 *    - Chuẩn hóa thông báo lỗi: Trả về một cấu trúc JSON đồng nhất giúp Frontend dễ dàng hiển thị thông báo cho người dùng.
 *    - Chuyển đổi các thông báo lỗi kỹ thuật (của MongoDB/Mongoose) thành ngôn ngữ dễ hiểu đối với người dùng cuối.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Hệ thống Core / Xử lý lỗi (Error Management).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Express Middleware (4 tham số): Đặc trưng của middleware xử lý lỗi trong Express là phải có đủ 4 tham số `(err, req, res, next)`.
 *    - Mongoose Error Handling: Bắt các loại lỗi đặc trưng như `CastError` (ID không đúng định dạng) hoặc lỗi `code 11000` (Trùng lặp dữ liệu duy nhất).
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Đối tượng lỗi `err` được gửi đi từ các hàm `next(err)` ở mọi nơi trong app.
 *    - Output: Một phản hồi HTTP (Response) chứa mã trạng thái lỗi và thông điệp lỗi dạng JSON.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không áp dụng.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Export mặc định một hàm middleware thực hiện logic phân loại và phản hồi lỗi.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Tiếp nhận đối tượng lỗi, xác định mã lỗi mặc định (thường là 500 - Lỗi hệ thống).
 *    - Bước 2: Kiểm tra xem đó có phải lỗi `CastError` (thường do ID sản phẩm/user trong URL bị gõ sai) hay không để đổi sang lỗi 404.
 *    - Bước 3: Kiểm tra lỗi trùng lặp dữ liệu (ví dụ: đăng ký trùng Email) để trả về mã lỗi 400.
 *    - Bước 4: Gửi phản hồi JSON về cho Client kèm theo cờ `success: false`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Request -> (Lỗi ở đâu đó) -> next(err) -> Middleware này -> Client nhận thông báo lỗi.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Điều kiện kiểm tra tên lỗi (`err.name`) và mã lỗi (`err.code`) để tùy biến thông báo.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - File này xử lý đồng bộ để phản hồi ngay lập tức cho client.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Khi bạn thêm một logic Validation mới trong Model, nếu Mongoose quăng ra lỗi đặc thù, bạn nên bổ sung `if` ở đây để xử lý cho đẹp.
 *    - Đảm bảo middleware này luôn được đăng ký **CUỐI CÙNG** trong `app.js` (sau tất cả các route) để nó có thể bắt được lỗi của mọi route phía trên.
 */
import HandleError from "../utils/handleError.js";

export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "May chu gap su co, vui long thu lai sau";

    if (err.name === "TokenExpiredError") {
        err = new HandleError("Phien dang nhap da het han. Vui long dang nhap lai", 401);
    }

    if (err.name === "JsonWebTokenError") {
        err = new HandleError("Token khong hop le. Vui long dang nhap lai", 401);
    }

    if (err.name === "CastError") {
        const message = `Khong tim thay: ${err.path}`;
        err = new HandleError(message, 404);
    }

    if (err.code === 11000) {
        const message = `${Object.keys(err.keyValue)} da ton tai, vui long dang nhap`;
        err = new HandleError(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        statusCode: err.statusCode
    });
};
