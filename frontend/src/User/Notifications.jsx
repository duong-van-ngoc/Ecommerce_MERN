/**
 * ============================================================================
 * COMPONENT: Notifications
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `Notifications` trong ứng dụng.
 * 
 * 2. Props: 
 *    - Không nhận trực tiếp props truyền từ cha.
 * 
 * 3. State:
 *    - Local State (quản lý nội bộ qua useState).
 * 
 * 4. Render lại khi nào:
 *    - Khi Local State thay đổi.
 * 
 * 5. Event handling:
 *    - Không có event controls phức tạp.
 * 
 * 6. Conditional rendering:
 *    - Sử dụng toán tử 3 ngôi (? :) hoặc `&&` để ẩn/hiện element hoặc component.
 * 
 * 7. List rendering:
 *    - Sử dụng `.map()` để render danh sách elements.
 * 
 * 8. Controlled input:
 *    - Không chứa form controls.
 * 
 * 9. Lifting state up:
 *    - Dữ liệu được quản lý cục bộ hoặc đẩy lên Redux store toàn cục.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Component Mount -> Chạy useEffect (gọi API hoặc thiết lập timer/listener).
 *    - (2) Nhận State/Props và render UI ban đầu.
 *    - (3) End-User tương tác trên component -> Cập nhật State -> Re-render màn hình.
 * ============================================================================
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
