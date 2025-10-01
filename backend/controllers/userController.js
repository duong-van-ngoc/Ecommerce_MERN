import handleAsyncError from "../middleware/handleAsyncError.js"
import User from "../models/userModel.js"
import HandleError from "../utils/handleError.js"
import { sendToken } from "../utils/jwtToken.js"
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

// 