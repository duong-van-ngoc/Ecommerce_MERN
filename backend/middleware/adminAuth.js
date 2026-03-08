// Middleware kiểm tra user có phải admin không
import HandleError from "../utils/handleError.js";
import asyncErrorHandler from "./handleAsyncError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/**
 * isAuthenticatedAdmin - Middleware bảo vệ routes admin
 * - Kiểm tra user đã đăng nhập chưa
 * - Kiểm tra user có role admin không
 */
export const isAuthenticatedAdmin = asyncErrorHandler(async (req, res, next) => {
    const { token } = req.cookies;

    // Kiểm tra token có tồn tại không
    if (!token) {
        return next(new HandleError("Vui lòng đăng nhập để truy cập", 401));
    }

    // Verify token
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decodedData.id);

    if (!req.user) {
        return next(new HandleError("Người dùng không tồn tại", 404));
    }

    // Kiểm tra role admin
    if (req.user.role !== "admin") {
        return next(new HandleError("Bạn không có quyền truy cập trang này", 403));
    }

    next();
});
