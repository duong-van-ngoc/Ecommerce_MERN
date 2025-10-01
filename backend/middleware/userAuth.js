import handleAsyncError from "./handleAsyncError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import HandleError from "../utils/handleError.js";

export const verifyUserAuth = handleAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new HandleError("Xác thực thất bại! Vui lòng đăng nhập để tiếp tục", 401));
    }

    // jwt.verify sẽ throw error nếu token sai/hết hạn
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decodedData.id);
    if (!user) {
        return next(new HandleError("Tài khoản không tồn tại hoặc đã bị xóa", 404));
    }

    req.user = user;
    next();
});
