import Order from "../models/orderModel.js";
import Voucher from "../models/voucherModel.js";

/**
 * Các trạng thái đơn hàng được coi là "đã sử dụng" voucher thành công.
 * Các đơn hàng đang chờ xử lý, đã hủy hoặc thất bại sẽ không tính vào lượt dùng.
 */
const VALID_STATUS = [
    "confirmed", 
    "processing", 
    "shipped", 
    "delivered", 
    "paid"
];

/**
 * Kiểm tra xem người dùng đã sử dụng voucher này chưa.
 * @param {string} userId - ID của người dùng.
 * @param {string} voucherId - ID của voucher.
 * @returns {Promise<boolean>} - Trả về true nếu đã dùng, false nếu chưa.
 */
export const hasUserUsedVoucher = async (userId, voucherId) => {
    const count = await Order.countDocuments({
        user_id: userId,
        voucher_id: voucherId,
        orderStatus: { $in: VALID_STATUS }
    });
    return count > 0;
};

/**
 * Lấy tổng số lần một voucher đã được sử dụng thành công trên toàn hệ thống.
 * @param {string} voucherId - ID của voucher.
 * @returns {Promise<number>} - Số lượt đã dùng.
 */
export const getVoucherTotalUsage = async (voucherId) => {
    return await Order.countDocuments({
        voucher_id: voucherId,
        orderStatus: { $in: VALID_STATUS }
    });
};

/**
 * Kiểm tra tính hợp lệ của Voucher trước khi áp dụng vào đơn hàng.
 * @param {string} userId - ID người dùng.
 * @param {string} voucherCode - Mã voucher nhập vào.
 * @returns {Promise<object>} - Trả về object voucher nếu hợp lệ, ngược lại throw lỗi.
 */
export const validateVoucherForUser = async (userId, voucherCode) => {
    const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase(), status: 'active' });

    if (!voucher) {
        throw new Error("Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa.");
    }

    // 1. Kiểm tra thời hạn
    const now = new Date();
    if (now < voucher.conditions.startDate || now > voucher.conditions.endDate) {
        throw new Error("Mã giảm giá đã hết hạn sử dụng.");
    }

    // 2. Kiểm tra giới hạn tổng lượt dùng toàn hệ thống
    if (voucher.conditions.usageLimit !== -1) {
        const totalUsed = await getVoucherTotalUsage(voucher._id);
        if (totalUsed >= voucher.conditions.usageLimit) {
            throw new Error("Mã giảm giá đã hết lượt sử dụng trên hệ thống.");
        }
    }

    // 3. Kiểm tra giới hạn lượt dùng trên mỗi người dùng
    const userUsedCount = await Order.countDocuments({
        user_id: userId,
        voucher_id: voucher._id,
        orderStatus: { $in: VALID_STATUS }
    });

    if (userUsedCount >= voucher.conditions.limitPerUser) {
        throw new Error(`Bạn đã sử dụng hết lượt cho phép của mã giảm giá này (${voucher.conditions.limitPerUser} lần).`);
    }

    return voucher;
};
