/**
 * ============================================================================
 * CONTROLLER: paymentController.js
 * ============================================================================
 * 1. Vai trò: 
 *    - Xử lý các yêu cầu liên quan đến thanh toán qua cổng VNPay.
 *    - Tạo URL thanh toán, xác thực kết quả trả về (Return URL) và thông báo từ server (IPN).
 * 
 * 2. Thư viện sử dụng:
 *    - `vnpay`: Thư viện Node.js để tương tác với VNPay API (xây dựng URL, verify checksum).
 *    - `crypto`: (Tích hợp sẵn trong vnpay lib) dùng để băm HMAC-SHA512 bảo mật dữ liệu.
 * 
 * 3. Kiến thức & Khái niệm cốt lõi:
 *    - HMAC-SHA512: Thuật toán mã hóa dùng để tạo chữ ký số (Checksum), đảm bảo dữ liệu không bị thay đổi giữa VNPay và Server.
 *    - IPN (Instant Payment Notification): Cơ chế server-to-server giúp cập nhật trạng thái đơn hàng tin cậy, ngay cả khi người dùng tắt trình duyệt.
 *    - Sanbox: Môi trường thử nghiệm của VNPay (giả lập thanh toán).
 *    - TmnCode & HashSecret: Mã định danh và khóa bí mật do VNPay cung cấp để định danh ứng dụng.
 * 
 * 4. Luồng hoạt động:
 *    - (1) Client gọi `createVnpayPayment` -> Server tạo Link VNPay và trả về.
 *    - (2) Người dùng thanh toán trên cổng VNPay -> VNPay redirect về `vnpayReturn`.
 *    - (3) Server xác thực chữ ký -> Cập nhật Database -> Redirect về Frontend.
 *    - (4) VNPay Server gọi `vnpayIPN` (song song) để đảm bảo đồng bộ dữ liệu.
 * ============================================================================
 */
import { VNPay, ProductCode, VnpCurrCode, VnpLocale } from 'vnpay';
import handleAsyncError from '../middleware/handleAsyncError.js';
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import HandleError from '../utils/handleError.js';

// Khởi tạo VNPay instance (lazy loading để tránh lỗi hoisting env)
let vnpayInstance;
const getVnpayInstance = () => {
    if (!vnpayInstance) {
        if (!process.env.VNP_TMN_CODE || !process.env.VNP_HASH_SECRET) {
            console.error("[VNPay] Thiếu cấu hình: VNP_TMN_CODE hoặc VNP_HASH_SECRET");
            throw new Error("Hệ thống chưa được cấu hình VNPay. Vui lòng kiểm tra file .env");
        }
        vnpayInstance = new VNPay({
            tmnCode: process.env.VNP_TMN_CODE,
            secureSecret: process.env.VNP_HASH_SECRET,
            vnpayHost: 'https://sandbox.vnpayment.vn',
            testMode: true, // Sandbox
        });
    }
    return vnpayInstance;
};


/**
 * Tạo URL thanh toán VNPay
 */
export const createVnpayPayment = handleAsyncError(async (req, res, next) => {
    try {
        const { amount, orderId, orderDescription } = req.body;

        if (!amount || !orderId) {
            return next(new HandleError("Thiếu thông tin số tiền hoặc ID đơn hàng", 400));
        }

        // Lấy IP address và chuẩn hóa (VNPay không thích ::1)
        let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
            ipAddr = '127.0.0.1';
        }

        const vnp_Amount = Math.round(Number(amount) );
        const vnp_OrderInfo = orderDescription || `Thanh toan don hang ${orderId}`;
        const vnp_TxnRef = orderId.toString();

        console.log("----- [VNPay DEBUG PARAMS] -----");
        console.log("- vnp_Amount:", vnp_Amount);
        console.log("- vnp_TxnRef:", vnp_TxnRef);
        console.log("- vnp_OrderInfo:", vnp_OrderInfo);
        console.log("- vnp_OrderType:", "100000"); // Fashion/Consumer
        console.log("- vnp_IpAddr:", ipAddr);
        console.log("- vnp_ReturnUrl:", process.env.VNP_RETURN_URL);
        console.log("---------------------------------");

        const vnpay = getVnpayInstance();
        const paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount,
            vnp_IpAddr: ipAddr,
            vnp_TxnRef,
            vnp_OrderInfo,
            vnp_OrderType: '100000', // Sử dụng mã số thay vì enum 'other'
            vnp_ReturnUrl: process.env.VNP_RETURN_URL,
            vnp_Locale: VnpLocale.VN,
            vnp_CurrCode: VnpCurrCode.VND,
            vnp_CreateDate: new Date(),
        });


        res.status(200).json({
            success: true,
            paymentUrl,
        });
    } catch (error) {
        console.error("LỖI TẠO THANH TOÁN VNPAY:", error);
        return next(new HandleError(`Lỗi hệ thống VNPay: ${error.message}`, 500));
    }
});



