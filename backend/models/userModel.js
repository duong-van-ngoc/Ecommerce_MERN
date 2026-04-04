/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Mongoose Model (Model thực thể Người dùng).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Định nghĩa cấu trúc dữ liệu tường minh cho người dùng trong cơ sở dữ liệu MongoDB.
 *    - Quản lý các ràng buộc dữ liệu (Validation) như định dạng Email, độ dài mật khẩu.
 *    - Tự động hóa việc bảo mật (Mã hóa mật khẩu) và cung cấp các phương thức hỗ trợ xác thực (JWT, Reset Token).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Xác thực & Người dùng (Authentication & User Management).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Mongoose Schema & Model: Định nghĩa lược đồ dữ liệu.
 *    - `validator`: Thư viện kiểm tra tính hợp lệ của chuỗi (ví dụ: định dạng Email).
 *    - `bcryptjs`: Thuật toán hash mật khẩu một chiều để bảo mật.
 *    - `jsonwebtoken (JWT)`: Tạo mã định danh cho phiên làm việc của người dùng.
 *    - `crypto`: Module có sẵn của Node.js để tạo các chuỗi ngẫu nhiên bảo mật (Reset Token).
 *    - Mongoose Middleware (`pre-save`): Can thiệp vào quá trình trước khi dữ liệu được ghi xuống DB.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Dữ liệu người dùng từ Controller (đăng ký, cập nhật).
 *    - Output: Object User đã được chuẩn hóa và lưu trữ thành công trong DB.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Các trường quan trọng: `name`, `email`, `password` (không trả về mặc định), `avatar`, `role`, `googleId`, `facebookId`.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `pre("save")`: Middleware tự động băm (hash) mật khẩu trước khi lưu.
 *    - `getJWTToken()`: Tạo mã Token để người dùng đăng nhập.
 *    - `verifyPassword()`: Kiểm tra mật khẩu người dùng nhập có khớp với bản lưu trong DB không.
 *    - `generatePasswordResetToken()`: Tạo mã khôi phục mật khẩu khi người dùng quên.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Khi có lệnh lưu (`save`), kiểm tra xem mật khẩu có thay đổi không.
 *    - Bước 2: Nếu có thay đổi, dùng bcrypt băm mật khẩu đó.
 *    - Bước 3: Dữ liệu được ghi vào cơ sở dữ liệu kèm theo timestamp (thời gian tạo/cập nhật).
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Là thực thể đại diện cho bảng (collection) `users` trong MongoDB.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Validate: Tên (5-30 ký tự), Email (đúng định dạng), Mật khẩu (ít nhất 8 ký tự).
 *    - Phân quyền mặc định là `user`. Trường mật khẩu bị ẩn (`select: false`) để tránh lộ thông tin khi query danh sách user.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Các hàm `pre-save` và `verifyPassword` là bất đồng bộ (Async) do quá trình băm mật khẩu tốn thời gian xử lý của CPU.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `unique: true` cho Email giúp ngăn chặn việc đăng ký trùng tài khoản.
 *    - `sparse: true` cho Google/Facebook ID cực kỳ quan trọng: Nó cho phép các trường này mang giá trị null (với người dùng login truyền thống) mà không gây lỗi trùng lặp dữ liệu `unique` trong MongoDB.
 *    - Token reset mật khẩu được lưu dưới dạng băm (SHA256) trong DB để đảm bảo dù DB có bị lộ thì kẻ xấu cũng không dùng Token đó đổi mật khẩu được ngay.
 */
import mongoose  from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required:[true, "Vui lòng nhập tên của bạn"],
        maxlength: [30, " Tên của bạn không được quá 30 ký tự"],
        minlength: [5, " Tên của ban phải có ít nhất 5 ký tự"]
    },
    email: {
        type: String,
        required: [true, "Vui lòng nhập email của bạn"],
        unique: true,
        validate:[validator.isEmail, " vui lòng nhập eamil hợp lệ"]
    },
    password: {
        type: String,
        required: [true, " Vui lòng nhập mật khẩu của bạn"],
        minlength: [8, " Mật khẩu của bạn phải có ít nhất 8 ký tự"],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: 'user'
    },
    role_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true
    },
    // Soft Delete fields - Account status management
    isActive: { // trạng thái hoạt động
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ["active", "locked", "disabled"],
        default: "active"
    },
    blockedAt: { // thời gian bị khóa
        type: Date,
        default: null
    },
    lockReason: { // lý do bị khóa
        type: String,
        default: null
    },
    resetPasswordToken: String, 
    resetPasswordExpire: Date // thời gian hết hạn token
},{timestamps:true})

// Note: Email index is created automatically by unique: true above.
// No need to call userSchema.index({ email: 1 }) separately.

// Password  hashing

userSchema.pre("save", async function(next){ 
    
    // 1st cập nhật hồ sơ ( name, email, image) password đã hash thì sẽ dc hashed  lại 

    // 2nd cập nhật password ( nếu không thay đổi password thì không cần hash lại)
    if(!this.isModified("password")) {
        return next();

    }
    this.password = await bcryptjs.hash(this.password, 10);
    next()
}) 

// tạo token để xác thực người dùng 
userSchema.methods.getJWTToken = function(){
    return jwt.sign(
        {id: this._id}, 
        process.env.JWT_SECRET_KEY,
        {expiresIn: process.env.JWT_EXPIRE}
    )
}

// xác nhận mật khẩu người nhập với mk trong DB
userSchema.methods.verifyPassword = async function(userEnterPassword) {
    return await bcryptjs.compare(userEnterPassword,
        this.password);
}

// tạo token  để đặt lại mk 

userSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    // hash token để lưu DB
    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000 // hết hạn sau 30 phut
    return resetToken

}

export default mongoose.model("User", userSchema)

