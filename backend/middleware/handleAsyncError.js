/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file hàm bao (Wrapper) xử lý lỗi bất đồng bộ trong Express.
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Giúp chúng ta viết code Controller "sạch" hơn bằng cách loại bỏ các khối `try...catch` lặp đi lặp lại ở mọi hàm `async`.
 *    - Tự động bắt (catch) các lỗi phát sinh từ câu lệnh `await` (như lỗi DB, lỗi Logic) và đẩy chúng sang Middleware xử lý lỗi tập trung (`error.js`).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Hệ thống Core / Công cụ (Utilities) / Xử lý lỗi (Error Handling).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Promises: Sử dụng `Promise.resolve()` để đảm bảo hàm truyền vào luôn được xử lý dưới dạng Promise.
 *    - Higher-Order Functions: Một hàm nhận vào một hàm khác làm tham số và trả về một hàm mới (Middleware).
 *    - Express Middleware: Tuân thủ cấu trúc `(req, res, next)`.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Một hàm xử lý bất đồng bộ (ASync Function/Controller).
 *    - Output: Một Middleware chuẩn của Express có khả năng tự động bắt lỗi.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `myErrorFun`: Hàm gốc mà chúng ta muốn bọc lại để xử lý lỗi.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Xuất khẩu mặc định một hàm bao (Closure) thực hiện logic `.catch(next)`.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Chúng ta bọc Controller bằng hàm này: `handleAsyncError(async (req, res, next) => { ... })`.
 *    - Bước 2: Khi có Request đến, hàm này sẽ chạy Controller đó.
 *    - Bước 3: Nếu trong Controller xảy ra lỗi (Reject), phương thức `.catch(next)` sẽ ngay lập tức bắt lấy lỗi đó.
 *    - Bước 4: Lỗi được chuyển tiếp (forward) đến middleware xử lý lỗi cuối cùng thông qua hàm `next`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không trực tiếp tương tác DB, nhưng là lớp bảo vệ cho mọi thao tác DB bất đồng bộ.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Không áp dụng.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - File này chính là "công cụ hỗ trợ" cho các phần bất đồng bộ khác trong dự án.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Đây là một kỹ thuật cực kỳ phổ biến trong các dự án Node.js chuyên nghiệp giúp mã nguồn ngắn gọn và dễ bảo trì.
 *    - Nếu bạn quên bọc Controller bằng hàm này và cũng không dùng `try...catch`, Server có thể bị "treo" hoặc lỗi "Unhandled Promise Rejection" khi có sự cố xảy ra.
 */
// hàm xử lý lỗi bất đồng bộ trong express
import HandleError from "../utils/handleError.js"; // Đảm bảo import để mentor biết nó liên kết với handleError
export default(myErrorFun) => (req, res, next) =>  {
    Promise.resolve(myErrorFun(req, res, next)).catch(next);
    
}