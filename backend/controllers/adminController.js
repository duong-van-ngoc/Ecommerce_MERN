/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Bộ điều khiển Thống kê Quản trị (Admin Statistics Controller).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp "linh hồn" dữ liệu cho trang Dashboard của Admin.
 *    - Tổng hợp và tính toán các chỉ số kinh doanh quan trọng như doanh thu, tăng trưởng, lượng khách hàng mới.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Báo cáo & Phân tích (Reporting & Analytics Flow).
 *    - Luồng Quản trị hệ thống (Admin Management).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - MongoDB Queries: Sử dụng các toán tử so sánh thời gian ($gte, $lt) để lọc dữ liệu theo tháng.
 *    - JavaScript Array Methods: `reduce()` để tính tổng doanh thu từ mảng đơn hàng.
 *    - Date Object Logic: Xử lý thời gian động để tính toán tăng trưởng giữa các tháng (Tháng này vs Tháng trước).
 *    - Data Mapping: Chuẩn hóa dữ liệu đơn hàng gần đây để Frontend hiển thị dễ dàng hơn.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Thường là các yêu cầu lấy thông tin tổng quan (không cần body) hoặc tham số `limit` từ query string.
 *    - Output: Một bản tóm tắt các chỉ số (Stats object) kèm theo phần trăm thay đổi so với kỳ trước.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không áp dụng.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `getDashboardStats`: Trái tim của Dashboard, tính toán Revenue, Orders, Products, Users và tỷ lệ tăng trưởng.
 *    - `getRecentOrders`: Truy vấn các đơn hàng mới phát sinh để Admin kịp thời xử lý.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Admin truy cập vào Dashboard.
 *    - Bước 2: Controller tính mốc thời gian: 30 ngày qua (tháng hiện tại) và 30-60 ngày trước (tháng trước).
 *    - Bước 3: Truy vấn song song dữ liệu từ 3 Collection (Orders, Products, Users).
 *    - Bước 4: Chạy logic so sánh để tính phần trăm (%) tăng hoặc giảm.
 *    - Bước 5: Trả về JSON chứa tất cả con số thống kê.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Admin Client -> Route -> Controller -> (Orders + Users + Products) -> MongoDB -> JSON Response.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Tự động bỏ qua các đơn hàng bị Hủy (`Cancelled`) khi tính doanh thu để tránh số liệu ảo.
 *    - Xử lý trường hợp "chia cho 0" khi hệ thống mới vận hành (tháng trước chưa có dữ liệu).
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Các lệnh `find()` và `countDocuments()` chạy bất đồng bộ để không làm treo server trong khi đếm dữ liệu lớn.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Hiện tại logic tính toán đang được thực hiện ở tầng Application (dùng `reduce`). Nếu dự án có hàng triệu đơn hàng, bạn nên chuyển sang dùng `MongoDB Aggregation Pipeline` để máy chủ database xử lý sẽ nhanh hơn nhiều.
 */
import asyncErrorHandler from "../middleware/handleAsyncError.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";


export const getDashboardStats = asyncErrorHandler(async (req, res, next) => {
    // Tính toán khoảng thời gian
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

   
    const currentMonthOrders = await Order.find({
        createdAt: { $gte: lastMonth },
        orderStatus: { $ne: 'Cancelled' }
    });

    const currentMonthRevenue = currentMonthOrders.reduce((total, order) => {
        return total + order.totalPrice;
    }, 0);

    // Doanh thu tháng trước
    const previousMonthOrders = await Order.find({
        createdAt: { $gte: twoMonthsAgo, $lt: lastMonth },
        orderStatus: { $ne: 'Cancelled' }
    });

    const previousMonthRevenue = previousMonthOrders.reduce((total, order) => {
        return total + order.totalPrice;
    }, 0);

    // Tính % thay đổi doanh thu
    const revenueChange = previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
        : 0;

    // tổng đơn hàng
    const totalOrders = await Order.countDocuments();
    const ordersChange = previousMonthOrders.length > 0
        ? ((currentMonthOrders.length - previousMonthOrders.length) / previousMonthOrders.length * 100).toFixed(1)
        : 0;

    // tổng sản phẩm 
    const totalProducts = await Product.countDocuments();

    // tổng người dùng
    const totalUsers = await User.countDocuments();
    const currentMonthUsers = await User.countDocuments({ createdAt: { $gte: lastMonth } });
    const previousMonthUsers = await User.countDocuments({ createdAt: { $gte: twoMonthsAgo, $lt: lastMonth } });
    const usersChange = previousMonthUsers > 0
        ? ((currentMonthUsers - previousMonthUsers) / previousMonthUsers * 100).toFixed(1)
        : 0;

    // Trả về kết quả
    res.status(200).json({
        success: true,
        stats: {
            totalRevenue: {
                value: Math.round(currentMonthRevenue),
                change: parseFloat(revenueChange)
            },
            totalOrders: {
                value: totalOrders,
                change: parseFloat(ordersChange)
            },
            totalProducts: {
                value: totalProducts,
                change: 0
            },
            totalUsers: {
                value: totalUsers,
                change: parseFloat(usersChange)
            }
        }
    });
});


export const getRecentOrders = asyncErrorHandler(async (req, res, next) => {
    const { limit = 10 } = req.query;

    const orders = await Order.find()
        .populate('user_id', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

    const formattedOrders = orders.map(order => ({
        orderId: order._id,
        customer: order.user_id ? order.user_id.name : 'Unknown',
        email: order.user_id ? order.user_id.email : 'N/A',
        date: order.createdAt,
        total: order.totalPrice,
        status: order.orderStatus
    }));

    res.status(200).json({
        success: true,
        orders: formattedOrders
    });
});
