import handleAsyncError from "../middleware/handleAsyncError.js"
import User from "../models/userModel.js"
import HandleError from "../utils/handleError.js"
import { sendToken } from "../utils/jwtToken.js"
import { sendEmail } from "../utils/sendEmail.js"
import crypto from "crypto";
import mongoose from "mongoose";



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
        return next(new HandleError("Thông tin tài khoản mật khẩu không chính xác",401))
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

//  quên mật khẩu 

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

// đặt lại mật khẩu 
export const resetPassword = handleAsyncError(async(req, res,next) => {
    // hash  lại token từ URL
    console.log(req.params.token);
    
    const resetPasswordToken= crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await  User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt:Date.now()}
    })
    if(!user) {
        return next(new HandleError("Mã token không hợp lệ hoặc đã hết hạn ", 400))
    }
    const {password, confirmPassword} = req.body
    if(password != confirmPassword) {
        return next(new HandleError("Mật khẩu không khớp", 400))
    }
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()
    sendToken(user, 200,res)
  
})
//  hồ sơ người dùng 
export const getUserDetails = handleAsyncError(async(req, res, next) => { 
    const user = await User.findById(req.user.id)
    console.log(req.user.id);
    res.status(200).json({
        success: true,
        user
    })


})

// cập nhật mật khẩu 
export const updatePassword = handleAsyncError(async(req, res, next) => {
    const { oldPassword, newPassword, confirmPassword} = req.body

    const user = await User.findById(req.user.id).select('+password')
    const checkPasswordMatch = await user.verifyPassword(oldPassword) 

    if(!checkPasswordMatch) {
        return next(new HandleError("Mật khẩu cũ không chính xác", 400))

    }

    if(newPassword !== confirmPassword) { 
        return next(new HandleError("Mật khẩu không khớp", 400))
    }
    user.password = newPassword

    await user.save()
    sendToken(user, 200, res)

})
 // Cập nhật hồ sơ người dùng
 export const updateProfile = handleAsyncError(async(req, res, next) => {
    const {name, email} = req.body
    const updateUserDetails={
        name,
        email
    }
    const user = await User.findByIdAndUpdate(req.user.id, 
    updateUserDetails, {
        new: true,
        runValidators: true 
    })
    res.status(200).json({
        success: true,
        message: "Cập nhật hồ sơ thành công",
        user

    })
})
// Admin - lấy thông tin user
export const getUsersList = handleAsyncError(async(req, res, next) => { 
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
})

// Admin - lấy thông tin của người dùng đơn lẻ 

export const getSingleUser = handleAsyncError(async(req, res, next) => {
    const user = await User.findById(req.params.id)
    if(!user) {
        return next(new HandleError(`Người dùng không tồn tại với id: 
            ${req.params.id}`, 400))
    }    
    res.status(200).json({
        success: true,
        user
    })
})

// Admin - thay đổi vai trò user
export const updateUserRole = handleAsyncError(async(req,  res, next) => {
    const {role } = req.body

    const newUserData = {
        role
    }
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new:true,
        runValidators: true

    })

    if(!user) {
        return next(new HandleError("Người dùng không tồn tại", 400))
    }
    res.status(200).json({
        success: true,
        user
    })
})

// Admin  xóa hồ sơ 
export const deleteProfile = handleAsyncError(async(req, res, next) => {
    const user = await User.findById(req.params.id)

    if(!user) {
        return next(new HandleError("Người dùng không tồn tại", 400))
    }
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json({
        success:true,
        message: "Xóa người dùng thành công"
    })

})