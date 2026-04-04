/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Bộ điều khiển Thanh toán VNPay (VNPay Payment Controller).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cầu nối cốt lõi giữa hệ thống của bạn và cổng thanh toán VNPay.
 *    - Chịu trách nhiệm tạo yêu cầu thanh toán (Payment URL), xác thực phản hồi từ ngân hàng (Return URL) và tiếp nhận thông báo kết quả giao dịch ngầm (IPN).
 *    - Tự động hóa việc cập nhật trạng thái thanh toán đơn hàng và dọn dẹp giỏ hàng sau khi khách trả tiền thành công.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Thanh toán điện tử (E-payment Flow) & Tích hợp bên thứ ba.
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - vnpay SDK: Thư viện giúp tính toán chữ ký số (Checksum) và xây dựng URL theo đúng chuẩn VNPay.
 *    - HMAC-SHA512: Thuật toán băm mã để tạo chữ ký bảo mật, chống việc tin tặc can thiệp thay đổi số tiền hoặc kết quả giao dịch.
 *    - IPN (Instant Payment Notification): Cơ chế Webhook quan trọng giúp Server-to-Server giao tiếp để cập nhật Database tin cậy nhất.
 *    - Redirect Logic: Chuyển hướng trình duyệt khách hàng giữa Frontend và cổng thanh toán.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Số tiền, ID đơn hàng từ Frontend hoặc các tham số truy vấn (Query string) từ máy chủ VNPay sau giao dịch.
 *    - Output: Một đường link dẫn đến trang thanh toán hoặc các phản hồi JSON thông báo kết quả cập nhật Database.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không áp dụng.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `createVnpayPayment`: Tạo mã băm và URL thanh toán dẫn khách sang trang ngân hàng.
 *    - `vnpayReturn`: Tiếp nhận khách hàng khi họ hoàn tất thanh toán và quay lại website để hiển thị thông báo.
 *    - `vnpayIPN`: Đầu nhận thông báo tự động từ VNPay Server để cập nhật trạng thái đơn hàng "vĩnh viễn".
 *    - `updateOrderPaymentStatus`: Hàm xử lý nghiệp vụ dùng chung để kiểm tra số tiền, cập nhật cờ `isPaid` và xóa sản phẩm trong giỏ hàng.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: User chọn thanh toán VNPay -> `createVnpayPayment` trả về URL.
 *    - Bước 2: User thanh toán xong -> VNPay gọi song song `vnpayReturn` (cho User thấy kết quả) và `vnpayIPN` (cho hệ thống lưu dữ liệu).
 *    - Bước 3: Cả hai đầu callback đều gọi `updateOrderPaymentStatus` để xác thực chữ ký (Checksum) và cập nhật DB.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Client -> Backend -> VNPay Gateway -> Backend (IPN/Return) -> MongoDB (Order & User Cart) -> Client (Page Success/Fail).
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Chống gian lận: Kiểm tra số tiền nhận được từ VNPay có khớp hoàn toàn với số tiền trong Đơn hàng hay không.
 *    - Kiểm tra chữ ký: `verifyReturnUrl` và `verifyIpnCall` đảm bảo dữ liệu đến từ VNPay thật chứ không phải giả mạo.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Sử dụng `async/await` dày đặc cho các thao tác cập nhật trạng thái đơn hàng và lọc giỏ hàng.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Tại sao cần cả Return và IPN? Vì khách hàng có thể tắt trình duyệt ngay sau khi trả tiền (Return không chạy), lúc này IPN là "cứu cánh" duy nhất để hệ thống biết tiền đã về.
 *    - Logic dọn dẹp giỏ hàng: Chỉ xóa các món hàng có trong đơn hàng vừa thanh toán, giữ lại các món khác nếu khách chưa mua.
 */
import { VNPay, ProductCode, VnpCurrCode, VnpLocale } from 'vnpay';
import handleAsyncError from '../middleware/handleAsyncError.js';
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import CartItem from '../models/cartItemModel.js';
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
    
    // Check amount (VNPay vnp_Amount is multiplied by 100)
    if (Number(query.vnp_Amount) / 100 !== order.totalPrice) {
        return { success: false, code: '04', message: 'Invalid amount' };
    }

    if (order.isPaid && responseCode === '00') {
        return { success: true, code: '02', message: 'Order already confirmed' };
    }

    if (responseCode === '00') {
        // Payment successful - update order status
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentMethod = "VNPAY";
        order.paymentStatus = "Paid";
        order.paymentInfo = {
            ...order.paymentInfo,
            provider: "VNPAY",
            transId: query.vnp_TransactionNo,
            resultCode: responseCode,
            message: "Thanh toán thành công",
            amount: Number(query.vnp_Amount) / 100,
        };
        order.orderStatus = "Chờ xử lý";
        await order.save();

        // --- CLEAR CART ITEMS (New normalized schema) ---
        try {
            // Use user_id (new schema) instead of user (old schema)
            const userId = order.user_id;
            const cart = await Cart.findOne({ user_id: userId });
            
            if (cart) {
                // Build product keys from order items using product_id (new field)
                const paidProductKeys = order.orderItems.map(item => {
                    const pId = item.product_id ? item.product_id.toString() : '';
                    return `${pId}-${item.size || ''}-${item.color || ''}`;
                });

                // Find and delete matching CartItem documents (separate collection)
                const cartItems = await CartItem.find({ cart_id: cart._id });
                const itemsToDelete = cartItems.filter(cartItem => {
                    const cartKey = `${cartItem.product_id.toString()}-${cartItem.size || ''}-${cartItem.color || ''}`;
                    return paidProductKeys.includes(cartKey);
                });

                if (itemsToDelete.length > 0) {
                    await CartItem.deleteMany({
                        _id: { $in: itemsToDelete.map(item => item._id) }
                    });
                    console.log(`[VNPay] Đã xóa ${itemsToDelete.length} sản phẩm khỏi giỏ hàng user ${userId}`);
                }
            }
        } catch (err) {
            console.error("[VNPay] Lỗi dọn dẹp giỏ hàng:", err.message);
        }

        return { success: true, code: '00', message: 'Success' };
    } else {
        // Payment failed
        order.paymentStatus = "Failed";
        order.paymentInfo = {
            ...order.paymentInfo,
            resultCode: responseCode,
            message: "Thanh toán thất bại",
        };
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
