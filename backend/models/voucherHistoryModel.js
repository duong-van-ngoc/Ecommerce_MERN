/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Mongoose Model (Model thực thể Lịch sử sử dụng Voucher - Voucher History).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Đóng vai trò là hệ thống "Audit Trail" (Truy vết) chuyên biệt cho các hoạt động khuyến mãi.
 *    - Lưu trữ bằng chứng xác thực về việc mã giảm giá nào đã được áp dụng vào đơn hàng nào, bởi người dùng nào.
 *    - Cung cấp dữ liệu nền tảng cho việc đối soát tài chính và báo cáo hiệu quả của các chiến dịch Marketing (ROI).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Khuyến mãi (Promotion Flow) & Thống kê báo cáo (Analytics & Reporting).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Compound Indexing: Sử dụng kỹ thuật đánh Index tổ hợp trên 3 trường {userId, voucherId, orderId} với thuộc tính `unique: true` để tạo ra một "chốt chặn thép" ngăn người dùng sử dụng một mã nhiều lần cho cùng một đơn hàng.
 *    - Snapshot Logging: Lưu lại số tiền giảm giá thực tế (`appliedAmount`) tại thời điểm giao dịch để đảm bảo báo cáo doanh thu luôn chính xác kể cả khi cấu hình Voucher gốc bị thay đổi hoặc xóa bỏ sau này.
 *    - Referential Integrity: Liên kết chặt chẽ 3 bên (User - Voucher - Order).
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Thông tin từ Checkout Controller sau khi xác nhận Voucher hợp lệ và thanh toán thành công.
 *    - Output: Một bản ghi lịch sử vĩnh viễn trong MongoDB phục vụ mục đích kiểm toán.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `appliedAmount`: Số tiền mặt đã được trừ trực tiếp vào hóa đơn (giá trị snapshot).
 *    - `usedAt`: Thời điểm chính xác mã được kích hoạt thành công.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Định nghĩa cấu trúc `voucherHistorySchema`.
 *    - Thiết lập Index cấp cao để thực thi logic nghiệp vụ ngay tại tầng Database.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Thanh toán thành công -> Bước 2: Hệ thống trích xuất dữ liệu voucher từ Order -> Bước 3: Ghi log vào VoucherHistory -> Bước 4: Tăng lượt dùng trong Voucher Model.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Đại diện cho collection `voucherhistories` trong MongoDB. Thường được Admin truy vấn để xem danh sách khách hàng sử dụng mã.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Unique Index đảm bảo không bao giờ có dữ liệu rác hoặc kịch bản "double-apply" cho cùng một giao dịch.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Model tĩnh, không trực tiếp xử lý Async.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - **Data Persistence**: Tuyệt đối không nên xóa các bản ghi trong file này (Hard delete) vì nó ảnh hưởng đến tính toàn vẹn của lịch sử đơn hàng và báo cáo tài chính cuối năm.
 *    - **Security Audit**: Nếu có sự cố tranh chấp về giảm giá, các bản ghi ở đây là bằng chứng duy nhất để kiểm tra hành vi của người dùng và hệ thống.
 */
import mongoose from "mongoose";

const voucherHistorySchema = new mongoose.Schema({
  // Liên kết tới cấu hình Voucher
  voucherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Voucher', 
    required: true, 
    index: true 
  },
  
  // Liên kết tới Người đã sử dụng
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  
  // Liên kết tới Đơn hàng cụ thể
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  
  // Số tiền đã được giảm trừ thực tế cho đơn hàng này (Dùng để báo cáo tổng doanh số giảm giá)
  appliedAmount: { 
    type: Number, 
    required: true 
  },
  
  // Thời điểm sử dụng (Dùng để thống kê theo ngày/tháng)
  usedAt: { 
    type: Date, 
    default: Date.now 
  }

}, { timestamps: true });

// Ràng buộc duy nhất (Single usage per user per order)
// Một user không thể dùng cùng một mã voucher cho cùng một đơn hàng 2 lần.
voucherHistorySchema.index({ userId: 1, voucherId: 1, orderId: 1 }, { unique: true });

export default mongoose.model("VoucherHistory", voucherHistorySchema);
