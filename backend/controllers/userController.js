import handleAsyncError from "../middleware/handleAsyncError.js"
import User from "../models/userModel.js"
import HandleError from "../utils/handleError.js"
import { sendToken } from "../utils/jwtToken.js"
import { sendEmail } from "../utils/sendEmail.js"
// Đăng ký 
export const registerUser = handleAsyncError(async (req, res, next) => {
    const {name, email, password} = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "id tam thoi ",
            url: "url tam thoi "
        }
    })

    sendToken(user, 200, res)
})

// Đăng Nhập 

export const loginUser = handleAsyncError(async(req, res, next) => {
    const { email, password} = req.body;

    if(!email || !password) {
        return next(new HandleError(" Vui lòng không để email và password trống "))

    }
    const user = await User.findOne({email}).select("+password");

    if(!user) {
        return next(new HandleError(" Email hoặc mật khẩu không đúng", 401));
    }
    const isPasswordValid = await user.verifyPassword(password)
    if(!isPasswordValid){
        return next(new HandleError("Email hoặc mật khẩu không hợp lệ",401))
    }
    sendToken(user, 200, res)
})

// Đăng xuất 
export const logout = handleAsyncError(async (req, res, next) => {

    res.cookie('token', null,{
        expires: new Date(Date.now()),
        httpOnly : true
    })
    res.status(200).json({
        success: true,
        message: "Đăng xuất thành công"
    })

})

// đặt lại password

export const requestPasswordReset = handleAsyncError(async(req, res, next) => {
    const { email } = req.body
    // tim user theo email
    const user = await User.findOne({email})
    if(!user) {
        return next(new HandleError("Người dùng không tồn tại", 400))
    }

    let resetToken;
    try{
        resetToken =user.generatePasswordResetToken()
        console.log(resetToken);
        await user.save({
            validateBeforeSave: false
        })
        
    }catch (error){
        
        return next(new HandleError("không thể lưu mã thông báo đặt lại, vui lòng thử lại sau"), 500)
    }

    const resetPasswordURL = `http://localhost/api/v1/reset/${resetToken}`
    console.log(resetPasswordURL);
    const message = `Sử dụng liên kết sau để đặt lại mật khẩu của ban ${resetPasswordURL}.
    \n\n Liên kết sẽ hết hạn sau 30 phút. 
    \n\n Nếu bạn không yêu cầu dặt lại mật khẩu , vui lòng bỏ qua tin nhắn này. `

    try{
     // Gửi Email
     await sendEmail({
        email: user.email,
        subject: 'Yêu cầu đặt lại mật khẩu',
        message: message
     })   
     res.status(200).json({
        success: true,
        message:`Email gửi tới ${user.email} thành công`
     })

    }catch(error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave: false})
        return next(new HandleError("không thể lưu mã thông báo đặt lại, vui lòng thử lại sau"), 500)

    }

})

