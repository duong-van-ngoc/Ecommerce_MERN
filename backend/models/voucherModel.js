/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Mongoose Model (Model thực thể Voucher / Database Schema).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Xác định cấu trúc dữ liệu chuẩn của mã giảm giá (Voucher) trong MongoDB.
 *    - Đảm bảo tính toàn vẹn của dữ liệu thông qua các ràng buộc (Validation) như duy nhất, bắt buộc, viết hoa.
 *    - Lưu trữ các thông số quan trọng như mức giảm, điều kiện áp dụng, và đối tượng được hưởng ưu đãi.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Dữ liệu (Database Layer) / Quản lý tài nguyên (Resource Management).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Mongoose Schema: Công cụ mô hình hóa dữ liệu cho MongoDB.
 *    - Data Validation: `required`, `unique`, `uppercase`, `index` để tối ưu tìm kiếm và tính chính xác.
 *    - Nested Objects: Sử dụng các đối tượng lồng nhau (`discount`, `conditions`, `targeting`) để phân nhóm dữ liệu khoa học.
 *    - Enumerations (enum): Giới hạn các giá trị hợp lệ cho trường dữ liệu (ví dụ: chỉ được phép 'percentage' hoặc 'fixed').
 *    - Pre-save Middleware: Logic tự động chạy trước khi dữ liệu được lưu vào Database (kiểm tra hạn dùng).
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Thông tin cấu hình Voucher từ Admin Controller gửi xuống.
 *    - Output: Một đối tượng (Document) đã được kiểm duyệt và sẵn sàng lưu vào MongoDB.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `code`: Mã voucher (Duy nhất, phục vụ tìm kiếm).
 *    - `usedCount`: Biến đếm số lần mã đã được dùng thực tế.
 *    - `usageLimit`: Tổng số lượt cho phép trên toàn hệ thống.
 *    - `limitPerUser`: Giới hạn cho từng tài khoản cá nhân.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `voucherSchema.pre('save')`: Hàm tự động kiểm soát logic thời gian, ngăn chặn lỗi con người khi nhập liệu (Ngày kết thúc < Ngày bắt đầu).
 *    - `mongoose.model("Voucher", ...)`: Chuyển đổi Schema thành một Model có thể thực hiện thao tác CRUD.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Khai báo cấu trúc các trường thông tin cần lưu trữ.
 *    - Bước 2: Thiết lập các tùy chọn cho từng trường (Kiểu dữ liệu, Thông báo lỗi khi thiếu).
 *    - Bước 3: Cài đặt Index cho các trường mã và trạng thái để tăng tốc độ truy vấn.
 *    - Bước 4: Chạy middleware kiểm tra logic ngày tháng rồi mới cho phép ghi vào ổ đĩa.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Controller (Sử dụng Model) -> **VoucherModel** (Validate Schema) -> MongoDB Server -> Trả về kết quả lưu trữ.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - `index: true`: Tối ưu hiệu năng khi hàng nghìn người dùng cùng lúc áp dụng mã.
 *    - `exclusiveUsers`: Mảng chứa các ID người dùng, xử lý tính năng Voucher độc quyền cho VIP.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Quá trình Middleware `pre-save` diễn ra trong luồng bất đồng bộ khi thực hiện lệnh `.save()`.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - **usedCount**: Đây là trường "sống", nó thay đổi liên tục khi có đơn hàng mới. Tuyệt đối không can thiệp thủ công vào trường này nếu không cần thiết.
 *    - **isPublic**: Cờ này quyết định Voucher có hiện ở trang chủ cho mọi người lấy không, hay là mã "tặng riêng" qua email.
 */
import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
  // 1. Thông tin định danh
  code: { 
    type: String, 
    required: [true, "Vui lòng nhập mã Voucher"], 
    unique: true, 
    uppercase: true,
    trim: true,
    index: true 
  },
  
  // Phân loại: Exclusive (Độc quyền VIP), Limited (Giới hạn lượt), General (Phố thông)
  type: { 
    type: String, 
    enum: ['exclusive', 'limited', 'general'], 
    required: true,
    default: 'general'
  },

  // 2. Cấu hình giảm giá (Discount)
  discount: {
    type: { 
      type: String, 
      enum: ['percentage', 'fixed'], 
      required: true,
      default: 'fixed'
    },
    value: { type: Number, required: true }, // Giá trị giảm (Ví dụ: 10% hoặc 50000 VND)
    maxAmount: { type: Number } // Số tiền giảm tối đa (Rat quan trọng cho loại percentage)
  },

  // 3. Điều kiện áp dụng (Conditions)
  conditions: {
    minOrderAmount: { type: Number, default: 0 }, // Giá trị đơn hàng tối thiểu
    startDate: { type: Date, default: Date.now }, // Ngày bắt đầu có hiệu lực
    endDate: { type: Date, required: [true, "Vui lòng nhập ngày kết hạn"] }, // Ngày hết hạn
    usageLimit: { type: Number, default: -1 }, // Tổng lượt toàn hệ thống (-1 là không giới hạn)
    limitPerUser: { type: Number, default: 1 } // Mỗi khách hàng được dùng tối đa bao nhiêu lần
  },

  // 4. Đối tượng mục tiêu (Targeting)
  targeting: {
    isPublic: { type: Boolean, default: true }, // Hiện lên Banner/Trang chủ hay không
    exclusiveUsers: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }] // Danh sách ID User được phép dùng (Nếu là loại exclusive)
  },

  // 5. Trạng thái vận hành
  usedCount: { type: Number, default: 0 }, // Số lượt đã sử dụng thực tế (Dùng để check nhanh)
  status: { 
    type: String, 
    enum: ['active', 'disabled'], 
    default: 'active',
    index: true
  }

}, { timestamps: true });

// Middleware kiểm tra tính hợp lệ của ngày hết hạn trước khi lưu
voucherSchema.pre('save', function(next) {
  if (this.conditions.endDate <= this.conditions.startDate) {
    next(new Error("Ngày kết thúc phải lớn hơn ngày bắt đầu!"));
  }
  next();
});

export default mongoose.model("Voucher", voucherSchema);
