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
import Voucher from '../models/voucherModel.js';
import HandleError from '../utils/handleError.js';
import sendEmail from '../utils/sendEmail.js';

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
        const { orderId, orderDescription } = req.body;

        if (!orderId) {
            return next(new HandleError("Thiếu ID đơn hàng", 400));
        }

        // SECURITY: Lấy totalPrice từ DB, không tin amount FE gửi lên
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new HandleError("Không tìm thấy đơn hàng", 404));
        }

        if (order.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role_id?.name !== 'admin') {
            return next(new HandleError("Bạn không có quyền thanh toán đơn hàng này", 403));
        }

        if (order.isPaid) {
            return next(new HandleError("Đơn hàng đã được thanh toán", 400));
        }

        // Lấy IP address và chuẩn hóa (VNPay không thích ::1)
        let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
            ipAddr = '127.0.0.1';
        }

        const vnp_Amount = Math.round(Number(order.totalPrice));
        const vnp_OrderInfo = orderDescription || `Thanh toan don hang ${orderId}`;
        const vnp_TxnRef = orderId.toString();

        console.log("----- [VNPay DEBUG PARAMS] -----");
        console.log("- vnp_Amount (from DB):", vnp_Amount);
        console.log("- vnp_TxnRef:", vnp_TxnRef);
        console.log("- vnp_OrderInfo:", vnp_OrderInfo);
        console.log("- vnp_IpAddr:", ipAddr);
        console.log("- vnp_ReturnUrl:", process.env.VNP_RETURN_URL);
        console.log("---------------------------------");

        const vnpay = getVnpayInstance();
        const paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount,
            vnp_IpAddr: ipAddr,
            vnp_TxnRef,
            vnp_OrderInfo,
            vnp_OrderType: '100000',
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

    const order = await Order.findById(orderId).populate("user_id", "name email");
    if (!order) return { success: false, code: '01', message: 'Order not found' };
    
    // Check amount (VNPay vnp_Amount is multiplied by 100)
    // Dùng Math.round để tránh sai lệch số thập phân (totalPrice = 12.5 -> VNPay 13)
    if (Number(query.vnp_Amount) / 100 !== Math.round(Number(order.totalPrice))) {
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

        // --- GỬI EMAIL XÁC NHẬN THANH TOÁN THÀNH CÔNG ---
        try {
            if (order.user_id && order.user_id.email) {
                const emailSubject = `✅ Xác nhận thanh toán thành công - Đơn hàng #${order._id}`;
                
                // Tạo bảng sản phẩm HTML
                const itemsHtml = order.orderItems.map(item => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString('vi-VN')}đ</td>
                    </tr>
                `).join('');

                const htmlContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                        <h2 style="color: #2e7d32; text-align: center;">Thanh toán thành công!</h2>
                        <p>Chào <strong>${order.user_id.name}</strong>,</p>
                        <p>Cảm ơn bạn đã mua sắm tại <strong>Tobi Shop</strong>. Chúng tôi đã nhận được thanh toán cho đơn hàng của bạn qua <strong>VNPay</strong>.</p>
                        
                        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #555;">Thông tin đơn hàng:</h3>
                            <p><strong>Mã đơn hàng:</strong> #${order._id}</p>
                            <p><strong>Tổng tiền:</strong> <span style="color: #d32f2f; font-weight: bold;">${order.totalPrice.toLocaleString('vi-VN')} VNĐ</span></p>
                            <p><strong>Trạng thái:</strong> Đã thanh toán</p>
                            <p><strong>Phương thức:</strong> VNPay</p>
                        </div>

                        <h3 style="color: #555;">Chi tiết sản phẩm:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #eee;">
                                    <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                                    <th style="padding: 10px; text-align: center;">Số lượng</th>
                                    <th style="padding: 10px; text-align: right;">Giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        <p style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL}/order/${order._id}" 
                               style="background: #2e7d32; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                               Xem chi tiết đơn hàng
                            </a>
                        </p>

                        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #999; text-align: center;">
                            Đây là email tự động, vui lòng không phản hồi.<br>
                            &copy; 2026 Tobi Shop. All rights reserved.
                        </p>
                    </div>
                `;

                // Gửi email bất đồng bộ, không bắt User phải chờ kết quả gửi mail xong mới thấy thông báo thành công
                sendEmail(order.user_id.email, emailSubject, htmlContent);
            }
        } catch (emailErr) {
            console.error("[Email System Error]: Không thể gửi mail xác nhận:", emailErr.message);
        }

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
        if (order.orderStatus !== "Đã hủy") {
            order.paymentStatus = "Failed";
            order.paymentInfo = {
                ...order.paymentInfo,
                resultCode: responseCode,
                message: "Thanh toán thất bại",
            };
            order.orderStatus = "Đã hủy";
            
            // Hoàn lại lượt dùng voucher
            if (order.voucher_id) {
                await Voucher.findByIdAndUpdate(order.voucher_id, { $inc: { usedCount: -1 } });
            }
            
            await order.save();
        }
        return { success: true, code: responseCode, message: 'Payment Failed recorded' };
    }
};

/**
 * Xử lý Return URL - Redirect từ VNPay
 */
export const vnpayReturn = handleAsyncError(async (req, res, next) => {
    const query = req.query;
    const vnpay = getVnpayInstance();
    const verify = vnpay.verifyReturnUrl(query);

    if (verify.isVerified) {
        // Cập nhật database VÀ kiểm tra kết quả trước khi redirect
        const result = await updateOrderPaymentStatus(query);

        // Chú ý: result.code === '02' nghĩa là IPN đã cập nhật đơn hàng thành công trước khi Return URL được gọi
        if (query.vnp_ResponseCode === '00' && result.success && (result.code === '00' || result.code === '02')) {
            // Chữ ký hợp lệ + VNPay báo thành công + DB update thành công + amount khớp
            res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${query.vnp_TxnRef}&vnp_ResponseCode=${query.vnp_ResponseCode}`);
        } else {
            // Thất bại: amount sai (code 04), DB update fail, hoặc VNPay báo lỗi
            const failCode = result.code || query.vnp_ResponseCode || 'unknown';
            res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${query.vnp_TxnRef}&vnp_ResponseCode=${failCode}`);
        }
    } else {
        // Chữ ký không hợp lệ
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

    if (verify.isVerified) {
        const result = await updateOrderPaymentStatus(query);
        return res.status(200).json({ RspCode: result.code, Message: result.message });
    } else {
        return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }
});
