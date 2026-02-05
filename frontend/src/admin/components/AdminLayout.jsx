import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import '../styles/AdminLayout.css';

/**
 * AdminLayout - Layout chung cho toàn bộ trang admin
 */
function AdminLayout() {
    const { isAuthenticated, user } = useSelector(state => state.user);

    // Kiểm tra quyền truy cập
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user && user.role !== 'admin') {
        toast.error('Bạn không có quyền truy cập trang này');
        return <Navigate to="/" replace />;
    }

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <div className="admin-sidebar">
                <div className="admin-logo">🛍️ ToBi Shop</div>
                <nav>
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        📊 Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/products"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        📦 Quản lý sản phẩm
                    </NavLink>
                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        📋 Quản lý đơn hàng
                    </NavLink>
                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        👥 Quản lý người dùng
                    </NavLink>
                    <NavLink
                        to="/admin/settings"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        ⚙️ Cài đặt
                    </NavLink>
                    <NavLink
                        to="/products"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        🏠 Về trang chủ
                    </NavLink>
                </nav>
            </div>

            {/* Main Content */}
            <div className="admin-main">
                {/* Header */}


                {/* Page Content - Outlet cho các trang con */}
                <div className="admin-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;
