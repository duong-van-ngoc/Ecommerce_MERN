import HandleError from "../utils/handleError.js";

// bắt lỗi ở các controller khi gọi next(err)
export default (err, req, res, next) => {
    err.statusCode = EvalError.statusCode || 500;
    err.message = err.message || "máy chủ gặp sự cố, vui lòng thử lại sau";
    
    // CastError  bắt lỗi từ mongoose khi id không đúng
    if(err.name === "CastError") {
        const message = `Không tìm thấy: ${err.path}`;
        err = new HandleError(message, 404);
    }

    // lỗi trùng  email
    if(err.code === 11000) {
        const message = `${Object.keys(err.keyValue)} đã tồn tại, vui lòng đăng nhập`;
        err = new HandleError(message, 400);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message

    })

}   