/**
 * Helper để cập nhật trạng thái đơn hàng sau khi thanh toán VNPay
 */
const updateOrderPaymentStatus = async (query) => {
    const orderId = query.vnp_TxnRef;
    const responseCode = query.vnp_ResponseCode;

    const order = await Order.findById(orderId);
    if (!order) return { success: false, code: '01', message: 'Order not found' };
    
    // Kiểm tra số tiền (VNPay vnp_Amount đã nhân 100)
    if (Number(query.vnp_Amount) / 100 !== order.totalPrice) {
        return { success: false, code: '04', message: 'Invalid amount' };
    }

    if (order.isPaid && responseCode === '00') {
        return { success: true, code: '02', message: 'Order already confirmed' };
    }

    if (responseCode === '00') {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentInfo.status = "PAID";
        order.paymentInfo.transId = query.vnp_TransactionNo;
        order.paymentInfo.method = "VNPAY";
        order.orderStatus = "Chờ xử lý"; // Đảm bảo trạng thái đơn hàng là chờ xử lý (hoặc Đang xử lý tùy logic)
        await order.save();

        // --- MỚI: XÓA SẢN PHẨM KHỎI GIỎ HÀNG Ở BACKEND ---
        try {
            const cart = await Cart.findOne({ user: order.user });
            if (cart) {
                const paidProductKeys = order.orderItems.map(item => 
                    `${item.product.toString()}-${item.size || ''}-${item.color || ''}`
                );

                cart.items = cart.items.filter(cartItem => {
                    const cartKey = `${cartItem.product.toString()}-${cartItem.size || ''}-${cartItem.color || ''}`;
                    return !paidProductKeys.includes(cartKey);
                });

                await cart.save();
                console.log(`[VNPay] Đã dọn dẹp giỏ hàng cho user ${order.user} sau khi thanh toán thành công.`);
            }
        } catch (err) {
            console.error("[VNPay] Lỗi dọn dẹp giỏ hàng:", err.message);
        }

        return { success: true, code: '00', message: 'Success' };
    } else {
        order.paymentInfo.status = "FAILED";
        order.paymentInfo.resultCode = responseCode;
        order.orderStatus = "Đã hủy";
        await order.save();
        return { success: true, code: '00', message: 'Payment Failed recorded' };
    }
};

/**
 * Xử lý Return URL - Redirect từ VNPay
 */
export const vnpayReturn = handleAsyncError(async (req, res, next) => {
    const query = req.query;
    const vnpay = getVnpayInstance();
    const verify = vnpay.verifyReturnUrl(query);

    if (verify.isSuccess) {
        // Cập nhật database ngay lập tức (Hữu ích cho localhost và feedback nhanh)
        await updateOrderPaymentStatus(query);

        if (query.vnp_ResponseCode === '00') {
            res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${query.vnp_TxnRef}&vnp_ResponseCode=${query.vnp_ResponseCode}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${query.vnp_TxnRef}&vnp_ResponseCode=${query.vnp_ResponseCode}`);
        }
    } else {
        res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${query.vnp_TxnRef}&vnp_ResponseCode=97`);
    }
});

/**
 * Xử lý IPN - Phản hồi từ Server VNPay
 */
export const vnpayIPN = handleAsyncError(async (req, res, next) => {
    const query = req.query;
    const vnpay = getVnpayInstance();
    const verify = vnpay.verifyIpnCall(query);

    if (verify.isSuccess) {
        const result = await updateOrderPaymentStatus(query);
        return res.status(200).json({ RspCode: result.code, Message: result.message });
    } else {
        return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }
});
