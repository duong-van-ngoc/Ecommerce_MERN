import handleAsyncError from "./handleAsyncError.js"
import jwt from "jsonwebtoken"

export const verifyUserAuth = handleAsyncError(async(req, res, next)=> 
{
    const { token } = req.cookies
    console.log(token)
    if(!token) {
        return next(new HandleError("Xác thực thất bại! Vui lòng đăng nhập để tiếp tục", 401));
    }

    const decodedData = jwt.verify(token,process.env.JWT_SECRET_KEY);
    console.log(decodedData);
    
})