/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component "Trang Thông báo" (Notifications Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Hiển thị tất cả các thông tin cập nhật liên quan đến vận hành: Đơn hàng, Khuyến mãi, Ví xu, và Tin tức hệ thống.
 *    - Phân loại thông báo thành các nhóm (Tabs) giúp người dùng dễ dàng theo dõi.
 *    - Cung cấp trải nghiệm đồng nhất với phong cách Shopee/E-commerce chuyên nghiệp.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Thông tin người dùng & Chăm sóc khách hàng (User Notifications & CRM Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Routing Integration: Sử dụng `useLocation` để thay đổi `filter` (bộ lọc) dựa trên đường dẫn URL hiện tại.
 *    - Mock Data Pattern: Sử dụng dữ liệu mẫu (`mockNotifications`) để xây dựng giao diện trước khi kết nối chính thức với API Socket/Backend.
 *    - Dynamic Title UI: Hàm `getTitle()` xử lý tiêu đề linh hoạt tùy theo tab người dùng đang xem.
 *    - List Rendering: Duyệt mảng và render các khối thông báo kèm icon cảm xúc (Emoji).
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Đường dẫn URL (ví dụ: `/notifications/order`).
 *    - Output: Danh sách thông báo tương ứng với bộ lọc đã chọn.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `filter`: Trạng thái quyết định nhóm thông báo nào sẽ được ưu tiên hiển thị.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `useEffect`: Theo dõi sự thay đổi của URL (`location`) để cập nhật bộ lọc `filter`.
 *    - `filteredNotifications`: Một mảng được tạo ra "nóng" (on-the-fly) từ dữ liệu gốc sau khi áp dụng điều kiện lọc.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng nhấn vào menu Thông báo -> URL chuyển sang `/notifications/...`.
 *    - Bước 2: `useEffect` bắt được thay đổi -> Cập nhật `setFilter`.
 *    - Bước 3: Mảng thông báo được lọc lại -> Re-render giao diện danh sách.
 *    - Bước 4: Click vào từng item -> Link dẫn tới trang chi tiết đơn hàng hoặc khuyến mãi.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - (Dự kiến) UI -> GET /api/v1/notifications -> MongoDB -> UI. Hiện tại đang sử dụng Mock Data.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Conditional Styling: Thêm class `.unread` cho các thông báo chưa đọc để làm nổi bật (màu nền đậm hơn).
 *    - Empty State: Hiển thị hình ảnh minh họa khi "Chưa có thông báo nào" để tránh màn hình bị trống trải.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Hiện tại chưa có (đang dùng mock), dự kiến sẽ là API fetch trong `useEffect`.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `AccountSidebar` được nhúng vào đây để duy trì cấu trúc Menu trái nhất quán cho trang cá nhân.
 *    - Chú ý phần `mark-read-btn`: Hiện tại chỉ là UI tĩnh/nút chờ logic "Đã đọc tất cả".
 */
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AccountSidebar from "../components/AccountSidebar";
import "../UserStyles/Notifications.css";
import PageTitle from "../components/PageTitle";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Notifications = () => {
    const location = useLocation();
    const [filter, setFilter] = useState("all");

    // Map path to filter type
    useEffect(() => {
        const path = location.pathname;
        if (path.includes("/notifications/order")) setFilter("order");
        else if (path.includes("/notifications/promotion")) setFilter("promotion");
        else if (path.includes("/notifications/wallet")) setFilter("wallet");
        else if (path.includes("/notifications/shopee")) setFilter("shopee");
        else setFilter("all");
    }, [location]);

    // Mock Data
    const mockNotifications = [
        {
            id: 1,
            type: "order",
            title: "Giao hàng thành công",
            content: "Đơn hàng #123456789 đã được giao thành công. Vui lòng đánh giá sản phẩm nhé!",
            icon: "📦",
            time: "14:30 02-02-2024",
            unread: true,
        },
        {
            id: 2,
            type: "order",
            title: "Đơn hàng đang được vận chuyển",
            content: "Đơn hàng #987654321 của bạn đã được giao cho đơn vị vận chuyển.",
            icon: "🚚",
            time: "09:15 01-02-2024",
            unread: false,
        },
        {
            id: 3,
            type: "promotion",
            title: "Siêu Sale 2.2 - Giảm đến 50%",
            content: "Săn deal hot ngay hôm nay! Hàng ngàn voucher đang chờ bạn.",
            icon: "🏷️",
            time: "00:00 02-02-2024",
            unread: true,
        },
        {
            id: 4,
            type: "wallet",
            title: "Hoàn xu 20.000đ",
            content: "Bạn vừa nhận được 20.000 xu từ đơn hàng #123456789.",
            icon: "💰",
            time: "15:00 02-02-2024",
            unread: true,
        },
        {
            id: 5,
            type: "shopee",
            title: "Chào mừng bạn đến với ToBi Shop",
            content: "Cảm ơn bạn đã tạo tài khoản. Khám phá các sản phẩm ngay!",
            icon: "🛍️",
            time: "10:00 01-01-2024",
            unread: false,
        },
    ];

    // Filter Logic
    const filteredNotifications = filter === "all"
        ? mockNotifications
        : mockNotifications.filter(item => item.type === filter);

    const getTitle = () => {
        switch (filter) {
            case "order": return "Cập Nhật Đơn Hàng";
            case "promotion": return "Khuyến Mãi";
            case "wallet": return "Cập Nhật Ví";
            case "shopee": return "Cập Nhật Shopee";
            default: return "Thông Báo Mới Nhận";
        }
    };

    return (
        <>
            <PageTitle title="Thông báo" />
            <Navbar />
            <div className="notifications-container">
                <div className="notifications-content">
                    <AccountSidebar />
                    <div className="notifications-main">
                        <div className="notifications-header">
                            <h2>{getTitle()}</h2>
                            <button className="mark-read-btn">Đánh dấu Đã đọc tất cả</button>
                        </div>

                        <div className="notifications-list">
                            {filteredNotifications.length > 0 ? (
                                filteredNotifications.map((item) => (
                                    <Link to="#" key={item.id} className={`notification-item ${item.unread ? "unread" : ""}`}>
                                        <div className="notification-image">
                                            <span className="notification-icon">{item.icon}</span>
                                        </div>
                                        <div className="notification-details">
                                            <h3 className="notification-title">{item.title}</h3>
                                            <p className="notification-desc">{item.content}</p>
                                            <span className="notification-time">{item.time}</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="no-notifications">
                                    <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/c9f754d67d6a5463.png" alt="No notifications" />
                                    <p>Chưa có thông báo nào</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Notifications;
