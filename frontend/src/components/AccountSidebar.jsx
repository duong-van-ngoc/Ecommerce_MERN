import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import "./AccountSidebar.css";

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
