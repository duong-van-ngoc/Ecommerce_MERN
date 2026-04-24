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
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markAsRead, markAllRead, readLocal, readAllLocal } from "@/features/notification/notificationSlice";
import AccountSidebar from "@/shared/components/AccountSidebar";
import "@/pages/user/styles/Notifications.css";
import "@/pages/user/styles/AccountShared.css";
import PageTitle from "@/shared/components/PageTitle";
import { TicketPercent, Package, Wallet, ShoppingBag, Bell } from "lucide-react";

import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";

const NotificationsView = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const [filter, setFilter] = useState("all");

    const { notifications, unreadCount, loading } = useSelector((state) => state.notification);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    // Map path to filter type
    useEffect(() => {
        const path = location.pathname;
        if (path.includes("/notifications/order")) setFilter("order");
        else if (path.includes("/notifications/promotion")) setFilter("promotion");
        else if (path.includes("/notifications/wallet")) setFilter("wallet");
        else if (path.includes("/notifications/shopee")) setFilter("shopee");
        else setFilter("all");
    }, [location]);

    // Filter Logic
    const filteredNotifications = filter === "all"
        ? notifications
        : notifications.filter(item => item.type === filter);

    const getTitle = () => {
        switch (filter) {
            case "order": return "Cập Nhật Đơn Hàng";
            case "promotion": return "Khuyến Mãi";
            case "wallet": return "Cập Nhật Ví";
            case "shopee": return "Cập Nhật Shopee";
            default: return "Thông Báo Mới Nhận";
        }
    };

    const handleMarkRead = (id) => {
        dispatch(readLocal(id));
        dispatch(markAsRead(id));
    };

    const handleMarkAllRead = () => {
        dispatch(readAllLocal());
        dispatch(markAllRead());
    };

    const getIcon = (type) => {
        switch (type) {
            case "promotion": return <TicketPercent className="icon-lucide" size={24} color="#ee4d2d" />;
            case "order": return <Package className="icon-lucide" size={24} color="#26aa99" />;
            case "wallet": return <Wallet className="icon-lucide" size={24} color="#f6a700" />;
            case "shopee": return <ShoppingBag className="icon-lucide" size={24} color="#ee4d2d" />;
            default: return <Bell className="icon-lucide" size={24} color="#4b5563" />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    };

    return (
        <>
            <PageTitle title="Thông báo" />
            <Navbar />
            <div className="account-container">
                <div className="account-content">
                    <AccountSidebar />
                    <div className="account-main">
                        
                        {/* HERO HEADER - ĐỒNG BỘ GIAO DIỆN */}
                        <div className="account-hero">
                            <div className="hero-content">
                                <span className="hero-badge">Trung tâm tin tức</span>
                                <h1 className="hero-title">
                                    Thông báo <br />
                                    <span className="hero-title-highlight">Mới nhận</span>
                                </h1>
                                <p className="hero-desc">
                                    Cập nhật những tin tức mới nhất về đơn hàng, khuyến mãi và các hoạt động hệ thống từ ToBi Shop. Đừng bỏ lỡ bất kỳ ưu đãi nào!
                                </p>
                            </div>
                            <div className="hero-stats">
                                <p className="hero-stats-label">Thông báo mới</p>
                                <div className="hero-stats-number">
                                    <span className="number">{unreadCount}</span>
                                    <span className="unit">tin</span>
                                </div>
                            </div>
                            <div className="hero-decoration-1"></div>
                            <div className="hero-decoration-2"></div>
                        </div>

                        <div className="account-card" style={{padding: '0'}}>
                            <div className="notifications-header" style={{padding: '24px', borderBottom: '1px solid #f1f5f9'}}>
                                <h2 style={{margin: 0, fontSize: '20px', fontWeight: 900}}>{getTitle()}</h2>
                                <button className="mark-read-btn" onClick={handleMarkAllRead}>Đánh dấu Đã đọc tất cả</button>
                            </div>

                        <div className="notifications-list">
                            {loading ? (
                                <div className="loading-notifications">Đang tải thông báo...</div>
                            ) : filteredNotifications.length > 0 ? (
                                filteredNotifications.map((item) => (
                                    <Link 
                                        to={item.link || "#"} 
                                        key={item._id} 
                                        className={`notification-item ${!item.isRead ? "unread" : ""}`}
                                        onClick={() => handleMarkRead(item._id)}
                                    >
                                        <div className="notification-image">
                                            <span className="notification-icon">
                                                {getIcon(item.type)}
                                            </span>
                                        </div>
                                        <div className="notification-details">
                                            <h3 className="notification-title">{item.title}</h3>
                                            <p className="notification-desc">{item.message}</p>
                                            <span className="notification-time">{formatTime(item.createdAt)}</span>
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
        </div>
        <Footer />
        </>
    );
};

export default NotificationsView;
