/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Mongoose Model (Model thực thể Cài đặt hệ thống).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Quản lý các thiết lập vận hành của toàn bộ hệ thống (Thông tin liên hệ, Tên công ty, Email Admin).
 *    - Cấu hình các loại thông báo tự động cho Quản trị viên (Ví dụ: Thông báo khi có đơn hàng mới hoặc khi kho sắp hết hàng).
 *    - Sử dụng mô hình Singleton: Đảm bảo toàn dự án chỉ có đúng 1 bản ghi cài đặt duy nhất để tránh xung đột dữ liệu.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị (Admin) & Cấu hình hệ thống (System Settings).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Mongoose Schema: Thiết lập cấu trúc dữ liệu phằng và lồng ghép (`notifications`).
 *    - Singleton Pattern: Kỹ thuật đảm bảo chỉ có 1 thực thể được tạo ra.
 *    - Mongoose Middleware (`pre-save`): Dùng để thực thi logic kiểm tra số lượng bản ghi trước khi lưu.
 *    - Thư viện `validator`: Kiểm tra định dạng Email.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Dữ liệu từ form Cài đặt trong trang quản trị.
 *    - Output: Object Settings duy nhất được lưu trong MongoDB.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `adminName`, `email`, `companyName`, `address`: Thông tin định danh của chủ cửa hàng.
 *    - `notifications`: Đối tượng chứa các cờ (Boolean) bật/tắt nhận tin nhắn thông báo.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `pre('save')`: Hàm chặn không cho phép tạo thêm bản ghi mới (`isNew`) nếu trong cơ sở dữ liệu đã có sẵn 1 bản ghi cài đặt.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Admin thực hiện lưu cài đặt.
 *    - Bước 2: Hệ thống chạy vào hàm `pre-save`, đếm số lượng document trong collection `settings`.
 *    - Bước 3: Nếu số lượng > 0 và đây là lệnh tạo mới, hệ thống sẽ quăng lỗi (văng error).
 *    - Bước 4: Nếu là lệnh cập nhật, dữ liệu mới sẽ đè lên bản ghi cũ.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Đại diện cho collection `settings` trong MongoDB.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Validate Email, giới hạn độ dài tên và địa chỉ. 
 *    - Các trường mặc định cho thông báo đều là `true`.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Hàm `pre-save` là bất đồng bộ do phải đợi kết quả từ câu lệnh `countDocuments()` của MongoDB.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Tại sao dùng `isNew`? Để cho phép chúng ta cập nhật (Update) bản ghi hiện tại nhưng cấm tạo (Create) bản ghi thứ 2.
 *    - Nếu bạn muốn thêm tính năng thông báo mới (ví dụ: Thông báo qua Telegram), hãy thêm một trường Boolean vào trong đối tượng `notifications`.
 */
import mongoose from 'mongoose';
import validator from 'validator';

/**
 * Settings Schema - Quản lý cài đặt hệ thống
 * 
 * SINGLETON PATTERN:
 * - Chỉ có 1 document settings duy nhất trong toàn bộ database
 * - Tránh duplicate data và xung đột
 * - Sử dụng pre-save middleware để enforce rule này
 */
const settingsSchema = new mongoose.Schema({
    // ========== THÔNG TIN CÁ NHÂN ==========
    adminName: {
        type: String,
        required: [true, 'Tên admin không được để trống'],
        trim: true, // Tự động xóa khoảng trắng đầu/cuối
        maxLength: [100, 'Tên không được vượt quá 100 ký tự']
    },

    email: {
        type: String,
        required: [true, 'Email không được để trống'],
        unique: true, // Đảm bảo email là duy nhất trong DB
        validate: [validator.isEmail, 'Email không hợp lệ'], // Sử dụng validator library
        lowercase: true // Tự động convert sang lowercase
    },

    // ========== THÔNG TIN CÔNG TY ==========
    companyName: {
        type: String,
        required: [true, 'Tên công ty không được để trống'],
        trim: true,
        maxLength: [200, 'Tên công ty quá dài']
    },

    address: {
        type: String,
        required: [true, 'Địa chỉ không được để trống'],
        trim: true,
        maxLength: [500, 'Địa chỉ quá dài']
    },

    // ========== THÔNG BÁO ==========
    /**
     * Notifications - Các cài đặt thông báo cho admin
     * Mặc định tất cả = true (opt-out thay vì opt-in)
     * Admin có thể tắt từng loại thông báo riêng lẻ
     */
    notifications: {
        newOrders: {
            type: Boolean,
            default: true // Thông báo khi có đơn hàng mới
        },
        lowStock: {
            type: Boolean,
            default: true // Thông báo khi sản phẩm sắp hết hàng
        },
        newUsers: {
            type: Boolean,
            default: true // Thông báo khi có user đăng ký mới
        },
        newReviews: {
            type: Boolean,
            default: true // Thông báo khi có review mới
        }
    }
}, {
    timestamps: true  // Tự động thêm createdAt và updatedAt
});

/**
 * PRE-SAVE MIDDLEWARE
 * Chạy TRƯỚC KHI save document vào database
 * 
 * MỤC ĐÍCH: Enforce Singleton Pattern
 * - Kiểm tra xem đã có settings document nào chưa
 * - Nếu đã có và đang tạo mới (isNew = true) → throw error
 * - Chỉ cho phép UPDATE, không cho phép tạo document thứ 2
 */
settingsSchema.pre('save', async function (next) {
    // countDocuments() - Đếm số lượng documents trong collection
    const count = await this.constructor.countDocuments();

    // Nếu đã có document VÀ đây là document mới → chặn lại
    if (count > 0 && this.isNew) {
        throw new Error('Settings document already exists. Use update instead.');
    }

    next(); // Tiếp tục save nếu pass validation
});

/**
 * Export Model
 * mongoose.model() tạo Model từ Schema
 * - Tham số 1: Tên model (sẽ tự động tạo collection 'settings' - lowercase + plural)
 * - Tham số 2: Schema definition
 */
export default mongoose.model('Settings', settingsSchema);
