import mongoose  from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";


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
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String, 
    resetPasswordExpire: Date // thời gian hết hạn token
},{timestamps:true})

// Password  hashing

userSchema.pre("save", async function(){ 
    this.password = await bcryptjs.hash(this.password, 10);
    // 1st cập nhật hồ sơ ( name, email, image)

    // 2nd cập nhật password ( nếu không thay đổi password thì không cần hash lại)
    if(!this.isModified("password")) {
        return next();

    }

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

export default mongoose.model("User", userSchema)

