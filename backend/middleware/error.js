import HandleError from "../utils/handleError.js";

// bắt lỗi ở các controller khi gọi next(err)
export default (err, req, res, next) => {
    err.statusCode = EvalError.statusCode || 500;
    err.message = err.message || "máy chủ gặp sự cố, vui lòng thử lại sau";
    
    // CastError  bắt lỗi từ mongoose khi id không đúng
    if(err.name === "CastError") {
        const message = `Tài nguyên không tìm thấy: ${err.path}`;
        err = new HandleError(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message

    })

}   
