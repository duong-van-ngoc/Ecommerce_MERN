/**
 * ============================================================================
 * COMPONENT: AccountSidebar (Bảng Điều Hướng Cá Nhân)
 * ============================================================================
 * 1. Component là gì: 
 *    - Bảng danh mục menu cố định bên tay trái của Phân hệ tài khoản `/profile/*`.
 *    - Hiện Profile Card thu nhỏ (Tên + Avatar) và đường Link nhanh quản trị.
 * 
 * 2. Props: 
 *    - Tự trị (Không nhận Props).
 * 
 * 3. State:
 *    - Global State: Extract giá trị `user` object từ Slice `user` thông qua `useSelector` Redux.
 *    - Hook URL: Lấy Path Route qua `useLocation`.
 * 
 * 4. Render lại khi nào:
 *    - Re-render mỗi khi Object Local User từ mẹ bị đánh dấu cập nhật do Login/Logout/Edit.
 *    - Re-render class `active` css khi Path URL thay đổi Route.
 * 
 * 5. Event handling:
 *    - Các item Click trực tiếp Link Navigation Router DOM nên bỏ qua onClick thủ công.
 * 
 * 6. Conditional rendering:
 *    - Nếu có giá trị Auth User có `avatar?.url` -> Render thẻ <img> từ AWS/Cloudinary. Còn không rơi fallback đổ `<div placeholder>` Icon bốc chữ cái đầu `user?.name?.charAt(0)`.
 *    - Cắm class động màu xanh (`active`) nếu địa chỉ URI trang hiện tại trùng với URI tĩnh của vòng lặp Link.
 *    - Kiểm tra có Sub-items con thả xuống (`Cập nhật Đơn Hàng`, `Khuyến mãi`) để expand Box.
 * 
 * 7. List rendering:
 *    - Map nguyên khối Configuration Array cố định của App Cấp 1 Menu `menuItems`. List map trong (Lồng) luôn Array `subItems`.
 * 
 * 8. Controlled input:
 *    - Không có.
 * 
 * 9. Lifting state up:
 *    - Không.
 * 
 * 10. Luồng hoạt động:
 *    - Layout Sidebar này được render Song song với component Ruột (Giống Master Page).
 *    - User click Tab `Tài khoản của tôi` -> Địa chỉ bật sang `/profile` -> Sidebar highlight tab 1 và Layout render form kế bên.
 * ============================================================================
 */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import "../componentStyles/AccountSidebar.css";

function AccountSidebar() {
    const location = useLocation();
    const { user } = useSelector((state) => state.user);

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        {
            icon: "👤",
            label: "Tài Khoản Của Tôi",
            path: "/profile",
        },
        {
            icon: "📦",
            label: "Đơn Mua",
            path: "/orders/user",
        },
        {
            icon: "🔔",
            label: "Thông Báo",
            path: "/notifications",
            subItems: [
                { label: "Cập Nhật Đơn Hàng", path: "/notifications/order" },
                { label: "Khuyến Mãi", path: "/notifications/promotion" },
                { label: "Cập Nhật Ví", path: "/notifications/wallet" },
                { label: "Cập Nhật Shopee", path: "/notifications/shopee" },
            ]
        },
        {
            icon: "🎟️",
            label: "Kho Voucher",
            path: "/vouchers",
        },
    ];

    return (
        <div className="account-sidebar">
            {/* User Info */}
            <div className="sidebar-user">
                <div className="user-avatar">
                    {user?.avatar?.url ? (
                        <img src={user.avatar.url} alt={user.name} />
                    ) : (
                        <div className="avatar-placeholder">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                    )}
                </div>
                <div className="user-info">
                    <div className="user-name">{user?.name || "Tài khoản"}</div>
                    <Link to="/profile/update" className="edit-profile">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Sửa Hồ Sơ
                    </Link>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="sidebar-menu">
                {menuItems.map((item) => {
                    // Check if any subItem is active
                    const isParentActive = isActive(item.path) || (item.subItems && item.subItems.some(sub => isActive(sub.path)));

                    return (
                        <div key={item.path} className="menu-group">
                            <Link
                                to={item.path}
                                className={`menu-item ${isActive(item.path) ? "active" : ""}`}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-label">{item.label}</span>
                            </Link>

                            {/* Render Submenu if exists */}
                            {item.subItems && (
                                <div className={`sub-menu ${isParentActive ? "expanded" : ""}`}>
                                    {item.subItems.map(subItem => (
                                        <Link
                                            key={subItem.path}
                                            to={subItem.path}
                                            className={`sub-menu-item ${isActive(subItem.path) ? "active" : ""}`}
                                        >
                                            {subItem.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}

export default AccountSidebar;
