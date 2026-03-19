/**
 * ============================================================================
 * COMPONENT: AdminLayout
 * ============================================================================
 * 1. Component là gì: 
 *    - Là HOC Layout Wrapper dành cho các luồng Dashboard của Admin, chứa Sidebar và Outlet cho các component con mount vào vùng thân giao diện.
 * 
 * 2. Props: 
 *    - Không Props.
 * 
 * 3. State:
 *    - Global State (useSelector): Lấy trạng thái `isAuthenticated` và schema `user` để phân quyền truy cập.
 * 
 * 4. Render lại khi nào:
 *    - Khi URL Route đổi -> Sidebar Navlink active state đổi.
 *    - Re-render khi Global Redux update user credential (VD: user log out).
 * 
 * 5. Event handling:
 *    - Click vào các thẻ `NavLink` điều khiển thay đổi đường dẫn Frontend.
 * 
 * 6. Conditional rendering:
 *    - Validate quyền (`!isAuthenticated` hoặc `role !== 'admin'`) -> Returns Redirect Element `<Navigate />`.
 * 
 * 7. List rendering:
 *    - Không có. (Tạo menu tĩnh).
 * 
 * 8. Controlled input:
 *    - Không chứa input.
 * 
 * 9. Lifting state up:
 *    - Outlet pass qua Router tree.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Router điều hướng sang Route Auth `/admin/*`.
 *    - (2) Mount Layout -> Check Authenticated & check user.role. Giữ chân nếu ko có quyền và chuyển hướng.
 *    - (3) Render sidebar tĩnh và khung Content.
 *    - (4) Trỏ thư mục con / Router con render inject vào thông qua thẻ `<Outlet />`.
 * ============================================================================
 */
import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import '../styles/AdminLayout.css';


//  AdminLayout - Layout chung cho toàn bộ trang admin

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
